<template>
    <view class='order-assets'>
        <view class='item'>
            <view class='amount'>
                <span>{{ $t('trade.free') }}</span>
                <b v-if='product.tradeType === 1'>
                    {{ accountTradeType1.availableMargin }}
                    <em>{{ account.currency }}</em>
                </b>
                <b v-else-if='product.tradeType === 2'>
                    {{ accountTradeType2.availableMargin }}
                    <em>{{ account.currency }}</em>
                </b>
                <b v-else>
                    {{ account.available }}
                    <em>{{ account.currency }}</em>
                </b>
            </view>
            <tui-icon 
                v-if='isReal' 
                class='add-fill' 
                :color='$style.primary' 
                name='add-fill' 
                :size='42' 
                unit='rpx' 
                @click='onAccountHandle'
            />
        </view>
        <view class='item'>
            <label>{{ $t('common.previewMargin') }}</label>
            <view>
                <b v-if='previewMargin'>
                    {{ previewMargin }}
                    <em>{{ account.currency }}</em>
                </b>
                <span v-else class='muted'>
                    --
                </span>
            </view>
        </view>
        <view class='item'>
            <label>{{ $t('common.previewFee') }}</label>
            <view>
                <b v-if='previewFee'>
                    {{ previewFee }}
                    <em>{{ account.currency }}</em>
                </b>
                <span v-else class='muted'>
                    --
                </span>
            </view>
        </view>
        <view v-if='product.tradeType === 3' class='item'>
            <label>
                <span>{{ $t('trade.availableLoanAmount') }}</span>
                <tui-icon 
                    class='explain' 
                    name='explain' 
                    :size='32'
                    unit='rpx' 
                    @click='showExplain3'
                />
            </label>
            <strong><span>{{ account.availableLoan || '--' }}</span>{{ account.currency }}</strong>
        </view>
        <view v-if='product.tradeType === 9' class='item'>
            <label>
                <span>{{ $t('trade.availableLoanAgent') }}</span>
                <tui-icon 
                    class='explain' 
                    name='explain' 
                    :size='32' 
                    unit='rpx' 
                    @click='showExplain9'
                />
            </label>
            <strong><span>{{ account.availableLoan || '--' }}</span>{{ account.currency }}</strong>
        </view>
		
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 账户操作 -->
        <account-handle 
            :account='account'
            :show.sync='isAccountHandle'
            :trade-type='Number(product.tradeType)'
        />
    </view>
</template>

<script>
import store from '@/store/index.js'
import { toFixed, mul } from '@/utils/calculation.js'
import accountHandle from './account-handle.vue'
	
export default {
    components: {
        accountHandle
    },
    props: {
        // 买卖方向
        direction: {
            type: String,
            default: ''
        },
        // 当前产品
        product: {
            type: Object,
            default: () => {}
        },
        // 手数
        volume: {
            type: [Number, String],
            default: ''
        },
        // 预估保证金
        previewMargin: {
            type: [Number, String],
            default: ''
        },
        // 预估手续费
        previewFee: {
            type: [Number, String],
            default: ''
        },
        // 账户
        account: {
            type: Object,
            default: () => {}
        }
    },
    data () {
        return {
            // 是否显示账户操作弹窗
            isAccountHandle: false
        }
    },
    computed: {
        // 合约全仓资产
        accountTradeType1 () {
            const accountAssets = store.state._user.accountAssets['1']
            const account = this.customerInfo?.accountList?.find(el => el.tradeType === parseInt(this.product?.tradeType))
            return Object.assign({}, account, accountAssets) || {}
        },
		
        // 合约逐仓资产
        accountTradeType2 () {
            return store.state._user.accountAssets['2'] || {}
        },
		
        // 最大可借
        maxBorrow () {
            const accountMap = store.state._user.customerInfo?.accountMap
            const assetsCurrency = store.state._user.assetsInfo?.currency
            const product = this.product
            const account = this.account
            if (product.tradeType === 9) return product.totalCredit + assetsCurrency // abcc玩法显示总授信
            const assetsId = accountMap[account.currency]?.assetsId
            if (product.borrowLimitList) {
                const borrowLimit = product?.borrowLimitList.find(item => Number(item.assetsId) === Number(assetsId))?.value
                return borrowLimit || '--'
            }
            return '--'
        },
		
        // 预计占用
        lockFunds () {
            let amount = ''
            if (this.direction === 'buy') {
                amount = mul(this.volume, this.product.buy_price)
            } else {
                amount = this.volume
            }
            if (amount === '') amount = 0
            return toFixed(amount, this.account.digits)
        },
        // 是否真实账户
        isReal () {
            return this.customerInfo?.companyType === 'real'
        }
    },
    methods: {
        // 是否包含玩法类型
        includePlay (arr) {
            return arr.includes(this.product.tradeType)
        },
		
        // 杠杆玩法可借弹窗
        showExplain3 () {
            this.$refs['modalDialog'].show({
                content: this.$t('trade.availableLoanContent7') + '\n' + this.$t('trade.availableLoanContent8')
            })
        },
		
        // 代理可借弹窗
        showExplain9 () {
            this.$refs['modalDialog'].show({
                content: this.$t('trade.availableLoanContent1', [this.maxBorrow]) + '\n' + this.$t('trade.availableLoanContent2')
            })
        },
		
        // 点击新增按钮
        onAccountHandle () {
            // 只有一个玩法跳转到充值页面
            if (this.plansLen === 1) {
                this.$method.goDeposit(this.account)
            } else {
                // 显示弹窗
                this.isAccountHandle = true
            } 
        }
    }
}
</script>

<style lang="scss" scoped>
.order-assets {
	margin-top: 25rpx;
	.item {
		@include flexBetweenAlign;
		@include styles('color', 'minorColor');
		margin-bottom: 16rpx;
		font-size: 24rpx;
		.amount {
			display: flex;
			justify-content: space-between;
			align-items: center;
			flex: 1;
			b {
				margin-right: 8rpx;
				font-weight: normal;
			}
		}
		b {
			@include styles('color', 'color');
		}
		em {
			@include styles('color', 'minorColor');
			margin-left: 8rpx;
		}
		label {
			@include flexAlign;
			.explain {
				@include styles('color', 'minorColor');
				margin-left: 10rpx !important; 
			}
		}
		&::v-deep .add-fill {
			margin-right: -2rpx !important;
		}
	}
}
</style>
