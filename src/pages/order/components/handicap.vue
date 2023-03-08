<template>
    <view class='orderHandicap'>
        <view class='selectBox'>
            <button class='selectBtn' @click.stop='showPopover = !showPopover'>
                <span>{{ handicapDigit }}</span>
                <tui-icon :color='$style.minorColor' name='turningdown' :size='32' unit='rpx' />
            </button>
            <tui-bubble-popup 
                direction='top'  
                left='0' 
                :mask='false' 
                position='absolute'
                :show='showPopover' 
                top='60rpx' 
                triangle-left='50%' 
                triangle-top='-22rpx'
                width='100%'
            >
                <view class='selectList'>
                    <view 
                        v-for='(item, index) in digitLevelList' 
                        :key='index' 
                        class='li'
                        @click.stop='selectDigit(item.text)'
                    >
                        {{ item.text }}
                    </view>
                </view>
            </tui-bubble-popup>
        </view>
        <view class='titleBar'>
            <view class='hd'>
                {{ $t('trade.priceLabel') }}
            </view>
            <view class='ft'>
                <span v-if='Number(product.tradeType) === 2'>
                    {{ $t('trade.quantity') }}
                </span>
                <span v-else>
                    {{ $t('trade.volumes') }}
                </span>
            </view>
        </view>
        <view class='priceMultiGear buy fallColor'>
            <view v-for='(item, index) in ask_deep' :key='index' class='item'>
                <span class='hd'>
                    {{ item.price_ask }}
                </span>
                <span class='ft'>
                    {{ formatAmount(item.volume_ask) }}
                </span>
                <span v-if='item.width' class='volunmePercent fallColorBg' :style="{ width:item.width + '%' }"></span>
            </view>
        </view>
        <view class='curPrice' :class='[product.cur_color]'>
            {{ lastPriceShow || '--' }}
        </view>
        <view class='priceMultiGear sell riseColor'>
            <view v-for='(item, index) in bid_deep' :key='index' class='item'>
                <span class='hd'>
                    {{ item.price_bid }}
                </span>
                <span class='ft'>
                    {{ formatAmount(item.volume_bid) }}
                </span>
                <span v-if='item.width' class='volunmePercent riseColorBg' :style="{ width:item.width+'%' }"></span>
            </view>
        </view>
    </view>
</template>

<script>
import store from '@/store'
import { deepClone, retainDecimal } from '@/utils/util'
import { lt, pow, formatAmount, gte, lte, toFixed, plus, div } from '@/utils/calculation'	

export default {
    props: {
        // 产品信息
        product: {
            type: Object,
            default: () => {}
        },
        // 深度报价小数位长度
        handicapDigit: {
            type: [String, Number],
            default: ''
        }
    },
    data () {
        return {
            // 是否显示下拉选择框
            showPopover: false,
            // 是否显示挂单
            showPending: false,
            // 最新成交价的颜色
            lastPriceColor: '',
            // 最新成交价，新的报价不在盘口范围内的时候过滤掉
            lastPriceShow: ''
        }
    },
    computed: {
        // 当前玩法挂单列表
        pendingList () {
            return store.state._trade?.pendingList[this.product?.tradeType]
        },
        // 盘口深度报价列表
        handicapList () {
            return store.state._quote.handicapList.find(item => item.symbol_id === String(this.product?.symbolId))
        },
        // 获取产品的深度小数位
        deepthDigits () {
            if (parseFloat(store.state._quote?.deepthDigits) === 1) {
                return 0
            } else if (parseFloat(store.state._quote?.deepthDigits) > 1) {
                return -(store.state._quote?.deepthDigits.length - 1)
            } else {
                return store.state._quote?.deepthDigits?.toString().split('.')?.[1].length
            }
        },
        // 最新盘口深度报价
        handicapResult () {
            if (this.handicapList) {
                const result = JSON.parse(JSON.stringify(this.handicapList))
                const tempArr = [] // 总量
                if (result?.ask_deep.length > 0) {
                    result.ask_deep.forEach(ask => {
                        tempArr.push(ask.volume_ask)
                    })
                }
		   
                if (result?.bid_deep.length > 0) {
                    result.bid_deep.forEach(bid => {
                        tempArr.push(bid.volume_bid)
                    })
                }
		   
                const maxValue = Math.max(...tempArr)
                const minValue = Math.min(...tempArr)
		   
                const diff = maxValue - minValue
                // 计算买入报价长度
                if (result?.ask_deep.length > 0) {
                    const buyPendingList = deepClone(this.pendingList && this.pendingList.filter(item => Number(item.direction === 2)))
		   
                    result.ask_deep.forEach(ask => {
                        ask.width = diff === 0 ? 0 : (parseFloat(ask.volume_ask) - parseFloat(minValue)) / diff * 100
                        ask.unitNum = 0
                        // 计算合并挂单数量
                        if (buyPendingList?.length > 0 && this.showPending) {
                            buyPendingList.forEach(bl => {
                                if (this.deepthDigits >= 0) {
                                    bl.requestPrice = parseFloat(retainDecimal(bl.requestPrice, this.deepthDigits))
                                } else {
                                    const tempNum = retainDecimal(bl.requestPrice, 0)
                                    bl.requestPrice = tempNum - parseInt(tempNum.substr(this.deepthDigits))
                                }
		   
                                if (bl.requestPrice === parseFloat(ask.price_ask)) {
                                    ask.unitNum = plus(bl.requestNum, ask.unitNum)
                                }
                            })
                        }
                    })
                }
		   
                // 计算卖出报价长度
                if (result?.bid_deep.length > 0) {
                    const sellPendingList = deepClone(this.pendingList && this.pendingList.filter(item => Number(item.direction === 1)))
                    result.bid_deep.forEach(bid => {
                        bid.width = diff === 0 ? 0 : (parseFloat(bid.volume_bid) - parseFloat(minValue)) / diff * 100
                        bid.unitNum = 0
                        // 计算合并挂单数量
                        if (sellPendingList?.length > 0 && this.showPending) {
                            sellPendingList.forEach(sl => {
                                if (this.deepthDigits >= 0) {
                                    sl.requestPrice = parseFloat(retainDecimal(sl.requestPrice, this.deepthDigits))
                                } else {
                                    const tempNum = retainDecimal(sl.requestPrice, 0)
                                    sl.requestPrice = tempNum - parseInt(tempNum.substr(this.deepthDigits))
                                }
		   
                                if (sl.requestPrice === parseFloat(bid.price_bid)) {
                                    bid.unitNum = plus(sl.requestNum, bid.unitNum)
                                }
                            })
                        }
                    })
                }
                return result
            } else {
                return ''
            }
        },
        // 买入
        ask_deep () {
            const askResult = this.handicapResult?.ask_deep?.slice(0, 5) || []
            if (askResult?.length < 5) {
                return this.fillPosition(askResult, 1)
            } else {
                return askResult
            }
        },
        // 卖出
        bid_deep () {
            const bidREsult = this.handicapResult?.bid_deep?.slice(0, 5) || []
            if (bidREsult?.length < 5) {
                return this.fillPosition(bidREsult, 2)
            } else {
                return bidREsult
            }
        },
        // 最新成交价
        lastPrice () {
            return store.state._quote.dealList[0]?.price
        },
        // 计算报价小数位档数
        digitLevelList () {
            const digits = []
            let symbolDigits = this.product?.price_digits || this.product?.symbolDigits || 0
            // 优先取昨收，如果没有则读开盘
            const price = (this.product?.yesterday_close_price || this.product?.open_price)
            while (symbolDigits > -3) {
                const v = pow(0.1, symbolDigits)
                // 当前档位不能大于报价缩进一位的值
                if (v <= (price / 10)) {
                    digits.push({ text: v })
                } else {
                    break
                }
                symbolDigits--
            }
            return digits.splice(0, 5)
        }
    },
    watch: {
        // 最新成交价的颜色
        lastPrice (newval, oldval) {
            this.lastPriceColor = lt(newval, oldval) ? 'fallColor' : 'riseColor'
            const askFirst = this.ask_deep[0]
            const bidFirst = this.bid_deep[0]
            if (lte(this.lastPrice, askFirst.price_ask) && gte(this.lastPrice, bidFirst.price_bid)) {
                this.lastPriceShow = this.lastPrice
            }
        },
        // 盘口变动时，如果最新价不在当前盘口买一卖一的范围内，(买一+卖一)/2算出最新价
        bid_deep (newval, oldval) {
            if (newval[0] === oldval[0]) return
            if (!parseFloat(newval[0].price_bid)) return
            const askFillList = this.ask_deep.filter(el => parseFloat(el.price_ask))
            const askFirst = askFillList[0]
            const bidFirst = this.bid_deep[0]
            const isBetween = lte(this.lastPriceShow, askFirst.price_ask) && gte(this.lastPriceShow, bidFirst.price_bid)
            if (!this.lastPriceShow || !isBetween) {
                const t = plus(askFirst.price_ask, bidFirst.price_bid)
                const m = div(t, 2)
                this.lastPriceShow = toFixed(m, this.product.symbolDigits)
            }
        }
    },
    methods: {
        formatAmount,
		
        // 报价不够5档，补空位
        fillPosition (data, type) {
            const keyLabel = {
                priceLabel: {
                    1: 'price_ask',
                    2: 'price_bid'
                },
                volume: {
                    1: 'volume_ask',
                    2: 'volume_bid'
                }
            }
            const result = data
            if (Array.isArray(result)) {
                let fillLength = 5 - data.length
                while (fillLength > 0) {
                    result.push({
                        [keyLabel.priceLabel[type]]: '--',
                        [keyLabel.volume[type]]: '--',
                        with: 0,
                        unitNum: 0
                    })
                    fillLength--
                }
            }
			
            return result
        },
		
        // 选择小位数
        selectDigit (value) {
            this.showPopover = false
            this.$emit('update:handicapDigit', value)
        }
    }
}
</script>

<style lang="scss" scoped>
.orderHandicap {
	padding-top: 25rpx;
	.titleBar {
		@include styles('color', 'placeholdColor');
		display: flex;
		justify-content: space-between;
		margin-top: 20rpx;
		margin-bottom: 10rpx;
		font-size: 26rpx;
	}
	.priceMultiGear {
		font-size: 24rpx;
		line-height: 40rpx;
		&.sell {
			// @include styles('color', 'riseColor');
		}
		&.buy {
			// @include styles('color', 'fallColor');
			display: flex;
			flex-flow: column-reverse;
		}
		.item {
			position: relative;
			display: flex;
			justify-content: space-between;
			.volunmePercent {
				// @include styles('backgorund', 'riseColor');
				position: absolute;
				top: 0;
				right: 0;
				max-width: 99%;
				height: 100%;
				opacity: 0.05;
				transition: all 0.3s linear;
				content: '';
				// &.buy {
				// 	@include styles('background', 'fallColor'); 
				// }
			}
			.ft {
				@include styles('color', 'normalColor');
			}
		}
	}
	.curPrice {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 70rpx;
		font-size: 30rpx;
	}
	.selectBox {
		display: inline-flex;
		position: relative;
		&::v-deep {
			.tui-popup-list {
				@include styles('background', 'assistColor');
				@include styles('color', 'minorColor');
			}
			.tui-triangle {
				@include styles('border-bottom-color', 'assistColor');
				margin-left: -3px !important;
			}
		}
		.selectList {
			padding: 10rpx 0;
			.li {
				@include styles('color', 'color');
				display: flex;
				align-items: center;
				height: 60rpx;
				padding: 0 20rpx;
				font-size: 26rpx;
			}
		}
		.selectBtn {
			@include styles('color', 'minorColor');
			@include styles('background', 'assistColor');
			display: inline-flex;
			justify-content: space-between;
			align-items: center;
			width: 160rpx;
			height: 40rpx;
			padding: 0 15rpx;
			font-size: 22rpx;
			line-height: 1;
			border-radius: 4rpx;
			&::v-deep .tui-icon-turningdown {
				margin-top: 2rpx !important;
				margin-right: -10rpx !important;
			}
		}
	}
}
</style>
