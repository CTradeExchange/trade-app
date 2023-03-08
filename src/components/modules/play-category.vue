<template>
    <view v-if='categoryList.length > 0' class='play-category'>
        <scroll-view class='scroll-view' :scroll-into-view="'scroll-' + (modelValue || 0)" scroll-with-animation scroll-x :show-scrollbar='false'>
            <block v-for='(item, index) in categoryList' :key='index'>
                <view :id="'scroll-' + index" :class="{ 'item': true, 'active': index === modelValue }" @click='switchCateogry(item, index)'>
                    <span>{{ item.title }}</span>
                </view>
            </block>
        </scroll-view>
    </view>
</template>

<script>
import { productSort } from '@/utils/method.js'
import store from '@/store/index.js'
	
export default {
    props: {
        // 产品分类id
        modelValue: {
            type: [Number, String],
            default: ''
        },
        // 玩法类型
        tradeType: {
            type: [Number, String],
            default: ''
        }
    },
    computed: {
        // 用户自选列表
        userSelfSymbolList () {
            return store.getters['userSelfSymbolList']
        },
        // 用户产品分类
        userProductCategory () {
            return store.getters['_quote/userProductCategory']
        },
        // 产品map数据
        productMap () {
            return store.state._quote.productMap
        },
        // 产品分类
        categoryList () {
            const categoryList = (this.userProductCategory[this.tradeType] || []).filter(e => e.listByUser.length)
            const listByUser = this.userSelfSymbolList[this.tradeType] || []
            let result = []
            const selfSymbol = {
                id: 0,
                title: this.$t('trade.favorites'),
                listByUser: listByUser
            }
            result = [
                selfSymbol,
                ...categoryList
            ]
            return result
        },
        // 默认板块下标
        defaultCategoryIndex () {
            return this.categoryList.length > 1 ? 1 : 0
        }
    },
    watch: {
        // 监听产品分类
        categoryList () { 
            if (this.categoryList.length > 0) {
                this.updateData(this.categoryList[this.defaultCategoryIndex], this.defaultCategoryIndex)
            }
        },
        // 监听productMap
        productMap () {
            if (this.categoryList.length > 0) {
                this.updateData(this.categoryList[this.defaultCategoryIndex])
            }
        }
    },
    methods: {
        // 切换分类
        switchCateogry (item, index) {
            if (index !== this.modelValue) {
                this.updateData(item, index)
            }
        },
		
        // 更新数据
        updateData (item, index = 0) {
            this.$emit('update:modelValue', index)
            const list = Object.assign([], item.listByUser)
            const tradeType = this.tradeType
            let productList = []
            if (Object.keys(this.productMap).length > 0) {
                list.forEach(symbolId => {
                    const product = this.productMap[`${symbolId}_${tradeType}`] 
                    if (product) {
                        productList.push(product)
                    }
                })
                // 产品排序
                productList = productSort(productList)
                const productKeys = productList.map(el => `${el.symbolId}_${el.tradeType}`)
                this.$emit('update', productList, productKeys)
            }
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
.play-category {
	@include styles('background-color', 'contentColor');
	padding: 15rpx 20rpx;
	.scroll-view {
		display: flex;
		white-space: nowrap;
		.item {
			@include styles('color', 'color');
			display: inline-flex;
			align-items: center;
			height: 56rpx;
			padding: 0 25rpx;
			margin-right: 15rpx;
			font-size: 28rpx;
			border-radius: 5rpx;
			&:last-of-type {
				margin-right: 0;
			}
		}
		.active {
			font-weight: bold;
			@include styles('color', 'primary');
			@include styles('background-color', 'primaryAssistColor');
		}
	}
}
</style>
