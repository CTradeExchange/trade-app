<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container'>
            <!-- 头部导航栏 -->
            <nav-bar :title="$t('cRoute.withdrawRecord')" />
            <!-- 时间控件 -->
            <view class='dropdown-menu'>
                <dropdown-item
                    :drop-index.sync='dropIndex' 
                    :fixed-text='timeRange' 
                    :index='1' 
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
            <view class='layout-content'>
                <!-- 列表数据 -->
                <template v-if='list.length > 0'>
                    <view class='record-list'>
                        <view v-for='(item, index) in list' :key='index' class='item'>
                            <tui-collapse :current='current' hd-bg-color='transparent' :index='index' @click='changeCurrent'>
                                <template #title>
                                    <view class='item-header'>
                                        <view class='vital'>
                                            <view class='name'>
                                                <span class='amount'>
                                                    {{ item.amount }}
                                                    {{ handleCurrency(item) }}
                                                </span>
                                            </view>
                                            <view class='time'>
                                                {{ formatTime(item.createTime) }}
                                            </view>
                                        </view>
                                        <view class='state'>
                                            {{ handleState(item.checkStatus, item.transferStatus) }}
                                        </view>
                                    </view>
                                </template>
                                <template #content>
                                    <view class='item-content'>
                                        <view class='row'>
                                            <view class='name'>
                                                {{ $t('withdrawRecord.moneyName') }}
                                            </view>
                                            <view class='value'>
                                                {{ item.amount }} {{ handleCurrency(item) }}
                                            </view>
                                        </view>
                                        <view class='row'>
                                            <view class='name'>
                                                {{ $t('withdrawRecord.serviceName') }}
                                            </view>
                                            <view class='value'>
                                                {{ item.withdrawFee }} {{ handleCurrency(item) }}
                                            </view>
                                        </view>
                                        <view class='row'>
                                            <view class='name'>
                                                {{ $t('withdrawRecord.predictName') }}
                                            </view>
                                            <view class='value'>
                                                {{ item.finalAmount }}
                                                {{ item.withdrawType === 1 ? item.withdrawCurrency : item.withdrawCurrency + '-' + item.blockchainName }}
                                            </view>
                                        </view>
                                        <view class='row'>
                                            <view class='name'>
                                                {{ $t('withdrawRecord.accountDeduction') }}
                                            </view>
                                            <view class='value'>
                                                {{ item.accountDeductAmount }} {{ item.accountCurrency }}
                                            </view>
                                        </view>
                                        <view class='row'>
                                            <view class='name'>
                                                {{ $t('withdrawRecord.statusName') }}
                                            </view>
                                            <view class='value state'>
                                                {{ handleState(item.checkStatus,item.transferStatus) }}
                                            </view>
                                        </view>
                                        <view class='row'>
                                            <view class='name'>
                                                TXID
                                            </view>
                                            <view class='value'>
                                                <view class='value-txid'>
                                                    {{ item.txid || '--' }}
                                                </view>
                                                <i v-if='item.txid' class='iconfont icon_fuzhi copy' @click='onCopy(item.txid)'></i>
                                            </view>
                                        </view>
                                        <view class='row'>
                                            <view class='name'>
                                                {{ $t('withdrawRecord.timeName') }}
                                            </view>
                                            <view class='value'>
                                                {{ formatTime(item.createTime) }}
                                            </view>
                                        </view>
                                        <view class='row'>
                                            <view class='name'>
                                                {{ $t('withdrawRecord.remarkName') }}
                                            </view>
                                            <view class='value'>
                                                {{ item.remark || '--' }}
                                            </view>
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
            </view>
		
            <!-- 日历组件 -->
            <calendar ref='calendar' is-fixed :type='2' @change='selectCalendar' />
            <!-- 提示弹窗 -->
            <modal-dialog ref='modalDialog' />
            <!-- 通知弹窗 -->
            <notice-dialog ref='noticeDialog' />
        </view>
    </view>
</template>

<script>
// api
import { queryWithdrawPageList } from '@/api/user.js'

export default {
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 提现类型
            withdrawType: 1,
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
            // 当前弹窗组件索引
            dropIndex: -1,
            // 当前展开项
            current: -1
        }
    },
    onLoad (options) {
        this.withdrawType = options.withdrawType

        // 初始化
        this.$init().then(() => {
            // 获取提现记录
            this.queryWithdrawPageList()
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('withdraw_record_view')
    },
    // 下拉刷新
    onPullDownRefresh () {
        setTimeout(() => {
            this.page = 1
            this.loadStatus = 'more'
            uni.stopPullDownRefresh()
            this.queryWithdrawPageList()
        }, 800)
    },
    methods: {
        // 改变当前展开项
        changeCurrent (e) {
            this.current = this.current === e.index ? -1 : e.index
        },

        // 获取取款记录
        queryWithdrawPageList () {
            if (this.loadStatus !== 'more') return
            this.loadStatus = 'loading'
            const customerInfo = this.customerInfo
            queryWithdrawPageList({
                companyId: customerInfo.companyId,
                customerNo: customerInfo.customerNo,
                withdrawType: this.withdrawType,
                current: this.page,
                size: this.size,
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
		
        // 筛选取款记录数据
        filterData () {
            this.page = 1
            this.loadStatus = 'more'
            this.current = -1
            uni.showLoading({
                title: this.$t('common.loading'),
                mask: true
            })
            this.queryWithdrawPageList()
        },

        // 状态文字转换
        handleState (checkStatus, transferStatus) {
            // 存款成功 待支付 已取消
            if (Number(checkStatus) === 3 || Number(transferStatus) === 3) {
                return this.$t('withdrawRecord.auditStatus.2')
            } else if (Number(transferStatus) === 2) {
                return this.$t('withdrawRecord.auditStatus.3')
            } else {
                return this.$t('withdrawRecord.auditStatus.1')
            }
        },

        // 货币转换
        handleCurrency (item) {
            let currency = ''
            switch (item.withdrawType) {
                case 1:
                    currency = item.accountCurrency
                    break
                case 2:
                    currency = `${item.withdrawCurrency}-${item.blockchainName}`
                    break
            }
            return currency
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
        }
    },
    onReachBottom () {
        // 获取提现记录
        this.queryWithdrawPageList()
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
			margin-top: -12rpx;
			font-size: 26rpx;
			right: 0;
		}
		.item-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 30rpx 0;
			.vital {
                flex: 1;
				.name {
					font-size: 28rpx;
					font-weight: bold;
					@include styles('color', 'color');
				}
				.time {
					@include styles('color', 'minorColor');
					margin-top: 15rpx;
					font-size: 24rpx;
				}
			}
			.state {
				@include styles('color', 'primary');
				margin-right: 30rpx;
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
					.copy {
						@include styles('color', 'minorColor');
						margin-left: 8rpx;
						font-size: 32rpx;
					}
				}
				.state {
					@include styles('color', 'primary');

				}
			}
		}
	}
}
</style>
