<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar :title="$t('cRoute.depositRecord')" />
            <!-- 时间控件 -->
            <view class='dropdown-menu'>
                <!-- <dropdown-item
                    :drop-index.sync='dropIndex' 
                    :index='1' 
                    :list='typeList' 
                    :model-value.sync='typeVal'
                    @update:modelValue='changeType' 
                /> -->
                <dropdown-item
                    :drop-index.sync='dropIndex' 
                    :index='2' 
                    :list='currencyList' 
                    :model-value.sync='currencyVal'
                    @update:modelValue='changeCurrency' 
                />
                <dropdown-item
                    :drop-index.sync='dropIndex' 
                    :fixed-text='timeRange' 
                    :index='3' 
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
                <!-- 列表数据 -->
                <template v-if='list.length > 0'>
                    <view class='record-list'>
                        <view v-for='(item, index) in list' :key='index' class='item'>
                            <tui-collapse :current='current' hd-bg-color='transparent' :index='index' @click='changeCurrent'>
                                <template #title>
                                    <view class='item-header'>
                                        <view class='vital'>
                                            <view class='name'>
                                                {{ item.intendAmount }} {{ item.depositCurrency }}
                                            </view>
                                            <view class='time'>
                                                {{ formatTime(item.createTime) }}
                                            </view>
                                        </view>
                                        <view class='state' :class="[item.depositStatus !== 2 ? 'state-1' : 'state-2']">
                                            {{ handleDepositState(item) }}
                                        </view>
                                    </view>
                                </template>
                                <template #content>
                                    <view class='item-content'>
                                        <view class='row'>
                                            <span class='name'>                     
                                                {{ $t('deposit.rechargeCurrency') }}			
                                            </span>
                                            <span class='value'>
                                                {{ item.depositCurrency }}
                                            </span>
                                        </view>
                                        <view class='row'>
                                            <span class='name'>
                                                {{ $t('deposit.amount') }}({{ $t('deposit.includeFee') }})
                                            </span>
                                            <span class='value'>
                                                {{ item.intendAmount }}
                                            </span>
                                        </view>
                                        <view class='row'>
                                            <span class='name'>
                                                {{ $t('deposit.receiptAmount') }}
                                            </span>
                                            <span class='value'>
                                                {{ item.finalAmount }}
                                            </span>
                                        </view>
                                        <view class='row'>
                                            <span class='name'>
                                                {{ $t('common.fee') }}
                                            </span>
                                            <span class='value'>
                                                {{ item.depositFee || '--' }}
                                            </span>
                                        </view>
                                        <view class='row'>
                                            <span class='name'>
                                                {{ $t('deposit.payCurrency') }}
                                            </span>
                                            <span class='value'>
                                                {{ item.paymentCurrency }}
                                            </span>
                                        </view>
                                        <view class='row'>
                                            <span class='name'>
                                                {{ $t('deposit.payAmount') }}
                                            </span>
                                            <span class='value'>
                                                {{ item.fromPaymentAmount || '--' }}
                                            </span>
                                        </view>
                                        <view class='row'>
                                            <span class='name'>
                                                {{ $t('common.createTime') }}
                                            </span>
                                            <span class='value'>
                                                {{ formatTime(item.createTime) }}
                                            </span>
                                        </view>
                                        <view class='row'>
                                            <span class='name'>
                                                {{ $t('common.updateTime') }}
                                            </span>
                                            <span class='value'>
                                                {{ formatTime(item.updateTime) }}
                                            </span>
                                        </view>
                                        <view class='row'>
                                            <view class='name'>
                                                <span>TXID</span>
                                                <tui-icon
                                                    class='info'
                                                    :color='$style.minorColor'
                                                    name='about-fill'
                                                    :size='32'
                                                    unit='rpx'
                                                    @click="showInfo($t('deposit.txid'))"
                                                /> 
                                            </view>
                                            <span class='value'>
                                                <span class='value-txid'>
                                                    {{ item.txid || '--' }}
                                                </span>
                                                <i v-if='item.txid' class='iconfont icon_fuzhi copy' @click='onCopy(item.txid)'></i>
                                            </span>
                                        </view>
                                        <view class='row'>
                                            <span class='name'>
                                                {{ $t('deposit.orderNo') }}
                                            </span>
                                            <span class='value'>
                                                {{ item.proposalNo }}
                                            </span>
                                        </view>
                                    </view>
                                </template>
                            </tui-collapse>
                        </view>
                    </view>
                    <loading-more :status='loadStatus' />
                </template>
                <!-- 没有数据 -->
                <none-data v-else />
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
import { getDepositCoinList, queryDepositPageList } from '@/api/user.js'

export default {
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 列表数据
            list: [],
            // 加载状态
            loadStatus: 'more',
            // 当前页数
            page: 1,
            // 页数数量
            size: 20,
            // 开始时间
            startTime: this.$dayjs(this.$dayjs().subtract(7, 'day').format('YYYY/MM/DD')).valueOf(),
            // 结束时间
            endTime: this.$dayjs(this.$dayjs(new Date()).format('YYYY/MM/DD 23:59:59')).valueOf(),
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
            // 存款类型
            typeVal: -1,
            // 存款类型列表
            typeList: [
                { text: '汇兑', value: 2 },
                { text: '直充', value: 1 }
            ],
            // 币种
            currencyVal: 0,
            // 币种列表
            currencyList: [
                { text: this.$t('common.all'), value: 0 }
            ],
            // 当前弹窗组件索引
            dropIndex: -1,
            // 当前展开项
            current: -1
        }
    },
    onLoad (options) {
        this.typeVal = Number(options.type) || 2
		
        // 初始化
        this.$init().then(() => {
            // 获取客户支持的存款币种列表
            this.queryDepositCoinList()
            // 获取存款记录
            this.queryDepositPageList()
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('deposit_record_view')
    },
    methods: {
        // 弹出提示
        showInfo (content) {
            this.$refs['modalDialog'].show({
                content
            })
        },
		
        // 获取客户支持的存款币种列表
        queryDepositCoinList () {
            getDepositCoinList({ clientType: 'mobile' }).then(res => {
                const result = []
                res.data.map((el, index) => {
                    result.push({ text: el, value: index + 1 })
                })
                this.currencyList = this.currencyList.concat(result)
            })
        },
		
        // 下拉刷新
        onPullDownRefresh () {
            setTimeout(() => {
                this.page = 1
                this.loadStatus = 'more'
                uni.stopPullDownRefresh()
                this.queryDepositPageList()
            }, 800)
        },
		
        // 改变当前展开项
        changeCurrent (e) {
            this.current = this.current === e.index ? -1 : e.index
        },
		
        // 点击复制
        onCopy (text) {
            uni.setClipboardData({
                data: text,
                showToast: false,
                success: () => {
                    uni.showToast({
                        title: this.$t('common.copySuccess')
                    })
                }
            })
        },

        // 获取存款记录
        queryDepositPageList () {
            if (this.loadStatus !== 'more') return
            this.loadStatus = 'loading'
            const customerInfo = this.customerInfo
            queryDepositPageList({
                customerNo: customerInfo.customerNo,
                depositCurrency: this.currencyVal === 0 ? '' : this.currencyList[this.currencyVal].text,
                size: this.size,
                current: this.page,
                startTime: this.startTime,
                endTime: this.endTime
            }).then(res => {
                uni.hideLoading()
                this.skeletonShow = false
                const { data } = res
                this.list = this.page === 1 ? data.records : this.list.concat(data.records)
                this.loadStatus = this.list.length === data.total ? 'noMore' : 'more'
                this.page += 1
            }).catch(() => {
                uni.hideLoading()
                this.skeletonShow = false
            })
        },
		
        // 筛选存款记录数据
        filterData () {
            this.page = 1
            this.loadStatus = 'more'
            this.current = -1
            uni.showLoading({
                title: this.$t('common.loading'),
                mask: true
            })
            this.queryDepositPageList()
        },

        // 处理存款状态文案
        handleDepositState (row) {
            const { checkStatus, paymentStatus } = row
            if (checkStatus === 2) {
                return this.$t('deposit.paySuccess')
            } else if (checkStatus === 3) {
                return this.$t('deposit.payFail')
            } else {
                if (paymentStatus === 1) {
                    return this.$t('deposit.tobePay')
                } else if (paymentStatus === 2) {
                    return this.$t('deposit.tobeProcessed')
                } else {
                    return this.$t('deposit.payFail')
                }
            }
        },
		
        // 改变时间类型
        changeTimeType () {
            switch (this.timeVal) {
                case 0:
                    this.startTime = -1
                    this.endTime = -1
                    break
                case 1: 
                    this.startTime = this.$dayjs(this.$dayjs(new Date()).format('YYYY/MM/DD 00:00:00')).valueOf()
                    break
                case 2: 
                    this.startTime = this.$dayjs(this.$dayjs().subtract(7, 'day').format('YYYY/MM/DD')).valueOf()
                    break
                case 3:
                    this.startTime = this.$dayjs(this.$dayjs().subtract(1, 'month').format('YYYY/MM/DD')).valueOf()
                    break
                case 4: 
                    this.startTime = this.$dayjs(this.$dayjs().subtract(3, 'month').format('YYYY/MM/DD')).valueOf()
                    break
            }
            this.endTime = this.$dayjs(this.$dayjs(new Date()).format('YYYY/MM/DD 23:59:59')).valueOf()
            this.timeRange = ''
            this.filterData()
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
            this.startTime = new Date(startTime).getTime()
            this.endTime = this.$dayjs(this.$dayjs(new Date(endTime)).format('YYYY/MM/DD 23:59:59')).valueOf()
            this.timeRange = startTime + '-' + endTime
            this.timeVal = -1
            this.filterData()
        },
		
        // 改变充值类型
        changeType () {
            this.filterData()
        },
		
        // 改变币种
        changeCurrency () {
            this.filterData()
        },
		
        // 加载更多
        loadMore () {
            // 获取存款记录
            this.queryDepositPageList()
        }
    }
}
</script>

<style lang="scss" scoped>
.dropdown-menu {
	@include flex;
	@include styles('border-top-color', 'lineColor');
	border-top-width: 1px;
	border-top-style: solid;
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
.record-list {
	.item {
		@include styles('background-color', 'contentColor');
		margin-top: 20rpx;
		padding: 0 30rpx;
		::v-deep .tui-icon-arrow {
			@include styles('color', 'color');
			font-size: 26rpx;
			right: 0;
		}
		.item-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 20rpx 0;
			.vital {
				font-size: 28rpx;
				.name {
					@include styles('color', 'color');
				}

				.time {
					@include styles('color', 'minorColor');
					margin-top: 10rpx;
					font-size: 24rpx;
				}
			}
			.state {
				margin-right: 45rpx;
				&.state-1 {
					@include styles('color', 'primary');
				}
				&.state-2 {
					@include styles('color', 'primary');
				}
			}
		}
		.item-content {
			@include styles('border-top-color', 'lineColor');
			padding: 20rpx 0 10rpx;
			border-top-style: solid;
			border-top-width: 1rpx;
			.row {
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-bottom: 20rpx;
				font-size: 24rpx;
				.name {
					@include styles('color', 'minorColor');
					&::v-deep {
						.info {
							margin-left: 6rpx !important;
						}
					}
				}
				.value {
                    .value-txid{
                        text-align: right;
                        display: inline-block;
                        max-width: 400rpx;
                        width:400rpx;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }
                    .copy{
                        display: inline-block;
                        @include styles('color', 'minorColor');
                    }
                    &.state-1 {
                        @include styles('color', 'primary');
                    }
                    &.state-2 {
                        @include styles('color', 'primary');
                    }
				}
			}
		}
	}
}
</style>
