<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar is-custom show-custom-title :title="$t('route.loan')">
                <view class='header-nav'>
                    <view class='link' @click='goRecord'>
                        {{ $t('assets.loanRecord') }}
                    </view>
                </view>
            </nav-bar>
            <!-- 内容区域 -->
            <view class='layout-content'>
                <view class='loan-module'>
                    <view class='box' @click='visible = true'>
                        <input disabled placeholderClass='placeholderClass' type='text' :value='currency' />
                        <tui-icon class='arrow' name='arrowdown' :size='40' unit='rpx' />
                    </view>
                    <view class='box'>
                        <input :model-value.sync='amount' :placeholder="$t('assets.loanAmount')" placeholderClass='placeholderClass' type='digit' />
                        <button class='all' @click='onAll'>
                            {{ $t('trade.allPosition') }}
                        </button>
                    </view>
                    <view class='loan-detail'>
                        <view class='row'>
                            <view class='name'>
                                {{ $t('assets.maxLoan') }}
                            </view>
                            <tui-icon class='explain' name='explain' :size='30' unit='rpx' @click='showInfo(1)' />
                            <view class='value'>
                                {{ account.availableLoan }}
                            </view>
                        </view>
                        <view class='row'>
                            <view class='name'>
                                {{ $t('assets.dailyRate') }}
                            </view>
                            <tui-icon class='explain' name='explain' :size='30' unit='rpx' @click='showInfo(2)' />
                            <view class='value'>
                                {{ account.interestProportion }}%
                            </view>
                        </view>
                        <view class='row'>
                            <view class='name'>
                                {{ $t('assets.alreadyLoan') }}
                            </view>
                            <view class='value'>
                                {{ account.liabilitiesPrincipal }}
                            </view>
                        </view>
                    </view>
                </view>
            </view>
            <!-- 底部按钮 -->
            <button class='footer-button' @click='handleLoan'>
                {{ $t('trade.get') }} {{ currency }}
            </button>
        </view>
		
        <!-- 货币弹窗 -->
        <picker-dialog :model-value.sync='visible' @change='selectCurrency'>
            <picker-view-column>
                <view v-for='(item, index) in currencyList' :key='index' class='item'>
                    {{ item.currency }}
                </view>
            </picker-view-column>
        </picker-dialog>
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>	
// vuex
import store from '@/store/index.js'
// api
import { manualLoan } from '@/api/user.js'
// utils
import { gt } from '@/utils/calculation.js'
import { isEmpty } from '@/utils/util.js'

export default {
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 是否显示弹窗
            visible: false,
            // 玩法类型
            tradeType: '',
            // 账户id
            accountId: '',
            // 货币
            currency: '',
            // 借款金额
            amount: ''
        }
    },
    computed: {
        // 账户列表
        accountList () {
            return this.customerInfo?.accountList || []
        },
        // 当前账户信息
        account () {
            return this.accountList.find(item => Number(item.tradeType) === Number(this.tradeType) && item.currency === this.currency) || {}
        },
        // 货币列表
        currencyList () {
            const arr = this.accountList.filter(item => Number(item.tradeType) === Number(this.tradeType)).map(el => {
                return {
                    currency: el.currency,
                    accountId: el.accountId
                }
            })
            return arr
        }
    },
    onLoad (options) {
        this.tradeType = options.tradeType
        this.accountId = options.accountId
        this.currency = options.currency
		
        // 初始化
        this.$init().then(() => {
            this.queryAccountAssetsInfo()
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('loan_view')
    },
    methods: {
        // 跳转到记录页面
        goRecord () {
            uni.navigateTo({
                url: '/pages/assets/record?type=1&tradeType=' + this.tradeType
            })
        },
		
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
		
        // 点击全部
        onAll () {
            this.amount = this.account.availableLoan
        },
		
        // 选择货币
        selectCurrency (value) {
            const item = this.currencyList[value]
            this.currency = item.currency
            this.accountId = item.accountId
            this.queryAccountAssetsInfo()
        },
		
        // 显示说明信息
        showInfo (type) {
            const params = type === 1 ? [this.account.availableLoan] : [this.currency, this.account?.interestProportion || '--']
            this.$refs['modalDialog'].show({
                content: this.$t(`assets.loanNotice[${type}]`, params)
            })
        },
		
        // 点击借款
        handleLoan () {
            if (parseFloat(this.amount) <= 0) {
                return uni.showToast({
                    title: this.$t('assets.loanAmountLess'),
                    icon: 'none'
                })
            }
            if (isEmpty(this.amount)) {
                return uni.showToast({
                    title: this.$t('assets.loanAmountNotice'),
                    icon: 'none'
                })
            }
            if (gt(this.amount, this.account.availableLoan)) {
                return uni.showToast({
                    title: this.$t('assets.loanAmountExcess'),
                    icon: 'none'
                })
            }
            this.manualLoan()
        },
		
        // 发起借款
        manualLoan () {
            uni.showLoading({
                title: this.$t('common.submiting'),
                mask: true
            })
            const params = {
                customerNo: this.customerInfo.customerNo,
                accountId: this.accountId,
                customerGroupId: this.customerGroupId,
                accountCurrency: this.currency,
                amount: this.amount,
                tradeType: this.tradeType
            }
            manualLoan(params).then(res => {
                uni.hideLoading()
                uni.showToast({
                    title: this.$t('assets.loanSuccess'),
                    icon: 'none'
                })
                this.amount = ''
                this.queryAccountAssetsInfo()
            }).catch(res => {
                uni.hideLoading()
                this.$refs['modelDialog'].show({
                    content: res.msg
                })
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.layout-content {
	@include styles('background-color', 'contentColor');
}
.header-nav {
	.link {
		@include flexAll;
		@include styles('color', 'primary');
		height: 100%;
		padding: 0 25rpx;
		font-size: 26rpx;
		position: absolute;
		top: 0;
		right: 0;
	}
}
.loan-module {
	padding: 40rpx 30rpx;
	.box {
		@include flexAll;
		@include styles('background-color', 'assistColor');
		height: 80rpx;
		padding: 0 30rpx;
		margin-bottom: 30rpx;
		font-size: 28rxp;
		input {
			flex: 1;
			height: 100%;
			margin-right: 20rpx;
		}
		.arrow {
			@include styles('color', 'normalColor');
			margin-right: -8rpx !important;
		}
		.all {
			@include styles('color', 'primary');
			font-size: 25rpx;
		}
	}
	.loan-detail {
		.row {
			@include flexAlign;
			@include styles('color', 'minorColor');
			padding: 0 20rpx;
			margin-bottom: 10rpx;
			.name {
				font-size: 26rpx;
			}
			.explain {
				margin: 0 5rpx !important;
			}
			.value {
				flex: 1;
				text-align: right;
				font-size: 28rpx;
			}
		}
	}
}
.footer-button {
	@include flexAll;
	@include styles('background-color', 'primary');
	height: 90rpx;
	margin: 20rpx;
	font-size: 30rpx;
	color: #fff;
	border-radius: 6rpx;
}
</style>
