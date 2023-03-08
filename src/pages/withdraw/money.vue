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
                                @input='inputWithdrawCount'
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
                                <strong>{{ serviceCount }}  {{ accountCurrency.currency }}</strong>
                            </view>
                        </view>
                    </view>
                </view>
                <!-- 银行卡 -->
                <view class='bank-module'>
                    <view class='title'>
                        {{ $t('withdrawMoney.bankName') }}
                    </view>
                    <view v-if='currentBank' class='bank-have' @click='toggleBankSelect'>
                        <tui-icon :color='$style.minorColor' name='bankcard-fill' :size='48' unit='rpx' />
                        <view class='row'>
                            <view class='name'>
                                {{ currentBank.bankName }}
                            </view>
                            <view class='no'>
                                {{ currentBank.bankAccount }}
                            </view>
                        </view>
                        <tui-icon class='arrow' name='arrowdown' :size='40' unit='rpx' />
                    </view>
                    <view v-else class='bank-none' @click="$method.goView('/pages/person/addBank?isWithdraw=true')">
                        <view class='tip'>
                            {{ $t('withdrawMoney.bankNone') }}
                        </view>
                        <button class='btn'>
                            {{ $t('withdrawMoney.addBtn') }}
                        </button>
                    </view>
                    <view class='predic'>
                        <span>{{ $t('withdrawMoney.predictName') }}</span>
                        <strong>
                            {{ arriveCount }} 
                            <b>
                                {{ currency }}
                            </b>
                        </strong>
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
        <!-- 银行卡选择弹窗 -->
        <bank-select
            :bank-id='bankId'
            :currency='currency'
            :list='bankList'
            :show='showBankSelect'
            @close='toggleBankSelect'
            @select='selectBank'
        />
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
import bankSelect from './components/bank-select.vue'
import dialogFundPwd from './components/dialog-fund-pwd.vue'
import furtherInformation from '@/components/modules/further-information.vue'
import mixins from './mixins.js'
import { isEmpty, computeBank } from '@/utils/util.js' 	
import { retainDecimal, getDecimalNum } from '@/utils/calculation'
// api
import { queryBankList, handleWithdraw, getWithdrawMethodList } from '@/api/user.js'
import md5 from 'js-md5'
export default {
    components: {
        withdrawTime,
        bankSelect,
        furtherInformation,
        dialogFundPwd
    },
    mixins: [mixins],
    data () {
        return {
            // 提现金额输入框提示
            amountPlaceholder: '', 
            // 银行卡号格式化方法
            computeBank,
            // 是否显示银行卡选择
            showBankSelect: false,
            // 银行卡列表
            bankList: [],
            // 当前银行卡
            currentBank: null,
            // 当前银行卡id
            bankId: 0,
            // 是否显示补充资料弹窗
            appendVis: false, 
            // 需要补充资料的数据
            extend: {}, 
            // 补充完整的资料数据
            appendMap: '',
            fundPwdVis: false,
            fundPwd: '',
            googleCode: ''
        }
    },
    onLoad (options) {
        const { currency, accountId, tradeType, withdrawMethod, withdrawType } = options
        this.currency = currency
        this.accountId = accountId
        this.tradeType = Number(tradeType)
        this.withdrawMethod = withdrawMethod
        this.withdrawType = Number(withdrawType)
        this.amountPlaceholder = this.withdrawMethod !== 'otc365_cny' ? this.$t('withdrawMoney.moneyPlaceholder') : this.$t('withdrawMoney.moneyPlaceholder') + `(${this.$t('withdrawMoney.digitsTip')})`
		
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
            // 获取银行卡列表
            this.queryBankList()
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
		
        // 获取银行卡列表
        queryBankList () {
            queryBankList().then(res => {
                const { data } = res
                if (data && data.length > 0) {
                    this.bankList = data
                    const arr = data.filter(el => el.bankCurrency === this.currency)
                    if (!this.currentBank && arr.length > 0) {
                        this.currentBank = arr[0]
                        this.bankId = arr[0].bankAccount
                    }
                }
            })
        },
		
        // 控制银行卡选择弹窗
        toggleBankSelect () {
            this.showBankSelect = !this.showBankSelect
        },
		
        // 选择银行卡
        selectBank (item) {
            this.currentBank = item
            this.bankId = item.bankAccount
            this.showBankSelect = false
        },
		
        // 输入提取数量
        inputWithdrawCount () {
            // otc365_cny限制最多输入4位小数位
            if (this.withdrawMethod === 'otc365_cny') {
                if (getDecimalNum(this.withdrawCount) > 4) {
                    setTimeout(() => {
                        this.withdrawCount = retainDecimal(this.withdrawCount, 4)
                    }, 10)
                }
            }
        },
		
        // 点击全部按钮
        onAll () {
            // otc365_cny限制最多输入4位小数位
            if (this.withdrawMethod === 'otc365_cny') {
                this.withdrawCount = retainDecimal(this.withdrawAmount, 4)
            } else {
                this.withdrawCount = this.withdrawAmount
            }
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
                    title: this.$t('withdraw.withdrawDigitsTip', { digit: this.accountCurrency.digits }),
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
            if (!this.currentBank) {
                return uni.showToast({
                    title: this.$t('withdrawMoney.bankPopupTitle'),
                    icon: 'none'
                })
            }
            if (!this.checkWithdrawSubmit()) return 
            // 取款方式为otc365_cny判断是否需要填写补充资料
            if (this.withdrawMethod === 'otc365_cny' && !this.checkAllComplete()) {
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
            const currentBank = this.currentBank
            const params = {
                ...this.getParams(),
                amount: Number(this.withdrawCount),
                rate: this.withdrawRate.exchangeRate,
                withdrawRateSerialNo: this.withdrawRate.withdrawRateSerialNo,
                bankAccountName: currentBank.lastName + currentBank.firstName,
                bankName: currentBank.bankName,
                bankCardNo: currentBank.bankAccount,
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
                    // 添加应用内事件
                    this.$addAppsEvent('complete_withdraw_money')
                })
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
}
// 银行卡
.bank-module {
    margin-top: 40rpx;
    padding: 0 30rpx;
    .title {
        margin-bottom: 16rpx;
    }
    .bank-have {
        @include flexAlign;
        @include styles('background-color', 'contentColor');
        @include styles('border-color', 'lineColor');
        height: 120rpx;
        padding-right: 20rpx;
        padding-left: 30rpx;
        border-style: solid;
        border-width: 1px;
        border-radius: 4rpx;
        .icon {
            width: 50rpx;
            height: 50rpx;
            margin-right: 15rpx;
        }
        .row {
            display: flex;
            flex: 1;
			flex-direction: column;
            font-size: 26rpx;
			margin: 0 24rpx;
			.name {
				margin-bottom: 8rpx;
			}
        }
        .arrow {
            @include styles('color', 'minorColor');
        }
    }
    .bank-none {
        @include flexBetweenAlign;
        @include styles('background-color', 'contentColor');
        @include styles('border-color', 'lineColor');
        height: 110rpx;
        padding: 0 40rpx;
        border-style: solid;
        border-width: 1px;
        border-radius: 4rpx;
        .tip {
            font-size: 26rpx;
        }
        .btn {
            @include flexAll;
            @include styles('color', 'primary');
            @include styles('border-color', 'primary');
            padding: 6rpx 18rpx;
            font-size: 26rpx;
            border-style: solid;
            border-width: 1px;
            border-radius: 40rpx;
        }
    }
    .predic {
        display: flex;
        flex: 1;
        margin-top: 16rpx;
        font-size: 25rpx;
        span {
            @include styles('color', 'minorColor');
            display: inline-flex;
            align-items: center;
            margin-right: 10rpx;
        }
        strong {
            @include styles('color', 'color');
            display: inline-flex;
            align-items: center;
            b {
                margin-left: 10rpx;
            }
        }
    }
}
// 底部按钮
.footer-btn {
    @include styles('background-color', 'contentColor');
}
</style>
