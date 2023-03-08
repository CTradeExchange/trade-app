<template>
    <tui-drawer :mode='mode' zIndex="1000" :visible='visible' @close='close'>
        <view class='sidebar-module'>
            <!-- 导航栏 -->
            <nav-bar :back-show='false' :show-title-bar='false' />
            <!-- 玩法选项卡 -->
            <view v-show='showPlay'>
                <play-tabs :model-value.sync='tradeType' />
            </view>
            <!-- 搜索 -->
            <view class='search-case'>
                <view class='search-box'>
                    <tui-icon class='search-icon' name='search' :size='32' unit='rpx' />
                    <input 
                        v-model='searchVal'
                        :placeholder="$t('search.keywords')" 
                        placeholderClass='placeholderClass'
                        @input='onSearch'
                    />
                    <tui-icon 
                        v-if='searchVal'
                        class='close-icon' 
                        name='close-fill' 
                        :size='34' 
                        unit='rpx'
                        @click='onClear'
                    />
                </view>
                <button class='cancel' @click='close'>
                    {{ $t('common.cancel') }}
                </button>
            </view>
            <!-- 玩法分类 -->
            <view v-show='showCategory'>
                <play-category 
                    :model-value.sync='categoryId'
                    :trade-type='tradeType'
                    @update='updateProducts'
                />
            </view>
            <!-- 产品数据 -->
            <view v-if='searchProducts.length > 0' class='product-list'>
                <tui-collapse :arrow='false' :current='current' :index='1'>
                    <template #content>
                        <view v-for='(item, index) in searchProducts' v-if='item.symbolName' :key='index' class='item' @click='selectProduct(item)'>
                            <span>{{ item.symbolName }}</span>
                            <etf-icon v-if='item.etf' />
                        </view>
                    </template> 
                </tui-collapse>
            </view>
            <!-- 无搜索数据 -->
            <none-data v-else />
        </view>
    </tui-drawer>
</template>

<script>
export default {
    props: {
        // 是否显示玩法
        showPlay: {
            type: Boolean,
            default: false
        },
        // 是否显示分类
        showCategory: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            // 是否显示弹窗
            visible: false,
            // 弹窗方向
            mode: 'left',
            // 玩法类型
            tradeType: '',
            // 分类id
            categoryId: '',
            // 产品列表
            productList: [],
            // 搜索后的产品列表数据
            searchProducts: [],
            // 搜索词
            searchVal: '',
            // 产品列表是否展开
            current: -1
        }
    },
    methods: {
        // 更新当前分类产品列表
        updateProducts (productList) {
            this.productList = productList
            this.onSearch()
        },
		
        // 过滤产品数据
        filterProducts () {
            if (this.searchVal.trim() === '') {
                this.searchProducts = this.productList
            } else {
                const result = this.productList.filter(elem => {
                    const searchContent = elem.symbolName + elem.symbolCode
                    return searchContent.toLowerCase().includes(this.searchVal.toLowerCase())
                })
                this.searchProducts = result
            }
        },
		
        // 显示弹窗
        show (tradeType = '') {
            if (tradeType) {
                this.tradeType = tradeType
            }
            this.visible = true
            setTimeout(() => {
                this.current = 1
            }, 300)
        },
		
        // 关闭弹窗
        close () {
            this.visible = false
            this.current = -1
            this.$emit('close')
        },
		
        // 搜索产品
        onSearch () {
            this.filterProducts()
        },
		
        // 清除搜索内容
        onClear () {
            this.searchVal = ''
            this.onSearch()
        },
		
        // 选择产品
        selectProduct (item) {
            this.$emit('select', this.tradeType, item) 
            this.visible = false
        }
    }
}
</script>

<style lang="scss" scoped>
.sidebar-module {
	@include flexColumn;
	@include styles('background-color', 'contentColor');
	width: 640rpx;
	height: 100%;
	.search-case {
		@include flexBetweenAlign;
		padding: 0 25rpx;
		margin-top: 20rpx;
		margin-bottom: 15rpx;
		.search-box {
			@include flexAlign;
			@include styles('background-color', 'assistColor');
			flex: 1;
			height: 68rpx;
			padding: 0 20rpx;
			border-radius: 5rpx;
			.search-icon {
				@include styles('color', 'minorColor');
			}
			input {
				flex: 1;
				height: 100%;
                @include styles('color', 'color');
                padding-left: 15rpx;
			}
			.close-icon {
				@include styles('color', 'minorColor');
				margin-left: 15rpx;
			}
		}
		.cancel {
			@include styles('color', 'normalColor');
			margin-left: 30rpx;
			font-size: 26rpx;
		}
	}
	.product-list {
		flex: 1;
		padding-bottom: 100rpx;
		overflow-y: auto;
		.item {
			@include flexAlign;
			@include styles('color', 'normalColor');
			height: 100rpx;
			padding: 0 30rpx;
			position: relative;
			&::after {
				@include styles('background-color', 'lineColor');
				content: '';
				width: 100%;
				height: 1px;
				transform: scaleY(0.5);
				position: absolute;
				left: 0;
				bottom: 0;
			}
			span {
				margin-right: 15rpx;
			}
		}
	}
}
</style>
