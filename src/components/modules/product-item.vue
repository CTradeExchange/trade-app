<template>
    <view
        class='productItem' 
        :class='[bgClass]' 
        :data-symbolId='product.symbolId'
        @click="$emit('open')"
    >
        <view class='cell'>
            <view
                class='th'
                :class='[
                    getLen(product.simplified) > 10 && "small",
                    getLen(product.simplified) > 15 && "mini"]'
            >
                <span class='name'>
                    {{ product.symbolName }}
                </span>
                <etf-icon v-if='product.etf' />
            </view>
            <view class='ft'>
                <span
                    class='buy_price'
                    :class='[product.last_color, "digits" + product.price_digits]'
                > 
                    {{ !product.rolling_last_price && product.rolling_last_price !== 0 ? '--' : product.rolling_last_price }}
                </span>
            </view>
            <view class='tb'>
                <span
                    class='sell_price'
                    :class='[product.rolling_upDownColor, "digits" + product.price_digits]'
                >
                    {{ !product.rolling_upDownWidth && product.rolling_upDownWidth !== 0 ? '--' : product.rolling_upDownWidth }}
                </span>
            </view>
        </view>
    </view>
</template>

<script>
import { getLen, localGet } from '@/utils/util.js'
let price = 0

export default {
    props: {
        // product
        product: {
            type: Object,
            default: () => {}
        }
    },
    data () {
        return {
            bgClass: ''
        }
    },
    computed: {
        chartColorType () {
            return localGet('chartConfig') ? Number(JSON.parse(localGet('chartConfig'))?.chartColorType) : 1
        }
    },
    watch: {
        // 如果 `question` 发生改变，这个函数就会运行
        'product.sell_price': {
            handler: function (val) {
                const product = this.product
                const chartColorType = this.chartColorType
                if (price === 0) {
                    if ((product.sell_color === 'riseColor' && chartColorType === 1) || (product.sell_color === 'fallColor' && chartColorType === 2)) {
                        this.bgClass = 'riseColorBgAni'
                    } else if ((product.sell_color === 'fallColor' && chartColorType === 1) || (product.sell_color === 'riseColor' && chartColorType === 2)) {
                        this.bgClass = 'fallColorBgAni'
                    }
                    price = val
                } else {
                    if (val - price > 0) {
                        this.bgClass = 'riseColorBgAni'
                    } else if (val - price < 0) {
                        this.bgClass = 'fallColorBgAni'
                    }
                    price = val
                }
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        getLen (simplified) {
            return getLen(simplified)
        }
    }
}
</script>

<style lang="scss" scoped>
.productItem {
	@include styles('background-color', 'contentColor');
    position: relative;
    padding: 0 30rpx;
    overflow: hidden;
	position: relative;
	&:after {
		@include styles('background', 'lineColor');
		content: '';
		width: 100%;
		height: 1px;
		transform: scaleY(.5);
		position: absolute;
		left: 0;
		bottom: 0;
	}
    .cell {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        height: 112rpx;
        .th {
			@include flexColumnAlign;
			flex: 1;
			height: 100%;
			overflow: hidden;
        }
        .tb {
			@include styles('color', 'minorColor');
            width: 200rpx;
            text-align: right;
        }
        .ft {
			@include styles('color', 'minorColor');
            width: 200rpx;
            text-align: left;
        }
		.price {
		    font-size: 30px;
		}
		.hd {
		    flex: 1;
		    color: var(--minorColor);
		    font-size: 22px;
		    line-height: 1.3;
		}
		.name {
			@include text-clamp-one;
		    color: var(--color);
		    font-weight: 400;
		    font-size: 30rpx;
		    &.small {
		        font-size: 26rpx;
		    }
		    &.mini {
		        font-size: 22rpx;
		    }
		}
		.symbolCode {
		    margin-top: 5px;
		}
		.sell_price,
		.buy_price {
		    font-size: 30rpx;
		    &.digits11,
		    &.digits12,
		    &.digits13 {
		        font-size: 26rpx;
		    }
		    &.digits14,
		    &.digits15,
		    &.digits16 {
		        font-size: 22rpx;
		    }
		}
		.sell_price {
			font-weight: bold;
		}
		.col {
		    width: 280rpx;
		    margin-left: 10rpx;
		    font-size: 24rpx;
		    text-align: right;
		}
		.upDownAmount {
		    padding-right: 15rpx;
		}
		::v-deep .etf-icon {
			margin-top: 5rpx;
		}
    }
}
</style>
