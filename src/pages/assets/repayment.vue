<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar is-custom show-custom-title :title="$t('route.returnMoney')">
                <view class='header-nav'>
                    <view class='link' @click='goRecord'>
                        {{ $t('assets.returnRecord') }}
                    </view>
                </view>
            </nav-bar>
            <!-- 内容区域 -->
            <view class='layout-content'>
                <view class='repayment-module'>
                    <view class='box'>
                        <view class='label'>
                            <span>{{ $t('trade.yi') }}</span>
                            <strong>{{ outCurrency }}</strong>
                        </view>
                        <view class='line' />
                        <input v-model='outAmount' placeholderClass='placeholderClass' type='digit' />
                        <button class='all' @click='handleAll'>
                            {{ $t('trade.allPosition') }}
                        </button>
                    </view>
                    <view class='tip'>
                        {{ $t('trade.free') }} {{ outAccount.available }}{{ outCurrency }}
                    </view>
                    <view class='box'>
                        <view class='label'>
                            <span>{{ $t('trade.huan') }}</span>
                            <strong>{{ inCurrency }}</strong>
                        </view>
                        <view class='line' />
                        <input v-model='inAmount' disabled placeholderClass='placeholderClass' type='digit' />
                    </view>
                    <view class='tip'>
                        {{ $t('trade.daihuan') }} {{ inAccount.liabilities }}{{ inCurrency }}
                    </view>
                </view>
            </view>
            <!-- 底部按钮 -->
            <button class='footer-button' @click='returnMoney'>
                {{ $t('trade.huan') }} {{ inCurrency }}
            </button>
        </view>
		
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>
// vuex
import store from '@/store/index.js'
// api
import { manualRepayment, addRepaymentOrder, previewOrder } from '@/api/user.js'
// utils
import { debounce, isEmpty } from '@/utils/util.js'
// 防抖计算金额
let computeReturnMoney = () => {}
	
export default {
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
            // 以xx币还
            outCurrency: '',
            // 以xx币还的金额
            outAmount: '', 
            // 还xx币
            inCurrency: '',
            // 还xx币的金额
            inAmount: ''
        }
    },
    computed: {
        // 账户列表
        accountList () {
            return this.customerInfo?.accountList || []
        },
        // 资产信息
        assetsInfo () {
            return store.state._user.assetsInfo
        },
        // 以xx币还的账户
        outAccount () {
            return this.accountList.find(item => item.tradeType === Number(this.tradeType) && item.currency === this.outCurrency) || {}
        },
        // 还xx币的账户
        inAccount () {
            return this.accountList.find(item => item.tradeType === Number(this.tradeType) && item.currency === this.inCurrency) || {}
        },
        // 货币列表
        currencyList () {
            const arr = this.accountList.filter(item => Number(item.tradeType) === Number(this.tradeType)).map(el => {
                return {
                    currency: el.currency,
                    accountId: el.accountId
                }
            })
            return arr
        }
    },
    watch: {
        // 监听以xx币还的金额
        outAmount () {
            if (isEmpty(this.outAmount)) {
                this.inAmount = ''
                return
            }
            if (this.outCurrency === this.inCurrency) {
                this.inAmount = this.outAmount
            } else {
                computeReturnMoney()
            }
        }
    },
    onLoad (options) {
        this.tradeType = options.tradeType
        this.accountId = options.accountId
        this.currency = options.currency
        this.outCurrency = options.currency
        this.inCurrency = options.currency
		
        // 初始化
        this.$init().then(() => {
            this.skeletonShow = false
            this.queryCustomerAssetsInfo()
            computeReturnMoney = debounce(this.computeReturnMoney)
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('repayment_view')
    },
    methods: {	
        // 跳转到记录页面
        goRecord () {
            uni.navigateTo({
                url: '/pages/assets/record?type=2&tradeType=' + this.tradeType
            })
        },
		
        // 查询账户资产信息
        queryCustomerAssetsInfo () {
            store.dispatch('_user/queryCustomerAssetsInfo', { tradeType: this.tradeType })
        },
		
        // 计算还xx币的金额
        computeReturnMoney () {
            const params = {
                tradeType: this.tradeType,
                sourceCurrency: this.outCurrency,
                targetCurrency: this.inCurrency,
                requestNum: this.outAmount,
                requestTime: Date.now(),
                customerCurrency: this.assetsInfo.currency,
                remark: ''
            }
            previewOrder(params).then(res => {
                this.inAmount = res.data
            }).catch(() => {
                this.inAmount = ''
            })
        },
		
        // 点击全部
        handleAll () {
            if (parseFloat(this.outAccount.available) > parseFloat(this.inAccount.liabilities)) {
                this.outAmount = this.inAccount.liabilities
            } else {
                this.outAmount = this.outAccount.available
            }
        },
		
        // 点击还款
        returnMoney () {
            if (isEmpty(this.outAmount)) {
                return uni.showToast({
                    title: this.$t('trade.enterReturnAmount'),
                    icon: 'none'
                })
            }
            if (parseFloat(this.outAmount) <= 0) {
                return uni.showToast({
                    title: this.$t('trade.enterReturnAmountLess'),
                    icon: 'none'
                })
            }
            // 如果来源货币和目标货币相同，刚手动还款，否则通过下单还币
            if (this.outCurrency === this.inCurrency) {
                this.manualRepayment()
            } else {
                this.addRepaymentOrder()
            }
        },
		
        // 手动还款
        manualRepayment () {
            uni.showLoading({
                title: this.$t('common.submiting'),
                mask: true
            })
            manualRepayment({
                tradeType: this.tradeType,
                customerNo: this.customerInfo.customerNo,
                accountId: this.accountId,
                customerGroupId: this.customerGroupId,
                accountCurrency: this.currency,
                amount: this.outAmount,
            }).then(res => {
                uni.hideLoading()
                this.returnSuccess()
            }).catch(res => {
                uni.hideLoading()
                this.$refs['modalDialog'].show({
                    content: res.msg
                })
            })
        },
		
        // 下单还款
        addRepaymentOrder () {
            uni.showLoading({
                title: this.$t('common.submiting'),
                mask: true
            })
            addRepaymentOrder({
                tradeType: this.tradeType,
                sourceCurrency: this.outCurrency,
                targetCurrency: this.inCurrency,
                customerCurrency: this.assetsInfo.currency,
                requestNum: this.outAmount,
                requestTime: Date.now(),
                remark: ''
            }).then(res => {
                uni.hideLoading()
                this.returnSuccess()
            }).catch(res => {
                uni.hideLoading()
                this.$refs['modalDialog'].show({
                    content: res.msg
                })
            })
        },
		
        // 还款成功
        returnSuccess () {
            uni.showToast({
                title: this.$t('trade.repaymentSuccess'),
                icon: 'none'
            })
            this.queryCustomerAssetsInfo()
            this.outAmount = ''
            this.inAmount = ''
        }
    }
}
</script>

<style lang="scss" scoped>
.layout-content {
	@include styles('background-color', 'contentColor');
}
.header-nav {
	.link {
		@include flexAll;
		@include styles('color', 'primary');
		height: 100%;
		padding: 0 25rpx;
		font-size: 26rpx;
		position: absolute;
		top: 0;
		right: 0;
	}
}
.repayment-module {
	padding: 40rpx 30rpx;
	.box {
		@include flexAll;
		@include styles('background-color', 'assistColor');
		height: 80rpx;
		padding: 0 30rpx;
		font-size: 28rxp;
		.label {
			@include flexAlign;
			width: 130rpx;
			position: relative;
			span {
				@include styles('color', 'minorColor');
				flex: 1;
			}
		}
		.line {
			@include styles('background-color', 'lineColor');
			width: 1px;
			height: 40rpx;
			margin-left: 20rpx;
			margin-right: 20rpx;
		}
		input {
			flex: 1;
			height: 100%;
			margin-right: 20rpx;
		}
		.all {
			@include styles('color', 'primary');
			font-size: 25rpx;
		}
	}
	.tip {
		@include styles('color', 'minorColor');
		margin-top: 10rpx;
		margin-bottom: 40rpx;
		padding-left: 30rpx;
		font-size: 24rpx;
	}
}
.footer-button {
	@include flexAll;
	@include styles('background-color', 'primary');
	height: 90rpx;
	margin: 20rpx;
	font-size: 30rpx;
	color: #fff;
	border-radius: 6rpx;
}
</style>
