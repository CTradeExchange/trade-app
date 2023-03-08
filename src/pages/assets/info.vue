<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar :fixed-title='currency' />
            <!-- 内容区域 -->
            <view class='layout-content'>
                <view class='assets-module'>
                    <view class='name'>
                        {{ $t('assets.totalAssets') }}
                    </view>
                    <view class='amount'>
                        {{ account.balance }}
                    </view>
                    <view v-if='isDepositWithdraw' class='handle'>
                        <button @click.stop='goDeposit(account)'>
                            {{ $t('trade.desposit') }}
                        </button>
                        <button @click.stop='goWithdraw(account)'>
                            {{ $t('trade.withdraw') }}
                        </button>
                    </view>
                </view>
                <view class='assets-detail'>
                    <view class='row'>
                        <view class='col'>
                            <span>{{ $t('trade.free') }}</span>
                            <strong>{{ account.available }}</strong>
                        </view>
                        <view class='col'>
                            <span>{{ $t('assets.frozen') }}</span>
                            <strong>{{ account.frozen }}</strong>
                        </view>
                    </view>
                    <view v-if='tradeType !== 5' class='row'>
                        <view class='col'>
                            <span>{{ $t('trade.borrowed') }}</span>
                            <strong>{{ account.liabilitiesPrincipal }}</strong>
                        </view>
                        <view class='col'>
                            <span>{{ $t('trade.swap_2') }}</span>
                            <strong>{{ account.interest }}</strong>
                        </view>
                    </view>
                    <view class='row'>
                        <view v-if='tradeType !== 5' class='col'>
                            <span>{{ $t('assets.maxLoan') }}</span>
                            <strong>{{ account.availableLoan }}</strong>
                        </view>
                        <view class='col'>
                            <span>{{ $t('withdrawCoin.can') }}</span>
                            <strong>{{ account.withdrawAmount }}</strong>
                        </view>
                    </view>
                </view>
            </view>
            <!-- 底部按钮 -->
            <!-- <view v-if='tradeType !== 5' class='footer-module'>
                <button v-if='tradeType === 3' class='btn' @click='goLoan'>
                    {{ $t('trade.loan') }}
                </button>
                <button class='btn' @click='goRepayment'>
                    {{ $t('trade.repayment') }}
                </button>
            </view> -->
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

export default {
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 玩法类型
            tradeType: '',
            // 账户id
            accountId: '',
            // 货币
            currency: '',
            // 模块
            module: ''
        }
    },
    computed: {
        // 当前账户信息
        account () {
            const accountList = this.customerInfo?.accountList || []
            return accountList.find(item => Number(item.tradeType) === Number(this.tradeType) && item.currency === this.currency) || {}
        }
    },
    onLoad (options) {
        this.tradeType = Number(options.tradeType)
        this.accountId = options.accountId
        this.currency = options.currency
        this.module = options.module || 'assets'
		
        // 初始化
        this.$init().then(() => {
            this.queryAccountAssetsInfo()
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('assets_info_view')
    },
    methods: {
        // 获取最新的资产数据
        queryAccountAssetsInfo () {
            store.dispatch('_user/queryAccountAssetsInfo', {
                tradeType: this.tradeType,
                accountId: this.accountId
            }).then(() => {
                this.skeletonShow = false
            }).catch(() => {
                this.skeletonShow = false
            })
        },
		
        // 跳转到借款页面
        goLoan () {
            uni.navigateTo({
                url: `/pages/assets/loan?currency=${this.currency}&accountId=${this.accountId}&tradeType=${this.tradeType}`
            })
        },
		
        // 跳转到还款页面
        goRepayment () {
            uni.navigateTo({
                url: `/pages/assets/repayment?currency=${this.currency}&accountId=${this.accountId}&tradeType=${this.tradeType}`
            })
        },
		
        // 点击充值
        goDeposit (account) {
            this.$method.goDeposit(account)
            // 添加应用内事件
            this.$addAppsEvent(this.module + '_desposit_click')
        },
		
        // 点击提现
        goWithdraw (account) {
            this.$method.goWithdraw(account)
            // 添加应用内事件
            this.$addAppsEvent(this.module + '_withdraw_click')
        }
    }
}
</script>

<style lang="scss" scoped>
.layout-content {
	padding: 0 20rpx;
}
.assets-module {
	@include styles('background-color', 'contentColor');
	padding: 30rpx;
	margin-top: 20rpx;
	border-radius: 10rpx;
	.name {
		@include styles('color', 'minorColor');
	}
	.amount {
		line-height: 1;
		margin-top: 15rpx;
		font-size: 50rpx;
		letter-spacing: -2rpx;
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
.assets-detail {
	@include styles('background-color', 'contentColor');
	margin-top: 20rpx;
	border-radius: 10rpx;
	.row {
		@include flexBetween;
		@include styles('border-bottom-color', 'lineColor');
		padding: 30rpx;
		border-bottom-style: solid;
		border-bottom-width: 1px;
		&:last-of-type {
			border: none;
		}
		.col {
			@include flexColumn;
			&:nth-of-type(1) {
				text-align: left;
			}
			&:nth-of-type(2) {
				text-align: right;
			}
			span {
				@include styles('color', 'minorColor');
				font-size: 24rpx;
			}
			strong {
				@include styles('color', 'color');
				margin-top: 4rpx;
				font-size: 28rpx;
			}
		}
	}
}
.footer-module {
	@include flexAlign;
	height: 120rpx;
	padding: 0 25rpx;
	.btn {
		@include flexAll;
		@include styles('background-color', 'primary');
		flex: 1;
		height: 80rpx;
		font-size: 30rpx;
		color: #fff;
		border-radius: 5rpx;
		&:nth-of-type(2) {
			margin-left: 25rpx;
		}
	}
}
</style>
