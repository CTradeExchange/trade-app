<template>
    <view class='pending-set'>
        <input
            v-model='inputValue' 
            :placeholder="$t('trade.priceLabel')" 
            placeholderClass='placeholderClass'  
            type='digit'
        />
        <!-- 提示组件 -->
        <float-tip v-if='warn'>
            {{ warn }}
        </float-tip>
    </view>
</template>

<script>
// vuex
import store from '@/store/index.js'
// calculation
import { lt, gt, pow } from '@/utils/calculation.js'
// components
import floatTip from './float-tip.vue'
	
export default {
    components: {
        floatTip
    },
    props: {
        // 默认值
        modelValue: {
            type: [Number, String],
            default: ''
        },
        // 方向
        direction: {
            type: String,
            default: ''
        },
        // 产品
        product: {
            type: Object,
            default: () => {}
        },
        // 提示
        pendingWarn: {
            type: [String, Boolean],
            default: ''
        }
    },
    data () {
        return {
            // 挂单值
            inputValue: ''
        }
    },
    computed: {
        // 挂单数据
        pendingRang () {
            const range = store.getters['_trade/pendingPriceRang']
            const limitRange = this.direction === 'buy' ? range.buyLimitRange : range.sellStopRange
            const stopRange = this.direction === 'buy' ? range.buyStopRange : range.sellLimitRange
            return {
                stopRangeMax: stopRange[1],
                stopRangeMin: stopRange[0],
                limitRangeMax: limitRange[1],
                limitRangeMin: limitRange[0],
                defaultBuyPrice: range.defaultBuyPrice,
                defaultSellPrice: range.defaultSellPrice
            }
        },
        // 步数
        step () {
            return pow(0.1, this.product.price_digits)
        },
        // 挂单提示
        warn () {
            const inputValue = this.inputValue
            const pendingRang = this.pendingRang
            if (!inputValue) {
                return false
            } else if (lt(inputValue, pendingRang.stopRangeMin) && gt(inputValue, pendingRang.limitRangeMax)) {
                return this.$t('trade.pendingPriceWarn')
            } else if (gt(inputValue, pendingRang.stopRangeMax) || lt(inputValue, pendingRang.limitRangeMin)) {
                return this.$t('trade.pendingPriceWarn2')
            } else {
                return false
            }
        }
    },
    watch: {
        // 监听modelValue
        modelValue () {
            if (this.inputValue !== this.modelValue) {
                this.inputValue = this.modelValue
            }
        },
        // 监听数字框的值
        inputValue (val) {
            this.$emit('update:modelValue', val)
            this.$emit('update:pendingWarn', this.warn)
        },
        // 监听买卖方向
        direction () {
            this.setDefaultPrice()
        }
    },
    mounted () {
        // 设置默认挂单价格
        this.setDefaultPrice()
    },
    destroyed () {
        this.$emit('update:modelValue', '')
    },
    methods: {
        // 设置默认挂单价格
        setDefaultPrice () {
            const value = this.pendingRang[this.direction === 'buy' ? 'defaultBuyPrice' : 'defaultSellPrice']
            this.inputValue = isNaN(value) ? '' : value
        }
    }
}
</script>

<style lang="scss" scoped>
.pending-set {
	@include styles('background-color', 'assistColor');
	height: 80rpx;
	input {
		flex: 1;
		height: 100%;
		text-align: center;
	}
}
</style>
