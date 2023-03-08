<template>
    <view :change-color='changeColor' class='layout' :class='currentTheme' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar ref='topNavRef' :back-show='false' :show-title-bar='false' />
            <!-- 顶部导航 -->
            <top-nav ref='topNavRef' />
            <!-- 骨架屏内容 -->
            <skeleton v-if='skeletonShow' />
            <!-- 内容区域 -->
            <scroll-view v-else class='layout-content' scroll-y @scrolltolower='loadMore'>
                <!-- 看见信号 再交易 -->
                <!-- <view class='w-container'>
                    <signal />
                    <notice-list :list='listNotice' />
                </view> -->
                <!-- 产品 -->
                <view class='w-container'>
                    <products :list='productKeys' />
                </view>
                <!-- 公告 -->
                <view class='w-container'>
                    <notice-list :list='listNotice' />
                </view>
                <!-- 注册/模拟开户 -->
                <view class='w-container'>
                    <quick-options @goDeposit='goDeposit' />
                </view>
                <!-- 导航 -->
                <view class='w-container'>
                    <list-links />
                </view>
                <view class='w-container' :style='{ overflow: "hidden" }'>
                    <view class='flow-tabs'>
                        <tui-tabs
                            :color='$style.minorColor'
                            :current-tab='current'
                            :height='90'
                            :item-width="(100 / newsTypes.length) + '%'"
                            :selected-color='$style.color'
                            :slider-bg-color='$style.primary'
                            :tabs='newsTypes'
                            unlined
                            @change='switchTabs'
                        />
                    </view>
                    <loading-more v-if='showLoading' status='loading' />
                    <template v-else>
                        <!-- 要闻 -->
                        <template v-if='currentVal === 7'>
                            <template v-if='newsTypes[0].list.length > 0'>
                                <new-list :list='newsTypes[0].list' :orgid='newsTypes[0].orgid' />
                                <loading-more :status='newsTypes[0].loadStatus' />
                            </template>
                            <none-data v-else />
                        </template>
                        <!-- 快讯 -->
                        <template v-if='currentVal === 8'>
                            <template v-if='newsTypes[1].list.length > 0'>
                                <short-new :list='newsTypes[1].list' />
                                <loading-more :status='newsTypes[1].loadStatus' />
                            </template>
                            <none-data v-else />
                        </template>
                        <!-- 财经日历 -->
                        <template v-if='currentVal === -1'>
                            <finance-date />
                        </template>
                    </template>
                </view>
            </scroll-view>
        </view>
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>
import store from '@/store'
import { beforeTime } from '@/utils/util.js'
import { getNoticeList } from '@/api/user.js'
// components
// import signal from './components/signal.vue'
import quickOptions from './components/quick-options.vue'
import products from './components/products.vue'
import financeDate from './components/finance-date.vue'
import listLinks from './components/list-links.vue'
import noticeList from './components/notice-list.vue'
import newList from './components/new-list.vue'
import shortNew from './components/short-new.vue'
import skeleton from './components/skeleton.vue'
import { newsListByTypeByPage } from '@/api/information.js'

export default {
    components: {
        // signal,
        noticeList,
        quickOptions,
        products,
        financeDate,
        listLinks,
        newList,
        shortNew,
        skeleton
    },
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 公告列表数据
            listNotice: [],
            // 信息流选项卡
            showLoading: true,
            newsTypes: [
                {
                    name: this.$t('information.focusNews'),
                    orgid: 1,
                    type: 7,
                    page: 1,
                    size: 10,
                    list: [],
                    loadStatus: 'more'
                },
                {
                    name: this.$t('information.newsFlash'),
                    orgid: 1,
                    type: 8,
                    page: 1,
                    size: 10,
                    list: [],
                    loadStatus: 'more'
                },
                {
                    name: this.$t('information.calendar'),
                    type: -1
                }
            ],
            current: 0,
            currentVal: 7
        }
    },
    computed: {
        // 报价列表
        productKeys () {
            if (this.customerInfo?.companyType === 'demo') {
                return this.$config.productKeysDemo
            }
            return this.$config.productKeys
        },
        // 是否显示全仓玩法真实模拟净值
        showFullNetAsset () {
            return store.getters.showFullNetAsset
        }
    },
    onLoad () {
        // 获取信息流列表数据
        this.getNewsListByTypeByPage(7)
        this.getNewsListByTypeByPage(8)
    },
    onShow () {
        // 初始化
        this.$init().then(() => {
            this.skeletonShow = false
            // 获取公告数据
            this.loadNoticeList()
            // 订阅产品
            this.$QuoteSocket.send_subscribe24H(this.productKeys)
            // 订阅资产
            if (this.showFullNetAsset) {
                this.$MsgSocket.subscribedListAdd(() => {
                    this.$MsgSocket.subscribeAsset(1)
                })
            }
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('home_view')
        // 获取cats2系统维护配置
        store.dispatch('_global/getConfigSystem')
    },
    onHide () {
        // 取消订阅产品
        if (this.$QuoteSocket) this.$QuoteSocket.cancel_subscribe()
        // 取消订阅资产
        if (!this.showFullNetAsset && this.$MsgSocket) {
            this.$MsgSocket.cancelSubscribeAsset()
        }
    },
    methods: {
        // 切换选项卡
        switchTabs (e) {
            this.current = e.index
            this.currentVal = this.newsTypes[e.index].type
        },

        // 获取公告数据
        loadNoticeList () {
            getNoticeList({
                current: 1,
                lang: this.currentLang,
                size: 3,
                customerNo: this.customerInfo.customerNo,
                accountId: this.accountId,
            }).then(res => {
                if (res.check()) {
                    if (res.data.records && res.data.records.length > 0) {
                        this.listNotice = res.data.records
                    }
                }
            })
        },
		
        // 获取信息流列表数据
        getNewsListByTypeByPage (type) {
            const item = this.newsTypes.find(v => v.type === type)
            if (item.loadStatus !== 'more') return
            item.loadStatus = 'loading'
            newsListByTypeByPage({
                page: item.page,
                pageSize: item.size,
                type,
                orgid: item.orgid
            }, this.currentLang).then(res => {
                const { data } = res
                data.map(elem => {
                    elem.updatetimeStr = beforeTime(elem.updatetime * 1000)
                })
                item.list = item.page === 1 ? data : item.list.concat(data)
                item.loadStatus = item.list.length === res.total ? 'noMore' : 'more'
                item.page += 1
                this.showLoading = false
            }).catch(() => {
                this.showLoading = false
            })
        },
		
        // 加载更多信息流列表数据
        loadMore () {
            if (this.skeletonShow) return
            if (this.currentVal !== -1) {
                this.getNewsListByTypeByPage(this.currentVal)
            }
        },
		
        // 跳转到充值页面
        goDeposit () {
            this.$refs.topNavRef.goDeposit()
        }
    }
}
</script>

<style lang="scss" scoped>
.w-container {
    @include styles('background-color', 'contentColor');
    margin: 12rpx 16rpx;
    border-radius: 8rpx;
}
</style>
