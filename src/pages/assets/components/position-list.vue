<template>
    <view>
        <view v-if='list.length > 0' class='position-list'>
            <view v-show='showHeader'>
                <view class='position-header'>
                    <span class='name'>
                        {{ $t('trade.position') }} ({{ list.length }})
                    </span>
                    <!-- userAccount会影响列表数据持仓盈亏的数据更新，目前不知所以然 -->
                    <strong :class="Number(userAccount.profitLoss) === 0 ? '' : (userAccount.profitLoss > 0 ? 'riseColor': 'fallColor')">
                        {{ userAccount.profitLoss || '--' }}
                    </strong>
                </view>
            </view>
            <view v-if='list.length > 0' class='position-content'> 
                <block v-for='(item, index) in list' :key='index'>
                    <position-item
                        :data='Object.assign({}, item)' 
                        :index='index'
                        @openAdjustMargin='openAdjustMargin'
                        @openMultipleSet='openMultipleSet' 
                        @openPosition='openPosition'
                        @openStopProfit='openStopProfit'
                    />
                </block>
            </view>
        </view>
        <view v-else-if='showTradeBtn' class='trade-handle'>
            <button @click='onTrade'>
                {{ $t('common.startTrade') }}
            </button>
            <view class='tip'>
                {{ $t('trade.positionEmpty') }}
            </view>
        </view>
        <none-data v-else :text="$t('trade.positionEmpty')" />
		
        <!-- 平仓 -->
        <close-position 
            ref='closePosition' 
            :data='data' 
            :product='product' 
        />
        <!-- 止盈止损 -->
        <stop-profit 
            ref='stopProfit' 
            :data='data' 
            :product='product' 
        />
        <!-- 调整保证金 -->
        <adjust-margin 
            ref='adjustMargin' 
            :data='data' 
            :product='product'
        />
        <!-- 全仓杠杆设置 -->
        <multiple-set-cross 
            v-if="product && product.tradeType === 1 && product.marginInfo && product.marginInfo.type !== '1'" 
            :multiple-val.sync='mVal'
            :position='data'
            :product='product'
            :show.sync='multipleVisible'
        />
        <!-- 逐仓杠杆设置 -->
        <multiple-set
            v-if="product && product.tradeType === 2 && product.marginInfo && product.marginInfo.type !== '1'"
            :multiple-val.sync='mVal'
            :position='data'
            :product='product'
            :show.sync='multipleVisible'
        />
    </view>
</template>

<script>
// vuex
import store from '@/store/index.js'
// components
import positionItem from './position-item.vue'
import closePosition from './close-position.vue'
import stopProfit from './stop-profit.vue'
import adjustMargin from './adjust-margin.vue'
import multipleSet from '@/components/modules/multiple-set.vue'
import multipleSetCross from '@/components/modules/multiple-set-cross.vue'
	
export default {
    components: {
        positionItem,
        closePosition,
        stopProfit,
        adjustMargin,
        multipleSet,
        multipleSetCross
    },
    props: {
        // 列表数据
        list: {
            type: Array,
            default: () => []
        },
        // 是否显示头部
        showHeader: {
            type: Boolean,
            default: true
        },
        // 玩法类型
        tradeType: {
            type: [Number, String],
            default: ''
        },
        // 是否显示交易按钮
        showTradeBtn: {
            type: Boolean,
            default: true
        }
    },
    data () {
        return {
            // data数据
            data: {},
            // 产品数据
            product: {},
            // 是否显示杠杆设置弹窗
            multipleVisible: false,
            // 杠杆倍数
            mVal: ''
        }
    },
    computed: {
        // 用户账户
        userAccount () {
            return store.state._user.accountAssets[this.tradeType] || {}
        }
    },
    methods: {
        // 打开平仓弹窗
        openPosition (data, product) {
            this.data = data
            this.product = product
            this.querySymbolInfo().then(() => {
                this.$refs['closePosition'].open()
            })
        },
		
        // 打开止盈止损弹窗
        openStopProfit (data, product) {
            this.data = data
            this.product = product  
            store.commit('_quote/Update_productActivedID', data.symbolId + '_' + data.tradeType)
            store.commit('_trade/Update_modifyPositionId', data.positionId + '_' + data.tradeType)
            this.querySymbolInfo().then(() => {
                setTimeout(() => {
                    this.$refs['stopProfit'].open()
                }, 10)
            })
        },
		
        // 打开调整保证金弹窗
        openAdjustMargin (data, product) {
            this.data = data
            this.product = product
            this.querySymbolInfo().then(() => {
                this.$refs['adjustMargin'].open()
            })
        },
		
        // 打开杠杆设置弹窗
        openMultipleSet (data, product) {
            this.data = data
            this.product = product
            this.mVal = data.crossLevelNum
            this.multipleVisible = true
            store.commit('_quote/Update_productActivedID', data.symbolId + '_' + data.tradeType)
            this.querySymbolInfo()
        },
		
        // 获取产品详情
        querySymbolInfo () {
            return new Promise(resolve => {
                if (!this.product.minVolume) {
                    store.dispatch('_quote/querySymbolInfo', {
                        symbolId: this.data.symbolId,
                        tradeType: this.data.tradeType
                    }).then(() => {
                        resolve()
                    })
                } else { 
                    resolve()
                }
            })
        },
		
        // 点击开始交易
        onTrade () {
            store.commit('_quote/setQuoteTradeType', this.tradeType)
            uni.switchTab({
                url: '/pages/quote/index'
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.position-list {
	margin: 20rpx 0;
	padding: 0 20rpx;
	.position-header {
		@include flexBetweenAlign;
		@include styles('background-color', 'contentColor');
		@include styles('border-bottom-color', 'lineColor');
		height: 90rpx;
		padding: 0 30rpx;
		border-bottom-width: 1px;
		border-bottom-style: solid;
		strong {
			font-size: 32rpx;
			font-weight: bold;
		}
	}
}
.trade-handle {
	@include styles('background', 'contentColor');
	display: flex;
	flex-direction: column;
	align-items: center;
	margin: 0 20rpx 20rpx;
	padding: 160rpx 0;
    border-radius: 8rpx;
	button {
		@include styles('background', 'primary');
		display: flex;
		justify-content: center;
		align-items: center;
		width: 200rpx;
		height: 72rpx;
		color: #fff;
		border-radius: 10rpx;
	}
	.tip {
		@include styles('color', 'minorColor');
		margin-top: 25rpx;
		font-size: 27rpx;
		letter-spacing: 1rpx;
	}
}
</style>
