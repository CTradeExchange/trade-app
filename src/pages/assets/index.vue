<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar :back-show='false' :show-title-bar='false' />
            <!-- 切换真实模拟 -->
            <top-nav ref='topNavRef' />
            <!-- 玩法选项卡 -->
            <play-tabs :current.sync='current' :is-filter='false' :model-value.sync='tradeType' show-stop
                       @complete='setPlans' @switch='switchPlay'
            />
            <!-- 内容区域 -->
            <view class='layout-content'>
                <view class='swiper' :current='current' @change='changeSwiper'>
                    <view v-for='(item, index) in plans' :key='index'>
                        <view v-if='Number(item.tradeType) === tradeType' class='scroll-view'>
                            <!-- 合约全仓 -->
                            <template v-if='Number(item.tradeType) === 1'>
                                <contract-all-warehouse :trade-type='tradeType' />
                                <position-list :list='positionList' :trade-type='tradeType' />
                            </template>
                            <!-- 合约逐仓 -->
                            <template v-if='Number(item.tradeType) === 2'>
                                <contract-by-warehouse :trade-type='tradeType' />
                                <position-list :list='positionList' :trade-type='tradeType' />
                            </template>
                            <!-- 杠杆全仓、现货 -->
                            <template v-if='$includePlay_2(item.tradeType)'>
                                <total-assets :trade-type='tradeType' />
                                <account-currency :trade-type='tradeType' />
                            </template>
                        </view>
                    </view>
                </view>
            </view>
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
// vuex
import store from '@/store/index.js'
// util
import { localGet } from '@/utils/util.js'
// comopnents
import contractAllWarehouse from './components/contract-all-warehouse.vue'
import contractByWarehouse from './components/contract-by-warehouse.vue'
import totalAssets from './components/totalAssets.vue'
import accountCurrency from './components/account-currency.vue'
import positionList from './components/position-list.vue'
import activityCountdown from '@/components/modules/activity-countdown.vue'

export default {
    components: {
        contractAllWarehouse,
        contractByWarehouse,
        totalAssets,
        accountCurrency,
        positionList,
        activityCountdown
    },
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 玩法列表
            plans: [],
            // 当前轮播图索引
            current: 0,
            // 当前玩法类型
            tradeType: ''
        }
    },
    computed: {
        // 持仓列表数据
        positionList () {
            return store.state._trade.positionList[this.tradeType] || []
        }
    },
    onShow () {
        // 此处只能调用pageFirstInit方法，若要添加其他方法，请添加在pageFirstInit里面
        this.pageFirstInit()
        // 获取cats2系统维护配置
        store.dispatch('_global/getConfigSystem')
    },
    onLoad () {
        // 设置默认玩法类型
        if (localGet('defaultTradeType')) this.tradeType = localGet('defaultTradeType')
    },
    onHide () {
        // 取消订阅资产
        if (this.$MsgSocket) {
            this.$MsgSocket.cancelSubscribeAsset()
        }
    },
    methods: {
        // 切换真实模拟账户后会在top-nav调用此方法
        pageFirstInit () {
            // 添加应用内事件
            this.$addAppsEvent('assets_view')
            // 初始化
            this.$init().then(() => {
                // 获取用户信息
                store.dispatch('_user/findCustomerInfo', false)
                // 首次打开不执行此操作
                if (!this.skeletonShow) {
                    // 页面初始化
                    this.pageInit()
                }

                this.skeletonShow = false
            }).catch(() => {
                this.skeletonShow = false
            })
        },
		
        // 页面初始化
        pageInit () {
            const tradeType = Number(this.tradeType)
            // 获取持仓列表
            if (this.$includePlay_1(tradeType)) {
                this.queryPositionList()
                // 订阅资产数据
                this.$MsgSocket.subscribedListAdd(() => {
                    this.$MsgSocket.subscribeAsset(tradeType)
                })
            }
            // 查询客户总资产信息
            if (this.$includePlay_2(tradeType)) {
                store.dispatch('_user/queryCustomerAssetsInfo', { tradeType })
            }
        },

        // 获取持仓列表
        queryPositionList () {
            const accountId = this.customerInfo.accountList.find(item => Number(item.tradeType) === Number(this.tradeType))?.accountId
            store.dispatch('_trade/queryPositionPage', {
                tradeType: this.tradeType,
                sortFieldName: 'openTime',
                sortType: 'desc',
                accountId
            }).then(res => {
                const { data } = res
                const productKeys = []
                if (data) {
                    data.map(elem => {
                        productKeys.push(elem.symbolId + '_' + elem.tradeType)
                    })
                }
                // 发起行情订阅
                this.$QuoteSocket.send_subscribe(productKeys)
            })
        },

        // 设置玩法列表数据
        setPlans (list) {
            this.plans = list
            this.pageInit()
        },

        // 切换玩法
        switchPlay () {
            this.pageInit()
        },

        // 改变轮播项
        changeSwiper (e) {
            this.current = e.detail.current
        },
        handleSwitch (type, callback) {
            this.$refs.topNavRef.goDeposit()
        }

    }
}
</script>

<style lang="scss" scoped>
.swiper {
    height: 100%;

    .scroll-view {
        height: 100%;
        overflow-y: auto;
    }

    &::v-deep {
        .none-data {
            margin: 10rpx 20rpx;
        }
    }
}
</style>
