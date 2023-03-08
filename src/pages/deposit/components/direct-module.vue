<template>
    <view class='module-content'>
        <!-- 不在存款时间内 -->
        <view v-if='timeTip' class='none-times'>
            <tui-icon class='icon' name='clock-fill' />
            <view class='text'>
                {{ timeTip }}
            </view>
        </view>
        <!-- 充值操作 -->
        <view v-else class='module-case'>
            <view class='module-handle'>
                <view class='block first-block'>
                    <view class='block-label'>
                        <span>{{ $t('deposit.rechargeCurrency') }}</span>
                        <tui-icon
                            class='info'
                            :color='$style.minorColor'
                            name='about-fill'
                            :size='36'
                            unit='rpx'
                            @click="showInfo($t('deposit.rechargeCurrencyTip'))"
                        /> 
                    </view>
                    <view class='block-box'>
                        <view :class="['select', currencyShowMenu ? 'show' : 'hide']" @click.stop='toggleBuyMenu'>
                            <currency-icon v-if='paymentInfo' :currency='currency' :size='48' />
                            <span>{{ currency }}</span>
                            <tui-icon class='arrow' :color='$style.minorColor' name='arrowdown' :size='48' unit='rpx' />
                        </view>
                    </view>
                </view>
                <view class='block second-block'>
                    <view class='block-label'>
                        <span>{{ $t('deposit.rechargeNework') }}</span>
                        <tui-icon
                            class='info'
                            :color='$style.minorColor'
                            name='about-fill'
                            :size='36'
                            unit='rpx'
                            @click="showInfo($t('deposit.rechargeNeworkTip'))"
                        /> 
                    </view>
                    <view class='block-box'>
                        <view :class="['select', paymentShowMenu ? 'show' : 'hide']" @click.stop='togglePaymentMenu'>
                            <span>{{ chainName }}</span>
                            <tui-icon class='arrow' :color='$style.minorColor' name='arrowdown' :size='48' unit='rpx' />
                        </view>
                    </view>
                    <view class='block-tip'>
                        <tui-icon class='about' color='red' name='about-fill' :size='28' unit='rpx' />
                        <span>{{ $t('deposit.selectNeworkTip') }}</span>
                    </view>
                </view>
                <view>
                    <p class='address-title'>
                        {{ $t('deposit.sendAddress') }}
                    </p>
                    <!-- 复制地址 -->
                    <view v-if='address' class='address-box'>
                        <p class='text'>
                            {{ address }}
                        </p>
                        <button
                            class='copy'
                            @click='copyAddress'
                        >
                            {{ $t('common.copy') }}
                        </button>
                    </view>
                    <!-- 有地址 -->
                    <view v-if='address' class='have-address'>
                        <p class='tip'>
                            {{ $t('deposit.scanTip') }}
                        </p>
                        <view class='qr-code'>
                            <uqrcode ref='uQRCode' :size='150' :text='address' />
                        </view>
                        <view class='warn-box'>
                            <p><mp-html :content="$t('deposit.addressTip1', { singleLowAmount: accountInfo.singleLowAmount, currency })" /></p>
                            <p><mp-html :content="$t('deposit.addressTip2', { currency })" /></p>
                            <p><mp-html :content="$t('deposit.addressTip3', { chainName })" /></p>
                        </view>
                    </view>
                    <!-- 无地址 -->
                    <view v-else class='none-address'>
                        <p class='tip'>
                            <mp-html :content="$t('deposit.noneAddressTip', { currency })" />
                        </p>
                        <button class='get' @click='applyBindAddress'>
                            {{ $t('deposit.getAddress') }}
                        </button>
                    </view>
                </view>
            </view>
        </view>
		
        <!-- 选择资产弹窗 -->
        <assets-dialog 
            v-if='accountList.length > 0'
            :account-id.sync='accountId' 
            :account-list='accountList'
            :currency.sync='currency'
            :model-value.sync='currencyShowMenu' 
            :trade-type='tradeType' 
        />
        <!-- 选择链弹窗 -->
        <chain-dialog 
            v-if='chainList.length > 0'
            :chain-name.sync='chainName' 
            :list='chainList'
            :model-value.sync='paymentShowMenu'
        />
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
    </view>
</template>

<script>
import assetsDialog from '@/components/modules/assets-dialog'
import chainDialog from '@/components/modules/chain-dialog'
import { getCryptoBlockchainInfo, getBindRechargeAddress, applyRechargeBindAddress } from '@/api/user'	
import { isEmpty } from '@/utils/util'
	
export default {
    components: {
        assetsDialog,
        chainDialog
    },
    data () {
        return {
            // 页面参数
            options: {},
            // 玩法类型
            tradeType: '',
            // 存款币种列表
            accountList: [],
            // 当前选择的购买货币
            currency: '',
            // 当前账户id
            accountId: '',
            // 是否显示账户下拉菜单
            currencyShowMenu: false,
            // 当前直充支付通道
            paymentInfo: '',
            // 是否显示支付币种下拉菜单
            paymentShowMenu: false,
            // 链名称列表
            chainList: [],
            // 当前选中链名称
            chainName: '',
            // 充值地址
            address: '',
            // 是否可获取地址
            isGet: true,
            // 请求参数
            params: {},
            // 存款时间提示弹窗
            timeTip: ''
        }
    },
    computed: {
        // 账户信息
        accountInfo () {
            return this.accountList.find(el => el.currency === this.currency) || {}
        }
    },
    watch: {
        // 监听选中币种
        currency () {
            if (this.timeTip) return
            // 获取直充支付通道支持币种信息
            this.getChainInfo()
        },
        // 监听链名称
        chainName () {
            // 获取直充支付钱包地址
            this.getRechargeAddress()
        }
    },
    methods: {
        // 初始化数据
        init (data) {
            this.options = data
            this.tradeType = data.tradeType
            this.paymentInfo = data.paymentInfo
            this.$nextTick(() => {
                // 设置账户币种列表
                this.setAccountList()
                // 设置请求参数
                this.setParams()
                // 通道存款时间验证
                this.checkDepositTime()
            })	
        },
		
        // 弹出提示
        showInfo (content) {
            this.$refs['modalDialog'].show({
                content
            })
        },
		
        // 设置账户币种列表
        setAccountList () {
            const accountList = this.customerInfo.accountList.filter(el => Number(el.tradeType) === Number(this.tradeType))
            const data = this.paymentInfo.limitConfigList
            const result = []
            accountList.map(account => {
                data.map(el => {
                    if (account.currency === el.accountCurrency) {
                        result.push(account)
                    }
                })
            })
            // 设置默认选择币种
            let accountInfo = result.find(el => el.currency === this.options.currency) || {}
            if (result.length > 0) {
                if (isEmpty(accountInfo)) accountInfo = result[0]
                this.currency = accountInfo.currency
                this.accountId = accountInfo.accountId
            } else {
                uni.hideLoading()
            }
            this.accountList = result
        },
				
        // 通道存款时间验证
        checkDepositTime () {
            const openTime = this.paymentInfo.openTime
            let isDialog = false
            const timeList = []
            if (!isEmpty(openTime)) {
                const todayStr = this.$dayjs().format('YYYY-MM-DD')
                const tomorrowStr = this.$dayjs().add(1, 'day')
                const [start, end] = openTime.split('-')
                const startLocal = this.$dayjs.utc(`${todayStr} ${start}`).local()
                const endLocal = this.$dayjs.utc(`${todayStr} ${end}`).local()
                			
                if ((startLocal.isAfter(todayStr, 'day') && endLocal.isAfter(todayStr, 'day')) || (startLocal.isBefore(tomorrowStr, 'day') && endLocal.isBefore(tomorrowStr, 'day'))) {
                    timeList.push(startLocal.format('HH:mm') + '-' + endLocal.format('HH:mm'))
                } else if (endLocal.format('HH:mm') === '00:00') {
                    timeList.push(startLocal.format('HH:mm') + '-24:00')
                } else {
                    timeList.push(startLocal.format('HH:mm') + '-23:59')
                    timeList.push('00:00-' + endLocal.format('HH:mm'))
                }
                			
                // 判断当前时间是否在设置的存款时间内
                const nowDate = this.$dayjs.utc()
                const nowMinutes = nowDate.hour() * 60 + nowDate.minute() // 获取当前天的分钟数
                const startMinutes = parseFloat(start.split(':')[0]) * 60 + parseFloat(start.split(':')[1]) // 计算开始时间的分钟数
                const endMinutes = parseFloat(end.split(':')[0]) * 60 + parseFloat(end.split(':')[1]) // 计算结束时间的分钟数
                isDialog = !(nowMinutes >= startMinutes && nowMinutes <= endMinutes)
            } else {
                isDialog = true
            }
			
            // 不在存款时间弹窗
            let timeTip = ''
            let timeStr = ''
            if (isDialog) {
                timeList.map((el, index) => {
                    timeStr += timeList.length - 1 === index ? el : el + ','
                })
                timeTip = timeStr ? this.$t('deposit.timeTip1') + timeStr : this.$t('deposit.timeTip2')
                this.$refs['modalDialog'].show({
                    content: timeTip,
                    confirmText: this.$t('common.know')
                })
            } 
            this.timeTip = timeTip
        },
		
        // 设置请求参数
        setParams () {
            this.params = {
                accountCurrency: this.currency,
                paymentChannelClientType: 'mobile',
                paymentChannelCode: this.paymentInfo.paymentCode,
                paymentChannelType: this.paymentInfo.paymentType,
                paymentMerchantNo: this.paymentInfo.merchantNo
            }
        },
		
        // 获取直充支付通道支持币种信息
        getChainInfo () {
            this.chainList = []
            this.chainName = ''
            getCryptoBlockchainInfo({
                currency: this.currency,
                paymentCode: this.paymentInfo.paymentCode
            }).then(res => {
                this.chainList = res.data.blockchainList 
                if (this.chainList.length > 0) {
                    this.chainName = this.chainList[0]
                } else {
                    this.chainName = ''
                    this.address = ''
                }
            }).catch(() => {
                uni.hideLoading()
                this.address = ''
            })
        },
		
        // 获取直充支付钱包地址
        getRechargeAddress () {
            if (!this.chainName) return
            if (this.isGet) {
                this.isGet = false
                this.params.blockchainName = this.chainName
                getBindRechargeAddress(this.params).then(res => {
                    this.isGet = true
                    this.address = res.data.address
                    this.showGet = false
                }).catch(res => {
                    uni.hideLoading()
                    this.isGet = true 
                    this.address = ''
                    this.showGet = true
                })
            }
        },
		
        // 申请绑定直充支付钱包地址
        applyBindAddress () {
            // 添加应用内事件
            this.$addAppsEvent('deposit_direct_getaddress_click')
            // 验证
            if (isEmpty(this.chainName)) return this.$toast('Select network')
            if (this.isGet) {
                uni.showLoading({
                    title: this.$t('common.loading'),
                    mask: true
                })
                this.isGet = false
                this.params.blockchainName = this.chainName
                applyRechargeBindAddress(this.params).then(res => {
                    uni.hideLoading()
                    this.isGet = true
                    this.address = res.data.address
                    this.$refs['modalDialog'].show({
                        title: this.$t('common.tip'),
                        content: this.$t('deposit.addressDialogTip', { currency: this.currency, singleLowAmount: this.accountInfo.singleLowAmount }),
                        confirmText: this.$t('common.know')
                    })
                }).catch(res => {
                    uni.hideLoading()
                    this.isGet = true
                    this.$toast(res.msg)
                })
            }
        },
			
        // 控制购买币种弹窗
        toggleBuyMenu () {
            this.currencyShowMenu = !this.currencyShowMenu
            this.paymentShowMenu = false
        },
	
        // 控制支付币种弹窗
        togglePaymentMenu () {
            if (this.chainList.length === 0) return
            this.paymentShowMenu = !this.paymentShowMenu
            this.currencyShowMenu = false
        },
		
        // 复制地址 
        copyAddress () {
            uni.setClipboardData({
                data: this.address,
                showToast: false,
                success: () => {
                    uni.showToast({
                        title: this.$t('common.copySuccess'),
                        icon: 'none'
                    })
                }
            })
        }
    }
}
</script>

<style lang='scss' scoped>
.module-content {
	@include styles('background-color', 'contentColor');
	@include styles('border-color', 'lineColor');
	width: 690rpx;
	margin: 0 auto 30rpx;
	border-radius: 16rpx;
	border-style: solid;
	border-width: 1px;
}
.none-times {
	@include flexColumnCenter;
	flex: 1;
	padding: 80rpx 0;
	&::v-deep {
		.icon {
			@include styles('color', 'minorColor');
			font-size: 100rpx !important;
		}
	}
	.text {
		@include styles('color', 'minorColor');
		margin-top: 30rpx;
		padding: 0 30rpx;
		font-size: 27rpx;
		letter-spacing: 1rpx;
	}
}

.module-case {
	padding: 50rpx 30rpx;
}	
/* 充值操作 */
.module-handle {
    .block {
        position: relative;
        font-size: 32rpx;
    }
	.first-block {
		margin-bottom: 70rpx;
	}
	.second-block {
		margin-bottom: 35rpx;
	}
    .block-label {
		display: flex;
		align-items: center;
		margin-bottom: 16rpx;
        span {
			@include styles('color', 'color');
        }
		&::v-deep {
			.info {
				margin-left: 10rpx !important;
			}
		}
    }
    .block-box {
		@include styles('background-color', 'contentColor');
		@include styles('border-color', 'lineColor');
        display: flex;
        align-items: center;
        height: 96rpx;
		border-width: 1px;
		border-style: solid;
        border-radius: 10rpx;
        position: relative;
        &:hover {
            @include styles('border-color', 'primary');
			border-style: solid;
			border-width: 1px;
        }
        .select {
            display: flex;
            align-items: center;
            width: 100%;
            height: 100%;
            padding: 0 30rpx;
            cursor: pointer;
			&::v-deep {
				.currency-img {
					margin-right: 12rpx;
				}
			}
            span {
                flex: 1;
                margin-top: 6rpx;
				font-size: 30rpx;
            }
            .arrow {
                transition: .15s;
                margin-top: -4rpx;
            }
            &.show {
                .arrow {
                    margin-top: 4rpx;
                    transform: rotate(180deg);
                }
            }
        }
    }
    .block-tip {
        display: flex;
		align-items: flex-start;
        margin-top: 12rpx;
        font-size: 25rpx;
        color: red;
        ::v-deep {
            .about {
				margin-top: 4rpx !important;
                margin-right: 6rpx !important;
				transform: rotate(180deg);
            }
        }
    }
    .address-title {
        text-align: center;
    }
    .address-box {
		@include styles('background-color', 'assistColor');
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 25rpx;
        margin-top: 10rpx;
        border-radius: 10rpx;
        .text {
			@include styles('color', 'color');
            text-align: center;
            line-height: 32rpx;
            word-break: break-all;
            font-size: 24rpx;
        }
        .copy {
			@include styles('color', 'primary');
            font-size: 28rpx;
            font-weight: bold;
            background: none;
            cursor: pointer;
        }
    }
    .have-address {
		@include styles('background-color', 'bgColor');
        padding: 60rpx;
        margin-top: 20rpx;
        border-radius: 12rpx;
        .tip {
			line-height: 1.5;
            text-align: center;
        }
        .qr-code {
            display: flex;
            justify-content: center;
            margin: 24rpx auto 0;
            position: relative;
        }
        .warn-box {
            margin-top: 40rpx;
            p {
				@include styles('color', 'color');
                line-height: 1.5;
                font-size: 27rpx;
                b {
                    margin-left: 8rpx;
					font-weight: bold;
					color: red;
                }
            }
        }
    }
    .none-address {
		@include styles('background-color', 'bgColor');
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 60rpx;
        margin-top: 20rpx;
        border-radius: 12rpx;
        .tip {
			line-height: 1.5;
            text-align: center;
			b {
			    margin-left: 8rpx;
				font-weight: bold;
			}
        }
        .get {
			@include styles('background', 'primary');
            display: flex;
            justify-content: center;
            align-items: center;
            width: 250rpx;
            height: 80rpx;
            margin-top: 32rpx;
            font-size: 30rpx;
            color: #fff;
            border-radius: 10rpx;
            cursor: pointer;
        }
    }
}
</style>
