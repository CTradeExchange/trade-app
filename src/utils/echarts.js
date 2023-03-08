// 绘制图表
export const newChart = (chartDom, opts = {}) => {
	if (!chartDom) return {}
	
	const myChart = echarts.init(chartDom)
	const yAxisExt = opts.yAxis?.ext ?  opts.yAxis?.ext : ''
	const option = {
		tooltip: {
			trigger: 'axis',
			extraCssText: 'z-index:99',
			textStyle: {
				fontSize: 12
			},
			formatter: function (params) {
				let str = `<p style="padding-bottom:10px;">${params[0].name}</p>`
				params.forEach((item) => {
					str += `<p style="padding-bottom:5px;">`
					if (item.seriesName.indexOf('series') === -1) {
						str += `<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;left:5px;background-color:${item.color}"></span>
							${item.seriesName}: <br /><span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;left:5px;"></span>
							${item.value + yAxisExt}</p>`
					} else {
						str += `<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;left:5px;background-color:${item.color}"></span>${item.value + yAxisExt}</p>`
					}
			
				})
				return str
			}
		},
		color: ['#F1A21A', '#2B70AE'],
		grid: {
			left: 10,
			right: 0,
			bottom: '3%',
			containLabel: true
		},
		xAxis: {
			type: 'category'
		},
		yAxis: {
			type: 'value'
		}
	}
	if (yAxisExt) {
		option.yAxis.axisLabel = {
			formatter: '{value} ' + yAxisExt
		}
	}
	
	option && myChart.setOption(option)

	return myChart
}

// 绘制环形图
export const newPieChart = (chartDom) => {
	if (!chartDom) return {}
	
	const myChart = echarts.init(chartDom)
	const option = {
		color: ['#B72122', '#E9393A', '#FF762C', '#FF9E2C', '#FFC62C', '#F1DE3F', '#D2C02A', '#B6A622', '#9E9123', '#648319', '#198351', '#2AA46B', '#41CE8D', '#6BF1B3', '#56F5DD', '#82ECFF', '#82D7FF', '#7BBCF6', '#589EDC', '#2B70AE'],
		legend: {
			top: 20,
			bottom: '0',
			right: 0,
		},
		series: [
			{
				type: 'pie',
				radius: ['40%', '70%'],
				avoidLabelOverlap: false,
				top: '30%',
				bottom: 0,
				label: {
					show: false,
					position: 'center'
				},
				emphasis: {
					label: {
						show: false,
					}
				},
				labelLine: {
					show: false
				}
			}
		]
	}

	option && myChart.setOption(option)
	return myChart
}
