<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar is-custom show-custom-title :title="$t('record.records')">
                <view class='header-filter' @click='openDateDrop'>
                    <i class='iconfont icon_paixu'></i>
                </view>
            </nav-bar>
            <view class='date-drop'>
                <dropdown-item
                    ref='dateDrop'
                    :drop-index.sync='dropIndex' 
                    :index='0'
                    :list='timeType'
                    :model-value.sync='timeVal'
                    :show-item='false'
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
            <!-- 头部选项卡 -->
            <view class='header-tabs'>
                <tui-tabs 	
                    :color='$style.minorColor'
                    :current-tab='current' 
                    :height='88'
                    :item-width="(100 / tabs.length) + '%'"
                    :padding='0'
                    :selected-color='$style.primary'
                    :slider-bg-color='$style.primary'
                    :slider-width='750 / tabs.length'
                    :tabs='tabs'
                    unlined
                    @change='switchTabs'
                />
            </view>
            <!-- 资金流水筛选 -->
            <dropdown-item
                v-if='currentVal === 4' 
                :drop-index.sync='dropIndex' 
                :index='1'
                :list='flowTypes'
                :model-value.sync='businessType'
                @update:modelValue='changeFlowTypes'
            />
            <!-- 内容区域 -->
            <scroll-view class='layout-content' scroll-y @scrolltolower='loadMore'>
                <!-- 借款记录 -->
                <view v-if='currentVal === 1'>
                    <template v-if='loan.list.length > 0'>
                        <loan-list :list='loan.list' />
                        <loading-more :status='loan.loadStatus' />
                    </template>
                    <none-data v-else />
                </view>
                <!-- 还款记录 -->
                <view v-if='currentVal === 2'>
                    <template v-if='repayment.list.length > 0'>
                        <repayment-list :list='repayment.list' />
                        <loading-more :status='repayment.loadStatus' />
                    </template>
                    <none-data v-else />
                </view>
                <!-- 划转记录 -->
                <view v-if='currentVal === 3'>
                    <template v-if='transfer.list.length > 0'>
                        <transfer-list :list='transfer.list' :trade-type='tradeType' />
                        <loading-more :status='transfer.loadStatus' />
                    </template>
                    <none-data v-else />
                </view>
                <!-- 资金流水 -->
                <view v-if='currentVal === 4'>
                    <template v-if='flow.list.length > 0'>
                        <flow-list :list='flow.list' :trade-type='tradeType' />
                        <loading-more :status='flow.loadStatus' />
                    </template>
                    <none-data v-else />
                </view>
            </scroll-view>
        </view>
		
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
// api
import { queryLiabilitiesWaterByPage, capitalTransferRecord, queryCapitalFlowList } from '@/api/user.js'
// components
import calendar from '@/components/calendar/calendar.vue'
import loanList from './components/loan-list.vue'
import repaymentList from './components/repayment-list.vue'
import transferList from './components/transfer-list.vue'
import flowList from './components/flow-list.vue'
	
export default {
    components: {
        loanList,
        repaymentList,
        transferList,
        flowList,
        calendar
    },
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 玩法类型
            tradeType: '',
            // 当前下拉组件索引
            dropIndex: -1,
            // 选项卡
            tabs: [],
            current: 0,
            currentVal: -1,
            // 时间筛选
            timeVal: 2,
            timeRange: '',
            timeType: [
                // { text: this.$t('common.all'), value: 0 },
                { text: this.$t('common.curToday'), value: 1 },
                { text: this.$t('common.curWeek'), value: 2 },
                { text: this.$t('common.curMonth'), value: 3 },
                { text: this.$t('common.curThreeMonth'), value: 4 }
            ],
            startTime: this.$dayjs(this.$dayjs().subtract(7, 'day').format('YYYY/MM/DD')).valueOf(),
            endTime: this.$dayjs(this.$dayjs(new Date()).format('YYYY/MM/DD 23:59:59')).valueOf(),
            // 资金流水
            flowTypes: [],
            businessType: '',
            // 借款数据
            loan: {
                current: 1,
                size: 20,
                list: [],
                loadStatus: 'more'
            },
            // 还款数据
            repayment: {
                current: 1,
                size: 20,
                list: [],
                loadStatus: 'more'
            },
            // 划转数据
            transfer: {
                current: 1,
                size: 20,
                list: [],
                loadStatus: 'more'
            },
            // 资金流水数据
            flow: {
                current: 1,
                size: 20,
                list: [],
                loadStatus: 'more'
            }
        }
    },
    computed: {
        // 玩法列表
        plans () {
            return store.state._base.plans || []
        }
    },
    onLoad (options) {
        this.tradeType = Number(options.tradeType)
        this.currentVal = Number(options.type) || -1
        this.setTabs()
        this.setFlowTypes()
        // 初始化
        this.$init().then(() => {
            this.pageInit()
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('assets_record_view')
    },
    methods: {
        // 页面数据初始化
        pageInit () {
            this.queryLiabilitiesWaterByPage(1)
            this.queryLiabilitiesWaterByPage(2)
            this.capitalTransferRecord()
            this.queryCapitalFlowList()
        },
		
        // 重置参数
        resetParams () {
            this.loan.current = 1
            this.loan.loadStatus = 'more'
            this.repayment.current = 1
            this.repayment.loadStatus = 'more'
            this.transfer.current = 1
            this.transfer.loadStatus = 'more'
            this.flow.current = 1
            this.flow.loadStatus = 'more'
        },
		
        // 获取请求参数
        getParams () {
            const params = {
                tradeType: this.tradeType
            }
            if (this.timeVal !== 0) {
                params.startTime = this.startTime
                params.endTime = this.endTime
            }
            return params
        },
        // 下拉刷新
        onPullDownRefresh () {
            setTimeout(() => {
                this.resetParams()
                uni.stopPullDownRefresh()
                this.loadMore()
            }, 800)
        },
		
        // 获取借款或还款数据
        queryLiabilitiesWaterByPage (type) {
            let item = {}
            if (type === 1) {
                item = this.loan
            }  
            if (type === 2) {
                item = this.repayment
            }
            if (item.loadStatus !== 'more') return
            item.loadStatus = 'loading'
            const params = this.getParams()
            queryLiabilitiesWaterByPage({
				...params,
                liabilitiesType: type,
				current: item.current,
				size: item.size
            }).then(res => {
                const { data } = res
                this.skeletonShow = false
                uni.hideLoading()
                item.list = item.current === 1 ? data.records : item.list.concat(data.records)
                item.loadStatus = item.list.length === data.total ? 'noMore' : 'more'
                item.current += 1
            }).catch(() => {
                this.skeletonShow = false
                uni.hideLoading()
            })
        },
		
        // 获取划转记录数据
        capitalTransferRecord () {
            const item = this.transfer
            if (item.loadStatus !== 'more') return
            item.loadStatus = 'loading'
            const params = this.getParams()
            capitalTransferRecord({
				...params,
				current: item.current,
				size: item.size
            }).then(res => {
                const { data } = res
                this.skeletonShow = false
                uni.hideLoading()
                item.list = item.current === 1 ? data.records : item.list.concat(data.records)
                item.loadStatus = item.list.length === data.total ? 'noMore' : 'more'
                item.current += 1
            }).catch(() => {
                this.skeletonShow = false
                uni.hideLoading()
            })
        },
		
        // 获取资金流水数据
        queryCapitalFlowList () {
            const item = this.flow
            if (item.loadStatus !== 'more') return
            item.loadStatus = 'loading'
            const params = this.getParams()
            if (this.businessType) {
                params.businessType = this.businessType
            }
            queryCapitalFlowList({
				...params,
				current: item.current,
				size: item.size
            }).then(res => {
                const { data } = res
                this.skeletonShow = false
                uni.hideLoading()
                item.list = item.current === 1 ? data.records : item.list.concat(data.records)
                item.loadStatus = item.list.length === data.total ? 'noMore' : 'more'
                item.current += 1
            }).catch(() => {
                this.skeletonShow = false
                uni.hideLoading()
            })
        },
		
        // 上拉加载更多 
        loadMore () {
            switch (this.currentVal) {
                case 1:
                    this.queryLiabilitiesWaterByPage(1)
                    break
                case 2: 
                    this.queryLiabilitiesWaterByPage(2)
                    break
                case 3:
                    this.capitalTransferRecord()
                    break
                case 4:
                    this.queryCapitalFlowList()
                    break
            }
        },
		
        // 设置选项卡
        setTabs () {
            const tabs = [
                {
                    name: this.$t('record.cransferRecord'),
                    value: 3
                },
                {
                    name: this.$t('record.capitalRecord'),
                    value: 4
                }
            ]
            if (this.$includePlay_2(this.tradeType) && this.tradeType !== 5) {
                tabs.unshift(
                    {
                        name: this.$t('record.loanRecord'),
                        value: 1
                    },
                    {
                        name: this.$t('record.repaymentRecord'),
                        value: 2
                    }
                )
            }
            if (this.currentVal !== -1) {
                this.current = tabs.findIndex(v => v.value === this.currentVal)
            } else {
                this.currentVal = tabs[0].value
            }
            this.tabs = tabs
        },
		
        // 设置资金流水类型
        setFlowTypes () {
            const flowCategories = this.$t(`fund.flowCategories.${this.tradeType}`)
            const flowTypes = [
                {
                    text: this.$t('common.all'),
                    value: ''
                }
            ]
            for (const key in flowCategories) {
                flowTypes.push({
                    text: flowCategories[key],
                    value: key
                })
            }
            this.flowTypes = flowTypes
        },
		
        // 切换选项卡
        switchTabs (e) {
            this.current = e.index
            this.currentVal = this.tabs[e.index].value
            this.dropIndex = -1
        },
		
        // 改变资金流水类型
        changeFlowTypes () {
            this.flow.current = 1
            this.flow.loadStatus = 'more'
            uni.showLoading({
                title: this.$t('common.loading'),
                mask: true
            })
            this.queryCapitalFlowList()
        },
		
        // 打开时间下拉组件
        openDateDrop () {
            this.$refs['dateDrop'].toggleDrop()
        },
		
        // 打开日历弹窗
        openCalendar () {
            this.dropIndex = -1
            this.$refs['calendar'].show()
        },
		
        // 改变时间类型
        changeTimeType () {
            switch (this.timeVal) {
                case 0:
                    this.startTime = ''
                    break
                case 1:
                    this.startTime = this.$dayjs(this.$dayjs(new Date()).format('YYYY/MM/DD 00:00:00')).valueOf()
                    break
                case 2: 
                    this.startTime = this.$dayjs(this.$dayjs().startOf('week')).valueOf()
                    break
                case 3:
                    this.startTime = this.$dayjs(this.$dayjs().startOf('month')).valueOf()
                    break
                case 4: 
                    this.startTime = this.$dayjs(this.$dayjs().subtract(3, 'month').format('YYYY/MM/DD')).valueOf()
                    break
            }
            this.endTime = this.$dayjs(this.$dayjs(new Date()).format('YYYY/MM/DD 23:59:59')).valueOf()
            this.timeRange = ''
            uni.showLoading({
                title: this.$t('common.loading'),
                mask: true
            })
            this.resetParams()
            this.pageInit()
        },
		
        // 选择日期
        selectCalendar (e) {
            const startTime = e.startDate.replace(/-/g, '/')
            const endTime = e.endDate.replace(/-/g, '/')
            this.startTime = new Date(startTime).getTime()
            this.endTime = this.$dayjs(this.$dayjs(new Date(endTime)).format('YYYY/MM/DD 23:59:59')).valueOf()
            this.timeRange = startTime + '-' + endTime
            this.timeVal = -1  
            uni.showLoading({
                title: this.$t('common.loading'),
                mask: true
            })
            this.resetParams()
            this.pageInit()
        }
    }
}
</script>

<style lang="scss" scoped>
.header-filter {
	@include flexAll;
	height: 100%;
	padding: 0 25rpx;
	position: absolute;
	top: 0;
	right: 0;
}
.date-drop {
	position: relative;
	z-index: 998;
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
.header-tabs {
	@include styles('border-bottom-color', 'lineColor');
	border-bottom-width: 1rpx;
	border-bottom-style: solid;
	position: relative;
	z-index: 502;
}
</style>
