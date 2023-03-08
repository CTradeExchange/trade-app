<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar :title="$t('cRoute.deposit')" />
            <!-- 内容区域 -->
            <view class='layout-content'>
                <view class='deposit-title'>
                    {{ $t('deposit.limit') }}
                </view>
                <!-- 存款金额筛选 -->
                <view class='amount-filter'>
                    <view class='amount-list'>
                        <view
                            v-for='(item, index) in amountList'
                            :key='index'
                            :class="{ 'item': true, active: currIndex === index }"
                            @click='checkAmount(index, item)'
                        >
                            <view class='check'>
                                <tui-icon class='tick' name='check' :size='24' unit='rpx' />
                            </view>
                            <view class='t1'>
                                {{ item.amount }} {{ currency }}
                            </view>
                            <view v-if='item.describe' class='t2'>
                                {{ item.describe }}
                            </view>
                        </view>
                    </view>
                    <view class='other-amount'>
                        <view class='icon-currency'>
                            <image :src='getCurrencyIcon()' />
                            <span class='label'>
                                {{ currency }}
                            </span>
                        </view>
                        <input v-model='amount' :placeholder='$t("deposit.inputAmount")' type='digit' />
                    </view>
                </view>
                <!-- 支付方式 -->
                <view>
                    <view class='deposit-title'>
                        {{ $t('deposit.payType') }}
                    </view>
                    <view v-if='payTypesSortEnable.length > 0' class='pay-module'>
                        <view v-for='(item, index) in payTypesSortEnable' :key='index' class='pay-case'>
                            <view class='pay-channel' @click='choosePayType(item)'>
                                <image class='icon' :src='item.imgUrl || require("@/static/image/payment_icon/" + item.paymentType + ".png")' />
                                <span class='name'>
                                    {{ item.alias || item.paymentTypeAlias || item.paymentType }}
                                </span>
                                <tui-icon v-if='paymentTypes.length > 1 && item.id === payTypeId' :color='$style.minorColor' name='arrowdown' :size='40' unit='rpx' />
                                <radio v-else :checked='Number(item.id) === payTypeId' :color='$style.primary' :value="item.id + ''" />
                            </view>
                            <view :class="['currency-list', (item.id === payTypeId && paymentTypes.length > 1) ? 'show' : 'hide']">
                                <radio-group>
                                    <label v-for='currencyItem in paymentTypes' :key='currencyItem' class='item' @click='currencyChecked = currencyItem'>
                                        <span class='name'>
                                            {{ currencyItem }}
                                        </span>
                                        <radio :checked='currencyChecked === currencyItem' :color='$style.primary' :value='currencyItem' />
                                    </label>
                                </radio-group>
                            </view>
                        </view>
                    </view>
                    <view v-else class='none-channel'>
                        {{ $t('deposit.noneChannelTip') }}
                    </view>
                </view>
                <!-- 支付信息 -->
                <view v-if="checkedType && checkedType.paymentCode !== 'payredeem'" class='pay-info'>
                    <view class='item'>
                        <span>{{ $t('deposit.expectInBank') }}</span>
                        <strong>{{ computeAccount }} {{ currency }}</strong>
                    </view>
                </view>
            </view>
			
            <!-- 存款按钮 -->
            <view class='footer-handle'>
                <!-- payredeem -->
                <button v-if="checkedType && checkedType.paymentCode === 'payredeem'" class='btn' @click='payRedeemNext'>
                    <span>{{ $t('common.nextStep') }}</span>
                    <tui-icon class='arrow' name='arrowright' :size='32' unit='rpx' />
                </button>
                <!-- 其它支付 -->
                <button v-else class='btn' @click='confirmDeposit'>
                    <span>{{ $t('deposit.confirmPay') }} {{ computeExpectedpay }}{{ currencyChecked }}</span>
                    <tui-icon class='arrow' name='arrowright' :size='32' unit='rpx' />
                </button>
            </view>
        </view>
		
        <!-- 补充资料弹窗 -->
        <further-information 
            :extend='extend' 
            is-deposit 
            :visible.sync='appendVis' 
            @complete='completeExtend' 
        />
        <!-- payRedeem弹窗 -->
        <pay-redeem-dialog 
            ref='payRedeemDialog' 
            :show.sync='payRedeemVisible'
            @confirm='payRedeemSubmit'
        />
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>
// components 
import furtherInformation from '@/components/modules/further-information.vue'
import payRedeemDialog from './components/pay-redeem-dialog.vue'
// api
import { queryPayType, queryDepositExchangeRate, handleDesposit, checkKycApply, queryDepositProposal, judgeIsAlreadyDeposit } from '@/api/user'
import { getListByParentCode } from '@/api/base'
// vuex
import store from '@/store/index.js'
// utils
import { isEmpty, sessionSet, sessionGet, sessionRemove, arrayObjSort } from '@/utils/util'
import { mul, divide, toFixed } from '@/utils/calculation'
	
export default {
    components: {
        furtherInformation,
        payRedeemDialog
    },
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 玩法类型
            tradeType: '',
            // 账户id
            accountId: '',
            // 货币
            currency: '',
            // 存款金额列表
            amountList: [],
            // 当前选择的存款金额下标，其它金额：99
            currIndex: '',
            // 当前选择的存款金额数量
            amount: '',
            // 是否显示支付通道弹窗
            typeShow: false,
            // 全部支付通道
            payTypes: [],
            // 可用并排序的支付通道
            payTypesSortEnable: [],
            // 当前选择的支付通道
            checkedType: '',
            // 当前选择的支付通道id
            payTypeId: '',
            // 支付通道币种列表
            paymentTypes: [],
            // 当前选择的支付通道币种
            currencyChecked: '',
            // 当前支付通道存款时间
            resultTimeMap: {},
            // 是否显示存款提示弹窗
            despositVis: false,
            // 存款配置数据
            rateConfig: '',
            // 是否显示补充资料弹窗
            appendVis: false, 
            // 需要补充资料的数据
            extend: {}, 
            // 补充完整的资料数据
            appendMap: '',
            // 存款提案创建成功返回的数据
            despositResult: {},
            // 是否显示payRedeem弹窗
            payRedeemVisible: false
        }
    },
    computed: {
        // 获取存款配置数据
        depositData () {
            return store.state._base.wpCompanyInfo?.depositData
        },
        // 获取wp配置的支付通道图标
        paymentIconList () {
            return store.state._base.wpCompanyInfo?.paymentIconList
        },
        // 计算存款手续费
        computeFee () {
            // feeType  1：固定金额手续费 2：百分比手续费
            if (Number(this.checkedType.feeType === 1)) {
                return this.checkedType.fee
            } else if (Number(this.checkedType.feeType === 2)) {
                return mul(this.amount, (this.checkedType.fee))
            } else {
                return 0
            }
        },
        // 计算预计到账金额
        computeAccount () {
            if (this.amount && this.checkedType) {
                const value = parseFloat(this.amount) - parseFloat(this.computeFee)
                return value > 0 ? value : 0
            } else {
                return '--'
            }
        },
        // 计算预计支付金额
        computeExpectedpay () {
            const rateConfig = this.rateConfig
            if (rateConfig.exchangeRate) {
                const value = rateConfig.formulaSymbol === 'multiply' ? mul(this.amount, rateConfig.exchangeRate) : divide(this.amount, rateConfig.exchangeRate)
                return toFixed(value, rateConfig.targetDigits)
            }
            return ''
        }
    },
    watch: {
        // 监听存款金额
        amount () {
            // 过滤可用支付通道
            this.filterUsablePay()
        },
        // 监听支付币种
        currencyChecked () {
            if (this.currencyChecked) {
                // 获取存款货币对汇率
                this.getDepositExchangeRate()
            } else {
                this.rateConfig = {}
            }
        }
    },
    onLoad (options) {
        this.tradeType = options.tradeType
        this.accountId = options.accountId
        this.currency = options.currency
		
        // 初始化
        this.$init().then(() => {
            this.skeletonShow = false
            this.pageInit()
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('deposit_index_view')
    },
    onShow () {
        // 判断sessionStorage 里面有没有保存proposalNo，有则弹窗提醒
        if (sessionGet('proposalNo')) {
            // 存款弹窗提示
            this.depositTip()
        }
    },
    methods: {
        // 页面初始化
        pageInit () {
            // 设置存款金额数据
            this.setAmountList()
            // 获取支付通道
            this.getPayTypes()
        },
		
        // 跳转到充值记录页面
        onLink () {
            uni.navigateTo({
                url: '/pages/deposit/record'
            })
        },
		
        // 检查是否需要KYC认证
        checkKyc () {
            checkKycApply({
                businessCode: 'cashin'
            }).then(res => {
                if (Number(res.data) !== 2) {
                    this.$refs['modalDialog'].show({
                        content: Number(res.data) === 2 ? this.$t('deposit.KYCReviewing') : this.$t('deposit.needKYC'),
                        confirmText: Number(res.data) === 1 ? this.$t('common.goLook') : this.$t('login.goAuthenticate')
                    }).then(() => {
                        uni.redirectTo({
                            url: '/pages/person/authentication?businessCode=cashin'
                        })
                    })
                }
            })
        },
		
        // 请求存款提案
        queryDepositProposal () {
            // 请求存款提案
            const proposalNo = sessionGet('proposalNo')
            if (proposalNo) {
                sessionRemove('proposalNo')
                const params = {
                    customerNo: this.customerInfo.customerNo,
                    proposalNo,
                    tradeType: this.tradeType,
                    accountId: this.accountId
                }
                queryDepositProposal(params).then(res => {
                    if (Number(res.data.paymentStatus) !== 2) {
                        this.$refs['modalDialog'].show({
                            content: this.$t('deposit.despositFail'),
                            confirmText: this.$t('deposit.toRecord')
                        }).then(() => {
                            this.onLink()
                        })
                    }
                }).catch(res => {
                    this.$refs['modalDialog'].show({
                        content: res.msg
                    })
                })
            }
        },
		
        // 存款弹窗提示
        depositTip () {
            this.$nextTick(() => {
                this.$refs['modalDialog'].show({
                    tip: this.$t('deposit.payConfirm'),
                    content: this.$t('deposit.payConfirmTips'),
                    showCancel: true,
                    confirmText: this.$t('deposit.agreeText'),
                    cancelText: this.$t('deposit.denyText')
                }).then(() => {
                    // 请求存款提案
                    this.queryDepositProposal()
                }).catch(() => {
                    sessionRemove('proposalNo')
                })
            })
        },
		
        // 设置存款金额数据
        setAmountList () {
            judgeIsAlreadyDeposit({
                companyId: this.customerInfo.companyId,
                customerNo: this.customerInfo.customerNo,
                accountId: this.accountId
            }).then(res => {
                const arr = []
                const isDeposit = res.data
                const depositData = this.depositData
                let data = {}
                // 已存款
                if (isDeposit) {
                    data = depositData.isAlready ? depositData['already'] : depositData['default']
                } else {
                    // 未存款
                    data = depositData.isNot ? depositData['not'] : depositData['default']
                }
                // 处理存款数据
                for (const key in data) {
                    const item = data[key]
                    if (item.amount) {
                        arr.push({
                            amount: item.amount,
                            describe: item[this.currentLang]?.describe
                        })
                    }
                }

                // 没有存款数据设置默认数据
                const defaultAmountList = [{ amount: 50 }, { amount: 100 }, { amount: 500 }, { amount: 1000 }]

                // 数据赋值
                this.amountList = arr.length ? arr : defaultAmountList
                this.currIndex = 0
                this.amount = this.amountList[0].amount
            })
        },
		
        // 切换存款金额
        checkAmount (index, item) {
            this.currIndex = index
            this.amount = item.amount
        },
		
        // 获取货币图标
        getCurrencyIcon () {
            try {
                return require('@/static/image/currency_icon/' + this.currency + '.png')
            } catch (error) {
                return require('@/static/image/currency_icon/default.png')
            }
        },
		
        // 获取支付通道
        getPayTypes () {
            const params = {
                customerNo: this.customerInfo.customerNo,
                customerGroupId: this.customerInfo.customerGroupId,
                clientType: 'mobile',
                accountId: this.accountId,
                tradeType: this.tradeType,
                accountCurrency: this.currency
            }
            queryPayType(params).then(res => {
                if (res.data.length > 0) {
                    const result = []
                    const paymentIconList = this.paymentIconList
                    // 过滤掉直充支付通道、设置支付通道图标
                    res.data.forEach(el => {
                        if (el.rechargeType !== '1') {
                            const iconKey = el.paymentCode + '_' + el.paymentType + '_' + el.merchantNo
                            if (paymentIconList[iconKey]) {
                                el.alias = paymentIconList[iconKey][this.currentLang].alias || ''
                                el.imgUrl = paymentIconList[iconKey][this.currentLang].imgUrl || require('@/static/image/payment_icon/default.png')
                            } else {
                                el.imgUrl = require('@/static/image/payment_icon/default.png')
                            }
                            result.push(el)
                        }
                    })
                    this.payTypes = result
                    // 处理支付通道存款时间
                    this.handleShowTime()
                    // 过滤可用支付通道
                    this.filterUsablePay()
                }
            })
        },
		
        // 处理支付通道存款时间
        handleShowTime () {
            if (this.payTypes.length > 0) {
                const todayStr = this.$dayjs().format('YYYY-MM-DD')
                const tomorrowStr = this.$dayjs().add(1, 'day')
                this.payTypes.forEach(payItem => {
                    const openTime = payItem.openTime
                    let openTimeList
                    if (!isEmpty(openTime)) {
                        openTimeList = openTime.split(',')
                        openTimeList.forEach(item => {
                            this.resultTimeMap[payItem.id] = [].concat(this.resultTimeMap[payItem.id])
                            const [start, end] = item.split('-')
                            const startLocal = this.$dayjs.utc(`${todayStr} ${start}`).local()
                            const endLocal = this.$dayjs.utc(`${todayStr} ${end}`).local()

                            if ((startLocal.isAfter(todayStr, 'day') && endLocal.isAfter(todayStr, 'day')) || (startLocal.isBefore(tomorrowStr, 'day') && endLocal.isBefore(tomorrowStr, 'day'))) {
                                this.resultTimeMap[payItem.id].push(startLocal.format('HH:mm') + '-' + endLocal.format('HH:mm'))
                            } else if (endLocal.format('HH:mm') === '00:00') {
                                this.resultTimeMap[payItem.id].push(startLocal.format('HH:mm') + '-24:00')
                            } else {
                                this.resultTimeMap[payItem.id].push(startLocal.format('HH:mm') + '-23:59')
                                this.resultTimeMap[payItem.id].push('00:00-' + endLocal.format('HH:mm'))
                            }

                            // 判断当前时间是否在设置的存款时间内
                            const nowDate = this.$dayjs.utc()
                            const nowMinutes = nowDate.hour() * 60 + nowDate.minute() // 获取当前天的分钟数
                            const startMinutes = parseFloat(start.split(':')[0]) * 60 + parseFloat(start.split(':')[1]) // 计算开始时间的分钟数
                            const endMinutes = parseFloat(end.split(':')[0]) * 60 + parseFloat(end.split(':')[1]) // 计算结束时间的分钟数
                            if (nowMinutes >= startMinutes && nowMinutes <= endMinutes) {
                                payItem.timeRangeFlag = true
                            }
                        })
						
                        // 重新排序
                        const newTimeList = [] // 排序并筛选后的时间列表
                        this.resultTimeMap[payItem.id].filter(el => el).forEach(item => {
                            if (item.split('-')[0] === '00:00') {
                                newTimeList.unshift(item)
                            } else {
                                newTimeList.push(item)
                            }
                        })

                        // 处理时间重叠情况,如果第一段的结束时间和第二段开始时间相差一分钟则合并
                        const finalTimeResult = []
                        for (let index = 0; index < newTimeList.length; index++) {
                            const el = newTimeList[index]
                            if (!isEmpty(el)) {
                                const start = el.split('-')[0]
                                const end = el.split('-')[1]
                                const nextStart = newTimeList[index + 1] && newTimeList[index + 1].split('-')[0]
                                const nextEnd = newTimeList[index + 1] && newTimeList[index + 1].split('-')[1]
                                if (this.$dayjs(`${todayStr} ${end}`).add(1, 'minute').isSame(this.$dayjs(`${todayStr} ${nextStart}`))) {
                                    finalTimeResult.push(start + '-' + nextEnd)
                                    index++
                                } else {
                                    finalTimeResult.push(start + '-' + end)
                                }
                            }
                        }

                        this.resultTimeMap[payItem.id] = finalTimeResult
                    }
                })
                // console.log('resultTimeMap', this.resultTimeMap)
            }
        },
		
        // 过滤可用支付通道
        filterUsablePay () {
            if (this.payTypes.length > 0 && this.amount) {
                // 筛选在存款时间内的支付通道
                let temp = this.payTypes.filter(item => item.timeRangeFlag || item.openTime === '')
                // 筛选在存款金额内的支付通道
                if (this.amount) {
                    temp = temp.filter(v => (parseFloat(this.amount) >= v.singleLowAmount && parseFloat(this.amount) <= v.singleHighAmount))
                }
                // 对支付通道进行排序
                temp.sort(arrayObjSort('sort'))
                if (temp.length > 0) {
                    this.payTypesSortEnable = temp
                    this.checkedType = temp[0]
                    this.payTypeId = temp[0].id
                    this.extend = temp[0].extend
                    // 设置支付货币列表
                    this.setPaymentList(this.checkedType)
                } else {
                    this.payTypesSortEnable = []
                    this.checkedType = ''
                    this.payTypeId = ''
                    this.paymentTypes = []
                    this.currencyChecked = ''
                }
            } else {
                this.payTypesSortEnable = []
            }

            // 设置当前存款金额高亮
            const index = this.amountList.findIndex(item => parseFloat(item.amount) === parseFloat(this.amount))
            this.currIndex = index !== -1 ? index : ''
        },
		
        // 设置支付货币列表
        setPaymentList (payItem) {
            // 当前支付通道不需要支付货币列表
            if (payItem.channelConvertRate) {
                this.paymentTypes = []
                this.currencyChecked = ''
                return
            }
            // 支付币种为USDT获取链名称列表
            if (payItem.paymentCurrency === 'USDT') {
                this.getChainList()
            } else {
                // 设置支付币种列表数据
                this.paymentTypes = this.checkedType.paymentCurrency.split(',')
                this.currencyChecked = this.paymentTypes[0]
            }
        },
		
        // 获取币种链名称列表数据
        getChainList () {
            const paymentTypes = []
            getListByParentCode({ parentCode: 'USDT' }).then(res => {
                if (res.data.length > 0) {
                    res.data.forEach(item => {
                        paymentTypes.push(item.parentCode + '-' + item.code)
                    })
                    this.paymentTypes = paymentTypes
                    this.currencyChecked = paymentTypes[0]
                }
            })
        },
		
        // 选择支付通道
        choosePayType (item) {
            this.checkedType = item
            this.payTypeId = item.id
            this.extend = this.checkedType.extend
            item.checked = true
            this.typeShow = false
            // 设置支付货币列表
            this.setPaymentList(this.checkedType)
        },
		
        // 获取存款货币对汇率
        getDepositExchangeRate () {
            if (this.currencyChecked) {
                const param = {
                    customerNo: this.customerInfo.customerNo,
                    accountId: this.accountId,
                    tradeType: this.tradeType,
                    accountCurrency: this.currency,
                    paymentCurrency: this.currencyChecked.split('-').length > 1 ? this.currencyChecked.split('-')[0] : this.currencyChecked
                }
                queryDepositExchangeRate(param).then(res => {
                    this.rateConfig = res.data
                }).catch(res => {
                    this.$refs['modalDialog'].show({
                        content: res.msg
                    })
                })
            }
        },
		
        // 补充资料是否全部填写完成
        checkAllComplete () {
            let flag = true
            const extend = this.extend
            for (const key in extend) {
                if (Object.hasOwnProperty.call(extend, key)) {
                    const element = extend[key]
                    if (isEmpty(element.value)) {
                        flag = false
                    }
                }
            }
            return flag
        },
		
        // 完成补充资料
        completeExtend (data) {
            this.appendMap = data
            // 创建存款提案
            this.handleDeposit()
        },
		
        // 获取存款来源
        getDespositSource () {
            const systemInfo = this.systemInfo
            const platform = systemInfo.platform.toUpperCase()
            let source = ''
            // #ifdef H5
            source = 'H5_' + platform
            // #endif
            // #ifdef APP-PLUS 
            source = 'APP_' + platform
            // #endif
            return source
        },
		
        // 点击确认存款按钮
        confirmDeposit () {
            if (!this.amount) {
                return this.$toast(this.$t('deposit.selectAmount'))
            }
            if (!this.checkedType) {
                return this.$toast(this.$t('deposit.selectPayMethods'))
            }
            if (Number(this.amount) < Number(this.checkedType.singleLowAmount)) {
                return this.$toast(this.$t('deposit.amountMinTips') + `${this.checkedType.singleLowAmount}`)
            }
            if (Number(this.amount > Number(this.checkedType.singleHighAmount))) {
                return this.$toast(this.$t('deposit.amountMaxTips') + `${this.checkedType.singleHighAmount}`)
            }
            // 判断是否需要填写补充资料
            if (!this.checkAllComplete()) {
                this.appendVis = true
                return
            }
            
            // 创建存款提案
            this.handleDeposit()
        },
		
        // 获取存款参数
        getDepositParams () {
            let paymentCurrency = ''
            if (this.checkedType.paymentCurrency === 'USDT') {
                paymentCurrency = 'USDT'
            } else {
                paymentCurrency = this.currencyChecked ? this.currencyChecked : this.checkedType.paymentCurrency
            }
            const params = {
                tradeType: this.tradeType,
                customerNo: this.customerInfo.customerNo,
                customerGroupId: this.customerInfo.customerGroupId,
                country: this.customerInfo.country,
                channelCode: this.customerInfo.utmSource,
                accountId: this.accountId,
                depositRateSerialNo: this.rateConfig.depositRateSerialNo,
                paymentCurrency,
                accountCurrency: this.currency,
                exchangeRate: this.rateConfig.exchangeRate,
                paymentChannelCode: this.checkedType.paymentCode,
                paymentChannelType: this.checkedType.paymentType,
                paymentMerchantNo: this.checkedType.merchantNo,
                paymentChannelClientType: 'mobile',
                depositAmount: this.amount,
                depositFrom: this.getDespositSource(),
                callbackUrl: 'deposit',
                blockchainName: (this.currencyChecked && this.currencyChecked.split('-').length > 1) ? this.currencyChecked.split('-')[1] : ''
            }
            return params
        },
		
        // 创建存款提案
        handleDeposit () {
            const params = this.getDepositParams()
            if (!isEmpty(this.appendMap)) {
                params.extend = JSON.stringify(this.appendMap)
            }
            uni.showLoading({
                title: this.$t('common.submiting'),
                mask: true
            })
            handleDesposit(params).then(res => {
                uni.hideLoading()
                if (res.data) {
                    this.despositResult = res.data
                    // 存款提案创建成功
                    this.despositSuccess()
                    // 添加应用内事件
                    this.$addAppsEvent('complete_deposit_exchange')
                }
            }).catch(res => {
                uni.hideLoading()
                this.$refs['modalDialog'].show({
                    content: res.msg
                })
            })
        },
		
        // 存款提案创建成功
        despositSuccess () {
            const despositResult = this.despositResult
            if (despositResult.submitType === 'post_data') {
                sessionSet('formUrl', despositResult.url)
                sessionSet('formData', despositResult.data)
            } else {
                sessionSet('browserOpenUrl', despositResult.browserOpenUrl)
            }
            sessionSet('proposalNo', despositResult.proposalNo)
            // 跳转到支付页面
            uni.redirectTo({
                url: `/pages/webview/payment?currency=${this.currency}&accountId=${this.accountId}&tradeType=${this.tradeType}`
            })
        },
		
        // payRedeem点击下一步
        payRedeemNext () {
            if (!this.amount) {
                return this.$toast(this.$t('deposit.selectAmount'))
            }
            if (!this.checkedType) {
                return this.$toast(this.$t('deposit.selectPayMethods'))
            }
            this.payRedeemVisible = true
        },
		
        // payRedeem提交
        payRedeemSubmit (pinCode) {
            const params = this.getDepositParams()
            params.extend = pinCode
            uni.showLoading({
                title: this.$t('common.submiting'),
                mask: true
            })
            handleDesposit(params).then(res => {
                uni.hideLoading()
                this.$refs['payRedeemDialog'].close()
                this.$refs['modalDialog'].show({
                    content: this.$t('deposit.payRedeemSuccess')
                })
                // 添加应用内事件
                this.$addAppsEvent('complete_deposit_exchange')
            }).catch(res => {
                uni.hideLoading()
                this.$refs['modalDialog'].show({
                    content: res.msg
                })
            })
        }
    }
}
</script>

<style lang="scss" scoped>
::v-deep .nav-title-bar {
	@include styles('background', 'bgColor');
}
.layout-content {
	padding: 0 30rpx;
}
.deposit-title {
	font-size: 48rpx;
}

// 存款金额筛选
.amount-filter {
	padding-top: 30rpx;
	margin-bottom: 60rpx;
	.amount-list {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		.item {
			@include styles('background', 'contentColor');
			@include styles('border-color', 'lineColor');
			position: relative;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			width: 48%;
			height: 96rpx;
			margin-bottom: 20rpx;
			border: 1px solid var(--lineColor);
			border-width: 1rpx;
			border-style: solid;
			border-radius: 10rpx;
			cursor: pointer;
			position: relative;
			&:nth-of-type(2n) {
				margin-right: 0;
			}
			.check {
				display: none;
			}
			.t1 {
				@include styles('color', 'color');
				font-size: 28rpx;
			}
			.t2 {
				@include styles('color', 'focusColor');
				padding: 3rpx 10rpx;
				font-size: 20rpx;
				background: rgba(242, 161, 27, .1);
				border-radius: 30rpx;
			}
			&.active {
				@include styles('border-color', 'focusColor');
				background: rgba(242, 161, 27, .1) !important;
			}
		}
		.active {
			.check {
				@include styles('background', 'primary');
			    display: flex;
			    justify-content: center;
			    align-items: center;
			    width: 30rpx;
			    height: 30rpx;
			    border-radius: 0 10rpx 0 10rpx;
			    position: absolute;
			    top: -1px;
			    right: -1px;
				.tick {
					color: #fff !important;
				}
			}
			.t1 {
				@include styles('color', 'focusColor');
			}
			.t2 {
				@include styles('color', 'focusColor');
			}
		}
	}
	.other-amount {
		display: flex;
		justify-content: space-between;
		height: 96rpx;
		align-items: center;
		border-radius: 10rpx;
		.icon-currency {
			@include styles('background', 'contentColor');
			display: flex;
			align-items: center;
			height: 100%;
			margin-right: 20rpx;
			padding: 0 32rpx;
			border-radius: 10rpx;
			image {
				width: 48rpx;
				height: 48rpx;
				margin-right: 15rpx;
			}
			.label {
				font-size: 36rpx;
			}
		}
		input {
			@include styles('background', 'contentColor');
			border-radius: 10rpx;
			padding-left: 32rpx;
			flex: 1;
			height: 100%;
			font-size: 36rpx;
		}
	}
}
.pay-module {
	border-radius: 10rpx;
	margin-top: 30rpx;
	overflow: hidden;
	.pay-case {
		@include styles('background', 'contentColor');
		border-radius: 10rpx;
		padding-left: 40rpx;
		padding-right: 32rpx;
		margin-bottom: 30rpx;
		cursor: pointer;
		.pay-channel {
			display: flex;
			align-items: center;
			height: 112rpx;
			.icon {
				width: 60rpx;
				height: 60rpx;
				margin-right: 35rpx;
			}
			.name {
				@include styles('color', 'color');
				flex: 1;
				font-size: 28rpx;
			}
		}
		.currency-list {
			overflow: hidden;
			&.show {
				max-height: 1000px;
				transition: all .3s ease-in-out;
			}
			&.hide {
				max-height: 0;
			}
			.item {
				@include styles('border-top-color', 'lineColor');
				display: flex;
				justify-content: space-between;
				align-items: center;
				height: 112rpx;
				border-top-width: 1rpx;
				border-top-style: solid;
				.name {
					@include styles('color', 'color');
					font-size: 28rpx;
				}
				&:last-child{
					border-bottom: none;
				}
			}
		}
	}
}
.none-channel {
	@include styles('background', 'contentColor');
	@include styles('color', 'color');
	@include styles('border-color', 'lineColor');
	display: flex;
	justify-content: center;
	align-items: center;
	height: 150rpx;
	padding: 0 20rpx;
	margin-top: 30rpx;
	font-size: 25rpx;
	border-width: 1rpx;
	border-style: solid;
	border-radius: 10rpx;
}
// 支付信息
.pay-info {
    padding-bottom: 60rpx;
    .item {
        display: flex;
        align-items: center;
        height: 70rpx;
        span {
			@include styles('color', 'minorColor');
            margin-right: 10rpx;
            font-size: 24rpx;
        }
        strong {
			@include styles('color', 'focusColor');
			letter-spacing: -1rpx;
            font-size: 28rpx;
			font-weight: bold;
        }
    }
}
// 存款按钮
.footer-handle {
    padding: 30rpx;
    .btn {
		@include styles('background', 'primary');
		display: flex;
		justify-content: center;
		align-items: center;
        height: 80rpx;
        border-radius: 10rpx;
        span {
            color: #fff;
            font-size: 30rpx;
        }
		.arrow {
			color: #fff !important;
		}
    }
}
</style>
