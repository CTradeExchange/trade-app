<template>
    <view class='fundPerformance'>
        <view class='case'>
            <view class='title'>
                {{ $t('fundInfo.fundChart1') }}
            </view>
            <view id='echarts_1' :change:prop='echarts.updateEcharts_1' class='echarts' :prop='option_1' />
        </view>
        <view class='bar' />
        <view class='case'>
            <view class='title'>
                {{ $t('fundInfo.fundChartTitle') }}
            </view>
            <view id='echarts_2' :change:prop='echarts.updateEcharts_2' class='echarts' :prop='option_2' />
        </view>
    </view>
</template>

<script>
import { marketPerformance, marketPerformanceQuoteChange } from '@/api/trade'
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
            // 市场价格 vs 基金净值
            option_1: {},
            // 基金涨幅 vs 指数涨幅
            option_2: {}
        }
    },
    mounted () {
        this.render()
    },
    methods: {
        // 初始化
        render () {
            // 获取市场价格 vs 基金净值
            this.getMarketPerformanceData()
            // 获取基金涨幅vs指数涨幅
            this.getMarketPerformanceQuoteChange()
        },

        // 获取市场价格 vs 基金净值
        getMarketPerformanceData () {
            marketPerformance({
                fundId: this.fundId,
                days: 60,
                type: 1,
            }).then(res => {
                this.setOption(res, 'option_1')
            })
        },

        // 获取基金涨幅vs指数涨幅
        getMarketPerformanceQuoteChange () {
            marketPerformanceQuoteChange({
                fundId: this.fundId,
                days: 60,
                type: 1
            }).then(res => {
                this.setOption(res, 'option_2')
            })
        },
		
        // 设置数据
        setOption (res, name) {
            const keyArr = Object.keys(res.data)
            const xData = []
            const yData = []
            Object.values(res.data).map((arr, index) => {
                const item = {
                    name: keyArr[index],
                    type: 'line',
                    data: []
                }
                arr.map(elem => {
                    if (keyArr.length - 1 === index) {
                        xData.push(elem.time)
                    }
                    item.data.push(elem.value)
                })
                yData.push(item)
            })
			
            this[name] = {
                backgroundColor: this.$style.contentColor,
                legend: {
                    data: keyArr,
                    textStyle: {
                        color: this.$style.normalColor
                    }
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
                        interval: 16
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
                series: yData
            }
        }
    }
}
</script>

<script module="echarts" lang="renderjs">
import { newChart } from '@/utils/echarts.js'
	
// 市场价格 vs 基金净值图表
let echarts_1 = null
// 基金涨幅 vs 指数涨幅图表
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
			echarts_1 = newChart(document.getElementById('echarts_1')) 
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
.fundPerformance {
	padding: 0 25rpx;
	.case {
		.title {
			font-size: rem(30px);
			font-weight: bold;
			padding-top: 30rpx;
			padding-bottom: 30rpx;
		}
	}
	.bar {
		@include styles('background', 'lineColor');
		height: 5rpx;
		margin: 20rpx 0;
	}
}
</style>
