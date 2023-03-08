<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar is-custom show-custom-title :title="$t('cRoute.withdraw')">
                <view class='header-module'>
                    <!-- 提现记录 -->
                    <view class='link' @click="$method.goView('/pages/withdraw/withdrawRecord?withdrawType=' + withdrawType)">
                        <span>{{ $t('withdraw.moneyRecordText') }}</span>
                        <tui-icon class='arrow' name='arrowright' :size='34' unit='rpx' />
                    </view>
                </view>
            </nav-bar>
			
            <!-- 内容区域 -->
            <view class='layout-content'>
                <!-- 表单模块 -->
                <view class='withdraw-form'>
                    <view class='empty' />
                    <view class='block'>
                        <view class='title'>
                            <span>{{ $t('withdrawMoney.moneyName') }}</span>
                        </view>
                        <view class='handle'>
                            <input 
                                v-model='withdrawCount' 
                                :placeholder='amountPlaceholder' 
                                placeholderClass='placeholderClass' 
                                type='digit' 
                            />
                            <button @click='onAll'>
                                {{ $t('withdrawCoin.allBtn') }}
                            </button>
                        </view>
                        <view class='row'>
                            <view class='may'>
                                <span>{{ $t('withdrawCoin.can') }}</span>
                                <strong>{{ withdrawAmount }} {{ accountCurrency.currency }}</strong>
                            </view>
                            <view class='may'>
                                <span>{{ $t('withdrawCoin.service') }}</span>
                                <strong>{{ serviceCount }} {{ accountCurrency.currency }}</strong>
                            </view>
                            <view class='may'>
                                <span>{{ $t('withdrawMoney.predictName') }}</span>
                                <strong>{{ arriveCount }} {{ currency }}</strong>
                            </view>
                            <view class='may'>
                                <span>{{ $t('withdrawCoin.minus') }}</span>
                                <strong>{{ minusCount }} {{ accountCurrency.currency }}</strong>
                            </view>
                        </view>
                    </view>
                    <!-- 收款地址 -->
                    <view class='receipt-address'>
                        <view class='name'>
                            {{ $t('withdrawMoney.receiptAddress') }}
                        </view>
                        <view class='box'>
                            <input v-model='receiptAddress' :placeholder="$t('withdrawMoney.inputReceiptAddress')" />
                            <tui-icon
                                v-if='receiptAddress'
                                class='clear-close'
                                name='close-fill'
                                @click="receiptAddress = ''"
                            />
                        </view>
                    </view>
                </view>
            </view>
			
            <!-- 底部按钮 -->
            <button class='footer-btn' @click='onConfirm'>
                {{ $t('common.sure') }}
            </button>
        </view>
		
        <!-- 补充资料弹窗 -->
        <further-information :extend='extend' :visible.sync='appendVis' @complete='completeExtend' />
        <!-- 取款时间弹窗 -->
        <withdraw-time :list='timeList' :show='timeShow' @confirm='confirmWithdrawTime' />
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
        <!-- 资金密码 -->
        <dialogFundPwd :show='fundPwdVis' @close='fundPwdVis=false' @confirmWithdraw='confirmWithdraw' />
    </view>
</template>

<script>
import withdrawTime from './components/withdraw-time.vue'
import dialogFundPwd from './components/dialog-fund-pwd.vue'
import furtherInformation from '@/components/modules/further-information.vue'
import mixins from './mixins.js'
import { isEmpty } from '@/utils/util.js' 	
// api
import { handleWithdraw, getWithdrawMethodList, findCustomerExtend, saveCustomerExtend } from '@/api/user.js'
import md5 from 'js-md5'
export default {
    components: {
        withdrawTime,
        furtherInformation,
        dialogFundPwd
    },
    mixins: [mixins],
    data () {
        return {
            // 提现金额输入框提示
            amountPlaceholder: '', 
            // 是否显示补充资料弹窗
            appendVis: false, 
            // 需要补充资料的数据
            extend: {}, 
            // 补充完整的资料数据
            appendMap: '',
            // 资金密码
            fundPwdVis: false,
            fundPwd: '',
            // 谷歌验证码
            googleCode: '',
            // 收款地址
            defaultReceiptAddress: '',
            receiptAddress: ''
        }
    },
    onLoad (options) {
        const { currency, accountId, tradeType, withdrawMethod, withdrawType } = options
        this.currency = currency
        this.accountId = accountId
        this.tradeType = Number(tradeType)
        this.withdrawMethod = withdrawMethod
        this.withdrawType = Number(withdrawType)
        this.amountPlaceholder = this.$t('withdrawMoney.moneyPlaceholder')
		
        // 初始化
        this.$init().then(() => {
            this.skeletonShow = false
            this.pageInit()
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('withdraw_money_view')
    },
    methods: {
        // 页面初始化
        pageInit () {
            // 金额初始化
            this.amountInit()
            // 检测取款是否需要kyc
            this.checkKyc()
            // 获取提现方式
            this.getWithdrawMethods()
            // 获取取款汇率
            this.queryWithdrawRate()
            // 查询用户扩展信息
            this.getCustomerExtend()
        },
		
        // 获取提现方式
        getWithdrawMethods () {
            const customerInfo = this.customerInfo
            getWithdrawMethodList({
                companyId: customerInfo.companyId,
                customerNo: customerInfo.customerNo,
                customerGroupId: customerInfo.customerGroupId,
                customerId: customerInfo.id,
                country: customerInfo.country,
                tradeType: this.tradeType,
                accountId: this.accountId
            }).then(res => {
                res.data.map(elem => {
                    if (elem.withdrawMethod === this.withdrawMethod) {
                        this.extend = elem.extend
                    }
                })
            })
        },
		
        // 查询用户扩展信息
        getCustomerExtend () {
            findCustomerExtend({
                type: 1
            }).then(res => {
                this.defaultReceiptAddress = res.data
                this.receiptAddress = res.data
            })
        },
		
        // 保存用户扩展信息
        keepCustomerExtend () {
            if (this.defaultReceiptAddress === this.receiptAddress) return
            saveCustomerExtend({
                type: 1,
                value: this.receiptAddress
            })
        },
			
        // 点击全部按钮
        onAll () {
            this.withdrawCount = this.withdrawAmount
        },
		
        // 验证是否可发起取款
        checkWithdrawSubmit () {
            const withdrawAmount = parseFloat(this.withdrawAmount)
            const withdrawCount = parseFloat(this.withdrawCount)
            if (!withdrawCount) {
                this.amountInit()
                return
            }
            if (withdrawCount < this.singleLowAmount) {
                uni.showToast({
                    title: `${this.$t('withdrawMoney.hint_3')}${this.singleLowAmount}`,
                    icon: 'none'
                })
                return 
            }
            if (withdrawCount > this.singleHighAmount) {
                uni.showToast({
                    title: `${this.$t('withdrawMoney.hint_4')}${this.singleHighAmount}`,
                    icon: 'none'
                })
                return
            }
            if (withdrawCount > withdrawAmount) {
                uni.showToast({
                    title: this.$t('withdrawMoney.hint_5'),
                    icon: 'none'
                })
                return
            }
            if (this.amountDigitsLength > this.accountCurrency.digits) {
                uni.showToast({
                    title: this.$t('withdraw.withdrawDigitsTip'),
                    icon: 'none'
                })
                return
            }
            return true
        },
		
        // 补充资料是否全部填写完成
        checkAllComplete () {
            let flag = true
            const extend = this.extend
            for (const key in extend) {
                if (Object.hasOwnProperty.call(extend, key)) {
                    const element = extend[key]
                    if (isEmpty(element.value)) {
                        flag = false
                    }
                }
            }
            return flag
        },
		
        // 完成补充资料
        completeExtend (data) {
            this.appendMap = data
            this.appendVis = false
            this.fundPwdVis = true
        },
		
        // 点击确定
        onConfirm () {
            // 验证是否可发起取款
            if (isEmpty(this.withdrawCount)) {
                uni.showToast({
                    title: this.$t('withdrawMoney.moneyPlaceholder'),
                    icon: 'none'
                })
                return
            }
            if (!this.checkWithdrawSubmit()) return 
            // 判断收款地址
            if (isEmpty(this.receiptAddress)) {
                uni.showToast({
                    title: this.$t('withdrawMoney.inputReceiptAddress'),
                    icon: 'none'
                })
                return
            }
            // 判断是否需要填写补充资料
            if (!this.checkAllComplete()) {
                this.appendVis = true
                return
            }
			
            // 显示资金密码弹窗
            this.fundPwdVis = true
        },
		
        confirmWithdraw (val) {
            this.fundPwd = val.pwd
            this.googleCode = val.googleCode
            // 发起提现
            this.launchHandleWithdraw()
        },
		
        // 发起提现
        launchHandleWithdraw () {
            const params = {
                ...this.getParams(),
                amount: Number(this.withdrawCount),
                rate: this.withdrawRate.exchangeRate,
                withdrawRateSerialNo: this.withdrawRate.withdrawRateSerialNo,
                bankAccountName: (this.extend['last_name'][this.currentLang]) + (this.extend['first_name'][this.currentLang]),
                bankName: '法币钱包',
                bankCardNo: this.receiptAddress,
                fundPwd: md5(this.fundPwd),
                googleCode: this.googleCode
            }
            if (!isEmpty(this.appendMap)) {
                params.extend = JSON.stringify(this.appendMap)
            }
			
            uni.showLoading({
                title: this.$t('common.submiting'),
                mask: true
            })
            handleWithdraw(params).then(() => {
                uni.hideLoading()
                this.fundPwdVis = false
                this.$refs['modalDialog'].show({
                    content: this.$t('withdraw.moneySuccessMsg')
                }).then(() => {
                    this.reset()
                    // 保存用户扩展信息
                    this.keepCustomerExtend()
                    // 添加应用内事件
                    this.$addAppsEvent('complete_withdraw_money')
                })
            }).catch(res => {
                uni.hideLoading()
                // 保存用户扩展信息
                this.keepCustomerExtend()
                this.$refs['modalDialog'].show({
                    content: res.msg
                })
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.header-module {
    .link {
        @include flexAll;
        position: absolute;
        top: 0;
        right: 20rpx;
        height: 100%;
        span {
            font-size: 26rpx;
        }
        .arrow {
            @include styles('color', 'normalColor');
            margin-left: -4rpx !important;
        }
    }
}
// 表单模块
.withdraw-form {
    @include styles('background-color', 'contentColor');
    margin-top: 20rpx;
    .block {
        padding: 30rpx;
        .title {
            display: flex;
            align-items: center;
            margin-bottom: 35rpx;
            font-size: 28rpx;
        }
        .handle {
            @include styles('border-bottom-color', 'lineColor');
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 90rpx;
            border-bottom-width: 1px;
            border-bottom-style: solid;
            input {
                width: 500rpx;
                height: 100%;
                font-size: 48rpx;
            }
            button {
                @include styles('color', 'color');
                @include styles('border-color', 'lineColor');
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 168rpx;
                height: 60rpx;
                font-size: 24rpx;
                line-height: 60rpx;
                border-style: solid;
                border-width: 1px;
                border-radius: 30rpx;
            }
        }
        .row {
            margin-top: 30rpx;
        }
        .may {
			@include flexBetween;
            margin-top: 8rpx;
            font-size: 25rpx;
            span {
                @include styles('color', 'minorColor');
                display: inline-flex;
                align-items: center;
                margin-right: 10rpx;
            }
            strong {
                @include styles('color', 'minorColor');
                display: inline-flex;
                align-items: center;
            }
        }
    }
	.receipt-address {
		padding: 30rpx;
		margin-top: 20rpx;
		.name {
			@include styles('color', 'minorColor');
			font-size: 28rpx;
		}
		.box {
			@include styles('background-color', 'bgColor');
			@include styles('border-color', 'lineColor');
			display: flex;
			align-items: center;
			width: 100%;
			height: 90rpx;
			padding: 0 25rpx;
			margin-top: 15rpx;
			border-style: solid;
			border-width: 1px;
			border-radius: 5rpx;
			input {
				flex: 1;
				height: 100%;
			}
			.van-icon-clear {
				@include styles('color', 'minorColor');
				margin-left: 20rpx;
				font-size: 36rpx;
			}
		}
	}
}

// 底部按钮
.footer-btn {
    @include styles('background-color', 'contentColor');
}
</style>
