<template>
    <tui-bottom-popup :show='show' @close='close'>
        <view class='popup-assets-list'>
            <view class='title'>
                {{ direction === 'apply' ? $t('fundInfo.choosePayAsset') : $t('fundInfo.chooseRedeemWay') }}
            </view>
            <view v-for='item in list' :key='item.currencyCode' class='asset-item' @click='switchCurrency(item)'>
                <view class='left'>
                    <view class='top-block'>
                        <currency-icon
                            :currency='item.currencyCode'
                            :size='48'
                        />
                        <span class='currency'>
                            {{ item.currencyCode === 'self' ? $t('fundInfo.basketAssets') : item.currencyCode }}
                        </span>
                    </view>
                    <view v-if="item.currencyCode === 'self'" class='desc'>
                        {{ direction === 'apply' ? $t('fundInfo.payBasketBuy') : $t('fundInfo.getBasketAssets') }}
                    </view>
                    <view v-else class='desc'>
                        <span v-if="direction === 'apply'">
                            {{ $t('fundInfo.payCurrencyBuy', { currency: item.currencyCode }) }}
                        </span>
                    </view>
                    <view v-if="item.currencyCode === 'self'" class='currency-list'>
                        <currency-icon
                            v-for='(elem, index) in fundAssetsList'
                            :key='index'
                            :currency='elem.currencyCode'
                        />
                    </view>
                </view>
                <view class='right'>
                    <tui-icon 
                        :color='currency === item.currencyCode ? $style.success : $style.minorColor'
                        name='circle-fill'
                        :size='44'
                        unit='rpx'
                    />
                </view>
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
        // 资产列表
        list: {
            type: Array,
            default: () => []
        },
        // 默认选择的资产
        activeCurrency: {
            type: String,
            default: ''
        },
        // 基金底层资产列表数据
        fundAssetsList: {
            type: Array,
            default: () => []
        },
        // 类型 apply:申购 redeem:赎回
        direction: {
            type: String,
            default: ''
        }
    },
    data () {
        return {
            // 当前选择的资产
            currency: ''
        }
    },
    watch: {
        activeCurrency: {
            handler (val) {
                this.currency = val
            },
            immediate: true
        }
    },
    methods: {
        // 关闭弹窗
        close () {
            this.$emit('update:show', false)
        },
		
        // 切换资产
        switchCurrency (item) {
            if (this.currency === item.currencyCode) return
            this.currency = item.currencyCode
            this.close()
            this.$emit('select', item)
        }
    }
}
</script>

<style lang="scss" scoped>
.popup-assets-list {
	@include styles('background', 'bgColor');
    padding: 30rpx;
    .title {
        font-size: 32rpx;
        text-align: center;
    }
    .asset-item {
		@include styles('background', 'contentColor');
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 30rpx;
        padding: 30rpx;
        border-radius: 12rpx;
        .top-block {
			display: flex;
			align-items: center;
            .currency {
				@include styles('color', 'color');
                margin-left: 15rpx;
                font-weight: bold;
            }
        }
        .desc {
			@include styles('color', 'minorColor');
            margin-top: 10rpx;
            font-weight: bold;
        }
        .currency-list {
            margin-top: 30rpx;
            margin-left: 20rpx;
            &::v-deep {
            	.currency-img {
            		width: 40rpx !important;
            		height: 40rpx !important;
            		margin-left: -10rpx;
            	}
            }
        }
    }
}
</style>
