<template>
    <view class='account-currency'>
        <asset-filter
            :hide-asset='hideAsset'
            @changeState='changeState'
            @searchAsset='searchAsset'
        />
        <none-data v-if='accountList.length === 0' />
        <view v-else>
            <block v-for='(data, index) in accountList' :key='index'>
                <view class='chunk' @click='goAssetsInfo(data)'>
                    <view class='label'>
                        <span>
                            {{ data.currency }}
                        </span>
                        <strong>
                            {{ data.balance }}
                        </strong>
                    </view>
                    <view class='detail'>
                        <view class='row'>
                            <view class='col'>
                                <span>{{ $t('trade.free') }}</span>
                                <strong>{{ data.available }}</strong>
                            </view>
                            <view class='col'>
                                <span>{{ $t('assets.frozen') }}</span>
                                <strong>{{ data.frozen }}</strong>
                            </view>
                        </view>
                        <view v-if='Number(tradeType) !== 5' class='row'>
                            <view class='col'>
                                <span>{{ $t('trade.loan') }}</span>
                                <strong>{{ data.liabilitiesPrincipal }}</strong>
                            </view>
                            <view class='col'>
                                <span>{{ $t('trade.swap_2') }}</span>
                                <strong>{{ data.interest }}</strong>
                            </view>
                        </view>
                    </view>
                    <view v-if='isDepositWithdraw' class='handle'>
                        <button @click.stop='goDeposit(data)'>
                            {{ $t('trade.desposit') }}
                        </button>
                        <button @click.stop='goWithdraw(data)'>
                            {{ $t('trade.withdraw') }}
                        </button>
                    </view>
                </view>
            </block>
        </view>
    </view>
</template>

<script>
import assetFilter from '@/components/modules/assetFilter.vue'
import { localGet } from '@/utils/util.js'
export default {
    components: {
        assetFilter
    },
    props: {
        // 玩法类型
        tradeType: {
            type: [Number, String],
            default: ''
        },
        // 模块
        module: {
            type: String,
            default: 'assets'
        }
    },
    data () {
        return {
            hideAsset: localGet('hideAsset') ? JSON.parse(localGet('hideAsset')) : false,
            tradeSearchMap: {}
        }
    },
    computed: {
        // 账户列表
        accountList () {
            const list = this.customerInfo?.accountList?.filter(el => Number(el.tradeType) === Number(this.tradeType)) || []
            const searchText = this.tradeSearchMap[this.tradeType] || ''
            
            if (this.hideAsset) {
                if (Number(this.tradeType) === 3) {
                    return list.filter(item => (item.balance > 0 || item.liabilitiesPrincipal > 0) && item.currency.toUpperCase().includes(searchText.toUpperCase()))
                } else if (Number(this.tradeType) === 5) {
                    return list.filter(item => (item.balance > 0 || item.liabilitiesPrincipal > 0) && item.currency.toUpperCase().includes(searchText.toUpperCase()))
                }
            }
            return list.filter(item => item.currency.toUpperCase().includes(searchText.toUpperCase())) || []
        }
    },
    methods: {
        // 跳转到资产信息
        goAssetsInfo (data) {
            uni.navigateTo({
                url: `/pages/assets/info?currency=${data.currency}&accountId=${data.accountId}&tradeType=${this.tradeType}&module=${this.module}`
            })
        },
		
        // 点击充值
        goDeposit (data) {
            this.$method.goDeposit(data)
            // 添加应用内事件
            this.$addAppsEvent(this.module + '_desposit_click')
        },
		
        // 点击提现
        goWithdraw (data) {
            this.$method.goWithdraw(data)
            // 添加应用内事件
            this.$addAppsEvent(this.module + '_withdraw_click')
        },
        changeState (val) {
            this.hideAsset = val
        },
        // 搜索资产
        searchAsset (val) {
            this.$set(this.tradeSearchMap, this.tradeType, val)
        }
    }
}
</script>

<style lang="scss" scoped>
.account-currency {
	//padding: 0 20rpx;
	margin-bottom: 20rpx;
	.chunk {
		@include styles('background-color', 'contentColor');
		padding: 30rpx;
		margin-bottom: 20rpx;
		border-radius: 10rpx;
		.label {
			@include flexBetweenAlign;
			@include styles('color', 'color');
			font-size: 30rpx;
			span, strong {
				font-weight: bold;
			}
		}
		.detail {
			margin-top: 30rpx;
			.row {
				@include flexBetween;
				margin-bottom: 30rpx;
				&:last-of-type {
					margin-bottom: 0;
				}
				.col {
					@include flexColumn;
					&:last-of-type {
						text-align: right;
					}
					span {
						@include styles('color', 'minorColor');
						font-size: 24rpx;
					}
					strong {
						@include styles('color', 'color');
						font-size: 28rpx;
					}
				}
			}
		}
	}
	.handle {
		display: flex;
		margin-top: 40rpx;
		button {
			@include flexAll;
			@include styles('color', 'primary');
			@include styles('background', 'primaryAssistColor');
			flex: 1;
			height: 60rpx;
			margin-right: 20rpx;
			font-size: 28rpx;
			&:last-of-type {
				margin-right: 0;
			}
		}
	}
}
</style>
