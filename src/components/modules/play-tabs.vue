<template>
    <view v-show='plans.length > 1' class='play-tabs'>
        <scroll-view class='scroll-view' :scroll-into-view="'scroll-' + activeIndex" scroll-with-animation scroll-x :show-scrollbar='false'>
            <block v-for='(item, index) in plans' :key='item.tradeType'>
                <view 
                    :id="'scroll-' + index" 
                    :class="{ 'item': true, 'active': activeIndex === index }" 
                    @click='switchPlay(item)'
                >
                    <span>{{ $t('tradeType' + '.' + item.tradeType) }}</span>
                </view>
            </block>
        </scroll-view>
    </view>
</template>

<script>
import store from '@/store/index.js'
import { getToken } from '@/utils/util.js'
	
export default {
    props: {
        // 当前玩法类型
        modelValue: {
            type: [Number, String],
            default: ''
        },
        // 当前玩法索引
        current: {
            type: Number,
            default: 0
        },
        // 默认玩法类型
        defaultValue: {
            type: [Number, String],
            default: ''
        },
        // 现货当钱包是否显示现货玩法
        showStop: {
            type: Boolean,
            default: false
        },
        // 是否根据存在产品过滤玩法
        isFilter: {
            type: Boolean,
            default: true
        }
    },
    data () {
        return {
            // 当前玩法下标索引，和current一致
            activeIndex: 0,
            // 玩法是否初始化完成
            isInited: false
        }
    },
    computed: {
        // 玩法列表
        plans () {
            const token = getToken()
            let list = []
            if (token) {
                list = this.customerInfo ? store.state._base.plans : []
            } else {
                list = store.state._base.plans || []
            }
            
            if (this.isWallet && !this.showStop) list = list.filter(el => Number(el.tradeType) !== 5)
            if (this.isFilter) list = list.filter(el => this.filterPlan(el.tradeType))
            const userProductCategory = store.getters.userProductCategory
            list = list.filter(el => {
                return userProductCategory[el.tradeType]?.find(o => o.listByUser?.length)
            })
            return list
        },
        // 存在产品的玩法长度
        plansLen () {
            const userProductCategory = store.getters.userProductCategory
            let arr = Object.keys(userProductCategory)
            arr = arr.filter(el => {
                return userProductCategory[el]?.find(o => o.listByUser?.length)
            })
            return arr.length
        },
        // 现货是否当钱包
        isWallet () {
            return this.wpCompanyInfo?.isWallet || false
        }
    },
    watch: {
        // 监听玩法列表数据
        plans () {
            if (this.isInited) return
            // 初始化玩法
            this.initPlay()
        },
        // 监听玩法索引
        current (newVal, oldVal) {
            if (newVal === oldVal) return
            const tradeType = Number(this.plans[this.current].tradeType)
            this.activeIndex = this.current
            if (tradeType !== Number(this.modelValue)) {
                this.$emit('update:modelValue', tradeType)
                this.$emit('switch', tradeType)
            }
        },
        // 监听玩法类型
        modelValue (newVal, oldVal) {
            if (newVal === oldVal) return
            const current = this.plans.findIndex(el => Number(el.tradeType) === Number(this.modelValue))
            this.$emit('update:current', current)
            this.activeIndex = current
        }
    },
    mounted () {
        // 初始化玩法
        this.initPlay()
    },
    methods: {
        // 初始化玩法
        initPlay () {
            if (this.plans.length > 0) {
                let tradeType = ''
                let current = ''
                const modelValue = Number(this.modelValue)
                current = this.plans.findIndex(el => Number(el.tradeType) === modelValue) 
                if (modelValue && current !== -1) {
                    tradeType = modelValue
                } else {
                    tradeType = Number(this.plans[0].tradeType)
                    current = 0
                }
                this.isInited = true
                this.activeIndex = current
                this.$emit('update:modelValue', tradeType)
                this.$emit('update:current', current)
                this.$emit('complete', this.plans)
            }
        },
		
        // 切换玩法 
        switchPlay (item) {
            if (Number(item.tradeType) !== Number(this.modelValue)) {
                const current = this.plans.findIndex(elem => Number(elem.tradeType) === Number(item.tradeType))
                this.$emit('update:modelValue', Number(item.tradeType))
                this.$emit('update:current', current)
                this.$emit('switch', Number(item.tradeType))
                this.activeIndex = current
            }
        },
		
        // 根据产品数据过滤玩法
        filterPlan (tradeType) {
            const arr = store.getters.userProductCategory[tradeType] || []
            let isHaveProduct = false
            arr.map(el => {
                if (el.listByUser.length > 0) {
                    isHaveProduct = true
                }
            })
            return isHaveProduct
        }
    }
}
</script>

<style lang="scss" scoped>	
scroll-view::-webkit-scrollbar {
	width: 0;
	height: 0;
	color: transparent;
}	
.play-tabs {
	@include styles('background-color', 'contentColor');
	@include styles('border-color', 'lineColor');
	height: 100rpx;
	padding: 0 25rpx;
	border-bottom-style: solid;
	border-bottom-width: 1px;
	.scroll-view {
		display: flex;
		height: 100%;
		white-space: nowrap;
		.item {
			@include styles('color', 'minorColor');
			display: inline-flex;
			align-items: center;
			height: 100%;
			margin-right: 60rpx;
			font-size: 32rpx;
			font-weight: bold;
			transition: ease-in-out .1s; 
		}
		.active {
			@include styles('color', 'color');
			font-size: 45rpx;
		}
	}
}
</style>
