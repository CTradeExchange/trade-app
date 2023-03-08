<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar :title="$t('tradeType' + '.' + tradeType)" />
            <!-- 头部选项卡 -->
            <view class='header-tabs'>
                <tui-tabs 	
                    :color='$style.minorColor'
                    :current-tab='tabIndex' 
                    :height='88'
                    :item-width="(100 / tabs.length) + '%'"
                    :padding='0'
                    :selected-color='$style.color'
                    :slider-bg-color='$style.primary'
                    :slider-width='375'
                    :tabs='tabs'
                    unlined
                    @change='switchTabs'
                />
            </view>
            <!-- 成交记录选项 -->
            <view v-if="tabValue === 'deal'" class='dropdown-menu'>
                <dropdown-item 
                    :drop-index.sync='dropIndex' 
                    :index='0' 
                    :list='direction' 
                    :model-value.sync='directionVal' 
                    @update:modelValue='filterDealList'
                />
                <dropdown-item 
                    :drop-index.sync='dropIndex'
                    :fixed-text='symbolName' 
                    :index='1' 
                    :list='productType'
                    :model-value.sync='productVal'
                    @update:modelValue='changeProductType'
                />
                <dropdown-item 
                    v-if='$includePlay_1(tradeType)' 
                    :drop-index.sync='dropIndex' 
                    :index='2' 
                    :list='positionType' 
                    :model-value.sync='positionTypeVal'
                    @update:modelValue='filterDealList'
                />
                <dropdown-item
                    v-if='$includePlay_2(tradeType)' 
                    :drop-index.sync='dropIndex' 
                    :index='3' 
                    :list='priceTypeList' 
                    :model-value.sync='positionTypeVal'
                    @update:modelValue='filterDealList'
                />
                <dropdown-item 
                    :drop-index.sync='dropIndex' 
                    :fixed-text='timeRange' 
                    :index='4' 
                    :list='timeList' 
                    :model-value.sync='timeVal'
                    @update:modelValue='changeTimeType' 
                >
                    <template #list>
                        <view :class="{ 'time-item': true, 'active': timeVal === -1 }" @click='openCalendar'>
                            <span class='text'>
                                {{ $t("fund.timeZone") }}
                            </span>
                            <input 
                                disabled
                                :placeholder="$t('fund.selectTimeZone')" 
                                placeholderClass='placeholderClass' 
                                type='text' 
                                :value='timeRange'
                            />
                            <tui-icon class='check' name='check' :size='32' unit='rpx' />
                        </view>
                    </template>
                </dropdown-item>
            </view>
            <!-- 内容区域 -->
            <scroll-view class='layout-content' scroll-y @scrolltolower='loadMore'>
                <!-- 当前委托 -->
                <view v-if="tabValue === 'pending'">
                    <view v-if='trustList.length > 0'>
                        <trust-list :list='trustList' />
                        <loading-more status='noMore' />
                    </view>
                    <none-data v-else :text="$t('trade.pendingEmpty')" />
                </view>
                <!-- 成交记录 -->
                <view v-if="tabValue === 'deal'">
                    <view v-if='dealList.length > 0'>
                        <deal-list :biz-type-text='bizTypeText' :list='dealList' :trade-type='tradeType' />
                        <loading-more :status='dealLoad' />
                    </view>
                    <none-data v-else :text="$t('trade.noDealData')" />
                </view>
            </scroll-view>
        </view>
		
        <!-- 侧边栏切换产品 -->
        <sidebar-product ref='sidebar' show-category @close='closeSidebar' @select='selectProduct' />
        <!-- 日历组件 -->
        <calendar ref='calendar' is-fixed :type='2' @change='selectCalendar' />
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>
// vuex
import store from '@/store/index.js'
// components
import trustList from './components/trust-list.vue'
import dealList from './components/deal-list.vue'
import calendar from '@/components/calendar/calendar.vue'
import sidebarProduct from '@/components/modules/sidebar-product.vue'	
// api
import { tradeRecordList } from '@/api/user.js' 
	
export default {
    components: {
        trustList,
        dealList,
        calendar,
        sidebarProduct
    },
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 玩法类型
            tradeType: '',
            // 头部选项卡
            tabs: [
                { name: this.$t('trade.curTrust'), value: 'pending' },
                { name: this.$t('trade.dealList'), value: 'deal' }
            ],
            // 当前头部选项卡索引
            tabIndex: 0,
            // 当前头部选项卡value
            tabValue: 'pending',
            // 当前弹窗组件索引
            dropIndex: -1,
            // 方向
            directionVal: -1,
            direction: [
                { text: this.$t('trade.direction'), value: -1 },
                { text: this.$t('trade.buy'), value: 1 },
                { text: this.$t('trade.sell'), value: 2 },
            ],
            // 开/平仓 
            positionTypeVal: -1,
            positionType: [
                { text: this.$t('trade.openClose'), value: -1 },
                { text: this.$t('trade.openPosition'), value: 1 },
                { text: this.$t('trade.closePosition'), value: 2 },
            ],
            priceTypeList: [
                { text: this.$t('trade.priceOrLimit'), value: -1 },
                { text: this.$t('trade.orderTypeShort1'), value: 3 },
                { text: this.$t('trade.orderTypeShort2'), value: 4 }
            ],
            // 产品
            productVal: 0,
            productType: [
                { text: this.$t('common.allProduct'), value: 0 },
                { text: this.$t('common.chooseProduct'), value: 1 }
            ],
            // 时间
            timeVal: 2,
            timeList: [
                // { text: this.$t('common.allDate'), value: 0 },
                { text: this.$t('common.curToday'), value: 1 },
                { text: this.$t('common.curWeek'), value: 2 },
                { text: this.$t('common.curMonth'), value: 3 },
                { text: this.$t('common.curThreeMonth'), value: 4 },
            ],
            timeRange: '',
            // 成交记录列表数据
            dealList: [],
            bizTypeText: {},
            dealPage: 1,
            dealSize: 10,
            dealLoad: 'more',
            executeStartTime: this.$dayjs(this.$dayjs().subtract(7, 'day').format('YYYY/MM/DD')).valueOf(),
            executeEndTime: this.$dayjs(this.$dayjs(new Date()).format('YYYY/MM/DD 23:59:59')).valueOf(),
            symbolId: '',
            symbolName: ''
        }
    },
    computed: {
        // 玩法列表
        plans () {
            return store.state._base.plans || []
        },
        // 委托列表数据
        trustList () {
            return store.state._trade.pendingList[this.tradeType] || []
        },
        // 账户
        account () {
            return this.customerInfo?.accountList.filter(el => Number(el.tradeType) === Number(this.tradeType))
        }
    },
    onLoad (options) {
        this.tradeType = Number(options.tradeType)
        // 设置当前选中
        if (options.active) {
            const index = this.tabs.findIndex(el => el.value === options.active)
            this.tabIndex = index
            this.tabValue = options.active
        }
        // 初始化
        this.$init().then(() => {
            this.pageInit()
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('order_list_view')
    },
    onShow () {
        if (this.skeletonShow) return
        this.sendSubscribe()
    },
    methods: {
        // 页面数据初始化
        pageInit () {
            this.getTrustList()
            this.getDealList()
        },
		
        // 获取委托列表数据
        getTrustList () {
            store.dispatch('_trade/queryPBOOrderPage', {
                tradeType: this.tradeType,
                customerNo: this.customerInfo.customerNo,
                sortFieldName: 'orderTime',
                sortType: 'desc'
            }).then(() => {
                this.skeletonShow = false
                this.sendSubscribe()
            }).catch(() => {
                this.skeletonShow = false
            })
        },
		
        // 获取成交记录列表数据
        getDealList () {
            if (this.dealLoad !== 'more') return
            this.dealLoad = 'loading'
            const accountIds = []
            if (this.account.length > 0) {
                this.account.forEach(element => {
                    accountIds.push(element.accountId)
                })
            }
            const params = {
                accountIds: accountIds.toString(),
                tradeType: this.tradeType,
                sortFieldName: 'executeTime',
                sortType: 'desc',
                current: this.dealPage,
                size: this.dealSize,
                direction: this.directionVal,
                orderType: this.positionTypeVal,
                executeStartTime: this.executeStartTime,
                executeEndTime: this.executeEndTime
            }
            if (this.symbolId) {
                params.symbolId = this.symbolId
            }
            tradeRecordList(params).then(res => {
                uni.hideLoading()
                const { data } = res
                if (data) {
                    this.bizTypeText = data.bizTypeText
                    this.dealList = this.dealPage === 1 ? data.list : this.dealList.concat(data.list)
                    this.dealLoad = this.dealPage === data.totalPage ? 'noMore' : 'more'
                    this.dealPage += 1
                } else {
                    this.bizTypeText = {}
                    this.dealList = []
                    this.dealLoad = 'noMore'
                }
            }).catch(() => {
                uni.hideLoading()
            })
        },
		
        // 筛选交易记录数据
        filterDealList () {
            this.dealPage = 1
            this.dealLoad = 'more'
            uni.showLoading({
                title: this.$t('common.loading'),
                mask: true
            })
            this.getDealList()
        },
		
        // 上拉加载更多
        loadMore () {
            if (this.tabValue === 'deal') {
                this.getDealList()
            }
        },
		
        // 订阅当前页面的所有产品
        sendSubscribe () {
            const list = []
            // 订阅委托列表产品数据
            if (this.tabValue === 'pending') {
                this.trustList.map(elem => {
                    const symbolKey = elem.symbolId + '_' + elem.tradeType
                    if (!list.includes(symbolKey)) {
                        list.push(symbolKey)
                    }
                })
            }
            this.$QuoteSocket.send_subscribe(list)
        },
		
        // 切换头部选项卡
        switchTabs (e) {
            this.tabIndex = e.index
            this.tabValue = this.tabs[e.index].value
            this.dropIndex = -1
            this.sendSubscribe()
        },
		
        // 改变产品类型
        changeProductType () {
            if (this.productVal === 0) {
                this.symbolId = ''
                this.symbolName = ''
                this.filterDealList()
            }
            if (this.productVal === 1) {
                this.$refs['sidebar'].show(Number(this.tradeType))
            }
        },
		
        // 选择产品
        selectProduct (tradeType, item) {
            this.symbolId = item.symbolId
            this.symbolName = item.symbolName
            this.filterDealList()
        },
		
        // 关闭产品侧边栏弹窗
        closeSidebar () {
            if (!this.symbolId) {
                this.productVal = 0
            }
        },
		
        // 改变时间类型
        changeTimeType () {
            switch (this.timeVal) {
                case 0:
                    this.executeStartTime = -1
                    this.executeEndTime = -1
                    break
                case 1: 
                    this.executeStartTime = this.$dayjs(this.$dayjs(new Date()).format('YYYY/MM/DD 00:00:00')).valueOf()
                    break
                case 2: 
                    this.executeStartTime = this.$dayjs(this.$dayjs().subtract(7, 'day').format('YYYY/MM/DD')).valueOf()
                    break
                case 3:
                    this.executeStartTime = this.$dayjs(this.$dayjs().subtract(1, 'month').format('YYYY/MM/DD')).valueOf()
                    break
                case 4: 
                    this.executeStartTime = this.$dayjs(this.$dayjs().subtract(3, 'month').format('YYYY/MM/DD')).valueOf()
                    break
            }
            this.executeEndTime = this.$dayjs(this.$dayjs(new Date()).format('YYYY/MM/DD 23:59:59')).valueOf()
            this.timeRange = ''
            this.filterDealList() 
        },
		
        // 打开日历弹窗
        openCalendar () {
            this.dropIndex = -1
            this.$refs['calendar'].show()
        },
		
        // 选择日期
        selectCalendar (e) {
            const startTime = e.startDate.replace(/-/g, '/')
            const endTime = e.endDate.replace(/-/g, '/')
            this.executeStartTime = new Date(startTime).getTime()
            this.executeEndTime = this.$dayjs(this.$dayjs(new Date(endTime)).format('YYYY/MM/DD 23:59:59')).valueOf()
            this.timeRange = startTime + '-' + endTime
            this.timeVal = -1
            this.filterDealList()
        }
    }
}
</script>

<style lang="scss" scoped>
.header-tabs {
	@include styles('border-bottom-color', 'lineColor');
	border-bottom-width: 1rpx;
	border-bottom-style: solid;
	position: relative;
	z-index: 502;
}
.dropdown-menu {
	@include flex;
	position: relative;
}
.time-item {
	@include flexBetweenAlign;
	height: 80rpx;
	position: relative;
	&::after {
		@include styles('background-color', 'lineColor');
		content: '';
		width: 100%;
		height: 1px;
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%) scaleY(.5);
	}
	.text {
		font-size: 26rpx;
	}
	input {
		flex: 1;
		height: 100%;
		margin: 0 40rpx;
		font-size: 26rpx;
	}
	.placeholderClass {
		font-size: 26rpx;
	}
	.check {
		display: none;
	}
	&.active {
		.text {
			@include styles('color', 'primary');
		}
		.check {
			@include styles('color', 'primary');
			display: inline-block;
		}
	}
}
</style>
