<template>
    <view class='news-list'>
        <view class='innerTab'>
            <view class='tabs-type'>
                <view class='tabs-item' :class='{ activeTab:canlendarType==1 }' @click='changeCanlendarType(1)'>
                    {{ $t('information.data') }}
                </view>
                <view class='tabs-item' :class='{ activeTab:canlendarType==2 }' @click='changeCanlendarType(2)'>
                    {{ $t('information.event') }}
                </view>
            </view>
        </view>
        <view class='week-container'>
            <view class='prev' :class='{ actived:direction===-1 }' @click='showExtraWeekDays(-1)'>
                <tui-icon
                    class='arrow'
                    :class='{ actived:direction===-1 }'
                    :name='getArrowName(-1)'
                    :size='36'
                    unit='rpx'
                />
            </view>
            <view class='week-wrap'>
                <view class='week'>
                    <view
                        v-for='week in weekdays'
                        :key='week.timeAxis'
                        :class='{ item: true, actived:timeAxis===week.timeAxis }'
                        @click='getCalendar(week.timeAxis)'
                    >
                        <view>{{ week.weekday }}</view>
                        <view>{{ week.date }}</view>
                    </view>
                </view>
                <view v-if='extraWeekVisible' class='extra-week'>
                    <view
                        v-for='week in extraWeekDays'
                        :key='week.timeAxis'
                        :class='{ actived:timeAxis===week.timeAxis }'
                        @click='renderCalendar(week.timeAxis)'
                    >
                        <view>{{ week.weekday }}</view>
                        <view>{{ week.date }}</view>
                    </view>
                </view>
            </view>
            <view class='next' :class='{ actived:direction===1 }' @click='showExtraWeekDays(1)'>
                <tui-icon
                    class='arrow'
                    :class='{ actived:direction===1 }'
                    :name='getArrowName(1)'
                    :size='36'
                    unit='rpx'
                />
            </view>
        </view>

        <view v-if='filterCalendarList.length > 0' class='self-container'>
            <view class='self-content'>
                <view v-for='calendar in filterCalendarList' :key='calendar.id' class='item'>
                    <view class='flag'>
                        <image :src='`http://cdn.jin10.com/assets/img/commons/flag/flash/${calendar.country}.png`' />
                    </view>
                    <view class='info'>
                        <view class='top' />
                        <view class='middle'>
                            {{ calendar.text }}
                        </view>
                        <view class='bottom'>
                            <span>{{ $t('information.previous') }}：{{ calendar.prev_value }}</span>
                            <span>{{ $t('information.expect') }}：{{ calendar.expect }}</span>
                            <span>{{ $t('information.publish') }}：{{ calendar.public_value }}</span>
                        </view>
                    </view>
                </view>
            </view>
        </view>
        <none-data v-else />
    </view>
</template>

<script>
import { canlendarListByDate } from '@/api/information.js'
import dayjs from 'dayjs'

export default {
    data () {
        return {
            canlendarType: 1,
            calendarList: [],
            filterCalendarList: [],
            lastWeek: [],
            weekdays: [],
            nextWeek: [],
            extraWeekDays: [],
            timeAxis: 0,
            extraWeekVisible: false,
            direction: 0,
        }
    },
    mounted () {
        this.renderCalendar()
    },
    methods: {
        getArrowName (type) {
            let str = ''
            if (type === -1) {
                str = 'turningleft'
            }
            if (type === 1) {
                str = 'turningright'
            }
            if ((type === -1 && this.direction === -1) || (type === 1 && this.direction === 1)) {
                str = 'turningdown'
            }

            return str
        },
        changeCanlendarType (val) {
            this.canlendarType = val
            this.filterCalendarList = this.calendarList.filter(el => el.type === val)
        },
        getCalendar (timeAxis) {
            this.timeAxis = timeAxis
            canlendarListByDate({
                timestamp: timeAxis
            }, this.currentLang).then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    this.calendarList = data
                    this.changeCanlendarType(this.canlendarType)
                }
            })
        },
        renderCalendar (time) {
            const weekLang = [
                this.$t('information.monday'),
                this.$t('information.tuesday'),
                this.$t('information.wednesday'),
                this.$t('information.thursday'),
                this.$t('information.friday'),
                this.$t('information.saturday'),
                this.$t('information.sunday')
            ]
            // 星期几
            // debugger
            const dayOfWeek = dayjs(time).day()
            const computeTime = dayOfWeek === 0 ? (time - 86400000) : time
            const startWeek = dayjs(computeTime).startOf('week')
            const computeDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek
            const tempTimeAxis = startWeek.add(computeDayOfWeek, 'day').valueOf()
            this.lastWeek = [-6, -5, -4, -3, -2, -1, 0].map((item, index) => ({
                weekday: weekLang[index],
                timeAxis: startWeek.add(item, 'day').valueOf(),
                date: startWeek.add(item, 'day').format('MM/DD')
            }))
            this.weekdays = [1, 2, 3, 4, 5, 6, 7].map((item, index) => ({
                weekday: weekLang[index],
                timeAxis: startWeek.add(item, 'day').valueOf(),
                date: startWeek.add(item, 'day').format('MM/DD')
            }))
            this.nextWeek = [8, 9, 10, 11, 12, 13, 14].map((item, index) => ({
                weekday: weekLang[index],
                timeAxis: startWeek.add(item, 'day').valueOf(),
                date: startWeek.add(item, 'day').format('MM/DD')
            }))
            this.extraWeekVisible = false
            this.getCalendar(tempTimeAxis)
            this.direction = 0
        },
        showExtraWeekDays (dir) {
            if (this.extraWeekVisible) {
                this.extraWeekVisible = false
                this.direction = 0
            } else {
                this.extraWeekVisible = true
                this.direction = dir
            }
            this.extraWeekDays = dir === -1 ? this.lastWeek : this.nextWeek
        }
    }
}
</script>

<style lang="scss" scoped>
.news-list {
	@include styles('background-color', 'contentColor');
	padding: 16rpx 30rpx 0;
	.innerTab {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 64rpx;
		padding-bottom: 16rpx;
		.tabs-type {
			width: 208rpx;
			height: 44rpx;
			border: 1px solid;
			padding:0 16rpx;
			@include styles('border-color', 'normalColor');
			border-radius: 40rpx;
			display: flex;
			align-items: baseline;
			.tabs-item {
				width: 50%;
				height: 100%;
				display: inline-flex;
				justify-content: center;
				align-items: center;
				font-size: 26rpx;
				@include styles('color', 'color');
			}
			.activeTab {
				// @include styles('background-color', 'contentColor');
				@include styles('color', 'primary');
			}
		}
	}
	.week-container {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		margin: 15px 0;
		.prev,
		.next {
			align-self: center;
			width: 26rpx;
			height: 26rpx;
			margin-top: -10rpx;
			font-style: normal;
			text-align: center;
			transition: all 0.3s ease;
			.tui-icon-class {
				vertical-align: middle;
				width: 26rpx;
				height: 26rpx;
				&.actived {
					@include styles('background-color', 'primary');
					border-radius: 50%;
					@include styles('color', 'contentColor');
				}

			}
		}
		.week-wrap {
			position: relative;
			display: flex;
			flex: 1;
			padding: 0 20rpx;
			font-size: 24rpx;
			.week,
			.extra-week {
				display: flex;
				justify-content: space-between;
				text-align: center;
				flex: 1;
				.item {
					padding: 5rpx 8rpx;
					border-radius: 6rpx;
				}
				.actived {
					@include styles('color', 'primary');
					@include styles('background-color', 'bgColor');
				}
			}
			.extra-week {
				padding: 5rpx 10rpx;
				position: absolute;
				top: 100%;
				width: 100%;
				box-shadow: 0 0 5rpx rgba(0, 0, 0, .2);
				border-radius: 6rpx;
				@include styles('background-color', 'contentColor');
			}
		}
	}
	.news-flex {
		display: flex;
		padding: 22rpx 25rpx;
		.news-tbox {
			flex: 1;
			padding-right: 28rpx;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			.news-title {
				@include styles('color', 'color');
				font-size: 27rpx;
			}
			.sub-box {
				@include styles('color', 'minorColor');
				display: flex;
				font-size: 25rpx;
				justify-content: space-between;
			}
		}
		.news-picbox {
			width: 240rpx;
			.thumb {
				width: 240rpx;
				height: 160rpx;
			}
		}
	}
	.self-container {
		padding: 0.2rem 0;
		.self-content {
			display: flex;
			flex-direction: column;
			.item {
				display: flex;
				flex-direction: row;
				align-content: center;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 15rpx;
				.flag {
					width: 96rpx;
					height: 96rpx;
					overflow: hidden;
					border-radius: 50%;
					image {
						display: block;
						width: 100%;
						height: 100%;
						border: none;
						outline: none;
					}
				}
				.info {
					display: flex;
					flex: 0 0 83%;
					flex-direction: column;
					justify-content: space-between;
					min-height: 160rpx;
					padding-bottom: 15px;
					@include styles('color', 'minorColor');
					border-bottom: 1px solid;
					@include styles('border-color', 'lineColor');
					.top {
						display: flex;
						align-items: center;
						margin-bottom: 14rpx;
					}
					.middle {
						margin-bottom: 20rpx;
						@include styles('color', 'normalColor');
						font-size: 28rpx;
						line-height: 52rpx;
						text-align: justify;
					}
					.bottom {
						display: flex;
						font-size: 22rpx;
						line-height: 28rpx;
						span {
							margin-right: 20rpx;
						}
					}
				}
			}
		}
	}
}
</style>
