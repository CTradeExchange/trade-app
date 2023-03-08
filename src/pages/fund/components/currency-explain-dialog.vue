<template>
    <tui-bottom-popup :show='show' @close='close'>
        <view class='popup-body'>
            <tui-tabs
                :current-tab='currentIndex' 
                :height='100' 
                :item-width="(100 / tabs.length) + '%'"
                :tabs='tabs'
                @change='changeTabs'
            />
            <view class='popup-assets'>
                <!-- 申购 -->
                <template v-if="direction === 'apply'">
                    <!-- 一篮子资产 -->
                    <view v-if="currentCurrency === 'self'">
                        <view class='content'>
                            {{ $t('fundInfo.applyBasketExplain') }}
                        </view>
                        <view class='direction'>
                            <view class='currency-list'>
                                <currency-icon
                                    v-for='(elem, index) in fundAssetsList'
                                    :key='index'
                                    :currency='elem.currencyCode'
                                />
                            </view>
                            <view class='indicate'>
                                <view class='row'>
                                    <image src='/static/image/icon/arrow-down.png' />
                                </view>
                            </view>
                            <view class='to'>
                                <currency-icon :currency='fund.shareTokenCode' :size='48' />
                                <view class='currency-text'>
                                    {{ fund.shareTokenCode }}
                                </view>
                            </view>
                        </view>
                    </view>
                    <!-- 单资产 -->
                    <view v-else>
                        <view class='content'>
                            {{ $t('fundInfo.applyCurrencyExplain', { currency: currentCurrency }) }}
                        </view>
                        <view class='direction'>
                            <view class='from'>
                                <currency-icon
                                    :currency='currentCurrency'
                                    :size='48'
                                />
                                <view class='currency-text'>
                                    {{ currentCurrency }}
                                </view>
                            </view>
                            <view class='indicate'>
                                <view class='row'>
                                    <image src='/static/image/icon/arrow-down.png' />
                                </view>
                            </view>
                            <view class='to'>
                                <currency-icon :currency='fund.shareTokenCode' :size='48' />
                                <view class='currency-text'>
                                    {{ fund.shareTokenCode }}
                                </view>
                            </view>
                        </view>
                    </view>
                </template>
				
                <!-- 赎回 -->
                <template v-else>
                    <!-- 一篮子资产 -->
                    <view v-if="currentCurrency === 'self'">
                        <view class='content'>
                            {{ $t('fundInfo.redeemBasketExplain') }}
                        </view>
                        <view class='direction'>
                            <view class='to'>
                                <currency-icon :currency='fund.shareTokenCode' :size='48' />
                                <p class='currency-text'>
                                    {{ fund.shareTokenCode }}
                                </p>
                            </view>
                            <view class='indicate'>
                                <view class='row'>
                                    <image src='/static/image/icon/arrow-down.png' />
                                </view>
                            </view>
                            <view class='currency-list'>
                                <currency-icon
                                    v-for='(elem, index) in fundAssetsList'
                                    :key='index'
                                    :currency='elem.currencyCode'
                                />
                            </view>
                        </view>
                    </view>
                    <!-- 单资产 -->
                    <view v-else>
                        <view class='content'>
                            <view>{{ $t('fundInfo.redeemCurrencyExplain', { currency: currentCurrency }) }}</view>
                            <view class='equation'>
                                {{ $t('fundInfo.amountCalculation') }}
                            </view>
                        </view>
                        <view class='direction'>
                            <view class='to'>
                                <currency-icon :currency='fund.shareTokenCode' :size='48' />
                                <view class='currency-text'>
                                    {{ fund.shareTokenCode }}
                                </view>
                            </view>
                            <view class='indicate'>
                                <view class='row'>
                                    <image src='/static/image/icon/arrow-down.png' />
                                </view>
                            </view>
                            <view class='from'>
                                <currency-icon
                                    :currency='currentCurrency'
                                    :size='48'
                                />
                                <view class='currency-text'>
                                    {{ currentCurrency }}
                                </view>
                            </view>
                        </view>
                    </view>
                </template>
            </view>
            <view class='confirm-btn' @click='close'>
                {{ $t('common.sure') }}
            </view>
        </view>
    </tui-bottom-popup>
</template>

<script>
export default {
    props: {
        // 是否显示弹窗
        show: {
            type: Boolean,
            default: false
        },
        // 基金信息
        fund: {
            type: Object,
            default: () => {}
        },
        // 选项卡列表
        list: {
            type: Array,
            default: () => []
        },
        // 基金底层资产列表数据
        fundAssetsList: {
            type: Array,
            default: () => []
        },
        // 当前选择的资产
        currency: {
            type: String,
            default: ''
        },
        // 类型 apply:申购 redeem:赎回
        direction: {
            type: String,
            default: ''
        }
    },
    data () {
        return {
            // tabs数据
            tabs: [],
            // 当前选择的选项卡索引
            currentIndex: 0,
            // 当前选择的资产
            currentCurrency: ''
        }
    },
    watch: {
        list: {
            handler () {
                this.tabs = this.list.map(elem => {
                    return {
                        name: elem.currencyCode === 'self' ? this.$t('fundInfo.basketAssets') : elem.currencyCode,
                        currency: elem.currencyCode
                    }
                })
            },
            immediate: true
        },
        show: {
            handler (val) {
                if (val) {
                    const index = this.tabs.findIndex(el => el.currency === this.currency)
                    this.currentIndex = index
                    this.currentCurrency = this.currency
                }
            },
            immediate: true
        }
    },
    methods: {
        // 关闭弹窗
        close () {
            this.$emit('update:show', false)
        },
		
        // 切换选项卡
        changeTabs (e) {
            this.currentIndex = e.index
            this.currentCurrency = this.tabs[e.index].currency
        }
    }
}
</script>

<style lang="scss" scoped>
.popup-assets {
	height: 700rpx;
	padding: 0 40rpx;
	.content {
		margin: 40rpx 0;
		font-size: 26rpx;
	}
	.direction {
		text-align: center;
	}
	.equation {
		text-align: center;
	}
	.indicate {
		display: flex;
		justify-content: center;
		margin: 30rpx 0;
		.row {
			image {
				width: 18px;
				height: 83px;
			}
		}
	}
	.currency-list {
		&::v-deep {
			.currency-img {
				width: 48rpx !important;
				height: 48rpx !important;
				margin-left: -10rpx;
			}
		}
	}
	.currency-text {
		margin: 10rpx 0;
		font-weight: 700;
		color: var(--color);
	}
}
.confirm-btn {
	@include styles('background', 'primary');
	display: flex;
	height: 90rpx;
	justify-content: center;
	align-items: center;
	color: #fff;
	font-size: 30rpx;
}
</style>
