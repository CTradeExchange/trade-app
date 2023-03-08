<template>
    <view>
        <view class='order-type'>
            <tui-tabs
                :color='$style.minorColor'
                :current-tab='currentIndex'
                item-width='100px'
                :padding='0'
                :selected-color='$style.primary'
                :slider-bg-color='$style.primary'
                :slider-width='110'
                :tabs='orderTypeList'
                unlined
                :width='orderTypeList.length * 100'
                @change='changeOrderType'
            />
            <!-- 全仓、逐仓可以设置杠杆 -->
            <span 
                v-if="[1,2].includes(product.tradeType) && product.marginInfo && product.marginInfo.type !== '1'"
                class='multipleBtn'
                @click='multipleVisible = true'
            >
                <span class='text'>
                    {{ mVal }}x
                </span>
                <tui-icon class='turningdown' name='turningdown' :size='24' />
            </span>
        </view>
		
        <!-- 全仓 -->
        <multiple-set-cross 
            v-if="product && product.tradeType === 1 && product.marginInfo && product.marginInfo.type !== '1'" 
            :multiple-val.sync='mVal'
            :product='product'
            :show.sync='multipleVisible'
        />
        <!-- 逐仓 -->
        <multiple-set
            v-if="product && product.tradeType === 2 && product.marginInfo && product.marginInfo.type !== '1'"
            :multiple-val.sync='mVal'
            :product='product'
            :show.sync='multipleVisible'
        />
    </view>
</template>

<script>
import multipleSet from '@/components/modules/multiple-set.vue'
import multipleSetCross from '@/components/modules/multiple-set-cross.vue'
export default {
    components: {
        multipleSet,
        multipleSetCross
    },
    props: {
        // 订单类型
        modelValue: {
            type: Number,
            default: 0
        },
        // 玩法类型
        tradeType: {
            type: [Number, String],
            default: ''
        },
        // 产品信息
        product: {
            type: Object,
            default: () => {}
        },
        // 默认杠杆倍数
        multipleVal: {
            type: [String, Number],
            default: ''
        },
        // 成交模式
        dealModeShowMap: {
            type: Object,
            default: () => {}
        }
    },
    data () {
        return {
            // 订单类型列表
            orderTypeList: [],
            // 订单类型索引
            currentIndex: 0,
            // 是否显示杠杆弹窗
            multipleVisible: false
        }
    },
    computed: {
        // 杠杆倍数
        mVal: {
            get: function () {
                return this.multipleVal
            },
            set: function (val) {
                this.$emit('update:multipleVal', val)
            }
        },
        limitOrderConfig () {
            return this.$store.state._global.config?.limitOrderConfig
        }
    },
    watch: {
        // 监听订单类型
        modelValue () {
            // 设置滑动条位置
            this.setSlide()
        },
        // 监听玩法类型
        tradeType () {
            this.setOrderTypeList()
        },
        // 监听产品
        'product.symbolId' (val) {
            this.setOrderTypeList()
        }
    },
    mounted () {
        // 设置滑动条位置
        this.setSlide()
    },
    methods: {
        // 设置滑动条位置
        setSlide () {
            const index = this.orderTypeList.findIndex(v => v.val === this.modelValue)
            if (index !== -1) {
                this.currentIndex = index
            }
        },
		
        // 设置订单类型列表
        setOrderTypeList () {
            const orderTypeList = [
                { name: this.$t('trade.marketPrice'), val: 1 }
            ]
            if (this.limitOrderConfig && this.limitOrderConfig.length > 0) {
                const key = `${this.tradeType}_${this.product.dealMode}`
                if (this.limitOrderConfig.includes(key)) {
                    orderTypeList.push({
                        name: this.$t('trade.pending2'),
                        val: 10
                    })
                }
            } else {
                const pendingTab = this.dealModeShowMap[this.product.dealMode]?.pendingTab || {}
                if (pendingTab.show && pendingTab.tradeType?.includes(parseInt(this.tradeType))) {
                    orderTypeList.push({
                        name: this.$t('trade.pending2'),
                        val: 10
                    })
                }
            }
            
            this.orderTypeList = orderTypeList
            this.$emit('update:modelValue', orderTypeList[0].val)
        },
		
        // 改变订单类型
        changeOrderType (e) {
            const orderType = this.orderTypeList[e.index].val
            this.$emit('update:modelValue', orderType)
            this.$emit('change')
        }
    }
}
</script>

<style lang="scss" scoped>
.order-type {
    @include styles('background-color', 'contentColor');
    justify-content: flex-start;
    margin-left: -20rpx;
    display: flex;
    justify-content: space-between;
    .multipleBtn {
        display: inline-flex;
        align-items: center;
        height: 48rpx;
        background: var(--assistColor);
        padding: 0 16rpx;
        border-radius: 6rpx;
        margin-top: 16rpx;
        @include styles('color', 'color');
        @include styles('background', 'assistColor');
        @include active();
        .text {
            display: inline-block;
            padding-right: 20rpx;
            font-size: 26rpx;
        }
        .turningdown {
            font-size: 20rpx;
            vertical-align: -10rpx;
        }
    }
}
</style>
