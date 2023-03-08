<template>
    <view>
        <tui-top-dropdown height='auto' :show='show' :translatey="'calc('+ systemInfo.navbarHeight +'px + 100rpx)'" @close='close'>
            <view class='module-content'>
                <view class='filter-module'>
                    <view class='title'>
                        {{ $t('common.time') }}
                    </view>
                    <view class='list'>
                        <block v-for='(item, index) in dateBtns' :key='index'>
                            <view :class="{ 'name': true, 'active': item.value === dateType }" @click='selectDate(item)'>
                                {{ item.name }}
                            </view>
                        </block>
                    </view>
                    <view class='section' @click='openCalendar'>
                        <view class='name'>
                            {{ $t("fund.timeZone") }}
                        </view>
                        <input 
                            disabled
                            :placeholder="$t('fund.selectTimeZone')" 
                            placeholderClass='placeholderClass' 
                            type='text' 
                            :value="startTime ? (startTime + ' - ' + endTime) : ''" 
                        />
                    </view>
                </view>
                <view class='handle'>
                    <button class='reset' @click='onReset'>
                        {{ $t('fund.reset') }}
                    </button>
                    <button class='complete' @click='onComplete'>
                        {{ $t('common.complete') }}
                    </button>
                </view>
            </view> 
        </tui-top-dropdown>
		
        <!-- 日历组件 -->
        <calendar ref='calendar' is-fixed :type='2' @change='selectCalendar' />
    </view>
</template>

<script>
export default {
    props: {
        // 是否显示弹窗
        show: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            // 日期
            dateBtns: this.$t('fund.dateBtns'),
            // 日期名称
            dateName: '',
            // 日期类型
            dateType: 0,
            // 开始时间
            startTime: '',
            // 结束时间
            endTime: ''
        }
    },
    methods: {
        // 设置默认值
        setDefault (data) {
            this.dateName = data.dateName
            this.dateType = data.dateType
            this.startTime = data.startTime
            this.endTime = data.endTime
        },
        
        // 选择日期类型
        selectDate (item) {
            this.dateName = item.name
            this.dateType = item.value
            this.setDate()
        },
		
        // 设置日期
        setDate () {
            let startTime = ''
            let endTime = this.$dayjs(new Date()).format('YYYY/MM/DD')
            switch (this.dateType) {
                case 0:
                    startTime = ''
                    endTime = ''
                    break
                case 1: 
                    startTime = this.$dayjs(new Date()).format('YYYY/MM/DD 00:00:00')
                    endTime = this.$dayjs(new Date()).format('YYYY/MM/DD 23:59:59')
                    break
                case 2:
                    startTime = this.$dayjs().subtract(7, 'day').format('YYYY/MM/DD')
                    break
                case 3:
                    startTime = this.$dayjs().subtract(1, 'month').format('YYYY/MM/DD')
                    break
                case 4:
                    startTime = this.$dayjs().subtract(3, 'month').format('YYYY/MM/DD')
                    break
            }
            this.startTime = startTime
            this.endTime = endTime
        },
		
        // 打开日历弹窗
        openCalendar () {
            if (this.dateType !== 0) return
            this.$refs['calendar'].show()
        },
		
        // 选择日期
        selectCalendar (e) {
            this.startTime = e.startDate.replace(/-/g, '/')
            this.endTime = e.endDate.replace(/-/g, '/')
        },
		
        // 关闭弹窗
        close () {
            this.$emit('close')
        },
		
        // 重置 
        onReset () {
            this.dateType = 0
            this.dateName = ''
            this.startTime = ''
            this.endTime = ''
        },
		
        // 完成
        onComplete () {
            this.$emit('complete', {
                dateType: this.dateType,
                dateName: this.dateName,
                startTime: this.startTime,
                endTime: this.endTime
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.module-content {
	@include styles('color', 'color');
	@include styles('background-color', 'contentColor');
	padding: 20rpx 30rpx;
	.filter-module {
		margin-bottom: 40rpx;
		.title {
			margin-bottom: 15rpx;
		}
		.list {
			display: flex;
			flex-wrap: wrap;
			.name {
				@include styles('border-color', 'lineColor');
				padding: 10rpx 15rpx;
				margin-right: 18rpx;
				margin-bottom: 18rpx;
				font-size: 25rpx;
				border-style: solid;
				border-width: 1px;
			}
			.active {
				@include styles('color', 'primary');
				@include styles('border-color', 'primary');
			}
		}
		.section {
			@include styles('border-bottom-color', 'lineColor');
			display: flex;
			justify-content: space-between;
			align-items: center;
			height: 100rpx;
			border-bottom-style: solid;
			border-bottom-width: 1px;
			.name {
				width: 160rpx;
			}
			input {
				flex: 1;
				height: 100%;
			}
		}
	}
	.handle {
		display: flex;
		justify-content: space-between;
		button {
			display: flex;
			justify-content: center;
			align-items: center;
			height: 75rpx;
			flex: 1;
			font-size: 26rpx;
			&.reset {
				@include styles('color', 'color');
				@include styles('background-color', 'primaryAssistColor');
				margin-right: 30rpx;
			}
			&.complete {
				@include styles('background-color', 'primary');
				color: #fff;
			}
		}
	}
}
</style>
