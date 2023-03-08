<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container'>
            <nav-bar :title='product.symbolName' />
            <view class='layout-content'>
                <view class='cell'>
                    <text class='label'>
                        {{ $t("contract.symbolCode") }}
                    </text>
                    <text class='value'>
                        {{ product.symbolCode }}
                    </text>
                </view>
                <view class='cell'>
                    <text class='label'>
                        {{ $t("contract.contractSize") }}
                    </text>
                    <text class='value'>
                        {{ product.contractSize }}
                    </text>
                </view>
                <view class='cell'>
                    <text class='label'>
                        {{ $t('contract.profitCurrency') }}
                    </text>
                    <text class='value'>
                        {{ product.profitCurrency }}
                    </text>
                </view>
                <view class='cell'>
                    <text class='label'>
                        {{ $t('contract.spread') }}
                    </text>
                    <text class='value'>
                        {{ $t('contract.float') }}
                    </text>
                </view>
                <view class='cell'>
                    <text class='label'>
                        {{ $t('contract.singleNumbers') }}
                    </text>
                    <text class='value'>
                        {{ product.minVolume +'-'+ product.maxVolume }}
                    </text>
                </view>
                <view class='cell'>
                    <text class='label'>
                        {{ $t('contract.limitDistance') }}
                    </text>
                    <text class='value'>
                        {{ product.priceMinLimit + '/' + product.priceMaxLimit + $t('contract.point') }}
                    </text>
                </view>
                <view v-if="product.marginInfo && product.marginInfo.type === '1' && usedMarginSet && usedMarginSet.length" class='block'>
                    <text class='label'>
                        {{ $t('contract.advance') }}
                    </text>
                    <view class='case'>
                        <view class='item'> 
                            <span>
                                {{ $t('contract.volumeRange') }}
                            </span>
                            <strong>
                                {{ $t('contract.margins') }}
                            </strong>
                        </view>
                        <view v-for='(item, index) in usedMarginSet' :key='index' class='item'>
                            <span>
                                {{ item.rangeLeftVolume }} {{ lt }} {{ $t('contract.volumes') }} {{ le }} {{ item.rangeRightVolume }}
                            </span>
                            <strong>
                                {{ item.percent * 100 }}%
                            </strong>
                        </view>
                        <view class='item'>
                            <span>
                                {{ $t('contract.volumes') }} &gt; {{ usedMarginSet[usedMarginSet.length-1].rangeRightVolume }}
                            </span>
                            <strong>
                                {{ usedMarginSet[usedMarginSet.length-1].percent * 100 }}%
                            </strong>
                        </view>
                    </view>
                </view>
                <view class='cell'>
                    <text class='label'>
                        {{ $t('contract.feeType') }}
                    </text>
                    <text class='value'>
                        {{ $t(parseFloat(product.feeFormula) === 1 ? 'contract.ratio' : 'contract.amount') }}
                    </text>
                </view>
                <view class='cell'>
                    <text class='label'>
                        {{ $t('fee') }}
                    </text>
                    <text class='value'>
                        {{ fee }}
                    </text>
                </view>
                <view class='cell'>
                    <text class='label'>
                        {{ $t('contract.interest') }}
                    </text>
                    <tui-icon class='explain' name='explain' :size='34' unit='rpx' @click='showExplain' />
                    <text class='value'>
                        {{ interest }}
                    </text>
                </view>
                <view class='cell'>
                    <text class='label'>
                        {{ $t('contract.zone') }}
                    </text>
                    <text class='value'>
                        {{ 'GMT +' + (0 - new Date().getTimezoneOffset() / 60) }}
                    </text>
                </view>
                <view v-if='tradeTimeList && tradeTimeList.length > 0' class='block'>
                    <text class='label'>
                        {{ $t('contract.tradeTime') }}
                    </text>
                    <view class='time'>
                        <block v-for='(item,index) in tradeTimeList' :key='index'>
                            <view v-if='item.length' class='row'>
                                <span class='day'>
                                    {{ $t('weekdayMap.'+ item[0].dayOfWeek) }}:
                                </span>
                                <span v-for='el in item' :key='el.timeStr' class='segment'>
                                    {{ el.timeStr }}
                                </span>
                            </view>
                        </block>
                    </view>
                </view>
                <view v-if='product.eodTime || product.eodTime === 0' class='cell'>
                    <text v-if='product.eodTime' class='label'>
                        {{ $t('contract.eodTime') }}
                    </text>
                    <text class='value'>
                        {{ eodTime }}
                    </text>
                </view>
                <view v-if='expireTime && product.endTime' class='cell'>
                    <text v-if='expireTime' class='label'>
                        {{ $t("contract.expireTime") }}
                    </text>
                    <text class='value'>
                        {{ expireTime }}
                    </text>
                </view>
            </view>
        </view>
		
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>
// vuex
import store from '@/store/index.js'
// utils
import { sessionGet, isEmpty, objArraySort } from '@/utils/util.js'
import { mul } from '@/utils/calculation.js'
import { sortTimeList, timeListFormat, timeListSort } from './contractUtil.js'
import BigNumber from 'bignumber.js'

export default {
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 玩法类型
            tradeType: '',
            // symbolId
            symbolId: '',
            // 使用说明 
            usedMarginSet: '',
            // 交易时间
            tradeTimeList: [],
            // 结算时间
            eodTime: '',
            // 年利率
            interest: '',
            // 手续费
            fee: '',
            // 到期时间
            expireTime: '',
            lt: '<',
            le: '>'
        }
    },
    computed: {
        // 偏侈时区
        utcOffset () {
            return sessionGet('utcOffset') || store.state._base.wpCompanyInfo.utcOffset
        },
        // 产品数据
        productMap () {
            return store.state._quote.productMap || {}
        },
        // 产品信息
        product () {
            return this.productMap[this.symbolKey] || {}
        }
    },
    onLoad (options) {
        this.symbolId = options.symbolId
        this.tradeType = options.tradeType
        this.symbolKey = `${options.symbolId}_${options.tradeType}`
		
        // 初始化
        this.$init().then(() => {
            this.pageInit()
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('contract_view')
    },
    methods: {
        // 页面初始化
        pageInit () {
            store.dispatch('_quote/querySymbolInfo', { 
                symbolId: this.symbolId, 
                tradeType: this.tradeType, 
                forceQuery: true
            }).then(() => {
                this.skeletonShow = false
                this.setPageData()
            }).catch(() => {
                this.skeletonShow = false
            })
            this.$QuoteSocket.send_subscribe([this.symbolKey])
        },
		
        // 显示隔夜利息说明
        showExplain () {
            this.$refs['modalDialog'].show({
                content: this.$t('contract.interestTip')
            })
        },
		
        // 设置页面数据
        setPageData () {
            // 设置使用说明
            if (this.product.usedMarginSet) {
                const contractSize = this.product.contractSize
                this.usedMarginSet = objArraySort(this.product.usedMarginSet, 'rangeLeft').map(el => {
                    el.rangeLeftVolume = BigNumber(el.rangeLeft).div(contractSize).toNumber()
                    el.rangeRightVolume = BigNumber(el.rangeRight).div(contractSize).toNumber()
                    return el
                })
            }
            // 设置年利率
            this.interest = mul(this.product.buyInterest, 100) + '%/' + mul(this.product.sellInterest, 100) + '%(' + this.$t(
                'contract.interestRate') + ')'
            // 设置手续费
            this.fee = ['1', '3'].includes(this.product.feeFormula) ? mul(this.product.feeRate, 100) + '%' : this.product.fee
            // 设置结算时间
            if (this.product.eodTime) {
                this.eodTime = this.product.eodTime.split(',').map(el => {
                    return this.$dayjs().utc().startOf('day').utcOffset(this.utcOffset).add(parseInt(el), 'minute').format('HH:mm')
                }).sort((a, b) => a.replace(/:/, '') - b.replace(/:/, '')).join(', ')
            }
            // 设置到期时间
            this.expireTime = this.product.endTime === 9999999999999 ? '' : this.$dayjs(this.product.endTime).format('YYYY-MM-DD HH:mm:ss')
            // 设置交易时间
            if (!isEmpty(this.product.tradeTimeList)) {
                const newTimeList = sortTimeList(this.product.tradeTimeList, this.utcOffset)
                timeListFormat(newTimeList)
                const timeStrList = JSON.parse(JSON.stringify(newTimeList))
                timeStrList.forEach((el, i) => {
                    timeStrList[i] = timeListSort(el)
                })
                this.tradeTimeList = timeStrList
            }
        }
    }
}
</script>

<style lang="scss" scoped> 
.layout-content {
	padding-top: 20rpx;
	font-size: 27rpx;
	.cell {
		@include styles('background-color', 'contentColor');
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 25rpx 30rpx;
		box-sizing: border-box;
		position: relative;
		&::after {
			@include styles('background-color', 'lineColor');
			content: '';
			width: 690rpx;
			height: 1px;
			position: absolute;
			bottom: 0;
			left: 50%;
			transform: translateX(-50%) scaleY(.5);
		}
		.label {
			display: inline-flex;
			align-items: center;
			@include styles('color', 'minorColor');	
		}
		.explain {
			vertical-align: -4rpx;
			margin-left: 10rpx !important;
		}
		.value {
			flex: 1;
			text-align: right;
		}
	}
	.block {
		@include styles('background-color', 'contentColor');
		display: flex;
		justify-content: space-between;
		padding: 25rpx 30rpx;
		position: relative;
		&::after {
			@include styles('background-color', 'lineColor');
			content: '';
			width: 690rpx;
			height: 1px;
			position: absolute;
			bottom: 0;
			left: 50%;
			transform: translateX(-50%) scaleY(.5);
		}
		.label {
			@include styles('color', 'minorColor');
		}
		.case {
			.item {
				display: flex;
				span {
					width: 300rpx;
					margin-right: 30rpx;
					text-align: right;
				}
				strong {
					width: 180rpx;
					text-align: right;
				}
			}
		}
		.time {
			text-align: right;
			line-height: 1.5;
			.row {
				display: flex;
				justify-content: flex-end;
				flex-wrap: wrap;
				.segment {
					margin-left: 10rpx;
					&:not(:last-of-type)::after {
						content: ',';
					}
				}
			}
		}
	}
}
</style>
