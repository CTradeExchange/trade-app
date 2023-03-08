<template>
    <view class='fund-invest-compose'>
        <view class='case'>
            <view class='title'>
                <strong>{{ $t('fundInfo.realtimeInvestCompose') }}</strong>
                <i class='iconfont icon_chouti1' @click='showList = !showList'></i>
            </view>
            <!-- 投资组件列表 -->
            <view v-show='showList'>
                <view class='assetsTitle cellflex'>
                    <p class='hd'>
                        {{ $t('fundInfo.assets') }}
                    </p>
                    <p class='bd'>
                        {{ $t('fundInfo.ranking') }}
                        <br />
                        <span class='small'>
                            ({{ fundId ? $t('fundInfo.comparePrev24') : $t('fundInfo.comparePrev') }})
                        </span>
                    </p>
                    <p class='ft'>
                        {{ $t('fundInfo.weight') }}
                        <br />
                        <span class='small'>
                            ({{ fundId ? $t('fundInfo.comparePrev24') : $t('fundInfo.comparePrev') }})
                        </span>
                    </p>
                </view>
                <view class='assetsList'>
                    <view v-for='item in rangList' :key='item.asset' class='item cellflex'>
                        <view class='hd'>
                            <currency-icon :currency='item.asset' :size='50' />
                            <span>{{ item.asset }}</span>
                        </view>
                        <view class='bd'>
                            {{ item.range }}
                            (<i v-if="item.previousPeriodRangeCompare !== '-'" :class='{ "downArrow":item.previousPeriodRangeCompare<0, "upArrow":item.previousPeriodRangeCompare>0 }'></i>
                            {{ item.previousPeriodRangeCompare === '-' ? ' - ' : Math.abs(item.previousPeriodRangeCompare) }})
                        </view>
                        <view class='ft'>
                            <span @click.stop='openPopupText(item)'>
                                <em>{{ item.weight }} ( </em>
                                <tui-icon :name='item.arrow' :size='36' unit='rpx' />
                                <em>{{ item.previousPeriodWeightCompare === '-' ? '-' : item.previousPeriodWeightCompare.replace(/[\+-]/,'') }} )</em>
                            </span>
                            <tui-bubble-popup
                                direction='top'  
                                :mask='false' 
                                position='absolute'
                                right='0'
                                :show='item.show' 
                                top='45rpx'
                                triangle-left='50%'
                                triangle-top='-22rpx'
                                width='auto'
                            >
                                <view class='popup-text'>
                                    {{ item.weightRealValue }}({{ item.previousPeriodWeightCompare }})
                                </view>
                            </tui-bubble-popup>
                        </view>
                    </view>
                </view>
            </view>
            <!-- 饼图 -->
            <view 
                v-show='!showList' 
                id='echarts_1' 
                :change:prop='echarts.updateEcharts_1' 
                :prop='option_1'
                :style="{ width: '100%', height: '320px' }" 
            />
        </view>
        <view class='bar' />
		
        <!-- 柱状图 -->
        <view class='case'>
            <view class='title'>
                <span>{{ $t('fundInfo.singleAsset') }}</span>
                <tui-icon 
                    :color='$style.color' 
                    name='explain' 
                    :size='36' 
                    unit='rpx' 
                    @click='assetQquestionTip'
                />
            </view>
            <view id='echarts_2' :change:prop='echarts.updateEcharts_2' class='echarts' :prop='option_2' />
        </view>
		
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
    </view>
</template>

<script>
import { assetPerformance, investCombination } from '@/api/trade'
export default {
    props: {
        // 基金id
        fundId: {
            type: [String, String],
            default: ''
        }
    },
    data () {
        return {
            // 投资组合列表
            rangList: [],
            // 是否显示列表数据
            showList: false,
            // 饼图高度
            chartPieDOMHeight: '300px',
            // 投资组合
            option_1: {},
            // 单资产表现
            option_2: {}
        }
    },
    mounted () {
        this.render()
        uni.$on('onLayout', () => {
            this.closeAllPopupText()
        })
    },
    methods: {
        // 初始化
        render () {
            // 获取投资组合
            this.getInvestCombination()
            // 获取单资产表现柱状图数据
            this.getAssetPerformance()
        },
		
        // 获取投资组合
        getInvestCombination () {
            investCombination({ 
                fundId: this.fundId, 
                statisticType: 1
            }).then(res => {
                this.rangList = res.data
                const arr = []
                res.data.map(elem => {
                    elem.arrow = parseFloat(elem.previousPeriodWeightCompare) < 0 ? 'turningdown' : 'turningup'
                    arr.push({
                        value: parseFloat(elem.weight),
                        name: elem.asset + ' ' + elem.weight,
                    })
                })
                this.showList = true
                this.option_1 = {
                    backgroundColor: this.$style.contentColor,
                    legend: {
                        textStyle: {
                            color: this.$style.normalColor
                        }
                    },
                    series: [
                        {
                            data: arr
                        }
                    ]
                }
            })
        },
		
        // 获取单资产表现柱状图数据
        getAssetPerformance () {
            assetPerformance({ fundId: this.fundId }).then(res => {
                const xData = []
                const yData = []
                res.data.map(elem => {
                    xData.push(elem.xAxisName)
                    yData.push({
                        value: elem.quoteChange,
                        itemStyle: {
                            color: elem.quoteChange < 0 ? '#a90000' : '#2b70ae'
                        }
                    })
                })
                this.option_2 = {
                    backgroundColor: this.$style.contentColor,
                    legend: {
                        show: false
                    },
                    grid: {
                        top: 10
                    },
                    xAxis: {
                        data: xData,
                        axisLine: {
                            show: true,
                            lineStyle: {
                                color: this.$style.normalColor
                            }
                        },
                        axisLabel: {
                            interval: 0,
                            rotate: 90
                        }
                    },
                    yAxis: {
                        axisLine: {
                            show: true,
                            lineStyle: {
                                color: this.$style.normalColor
                            }
                        }
                    },
                    series: [
                        {
                            type: 'bar',
                            data: yData
                        }
                    ]
                }
            })
        },
		
        // 关闭所有权重文字提示
        closeAllPopupText () {
            this.rangList.map(elem => {
                this.$set(elem, 'show', false)
            })
        },
		
        // 权重文字提示
        openPopupText (item) {
            this.closeAllPopupText()
            this.$set(item, 'show', true)
        },
		
        // 资产弹窗提示
        assetQquestionTip () {
            this.$refs['modalDialog'].show({
                content: this.fundId ? this.$t('fundInfo.assetQquestionTip') : this.$t('fundInfo.assetIndexQquestionTip')
            })
        }
    }
}
</script>

<script module="echarts" lang="renderjs">
import { newChart, newPieChart } from '@/utils/echarts.js'
	
// 投资组合
let echarts_1 = null
// 单资产表现
let echarts_2 = null

export default {
	mounted() {
		if (typeof window.echarts === 'function') {
			this.initEcharts()
		} else {
			// 动态引入较大类库避免影响页面展示
			const script = document.createElement('script')
			script.onload = this.initEcharts
			script.src = 'static/js/echarts.js'
			document.head.appendChild(script)
		}
	},
	methods: {
		// 初始化
		initEcharts() {
			echarts_1 = newPieChart(document.getElementById('echarts_1')) 
			echarts_2 = newChart(document.getElementById('echarts_2'), { yAxis: { 'ext': '%' } }) 
		},
		
		// 更新市场价格 vs 基金净值图表
		updateEcharts_1 (newValue, oldValue, ownerInstance, instance) {
			echarts_1.setOption(newValue)
		},
		
		// 更新基金涨幅 vs 指数涨幅图表
		updateEcharts_2 (newValue, oldValue, ownerInstance, instance) {
			echarts_2.setOption(newValue)
		}
	}
}
</script>

<style lang="scss" scoped>
.echarts {
	width: 100%;
	height: 500rpx;
}
.fund-invest-compose {
	padding: 0 25rpx;
	.case {
		.title {
			@include flexAlign;
			padding-top: 30rpx;
			padding-bottom: 30rpx;
			span {
				margin-right: 8rpx;
				font-size: rem(30px);
				font-weight: bold;
			}
			strong {
				flex: 1;
				font-size: rem(30px);
				font-weight: bold;
			}
			.icon_chouti1 {
				font-size: rem(30px);
			}
		}
	}
	.bar {
		@include styles('background', 'lineColor');
		height: 5rpx;
		margin-top: 40rpx;
		margin-bottom: 15rpx;
	}
}
.assetsTitle {
	@include styles('color', 'minorColor');
    margin-top: rem(30px);
    font-size: rem(24px);
}
.assetsList {
    margin-top: rem(20px);
    font-size: rem(28px);
    .item {
		display: flex;
		align-items: center;
        margin-bottom: 15rpx;
		&:last-of-type {
			margin-bottom: 0;
		}
		.hd {
			display: flex;
			align-items: center;
			span {
				margin-left: 10rpx;
			}
		}
		.ft {
			&::v-deep {
				.tui-icon-turningdown {
					@include styles('color', 'fallColor');
				}
				.tui-icon-turningup {
					@include styles('color', 'riseColor');
				}
			}
		}
		.popup-text {
			padding: 10rpx 15rpx;
			font-size: 26rpx;
		}
    }

}
.cellflex {
    display: flex;
    text-align: right;
    .hd {
        text-align: left;
    }
    .bd {
        flex: 1;
    }
    .ft {
        width: rem(300px);
		position: relative;
    }
    .small{
        font-size: rem(22px);
    }
}
</style>
