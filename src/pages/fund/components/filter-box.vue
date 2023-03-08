<template>
    <view>
        <view class='dropdown-menu'>
            <dropdown-item
                :drop-index.sync='dropIndex' 
                :index='0' 
                :list='currencyList' 
                :model-value.sync='currencyVal' 
                @update:modelValue='filterData'
            />
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
		
        <!-- 日历组件 -->
        <calendar ref='calendar' is-fixed :type='2' @change='selectCalendar' />
    </view>
</template>

<script>
export default {
    props: {
        // 资产列表
        assetsList: {
            type: Array,
            default: () => []
        }
    },
    data () {
        return {
            // 当前弹窗组件索引
            dropIndex: -1,
            // 份额代币
            currencyVal: 0,
            currencyList: [{ text: this.$t('fundInfo.shareCurrency'), value: 0 }], 
            // 时间
            timeVal: 0,
            timeList: [
                { text: this.$t('common.allDate'), value: 0 },
                { text: this.$t('common.curToday'), value: 1 },
                { text: this.$t('common.curWeek'), value: 2 },
                { text: this.$t('common.curMonth'), value: 3 },
                { text: this.$t('common.curThreeMonth'), value: 4 }
            ],
            timeRange: '',
            startTime: '',
            endTime: ''
        }
    },
    watch: {
        // 监听assetsList
        assetsList () {
            const arr = this.currencyList
            this.assetsList.map(elem => {
                arr.push({ text: elem.code, value: elem.code })
            })
            this.currencyList = arr
        }
    },
    methods: {
        // 重置参数
        reset () {
            this.dropIndex = -1
            this.currencyVal = 0
            this.timeVal = 0
            this.timeRange = ''
            this.startTime = ''
            this.endTime = ''
        },
		
        // 筛选数据
        filterData () {
            this.$emit('filter', {
                currencyVal: this.currencyVal,
                startTime: this.startTime,
                endTime: this.endTime
            })
        },
		
        // 改变时间类型
        changeTimeType () {
            switch (this.timeVal) {
                case 0:
                    this.startTime = ''
                    this.endTime = ''
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
            if (this.startTime) {
                this.endTime = this.$dayjs(this.$dayjs(new Date()).format('YYYY/MM/DD 23:59:59')).valueOf()
            }
            this.timeRange = ''
            // 筛选数据
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
            // 筛选数据
            this.filterData()
        }
    }
}
</script>

<style lang="scss" scoped>
.dropdown-menu {
	@include flex;
	position: relative;
	&::after {
		@include styles('background', 'lineColor');
		content: '';
		width: 100%;
		height: 1rpx;
		position: absolute;
		bottom: 0;
	}
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
