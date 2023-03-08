<template>
    <view>
        <view class='tradeFormBar'>
            <trade-asset-bar
                :currency='activeCurrency'
                direction='apply'
                :fund-assets-list='fundAssetsList'
                is-select
                :label="$t('fundInfo.youPay')"
                @openExplain='openExplain'
                @openSelect='openSelect'
            />
            <view class='switch-block'>
                <view class='switch'>
                    <image class='switch-icon' src='/static/image/icon/transfer.png' @click="$emit('switch', 'redeem')" />
                    <view class='line' />
                </view>
                <view class='switch-text'>
                    <view>
                        <span class='muted'>
                            {{ $t('fundInfo.rate') }}:
                        </span>
                        <span class='muted'>
                            {{ mul(activeAssets.purchaseFeeProportion, 100) }}%
                        </span>
                    </view>
                    <view>
                        <span class='muted'>
                            1 {{ fund.shareTokenCode }} =
                        </span>
                        <span class='muted'>
                            {{ '&nbsp' }}{{ fund.netValue }}{{ fund.currency }}
                        </span> 
                    </view> 
                </view>
            </view>
            <trade-asset-bar
                v-model='amountPay'
                :currency='fund.shareTokenCode'
                :digits='fund.shareTokenDigits || 0'
                direction='apply'
                :label="$t('fundInfo.wantGet')"
                :placeholder="$t('fundInfo.inputCount')"
                @input='inputAmount'
            />
        </view>
		
        <view class='pay-wrap'>
            <view class='title'>
                {{ $t('fundInfo.needAssets') }}
            </view>
            <view class='header'>
                <span>{{ $t('fundInfo.assets') }}</span>
                <span>{{ $t('fundInfo.payCount') }}</span>
            </view>
            <ul class='content'>
                <li v-for='item in lastAssetsPay' :key='item.currencyCode'>
                    <view class='flex'>
                        <view class='c-left'>
                            <currency-icon
                                :currency='item.currency'
                                :size='36'
                            />
                            <span class='currency-text'>
                                {{ item.currency }}
                            </span>
                        </view>
                        <view class='c-right'>
                            <view class='cr-inline'>
                                <span>{{ item.amountPay }}</span>
                            </view>
                            <view v-if='item.isShow' class='cr-icon'>
                                <tui-icon
                                    v-if='item.depositAmount > 0'
                                    :color='$style.primary'
                                    name='add-fill'
                                    :size='40'
                                    unit='rpx'
                                    @click='openAddAssets(item)'
                                />
                                <tui-icon
                                    v-else
                                    :color='$style.placeholdColor'
                                    name='circle-fill'
                                    :size='40'
                                    unit='rpx'
                                />
                            </view>
                        </view>
                    </view>
                    <view v-if='item.isShow && item.depositAmount > 0' class='error-text'>
                        * {{ $t('fundInfo.availableNot') }}{{ item.depositAmount }}
                    </view>
                </li>
            </ul>
            <view class='notice'>
                {{ $t('fundInfo.applyCalculateTip') }}
                <a class='toRule' href='javascript:;' @click='toRule'>
                    {{ $t('fundInfo.viewRule') }}
                </a>
            </view>
        </view>
		
        <view class='footerBtn' :style="{ 'bottom': systemInfo.platform === 'ios' ? 'env(safe-area-inset-bottom)' : 0 }">
            <button :class="{ 'disable': fund.canPurchase !== 1 }" @click='submitHandler'>
                {{ fund.canPurchase === 1 ? $t('fundInfo.buy'): $t('fundInfo.disabledBuy') }}
            </button>
        </view>
		
        <!-- 资产说明弹窗 -->
        <currency-explain-dialog 
            :currency='activeCurrency'
            direction='apply'
            :fund='fund'
            :fund-assets-list='fundAssetsList'
            :list='activeCurrencyList'
            :show.sync='currencyExplainShow'
        />
        <!-- 选择资产弹窗 -->
        <select-assets-dialog
            :active-currency='activeCurrency'
            direction='apply'
            :fund-assets-list='fundAssetsList'
            :list='activeCurrencyList'
            :show.sync='selectShow'
            @select='selectAssets'
        />
        <!-- 添加资产弹窗 -->
        <add-assets 
            :currency='addAssetsCurrency'
            :fund='fund'
            :show.sync='addAssetShow'
        />
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>
import tradeAssetBar from './trade-asset-bar.vue'
import currencyExplainDialog from './currency-explain-dialog.vue'
import selectAssetsDialog from './select-assets-dialog.vue'
import addAssets from './add-assets.vue'
import store from '@/store'	
import { fundCalcApplyShares, fundApply } from '@/api/fund'
import { isEmpty } from '@/utils/util.js'
import { mul, minus } from '@/utils/calculation'	
export default {
    components: {
        tradeAssetBar,
        currencyExplainDialog,
        selectAssetsDialog,
        addAssets
    },
    props: {
        // 基金数据
        fund: {
            type: Object,
            default: () => {}
        }
    },
    data () {
        return {
            // 当前选择的资产币种
            activeCurrency: '',
            // 当前选择的资产数据
            activeAssets: {},
            // 支付的数量
            amountPay: '',
            // 单资产需要支付的资产
            singleAssetsPay: null,
            // 一篮子需要支付的资产
            selfAssetsList: [],
            // 是否显示资产说明弹窗
            currencyExplainShow: false,
            // 是否显示资产选择弹窗
            selectShow: false,
            // 是否显示新增资产弹窗
            addAssetShow: false,
            // 新增资产的货币
            addAssetsCurrency: ''
        }
    },
    computed: {
        // 现货玩法的账户列表
        accountList () {
            return this.customerInfo?.accountList?.filter(el => el.tradeType === 5) || []
        },
        // 基金底层资产列表
        fundAssetsList () {
            return this.fund.fundCurrencyList || []
        },
        // 可选择的资产币种列表
        activeCurrencyList () {
            const purchaseCurrencySetting = this.fund?.purchaseCurrencySetting || []
            return purchaseCurrencySetting
        },
        // 处理后需要支付的资产
        lastAssetsPay () {
            const result = []
            // 一篮子资产
            if (this.activeCurrency === 'self') {
                this.fundAssetsList.map(elem => {
                    const item = {
                        currency: elem.currencyCode,
                        amountPay: '0.00',
                        isShow: false
                    }
                    const account = this.accountList.find(el => el.currency === item.currency)
                    const payItem = this.selfAssetsList.find(el => el.currency === item.currency)
                    item.available = account?.available || 0
                    if (payItem) {
                        item.isShow = true
                        item.amountPay = payItem.amount
                        // 计算需要充值的金额
                        item.depositAmount = minus(item.amountPay, item.available)
                    }
                    result.push(item)
                })
            } else {
                // 单资产
                const item = {
                    currency: this.activeCurrency,
                    amountPay: '0.00',
                    isShow: false
                }
                const account = this.accountList.find(el => el.currency === item.currency)
                const payItem = this.singleAssetsPay
                if (account && payItem) {
                    item.isShow = true
                    item.available = account.available
                    item.amountPay = payItem.amountPay
                    // 计算需要充值的金额 
                    item.depositAmount = minus(item.amountPay, item.available)
                }
                result.push(item)
            }
            return result
        }
    },
    watch: {
        // 监听activeCurrencyList
        activeCurrencyList: {
            handler () {
                // 第一次设置默认选中
                if (this.activeCurrencyList.length > 0 && !this.activeCurrency) {
                    this.activeCurrency = this.activeCurrencyList[0].currencyCode
                    this.activeAssets = this.activeCurrencyList[0]
                }
            },
            immediate: true
        },
        // 监听activeCurrency
        activeCurrency: {
            handler () {
                this.updateAccountAssetsInfo(this.activeCurrency)
            },
            immediate: true
        }
    },
    methods: {
        mul,
		
        // 获取基金净值数据
        queryFundNetValue () {
            store.dispatch('_quote/fundNetValue', { fundId: this.fund.fundId })
        },
		
        // 更新单个资产详情
        updateAccountAssetsInfo (currency) {
            const account = this.accountList.find(el => el.currency === currency)
            if (account) {
                store.dispatch('_user/queryAccountAssetsInfo', {
                    tradeType: 5,
                    accountId: Number(account.accountId)
                })
            }
        },
		
        // 打开资产说明弹窗
        openExplain () {
            this.currencyExplainShow = true 
        },
		
        // 打开资产选择弹窗
        openSelect () {
            this.selectShow = true
        },
		
        // 选择资产
        selectAssets (item) {
            this.activeCurrency = item.currencyCode
            this.activeAssets = item
            this.updateAccountAssetsInfo(item.currencyCode)
            this.queryFundNetValue()
            this.fundCalcApplyShares()
        },
		
        // 显示添加资产弹窗
        openAddAssets (item) {
            this.addAssetShow = true
            this.addAssetsCurrency = item.currency
        },
		
        // 改变数量
        inputAmount () {
            this.queryFundNetValue()
            this.fundCalcApplyShares()
        },
		
        // 跳转到申购规则页面
        toRule () {
            uni.navigateTo({
                url: '/pages/fund/rules?type=apply'
            })
        },
		
        // 获取申购数据
        fundCalcApplyShares () {
            // 验证参数
            if (isEmpty(this.amountPay)) {
                this.singleAssetsPay = null
                this.selfAssetsList = []
                return false
            }
            if (Number(this.amountPay) < Number(this.activeAssets.minPurchaseNum)) {
                this.singleAssetsPay = null
                this.selfAssetsList = []
                return this.$toast(this.$t('fundInfo.applyMinTip') + this.activeAssets.minPurchaseNum)
            }
            // 发起请求
            fundCalcApplyShares({
                fundId: this.fund.fundId,
                amountPay: this.amountPay,
                currencyPay: this.activeCurrency,
                applyType: 2
            }).then(res => {
                const { data } = res
                if (this.activeCurrency === 'self') {
                    this.selfAssetsList = data.list || []
                } else {
                    this.singleAssetsPay = data
                }
                // 更新单个基金产品信息
                store.commit('_quote/Update_fundProduct', { netValue: data.sharesNet })
            })
        },
		
        // 点击申购
        submitHandler () {
            const fund = this.fund
            // 验证参数
            if (!this.customerInfo) {
                return uni.navigateTo({
                    url: '/pages/mine/login'
                })
            }
            if (fund.canPurchase !== 1) {
                return this.$toast(this.$t('fundInfo.disabledBuy'))
            }
            if (isEmpty(this.amountPay)) {
                return this.$toast(this.$t('fundInfo.subScriptePlaceholder'))
            }
            if (Number(this.amountPay) < Number(this.activeAssets.minPurchaseNum)) {
                return this.$toast(this.$t('fundInfo.applyMinTip') + this.activeAssets.minPurchaseNum)
            }
            let assetsTip = ''
            this.lastAssetsPay.map(elem => {
                if (elem.depositAmount > 0) assetsTip += elem.currency + '、'
            })
            if (assetsTip) {
                assetsTip = assetsTip.substring(0, assetsTip.length - 1)
                assetsTip = assetsTip + ' \n' + this.$t('fundInfo.applyNotTip')
                return this.$toast(assetsTip)
            }
            
            // 发起申购
            uni.showLoading({
                title: this.$t('common.submiting'),
                mask: true
            })
            fundApply({
                fundId: fund.fundId,
                amountPay: this.amountPay,
                currencyPay: this.activeCurrency,
                applyType: 2
            }).then(() => {
                uni.hideLoading()
                this.amountPay = ''
                this.fundCalcApplyShares()
                this.$refs['modalDialog'].show({
                    content: this.$t('fundInfo.applySuccessed'),
                    confirmText: this.$t('fundInfo.records'),
                    cancelText: this.$t('fundInfo.iknow'),
                    showCancel: true,
                    confirmTextColor: this.$style.primary
                }).then(() => {
                    uni.navigateTo({
                        url: '/pages/fund/record?current=0'
                    })
                }).catch(() => {})
               
                // 添加应用内事件
                this.$addAppsEvent('complete_fund_apply')
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
.muted {
	@include styles('color', 'minorColor');
}
.tradeFormBar {
	@include styles('background', 'contentColor');
    position: relative;
    padding: rem(30px);
	margin-top: 20rpx;
}
.switch-block {
	display: flex;
	align-items: center;
	margin: 50rpx 0;
	.switch {
		position: relative;
		.line {
			@include styles('border-right-color', 'placeholdColor');
			height: 120rpx;
			border-right-width: 1px;
			border-right-style: dashed;
			position: absolute;
			top: -30rpx;
			right: 50rpx;
			z-index: 0;
		}
	}
	.switch-icon {
		@include styles('color', 'primary');
		position: relative;
		z-index: 1;
		width: 56rpx;
		height: 56rpx;
		margin-right: 20rpx;
		cursor: pointer;
	}
	.switch-text {
		line-height: 42rpx;
	}
}
.pay-wrap {
    position: relative;
	margin-top: 30rpx;
    margin-bottom: 120rpx;
    padding: 30rpx 0;
    background: var(--contentColor);
    .title {
        font-weight: bold;
        font-size: 30rpx;
        text-align: center;
    }
    .header {
        display: flex;
        justify-content: space-between;
        margin: 30rpx 0;
        padding: 0 40rpx;
    }
    .content {
		@include styles('border-bottom-color', 'lineColor');
        margin: 30rpx;
		border-bottom-width: 1px;
		border-bottom-style: solid;
        li {
            margin-bottom: 40rpx;
            .flex {
                display: flex;
                align-items: center;
                justify-content: space-between;
                .c-left {
                    display: flex;
                    align-items: center;
                    height: 100%;
                    .currency-text {
                        margin-top: 4rpx;
                        margin-left: 10rpx;
                        font-weight: bold;
                    }
                }
                .c-right {
                    display: flex;
                    align-items: center;
                    text-align: right;
					.cr-inline {
						font-size: 28rpx;
					}
					.cr-icon {
						margin-left: 20rpx;
					}
                }
            }
            .error-text {
				@include styles('color', 'warn');
                margin-top: 10rpx;
                text-align: right;
				font-size: 26rpx;
            }
        }
    }
    .notice {
		@include styles('color', 'minorColor');
        padding: 0 30rpx;
        .toRule {
			@include styles('color', 'primary');
            text-decoration: underline;
        }
    }
}
.footerBtn {
	width: 100%;
	position: fixed;
	left: 0;
    button {
		@include styles('background', 'primary');
		display: flex;
		height: 90rpx;
		justify-content: center;
		align-items: center;
		color: #fff;
        font-size: 30rpx;
		&.disable {
			@include styles('background', 'minorColor');
		    opacity: .5;
		}
    }
}
</style>
