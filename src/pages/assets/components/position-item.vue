<template>
    <view class='position-item'>
        <tui-collapse :current='current' hd-bg-color='transparent' :index='data.positionId' @click='changeCurrent'>
            <template #title>
                <view class='item-header'>
                    <view class='row-1'>
                        <view class='name'>
                            {{ data.symbolName }}
                        </view>
                        <i class='iconfont icon_tubiao' @click.stop='goChartPage'></i>
                        <span 
                            v-if='data.crossLevelNum' 
                            class='multipleVal' 
                            :class="{ arrow: data.marginSetType === '2' }"
                            @click.stop='openMultipleSet'
                        >
                            <i>{{ data.crossLevelNum }}x</i>
                            <i v-if="data.marginSetType ==='2' " class='icon_arrow_down'></i>
                        </span>
                    </view>
                    <view class='row-2'>
                        <view class='lot'>
                            <span class='direction' :class="Number(data.direction) === 1 ? 'riseColor' : 'fallColor'">
                                {{ Number(data.direction) === 1 ? $t('trade.buyShort') :$t('trade.sellShort') }}
                            </span>
                            <strong>
                                {{ minus(data.openVolume, data.closeVolume) }}{{ $t('trade.volumeUnit') }}
                            </strong>
                        </view>
                        <view class='amount'>
                            <span :class="Number(data.profitLoss) === 0 ? '' : (Number(data.profitLoss) > 0 ? 'riseColor': 'fallColor')">
                                {{ data.profitLoss || '--' }}
                            </span>
                        </view>
                    </view>
                </view>
            </template>
            <template #content>
                <view :class="['item-content', 'item-content-type-' + data.tradeType]" @click.stop='goPositionDetail'>
                    <view class='row'>
                        <view class='col'> 
                            <span>{{ $t('trade.positionPrice') }}</span>
                            <strong>{{ data.openPrice || '--' }}</strong> 
                        </view>
                        <view class='col'>
                            <span>{{ $t('trade.currentPrice') }}</span>
                            <strong :class='[Number(data.direction) === 1 ? product.sell_color : product.buy_color]'>
                                {{ (Number(data.direction) === 1 ? product.sell_price : product.buy_price) || '--' }}
                            </strong>
                        </view>
                        <view v-if='Number(data.tradeType) === 2' class='col'>
                            <view class='title'>
                                <span @click.stop='showExplain(7)'>
                                    {{ $t('trade.previewStopPrice') }}
                                </span>
                                <em @click.stop='showExplain(7)'>
                                    <tui-icon class='explain' name='explain' />
                                </em>
                            </view>
                            <strong>{{ data.previewStopPrice || '--' }}</strong>
                        </view>
                    </view>
                    <view v-if='Number(data.tradeType) === 2' class='row'>
                        <view class='col'>
                            <view class='title'>
                                <span @click.stop='showExplain(8)'>
                                    {{ $t('trade.originalMargin') }}
                                </span>
                                <em @click.stop='showExplain(8)'>
                                    <tui-icon class='explain' name='explain' />
                                </em>
                            </view>
                            <strong>{{ data.occupyTheMargin || '--' }}</strong>
                        </view>
                        <view class='col'>
                            <view class='title'>
                                <span @click.stop='showExplain(9)'>
                                    {{ $t('trade.holdMargin') }}
                                </span>
                                <em @click.stop='showExplain(9)'>
                                    <tui-icon class='explain' name='explain' />
                                </em>
                            </view>
                            <strong>{{ data.maintenanceMargin || '--' }}</strong>
                        </view>
                        <view class='col'>
                            <view class='title'>
                                <span @click.stop='showExplain(10)'>
                                    风险状态
                                </span>
                                <em @click.stop='showExplain(10)'>
                                    <tui-icon class='explain' name='explain' />
                                </em>
                            </view>
                            <strong :class='["riskLevel", "riskLevel" + data.riskStatus]'>
                                {{ riskLevelMap[data.riskStatus] }}
                            </strong>
                        </view>
                    </view>
                    <view class='row'>
                        <view class='col'>
                            <span>{{ $t('trade.stopProfitPrice') }}</span>
                            <strong>{{ parseFloat(data.takeProfitDecimal) ? data.takeProfitDecimal : '--' }}</strong>
                        </view>
                        <view class='col'>
                            <span>{{ $t('trade.stopLossPrice') }}</span>
                            <strong>{{ parseFloat(data.stopLossDecimal) ? data.stopLossDecimal : '--' }}</strong>
                        </view>
                    </view>
                </view>
                <view class='handle'>
                    <button v-if='Number(data.tradeType) === 2' class='btn' @click='openAdjustMargin'> 
                        {{ $t('trade.modifyMargin') }}
                    </button>
                    <button class='btn' @click='openStopProfit'>
                        {{ $t('trade.tackStopSetup') }}
                    </button>
                    <button class='btn' @click='openPosition'>
                        {{ $t('trade.closed') }}
                    </button>
                </view>
            </template>
        </tui-collapse>
		
        <!-- 说明弹窗 -->
        <explain-popup  
            :explain-type='explainType'
            :show.sync='isExplain'
            :user-account='userAccount'
        />
    </view>
</template>

<script>
import store from '@/store/index.js'
import { minus } from '@/utils/calculation.js'
import explainPopup from './explain-popup.vue'

export default {
    components: {
        explainPopup
    },
    props: {
        // data数据
        data: {
            type: Object,
            default: () => {}
        },
        // 当前索引
        index: {
            type: Number,
            default: -1
        }
    },
    data () {
        return {
            // 是否展开
            current: -1,
            // 是否显示说明弹窗
            isExplain: false,
            // 说明类型
            explainType: 0,
            // 保证金水平等级文案
            riskLevelMap: {
                1: this.$t('riskLevel.safety'),
                2: this.$t('riskLevel.warn'),
                3: this.$t('riskLevel.danger')
            }
        }
    },
    computed: {
        // 产品数据
        product () {
            const data = this.data
            return store.state._quote.productMap[data.symbolId + '_' + data.tradeType] || {}
        },
        // 用户账户资产
        userAccount () {
            const data = this.data
            return store.state._user.accountAssets[data.tradeType] || {}
        }
    },
    mounted () {
        // 默认展开第一个
        if (this.index === 0) {
            this.current = this.data.positionId
        }
    },
    methods: {
        minus,
		
        // 展开或收起
        changeCurrent (e) {
            this.current = this.current !== e.index ? e.index : -1
        },
		
        // 跳转到图表页面
        goChartPage () {
            this.$method.goChartPage(this.product)
        },
		
        // 跳转到持仓详情页面
        goPositionDetail () {
            const data = this.data
            const param = `symbolId=${data.symbolId}&positionId=${data.positionId}&tradeType=${data.tradeType}`
            uni.navigateTo({
                url: '/pages/assets/positionDetail?' + param
            })
        },
		
        // 打开平仓弹窗
        openPosition () {
            this.$emit('openPosition', this.data, this.product)
        },
		
        // 打开止盈止损弹窗
        openStopProfit () {
            this.$emit('openStopProfit', this.data, this.product)
        },
		
        // 打开调整保证金弹窗
        openAdjustMargin () {
            this.$emit('openAdjustMargin', this.data, this.product)
        },
		
        // 打开杠杆设置弹窗
        openMultipleSet () {
            this.$emit('openMultipleSet', this.data, this.product)
        },
		
        // 显示说明弹窗
        showExplain (type) {
            this.explainType = type
            this.isExplain = true
        }
    }
}
</script>

<style lang="scss" scoped>
.position-item {
	padding: 0 30rpx;
	@include styles('background-color', 'contentColor');
	@include styles('border-bottom-color', 'lineColor');
	border-bottom-style: solid;
	border-bottom-width: 1px;
	border-radius: 6rpx;
	&:last-of-type {
		border: none;
	}
	&::v-deep .tui-icon-arrow {
		@include styles('color', 'normalColor');
		font-size: 26rpx;
		top: 40rpx;
		right: -10rpx;
	}
	.item-header {
		padding: 25rpx 0;
		.row-1 {
			@include flexAlign;
			.name {
				margin-right: 25rpx;
				font-size: 32rpx;
			}
			.icon_tubiao {
				@include styles('color', 'normalColor');
				margin-right: 25rpx;
				font-size: 26rpx;
			}
		}
		.row-2 {
			@include flexAlign;
			margin-top: 30rpx;
			.lot {
				@include styles('color', 'color');
				font-size: 24rpx;
				.direction {
					display: inline-flex;
					justify-content: center;
					align-items: center;
					height: 36rpx;
					padding: 0 8rpx;
					margin-right: 10rpx;
					color: #fff !important;
					border-radius: 6rpx;
					&.riseColor {
						@include styles('background', 'riseColor');
					}
					&.fallColor {
						@include styles('background', 'fallColor');
					}
				}
			}
			.amount {
				flex: 1;
				text-align: right;
				font-size: 32rpx;
				font-weight: bold;
			}
		}
	}
	.item-content {
		margin-top: 20rpx;
		.row {
			@include flexBetween;
			margin-top: 20rpx;
			.col {
				@include flexColumn;
				@include styles('color', 'color');
				&:last-of-type {
					text-align: right;
				}
				.title {
					display: inline-flex;
					align-items: center;
					.explain {
						margin-left: 4rpx !important;
						font-size: 36rpx !important;
					}
					span {
						@include styles('color', 'minorColor');
						font-size: 24rpx;
					}
				}
				span {
					@include styles('color', 'minorColor');
					font-size: 24rpx;
				}
				strong {
					margin-top: 5rpx;
					font-size: 28rpx;
				}
				.riskLevel {
					font-size: 25rpx;
					&.riskLevel1 {
						@include styles('color', 'success');
					}
					&.riskLevel2 {
						@include styles('color', 'focusColor');
					}
					&.riskLevel3 {
						@include styles('color', 'warn');
					}
				}
			}
		}
	}
	.handle {
		@include flex;
		margin: 40rpx 0 30rpx;
		.btn {
			@include flexAll;
			@include styles('color', 'primary');
			@include styles('background-color', 'primaryAssistColor');
			flex: 1;
			height: 52rpx;
			margin-left: 18rpx;
			font-size: 24rpx;
			border-radius: 6rpx;
			&:first-child {
				margin-left: 0;
			}
		}
	}
}
.multipleVal{
    vertical-align: middle;
    position: relative;
	display: inline-flex;
	align-items: center;
    height: 32rpx;
    padding-left: 8rpx;
    padding-right: 10rpx;
    font-size: 24rpx;
    border-radius: 6rpx;
    border: 1px solid #000;
    @include styles('border-color', 'color');
    @include styles('color', 'color');
    &.arrow{
        padding-right: rem(50px);
        color: var(--color);
    }
    i {
        font-style: normal;
    }
    .icon_arrow_down{
        position: absolute;
        right: 10rpx;
        top: 10rpx;
        border-radius: 5rpx;
        border: 10rpx solid #000;
        height: 0;
        line-height: 0;
        border-color: transparent;
        vertical-align: middle;
        @include styles('border-top-color', 'color');
    }
}

</style>
