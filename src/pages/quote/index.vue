<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar :back-show='false' :show-title-bar='false' />
            <!-- 切换真实模拟 -->
            <top-nav ref='topNavRef' />

            <!-- 玩法选项卡 -->
            <play-tabs :model-value.sync='tradeType' />
            <!-- 玩法分类 -->
            <view class='category-case'>
                <play-category
                    class='category-box'
                    :model-value.sync='categoryId'
                    :trade-type='tradeType'
                    @update='updateProducts'
                />
                <tui-icon
                    class='search-icon'
                    :color='$style.color'
                    name='search'
                    :size='38'
                    unit='rpx'
                    @click='searchHandler'
                />
            </view>

            <!-- 基金banner -->
            <!-- <view 
                v-if='(tradeType === 5 && categoryId === 0 || categoryId === 2) && $config.isFund'
                class='etf-banner' 
                @click='goFundPage'
            >
                <image mode='widthFix' :src="'/static/image/pic/' + currentLang + '/ETF_banner.png'" />
            </view> -->
            <!-- 产品头部名称 -->
            <product-bar :sort-field.sync='sortField' :sort-type.sync='sortType' />
            <!-- 内容区域 -->
            <scroll-view class='layout-content' scroll-y>
                <product-list v-if='sortProdctList.length > 0' :product-list='sortProdctList' />
                <none-data v-else />
            </scroll-view>
            <!-- 活动倒计时 -->
            <activity-countdown @handleSwitch='handleSwitch' />
        </view>

        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>
import store from '@/store'
import { localGet } from '@/utils/util.js'
import { gte } from '@/utils/calculation'
import productBar from '@/components/modules/product-bar.vue'
import productList from '@/components/modules/product-list.vue'
import activityCountdown from '@/components/modules/activity-countdown.vue'

export default {
    components: {
        productBar,
        productList,
        activityCountdown
    },
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 玩法类型
            tradeType: '',
            // 分类id
            categoryId: '',
            // 产品列表
            productList: [],
            // 产品列表订阅数据
            productKeys: [],
            // etf banner显示的位置
            fundBannerPosition: '5-2',
            // 排序字段
            sortField: localGet('productListSortField') || '',
            // 排序方式 asc-升序 desc-降序
            sortType: localGet('productListSortType') || ''
        }
    },
    computed: {
        // 是否显示基金banner图片
        showFundBanner () {
            if (!this.fundBannerPosition) return false
            const arr = this.fundBannerPosition.split('-')
            return this.tradeType === Number(arr[0]) && this.categoryId === Number(arr[1])
        },
        // 排序后的产口列表数据
        sortProdctList () {
            const resultList = this.productList.filter(el => el.symbolName)
            if (this.sortField || this.sortType) {
                resultList.sort((a, b) => {
                    // 根据享元模式封装，默认是asc排序
                    let firstEl = a
                    let secondEl = b
                    const defaultInfinity = this.sortType === 'asc' ? Infinity : -Infinity

                    if (this.sortType === 'desc') {
                        firstEl = b
                        secondEl = a
                    }
                    if (this.sortField === 'symbolName') {
                        // 将有报价的产品排序到前面
                        if (parseFloat(firstEl['rolling_last_price']) && parseFloat(secondEl['rolling_last_price'])) {
                            return firstEl[this.sortField].localeCompare(secondEl[this.sortField])
                        } else if (parseFloat(firstEl['rolling_last_price']) || parseFloat(secondEl['rolling_last_price'])) {
                            const firtstValue = firstEl['rolling_last_price'] || defaultInfinity
                            const secondValue = secondEl['rolling_last_price'] || defaultInfinity
                            return gte(firtstValue, secondValue) ? 1 : -1
                        } else {
                            return 0
                        }
                    } else if (this.sortField === 'rolling_upDownWidth') {
                        const firtstValue = parseFloat(firstEl[this.sortField]) || defaultInfinity
                        const secondValue = parseFloat(secondEl[this.sortField]) || defaultInfinity
                        return firtstValue - secondValue
                    } else {
                        const firtstValue = firstEl[this.sortField] || defaultInfinity
                        const secondValue = secondEl[this.sortField] || defaultInfinity
                        return gte(firtstValue, secondValue) ? 1 : -1
                    }
                })
            }

            return resultList
        },
        // 是否显示全仓玩法真实模拟净值
        showFullNetAsset () {
            return store.getters.showFullNetAsset
        }
    },
    onShow () {
        // 添加应用内事件
        this.$addAppsEvent('quote_view')
        // 获取cats2系统维护配置
        store.dispatch('_global/getConfigSystem')

        // 初始化
        this.$init().then(() => {
            this.skeletonShow = false
            // 设置默认玩法类型
            const quoteTradeType = store.state._quote.quoteTradeType
            if (quoteTradeType) {
                this.tradeType = quoteTradeType
                store.commit('_quote/setQuoteTradeType', '')
            }
            // 订阅产品
            this.productSubscribe()
            // 订阅资产
            if (this.showFullNetAsset) {
                this.$MsgSocket.subscribedListAdd(() => {
                    this.$MsgSocket.subscribeAsset(1)
                })
            }
        }).catch(() => {
            this.skeletonShow = false
        })
    },
    onHide () {
        // 取消订阅产品
        this.$QuoteSocket.cancel_subscribe()
        // 取消订阅资产
        if (!this.showFullNetAsset && this.$MsgSocket) {
            this.$MsgSocket.cancelSubscribeAsset()
        }
    },
    methods: {
        // 跳转到基金页面
        goFundPage () {
            uni.navigateTo({
                url: '/pages/fund/index'
            })
            // 添加应用内事件
            this.$addAppsEvent('quote_fund_banner_click')
        },

        // 更新分类产品数据
        updateProducts (productList, productKeys) {
            this.productList = productList
            this.productKeys = productKeys
            this.productSubscribe()
        },
		
        // 订阅产品
        productSubscribe () {
            if (this.$QuoteSocket) this.$QuoteSocket.send_subscribe24H(this.productKeys)
        },

        // 跳转产品搜索
        searchHandler () {
            uni.navigateTo({
                url: '/pages/quote/search?tradeType=' + this.tradeType
            })
        },
        handleSwitch () {
            this.$refs.topNavRef.goDeposit()
        }
    }
}  
</script> 
 
<style lang="scss" scoped>
.layout-content {
    -webkit-overflow-scrolling: touch;
}

.category-case {
    @include flexAlign;
    @include styles('background-color', 'contentColor');

    .category-box {
        flex: 1;
        overflow: hidden;
        padding-right: 10rpx;
    }

    .search-icon {
        width: 80rpx;
    }
}

.etf-banner {
    @include styles('background', 'contentColor');

    image {
        display: block;
        width: 100%;
    }
}
</style>
