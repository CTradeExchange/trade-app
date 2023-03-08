<template>
    <view>
        <view class='tradeFormBar'>
            <trade-asset-bar
                v-model='amountPay'
                :currency='fund.shareTokenCode'
                :digits='fund.shareTokenDigits || 0'
                direction='redeem'
                :fund-assets-list='fundAssetsList'
                :label="$t('fundInfo.youPay')"
                :placeholder='payPlaceholder'
                @input='inputAmount'
            />
            <view class='switch-block'>
                <view class='switch'>
                    <image class='switch-icon' src='/static/image/icon/transfer.png' @click="$emit('switch', 'apply')" />
                    <view class='line' />
                </view>
                <view class='switch-text'>
                    <view>
                        <span class='muted'>
                            {{ $t('fundInfo.rate') }}:
                        </span>
                        <span class='muted'>
                            {{ mul(activeAssets.redemptionFeeProportion, 100) }}%
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
                :currency='activeCurrency'
                direction='redeem'
                :fund-assets-list='fundAssetsList'
                is-select
                :label="$t('fundInfo.wantGet')"
                @openExplain='openExplain'
                @openSelect='openSelect'
            />
        </view>
		
        <view class='pay-wrap'>
            <view class='title'>
                {{ $t('fundInfo.expectedGetAssets') }}
            </view>
            <!-- 一篮子资产 -->
            <view v-if="activeCurrency === 'self'" class='redeem-assets'>
                <view v-for='(item, index) in fundAssetsList' :key='index' class='redeem-asset-item'>
                    <currency-icon
                        :currency='item.currencyCode'
                        :size='60'
                    />
                    <view class='currency'>
                        {{ item.currencyCode }}
                    </view>
                    <view class='percent'>
                        {{ item.weight }}
                    </view>
                </view>
            </view>
            <!-- 单资产 -->
            <view v-else class='redeem-type'>
                <view class='header'>
                    <span>{{ $t('fundInfo.assets') }}</span>
                    <span>{{ $t('fundInfo.expectedGetAmount') }}</span>
                </view>
                <ul class='content'>
                    <li>
                        <div class='c-left'>
                            <currency-icon
                                :currency='activeCurrency'
                                :size='36'
                            />
                            <span class='currency-text'>
                                {{ activeCurrency }}
                            </span>
                        </div>
                        <view class='c-right'>
                            <span>{{ $t('fundInfo.t2Tip1') }}</span>
                        </view>
                    </li>
                </ul>
            </view>
            <view v-if="activeCurrency === 'self'" class='notice'>
                {{ $t('fundInfo.t2Tip2') }}
                <a class='toRule' href='javascript:;' @click='toRule'>
                    {{ $t('fundInfo.viewRule') }}
                </a>
            </view>
        </view>
		
        <view class='footerBtn' :style="{ 'bottom': systemInfo.platform === 'ios' ? 'env(safe-area-inset-bottom)' : 0 }">
            <button :class="{ 'disable': fund.canRedemption !== 1 }" @click='submitHandler'>
                {{ fund.canRedemption === 1 ? $t('fundInfo.sell'):$t('fundInfo.disabledSell') }}
            </button>
        </view>
		
        <!-- 资产说明弹窗 -->
        <currency-explain-dialog 
            :currency='activeCurrency'
            direction='redeem'
            :fund='fund'
            :fund-assets-list='fundAssetsList'
            :list='activeCurrencyList'
            :show.sync='currencyExplainShow'
        />
        <!-- 选择资产弹窗 -->
        <select-assets-dialog
            :active-currency='activeCurrency'
            direction='redeem'
            :fund-assets-list='fundAssetsList'
            :list='activeCurrencyList'
            :show.sync='selectShow'
            @select='selectAssets'
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
import store from '@/store'
import { fundRedeem } from '@/api/fund'
import { isEmpty } from '@/utils/util.js'
import { mul } from '@/utils/calculation.js'

export default {
    components: {
        tradeAssetBar,
        currencyExplainDialog,
        selectAssetsDialog
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
            // 赎回的数量
            amountPay: '',
            // 是否显示资产说明弹窗
            currencyExplainShow: false,
            // 是否显示资产选择弹窗
            selectShow: false,
            // 是否显示新增资产弹窗
            addAssetShow: false
        }
    },
    computed: {
        // 现货玩法的账户列表
        accountList () {
            return this.customerInfo?.accountList?.filter(el => el.tradeType === 5) || []
        },
        // 当前账户信息
        fundAccount () {
            return this.accountList?.find(el => el.currency === this.fund?.shareTokenCode)
        },
        // 基金底层资产列表
        fundAssetsList () {
            return this.fund.fundCurrencyList || []
        },
        // 可选择的资产币种列表
        activeCurrencyList () {
            const redemptionCurrencySetting = this.fund?.redemptionCurrencySetting || []
            return redemptionCurrencySetting
        },
        // 赎回份额输入框的placeholder 
        payPlaceholder () {
            const text = this.$t('fundInfo.canRedeemMax') + (this.fundAccount?.available || 0)
            return text
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
        },
		
        // 改变数量
        inputAmount () {
            this.queryFundNetValue()
        },
		
        // 跳转到申购规则页面
        toRule () {
            uni.navigateTo({
                url: '/pages/fund/rules?type=redeem'
            })
        },
		
        // 点击赎回
        submitHandler () {
            const fund = this.fund
            // 验证参数
            if (!this.customerInfo) {
                return uni.navigateTo({
                    url: '/pages/mine/login'
                })
            }
            if (fund.canRedemption !== 1) {
                return this.$toast(this.$t('fundInfo.disabledSell'))
            }
            if (isEmpty(this.amountPay)) {
                return this.$toast(this.$t('fundInfo.redeemNumPlaceholder'))
            }
            if (Number(this.amountPay) < Number(this.activeAssets.minRedemptionNum)) {
                return this.$toast(this.$t('fundInfo.redeemMinTip') + this.activeAssets.minRedemptionNum)
            }
            
            // 发起赎回
            uni.showLoading({
                title: this.$t('common.submiting'),
                mask: true
            })
            fundRedeem({
                fundId: fund.fundId,
                shares: this.amountPay,
                currencyCode: this.activeCurrency
            }).then(() => {
                uni.hideLoading()
                this.amountPay = ''
                this.$refs['modalDialog'].show({
                    title: this.$t('fundInfo.redeemSubmiteed'),
                    content: this.$t('fundInfo.redeemSubmiteedDesc'),
                    confirmText: this.$t('fundInfo.records'),
                    cancelText: this.$t('fundInfo.iknow'),
                    showCancel: true,
                    confirmTextColor: this.$style.primary
                }).then(() => {
                    uni.navigateTo({
                        url: '/pages/fund/record?current=1'
                    })
                }).catch(() => {})
				
                // 更新单个资产详情
                this.updateAccountAssetsInfo(this.fund.shareTokenCode)
                // 添加应用内事件
                this.$addAppsEvent('complete_fund_redeem')
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
	.redeem-type {
		overflow: hidden;
		.header {
			display: flex;
			justify-content: space-between;
			margin: 30rpx 0;
			padding: 0 40rpx;
		}
		.content {
			margin: 30rpx 0;
			padding: 0 30rpx;
			li {
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-bottom: 30rpx;
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
				}
			}
		}
	}
	.redeem-assets {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		margin: 30rpx 30rpx 0;
		.redeem-asset-item {
			@include styles('background', 'contentColor');
			@include styles('border-color', 'lineColor');
			width: calc((100% - 60rpx) / 3);  
			text-align: center;
			padding: 30rpx 0;
			margin-right: 30rpx;
			margin-bottom: 30rpx;
			border-width: 1px;
			border-style: solid;
			border-radius: 10rpx;
			&:nth-child(3n) { 
				margin-right: 0;
			}
			.currency {
				@include styles('color', 'color');
				margin: 10rpx 0 5rpx;
				font-weight: bold;
				font-size: 28rpx;
			}
			.percent {
				font-size: 20rpx;
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
