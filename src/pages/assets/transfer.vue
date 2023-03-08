<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view v-else class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar :right-text="$t('assets.transferRecord')" :title="$t('trade.asset')" @link='onLink' />
            <!-- <div class='currency-bg'>
                <image mode='widthFix' :src='getCurrencyIcon(curAccount.currency)' />
            </div> -->
            <!-- 内容区域 -->
            <view class='layout-content'>
                <view class='page-content'>
                    <view class='transfer-case'>
                        <view class='left'>
                            <span>{{ $t('common.from') }}</span>
                            <view class='dots'>
                                <em></em>
                                <em></em>
                            </view>
                            <span>{{ $t('common.to') }}</span>
                        </view>
                        <view class='center'>
                            <view v-if='fromPlan' class='select from' @click='openSelectPlan(fromPlan)'>
                                <input disabled type='text' :value="$t('tradeType' + '.' + fromPlan.tradeType)" />
                                <tui-icon v-if='Number(fromPlan.tradeType) !== 5' class='arrow' name='arrowright' :size='40' unit='rpx' />
                            </view>
                            <view v-if='toPlan' class='select to' @click='openSelectPlan(toPlan)'>
                                <input disabled type='text' :value="$t('tradeType' + '.' + toPlan.tradeType)" />
                                <tui-icon v-if='Number(toPlan.tradeType) !== 5' class='arrow' name='arrowright' :size='40' unit='rpx' />
                            </view>
                        </view>
                        <view class='right' @click='handleSwap'>
                            <i class='iconfont icon_zhuanhuan'></i>
                        </view>
                    </view>
                    <view class='action-block'>
                        <view class='action-title'>
                            {{ $t('assets.transferAsset') }}
                        </view>
                        <view class='action-bar' @click='openSelectCurrency'>
                            <image class='icon' :src='getCurrencyIcon(curAccount.currency)' />
                            <input disabled type='text' :value='curAccount.currency' />
                            <tui-icon v-if='accountList.length > 1' class='arrow' name='arrowright' :size='40' unit='rpx' />
                        </view>
                    </view>
                    <view class='action-block'>
                        <view class='action-title'>
                            {{ $t('trade.orderVolume') }}
                        </view>
                        <view class='action-bar'>
                            <input v-model='amount' :placeholder="$t('assets.minTransfer') + minTransfer" type='digit' />
                            <span class='currency'>
                                {{ curAccount.currency }}
                            </span>
                            <span class='line'></span>
                            <button class='all' @click='amount = maxTransfer'>
                                {{ $t('common.all') }}
                            </button>
                        </view>
                    </view>
                    <view class='tip'>
                        {{ $t('assets.maxTransfer') }} <span>{{ maxTransfer }}</span> {{ curAccount.currency }}
                    </view>
                </view>
            </view>
            <!-- 底部按钮 -->
            <button class='footer-button' @click='handleTransfer'>
                {{ $t('trade.transfer') }} {{ curAccount.currency }}
            </button>
        </view>
		
        <!-- 玩法选择弹窗 -->
        <picker-dialog :model-value.sync='planVisible' @change='changePlan'>
            <picker-view-column>
                <view v-for='(item, index) in selectPlans' :key='index' class='item'>
                    {{ $t('tradeType' + '.' + item.tradeType) }}
                </view>
            </picker-view-column>
        </picker-dialog>
        <!-- 币种弹窗 -->
        <!-- <picker-dialog :model-value.sync='currencyVisible' @change='changeCurrency'>
            <picker-view-column>
                <view v-for='(item, index) in accountList' :key='index' class='item'>
                    {{ item.currency }}
                </view>
            </picker-view-column>
        </picker-dialog> -->
        <!-- 资产弹窗 -->
        <assets-dialog 
            :account-id.sync='curAccountId' 
            :account-list='accountList'
            :currency.sync='curCurrency'
            :model-value.sync='currencyVisible' 
            :trade-type='fromPlan.tradeType' 
        />
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>
// components
import assetsDialog from '@/components/modules/assets-dialog'
// vuex
import store from '@/store/index.js'
// utils
import { isEmpty } from '@/utils/util.js'
import { pow, gt, lt } from '@/utils/calculation.js'
// api
import { capitalTransfer, queryAccountById } from '@/api/user.js'
	
export default {
    components: {
        assetsDialog
    },
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 是否显示玩法弹窗
            planVisible: false,
            // 是否显示币种弹窗
            currencyVisible: false,
            // 玩法类型
            tradeType: '',
            // 账户id
            accountId: '',
            // 从玩法
            fromPlan: '',
            // 到玩法
            toPlan: '',
            // 当前账户
            curAccount: '',
            // 当前账户id
            curAccountId: '',
            // 当前账户货币
            curCurrency: '',
            // 最大可划转
            maxTransfer: '',
            // 最少可划转
            minTransfer: '',
            // 划转金额
            amount: ''
        }
    },
    computed: {
        // 玩法列表
        plans () {
            return store.state._base.plans || []
        },
        // 可选择的玩法列表
        selectPlans() {
            const userProductCategory = store.getters.userProductCategory
            return this.plans.filter(el => Number(el.tradeType) !== 5 && userProductCategory[el.tradeType]?.find(o => o.listByUser?.length))
        },
        // 从玩法账户列表
        accountList () {
            return this.customerInfo.accountList?.filter(el => Number(el.tradeType) === Number(this.fromPlan.tradeType)) || []
        },
        // 到账户
        toAccount () {
            const list = this.customerInfo.accountList?.filter(el => Number(el.tradeType) === Number(this.toPlan.tradeType)) 
            return list.find(el => el.currency === this.curAccount.currency)
        }
    },
    watch: {
        // 监听从玩法账户列表
        accountList () {
            if (this.accountList.length > 0) {
                // 玩法类型为5第一次进入页面默认选择传入的accountId
                let account = {}
                if (this.tradeType === 5 && !this.curAccount) {
                    account = this.accountList.find(el => el.accountId === this.accountId)
                } else {
                    account = this.accountList[0]
                } 
                this.curAccountId = account.accountId
                this.curCurrency = account.currency
            }
        },
        // 监听当前账户id
        curAccountId () {
            this.curAccount = this.accountList.find(elem => elem.accountId === this.curAccountId)
            this.amount = ''
            this.minTransfer = pow(0.1, this.curAccount.digits)
            this.queryMaxTransfer()
        }
    },
    onLoad (options) {
        this.tradeType = Number(options.tradeType)
        this.accountId = Number(options.accountId)
		
        // 初始化
        this.$init().then(() => {
            this.skeletonShow = false
            // 设置默认从、到的玩法
            this.fromPlan = this.plans.find(el => Number(el.tradeType) === 5)
            if (this.tradeType === 5) {
                this.toPlan = this.selectPlans[0]
            } else {
                this.toPlan = this.selectPlans.find(el => Number(el.tradeType) === this.tradeType)
            }
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('transfer_view')
    },
    methods: {
        // 获取账户资产信息
        queryCustomerAssetsInfo () {
            if (this.$includePlay_2(this.fromPlan.tradeType)) {
                store.dispatch('_user/queryCustomerAssetsInfo', { tradeType: this.fromPlan.tradeType })
            }
        },
		
        // 获取最大可划转金额
        queryMaxTransfer () {
            queryAccountById({
                accountId: this.curAccount.accountId,
                tradeType: this.curAccount.tradeType
            }).then(res => {
                const { data } = res
                this.maxTransfer = data.available
            })
        },
		
        // 获取当前资产图标
        getCurrencyIcon (currency) {
            try {
                return require('@/static/image/currency_icon/' + currency + '.png')
            } catch (error) {
                return require('@/static/image/currency_icon/default.png')
            }
        },
		
        // 跳转到划转记录页面
        onLink () {
            uni.navigateTo({
                url: '/pages/assets/record?type=3&tradeType=' + this.tradeType
            })
        },
		
        // 切换划转方式
        handleSwap () {
            const fromPlan = this.fromPlan
            const toPlan = this.toPlan
            this.fromPlan = toPlan
            this.toPlan = fromPlan
        },
		
        // 打开选择玩法弹窗
        openSelectPlan (item) {
            if (Number(item.tradeType) !== 5) {
                this.planVisible = true
            }
        },
		
        // 改变玩法
        changePlan (value) {
            const item = this.selectPlans[value]
            if (Number(this.fromPlan.tradeType) !== 5) {
                this.fromPlan = item
            } else {
                this.toPlan = item
            }
        },
		
        // 打开选择货币弹窗
        openSelectCurrency () {
            if (this.accountList.length > 1) {
                this.currencyVisible = true
            }
        },
		
        // 点击划转
        handleTransfer () {
            if (isEmpty(this.amount)) {
                return uni.showToast({
                    title: this.$t('assets.transferTip1'),
                    icon: 'none'
                })
            }
            if (this.amount <= 0) {
                return uni.showToast({
                    title: this.$t('assets.transferTip6'),
                    icon: 'none'
                })
            }
            if (isEmpty(this.toAccount)) {
                return uni.showToast({
                    title: this.$t('tradeType' + '.' + this.toPlan.tradeType) + this.$t('common.notFound') + this.curAccount.currency + this.$t('common.account'),
                    icon: 'none'
                })
            }
            if (gt(this.amount, this.maxTransfer)) {
                return uni.showToast({
                    title: this.$t('assets.transferTip4'),
                    icon: 'none'
                })
            }
            if (lt(this.amount, this.minTransfer)) {
                return uni.showToast({
                    title: this.$t('assets.transferTip5'),
                    icon: 'none'
                })
            }
            this.capitalTransfer()
        },
		
        // 发起划转
        capitalTransfer () {
            const customerInfo = this.customerInfo
            const curAccount = this.curAccount
            const toAccount = this.toAccount
            const params = {
                customerNo: customerInfo.customerNo,
                customerId: customerInfo.id,
                toCustomerNo: customerInfo.customerNo,
                tradeType: this.fromPlan.tradeType,
                toTradeType: this.toPlan.tradeType,
                accountId: curAccount.accountId,
                accountDigit: curAccount.digits,
                toAccountDigit: curAccount.digits,
                toAccountId: toAccount.accountId,
                amount: parseFloat(this.amount)
            }
            uni.showLoading({
                title: this.$t('common.submiting'),
                mask: true
            })
            capitalTransfer(params).then(res => {
                uni.hideLoading()
                uni.showToast({
                    title: this.$t('assets.transferSuccess'),
                    icon: 'none'
                })
                this.amount = ''
                this.queryMaxTransfer()
                this.queryCustomerAssetsInfo()
				
                // 添加应用内事件
                this.$addAppsEvent('complete_transfer')
            }).catch(res => {
                uni.hideLoading()
                this.$refs['modalDialog'].show({
                    content: res.msg
                })
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.layout {
	::v-deep .nav-title-bar {
		background-color: transparent !important;
	}
}
.currency-bg{
    position: fixed;
    right: -60px;
    top: -55px;
    overflow: hidden;
    opacity: 0.05;
	z-index: 998;
    image {
        width: 320px;
    }
}
.layout-content {
	@include styles('background-color', 'bgColor');
}
.page-content {
	padding: 30rpx;
	.transfer-case {
		@include flex;
		@include styles('background-color', 'contentColor');
		position: relative;
		z-index: 1000;
		.left {
			@include flexColumnAll;
			width: 120rpx;
			padding-right: 20rpx;
			span {
				@include styles('color', 'color');
				font-size: 40rpx;
			}
			.dots {
				@include flexColumnAll;
				margin: 12rpx 0;
				em {
					@include styles('background-color', 'placeholdColor');
					width: 6rpx;
					height: 6rpx;
					margin-bottom: 10rpx;
					border-radius: 50%;
					&:last-of-type {
						margin-bottom: 0;
					}
				}
			}
		}
		.center {
			flex: 1;
			.select {
				@include flexAlign;
				height: 100rpx; 
				&.from {
					@include styles('border-bottom-color', 'lineColor');
					border-bottom-style: solid;
					border-bottom-width: 1rpx;
				}
				input {
					flex: 1;
					height: 100%;
					padding-left: 20rpx;
				}
				.arrow {
					@include styles('color', 'minorColor');
					margin-right: 20rpx !important;
				}
			}
		}
		.right {
			@include flexAll;
			width: 100rpx;
			i {
				@include styles('color', 'color');
				font-size: 44rpx;
			}
		}
	}
	.action-block {
		margin-top: 60rpx;
		.action-title {
			@include styles('color', 'color');
			margin-bottom: 20rpx;
			font-size: 48rpx;
		}
		.action-bar {
			@include flexAlign;
			@include styles('background-color', 'contentColor');
			height: 100rpx;
			border-radius: 6rpx;
			position: relative;
			z-index: 1000;
			.icon {
				width: 56rpx;
				height: 56rpx;
				margin-left: 30rpx;
			}
			input {
				flex: 1;
				height: 100%;
				padding: 0 30rpx;
			}
			.arrow {
				@include styles('color', 'minorColor');
				margin-right: 20rpx !important;
			}
			.currency {
				margin-right: 20rpx;
			}
			.line {
				@include styles('background-color', 'minorColor');
				width: 1px;
				height: 40rpx;
			}
			.all {
				@include flexAll;
				@include styles('color', 'primary');
				width: 100rpx;
				height: 100%;
				font-size: 26rpx;
				position: relative;
			}
		}
	}
	.tip {
		@include styles('color', 'minorColor');
		text-align: right;
		margin-top: 20rpx;
		font-size: 26rpx;
		span {
			@include styles('color', 'color');
			margin: 0 6rpx;
		}
	}
}
.footer-button {
	@include flexAll;
	@include styles('background-color', 'primary');
	height: 90rpx;
	margin: 20rpx;
	font-weight: bold;
	color: #fff;
	border-radius: 10rpx;
}
</style>
