import { isEmpty, debounce } from '@/utils/util.js'
import { toFixed } from '@/utils/calculation.js'
import { checkKycApply, queryWithdrawConfig, queryWithdrawRate, queryWithdrawLimitInfo, computeWithdrawFee } from '@/api/user.js'

export default {
    computed: {
        // 账户币种
        accountCurrency () {
            return this.customerInfo.accountList?.find(el => el.accountId === Number(this.accountId)) || {}
        },
        // 输入的取款数量小数位长度
        amountDigitsLength () {
            const arr = this.withdrawCount.toString().split('.')
            return arr ? arr[1]?.length : 0
        }
    },
    watch: {
	    // 监听提取数量
	    withdrawCount (val) {
	        this.getWithdrawFee()
	    }
    },
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 是否显示取款时间弹窗
            timeShow: false,
            // 可取款时间
            timeList: [],
            // 提现账户id
            accountId: '',
            // 到账币种
            currency: '',
            // 玩法类型
            tradeType: '',
            // 取款方式
            withdrawMethod: '',
            // 提现类型
            withdrawType: '',
            // 获取取款相关费用
            getWithdrawFee: debounce(this.computeWithdrawFee, 500),
            // 取款配置
            withdrawConfig: {},
            // 取款汇率
            withdrawRate: {},
            // 可取数量
            withdrawAmount: '',
            // 最高可取
            singleHighAmount: 0,
            // 最低可取
            singleLowAmount: 0,
            // 输入的取款数量
            withdrawCount: '',
            // 手续费
            serviceCount: '',
            // 预计到账
            arriveCount: '',
            // 账户减扣
            minusCount: ''
        }
    },
    methods: {
        // 获取请求参数
        getParams () {
		    const customerInfo = this.customerInfo
            const params = {
                companyId: customerInfo.companyId,
                customerNo: customerInfo.customerNo,
                customerGroupId: customerInfo.customerGroupId,
                country: customerInfo.country,
                accountId: this.accountId,
                tradeType: this.tradeType,
                accountCurrency: this.accountCurrency.currency,
                withdrawMethod: this.withdrawMethod,
                withdrawType: this.withdrawType,
                withdrawCurrency: this.currency
            }
            // 提币参数需要链名称
		    if (this.chainName) {
                params.blockchainName = this.chainName
            }
            return params
        },
		
        // 金额初始化
        amountInit () {
            this.serviceCount = this.arriveCount = this.minusCount = toFixed(0, this.accountCurrency.digits)
        },

        // 重置数据
        reset () {
		    this.withdrawRate = {}
            this.withdrawCount = ''
		    this.singleHighAmount = 0
		    this.singleLowAmount = 0
            this.amountInit()
		    // 获取取款汇率
		    this.queryWithdrawRate()
        },

        // 检测取款是否需要kyc
        checkKyc () {
		    checkKycApply({
		        businessCode: 'withdraw'
		    }).then(res => {
		        const status = res.data
		        // 身份未验证
		        if (status !== 2) {
		            this.$refs['modalDialog'].show({
		                content: status === 1 ? this.$t('withdraw.kycMsg_1') : this.$t('withdraw.kycMsg_2'),
		                confirmText: status === 1 ? this.$t('withdraw.kycBtn_1') : this.$t('withdraw.kycBtn_2')
		            }).then(() => {
		                // 关闭当前页面跳转到身份验证页面
		                uni.redirectTo({
						    url: '/pages/person/authentication'
		                })
		            })
		        }
		    })
        },

        // 获取取款配置
        queryWithdrawConfig () {
            queryWithdrawConfig({
                ...this.getParams(),
            }).then(res => {
                const { data } = res
                this.withdrawConfig = data
                // 设置提现可提金额、最高可取、最低可取
                if (this.withdrawType === 1) {
                    this.withdrawAmount = data.withdrawAmount
                    this.singleHighAmount = data.withdrawAmountConfig.singleHighAmount
                    this.singleLowAmount = data.withdrawAmountConfig.singleLowAmount
                }
                // 取款限制验证
                this.checkWithdrawLimit()
            }).catch(res => {
                this.$refs['modalDialog'].show({
                    content: res.msg
                }).then(() => {
                    this.onBack()
                })
            })
        },

        // 取款限制验证
        checkWithdrawLimit () {
            const withdrawConfig = this.withdrawConfig
            const { withdrawConditionConfig } = withdrawConfig
            // 账户未激活
            if (!withdrawConfig.accountActiveEnable) {
			    return this.$refs['modalDialog'].show({
			        content: this.$t('withdraw.activateMsg'),
			        confirmText: this.$t('withdraw.activateBtn'),
			        showCancel: true
			    }).then(() => {
			        this.onBack()
			        uni.redirectTo({
			            url: `/pages/deposit/choose?currency=${this.accountCurrency.currency}&accountId=${this.accountId}&tradeType=${this.tradeType}`
			        })
			    })
            }
            // 不在取款时间内
            if (!withdrawConfig.timeEnable) {
                this.timeShow = true
                this.formatWithdrawTime()
                return
            }
            // 不可取款
            if (!withdrawConfig.customerGroupEnable) {
                return this.$refs['modalDialog'].show({
                    content: this.$t('withdraw.withdrawLimitHint')
                }).then(() => {
                    this.onBack()
                })
            }
            // 可取资金不足
            if (!withdrawConfig.amountEnable) {
                return this.$refs['modalDialog'].show({
                    content: this.$t('withdrawMoney.hint_6')
                }).then(() => {
                    this.onBack()
                })
            }
            // 24内取款超过最大次数
            if (!withdrawConfig.hourIn24Enable) {
                const msg = this.$t('withdrawMoney.hint_7') + withdrawConditionConfig.maxCount + this.$t('withdrawMoney.unit')
                return this.$refs['modalDialog'].show({
                    content: msg
                }).then(() => {
                    this.onBack()
                })
            }
        },

        // 获取取款汇率
        queryWithdrawRate () {
            return new Promise((resolve, reject) => {
                queryWithdrawRate({
				    ...this.getParams(),
                }).then(res => {
				    this.withdrawRate = res.data
					// 提现获取取款配置
					if (this.withdrawType === 1) {
						this.queryWithdrawConfig()
					}
				    // 提币获取当前币种取款数据
                    if (this.withdrawType === 2) {
                        this.queryWithdrawLimitInfo()
                    }
                    resolve()
                }).catch(res => {
                    this.$refs['modalDialog'].show({
					    content: res.msg
                    }).then(() => {
					    this.onBack()
                    })
                    reject()
                })
            })
        },

        // 获取当前币种取款数据
        queryWithdrawLimitInfo () {
		    queryWithdrawLimitInfo({
                ...this.getParams(),
		        withdrawRateSerialNo: this.withdrawRate.withdrawRateSerialNo
		    }).then(res => {
		        const { data } = res
		        this.withdrawAmount = data.withdrawAmount
		        this.singleHighAmount = data.singleHighAmount
		        this.singleLowAmount = data.singleLowAmount
		    })
        },

        // 获取取款相关费用
        computeWithdrawFee () {
		    // 验证是否可发起取款
		    if (!this.checkWithdrawSubmit()) return
		    // 发起api请求
		    computeWithdrawFee({
		        ...this.getParams(),
		        amount: this.withdrawCount,
		        withdrawRateSerialNo: this.withdrawRate.withdrawRateSerialNo
		    }).then(res => {
		        const { data } = res
                // 提现
                if (this.withdrawType === 1) {
                    this.serviceCount = data.withdrawFee
                    this.arriveCount = data.finalAmount
					this.minusCount = data.amount
                }
                // 提币
                if (this.withdrawType === 2) {
                    this.serviceCount = data.coinFee
                    this.arriveCount = data.coinFinalAmount
                    this.minusCount = data.amount
                }
		    }).catch(res => {
		        uni.showToast({
		            title: res.msg,
		            icon: 'none'
		        })
		    })
        },

        // 格式化取款时间
		formatWithdrawTime () {
			const weekdayMap = this.$t('weekdayMap')
			const todayStr = this.$dayjs().format('YYYY-MM-DD')
			const withdrawTimeConfigMap = {}
			const { withdrawTimeConfigList } = this.withdrawConfig
			withdrawTimeConfigList.forEach(el => {
				el.openTimeLocal = []
				withdrawTimeConfigMap[el.weekDay] = {
					weekDay: el.weekDay,
					openTime: el.openTime,
					openTimeLocal: []
				}
			})
			// 处理跨天逻辑
			for (const key in withdrawTimeConfigMap) {
				if (Object.hasOwnProperty.call(withdrawTimeConfigMap, key)) {
					const el = withdrawTimeConfigMap[key]
					if (!isEmpty(el.openTime)) {
						const timeRange = el.openTime.split(',')
						if (timeRange.length > 0) {
							timeRange.forEach(timeRangeItem => {
								const [start, end] = timeRangeItem.split('-')
								const startLocal = this.$dayjs.utc(`${todayStr} ${start}`).local()
								const endLocal = this.$dayjs.utc(`${todayStr} ${end}`).local()
	
								// 第二天
								const weekDay = key < 7 ? Number(key) + 1 : 1
								let elNext = withdrawTimeConfigMap[weekDay]
	
								if (!elNext) {
									elNext = {
										openTimeLocal: [],
										weekDay
									}
									withdrawTimeConfigMap[weekDay] = elNext
								}
	
								if (startLocal.isAfter(todayStr, 'day')) {
									elNext.openTimeLocal.push(startLocal.format('HH:mm') + '-' + endLocal.format('HH:mm'))
								} else if (endLocal.format('HH:mm') === '00:00') {
									el.openTimeLocal.push(startLocal.format('HH:mm') + '-24:00')
								} else if (endLocal.isAfter(todayStr, 'day')) {
									elNext.openTimeLocal.unshift('00:00-' + endLocal.format('HH:mm'))
									el.openTimeLocal.push(startLocal.format('HH:mm') + '-23:59')
								} else if (el.openTime !== '00:00-00:00' || el.openTime !== '') {
									el.openTimeLocal.push(startLocal.format('HH:mm') + '-' + endLocal.format('HH:mm'))
								}
							})
						}
					}
				}
			}
			// 处理时间合并
			for (const key in withdrawTimeConfigMap) {
				if (Object.hasOwnProperty.call(withdrawTimeConfigMap, key)) {
					const el = withdrawTimeConfigMap[key]
					if (Array.isArray(el.openTimeLocal)) {
						el.openTimeLocal.forEach((time, index) => {
							const start = el.openTimeLocal[0].split('-')[0]
	
							const end = time.split('-')[1]
							const nextStart = el.openTimeLocal[index + 1] && el.openTimeLocal[index + 1].split('-')[0]
							const nextEnd = el.openTimeLocal[index + 1] && el.openTimeLocal[index + 1].split('-')[1]
	
							if (this.$dayjs(`${todayStr} ${end}`).add(1, 'minute').isSame(this.$dayjs(`${todayStr} ${nextStart}`)) ||
								end === nextStart
							) {
								el.openTimeLocal = start + '-' + nextEnd
							}
						})
					}
				}
			}
			const tempList = []
			if (!isEmpty(withdrawTimeConfigMap)) {
				for (const key in withdrawTimeConfigMap) {
					if (Object.hasOwnProperty.call(withdrawTimeConfigMap, key)) {
						const item = withdrawTimeConfigMap[key]
						if (!isEmpty(item.openTimeLocal)) {
							tempList.push({
								weekDay: weekdayMap[item.weekDay],
								openTimeLocal: item.openTimeLocal
							})
						}
					}
				}
			}
			this.timeList = tempList
		},

        // 确定取款时间弹窗
        confirmWithdrawTime () {
            this.timeShow = false
        },

        // 返回上一个页面
        onBack () {
            // uni.navigateBack({
            //     delta: 1
            // })
        }
    }
}
