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
                    <view class='box'>
                        <view class='name'>
                            {{ $t('withdrawCoin.coinName') }}
                        </view>
                        <input class='text-right' disabled :placeholder="$t('withdrawCoin.coinPlaceholder')" placeholderClass='placeholderClass' :value='coinKind' />
                    </view>
                    <view class='box' @click='showChain = true'>
                        <view class='name'>
                            {{ $t('withdrawCoin.chainName') }}
                        </view>
                        <input class='text-right' disabled :placeholder="$t('withdrawCoin.chainPlaceholder')" placeholderClass='placeholderClass' :value='chainName' />
                        <tui-icon class='arrow' name='arrowdown' :size='44' unit='rpx' />
                    </view>
                    <view class='block'>
                        <view class='title'>
                            <span>{{ $t('withdrawCoin.coinCount') }}</span>
                        </view>
                        <view class='handle'>
                            <input v-model='withdrawCount' :placeholder="$t('withdrawCoin.coinCountPlaceholder')" placeholderClass='placeholderClass' type='digit' />
                            <button @click='withdrawCount = withdrawAmount'>
                                {{ $t('withdrawCoin.allBtn') }}
                            </button>
                        </view>
                        <view class='may'>
                            <span>{{ $t('withdrawCoin.can') }}</span>
                            <strong>
                                {{ withdrawAmount }} {{ coinKind }}
                            </strong>
                        </view>
                        <view class='chunk'>
                            <view class='row'>
                                <label class='name'>
                                    {{ $t('withdrawCoin.service') }}
                                </label>
                                <span class='value'>
                                    {{ serviceCount }} {{ coinKind }}
                                </span>
                            </view>
                            <view class='row'>
                                <label class='name'>
                                    {{ $t('withdrawCoin.predict') }}
                                </label>
                                <span class='value'>
                                    {{ arriveCount }} {{ coinKind }}
                                </span>
                            </view>
                            <view class='row'>
                                <label class='name'>
                                    {{ $t('withdrawCoin.minus') }}
                                </label>
                                <span class='value'>
                                    {{ minusCount }}
                                    <span class='unit'>
                                        {{ accountCurrency.currency }}
                                    </span>
                                </span>
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 钱包模块 -->
                <view class='wallet-module'>
                    <view class='title'>
                        {{ $t('withdrawCoin.walletSelect') }}
                    </view>
                    <view class='hint'>
                        {{ $t('withdrawCoin.walletHint') }}
                    </view>
                    <!-- 有钱包地址 -->
                    <view v-if='currentWallet' class='wallet-have' @click='toggleWalletSelect'>
                        <view class='info'>
                            <view class='row'>
                                <span class='name'>
                                    {{ currentWallet.currency }}-{{ currentWallet.chainName }}
                                </span>
                                <span v-if='currentWallet.remark' class='tag'>
                                    {{ currentWallet.remark }}
                                </span>
                            </view>
                            <view class='code'>
                                {{ currentWallet.address }}
                            </view>
                        </view>
                        <tui-icon class='arrow' name='arrowdown' :size='40' unit='rpx' />
                    </view>
                    <!-- 无钱包地址 -->
                    <view v-else class='wallet-not' @click="$method.goView('/pages/person/addWallet?isWithdraw=true')">
                        <tui-icon class='plus' name='plus' :size='40' unit='rpx' />
                        <span>{{ $t('withdrawCoin.walletAdd') }}</span>
                    </view>
                </view>
            </view>

            <!-- 底部按钮 -->
            <button class='footer-btn' @click='onConfirm'>
                {{ $t('common.sure') }}
            </button>

            <!-- 链名称弹窗 -->
            <picker-dialog :model-value.sync='showChain' @change='selectChainName'>
                <picker-view-column>
                    <view v-for='(item, index) in chainNameList' :key='index' class='item'>
                        {{ item.name }}
                    </view>
                </picker-view-column>
            </picker-dialog>
            <!-- 取款时间弹窗 -->
            <withdraw-time :list='timeList' :show='timeShow' @confirm='confirmWithdrawTime' />
            <!-- 钱包选择 -->
            <wallet-select :list='walletList' :show='showWalletSelect' :wallet-id='walletId' @close='toggleWalletSelect' @select='selectWallet' />
            <!-- 提示弹窗 -->
            <modal-dialog ref='modalDialog' />
            <!-- 通知弹窗 -->
            <notice-dialog ref='noticeDialog' />
            <!-- 资金密码 -->
            <dialogFundPwd :show='fundPwdVis' @close='fundPwdVis=false' @confirmWithdraw='confirmWithdraw' />
        </view>
    </view>
</template>

<script>
// mixins
import mixins from './mixins.js'
// components
import withdrawTime from './components/withdraw-time.vue'
import walletSelect from './components/wallet-select.vue'
// util
import { isEmpty } from '@/utils/util.js'
import md5 from 'js-md5'
// api
import { getAssetsList } from '@/api/base'
import { getWithdrawCurrencyList, getWalletAddressList, handleWithdraw } from '@/api/user.js'
import dialogFundPwd from './components/dialog-fund-pwd.vue'

export default {
    components: {
        withdrawTime,
        walletSelect,
        dialogFundPwd
    },
    mixins: [mixins],
    data () {
        return {
            // 提币币种小数位
            withdrawCurrencyDigits: 0,
            // 提币链名称数据列表
            allList: [],
            // 提币币种选项列表
            coinKindList: [],
            // 链名称列表
            chainNameList: [],
            // 提币币种
            coinKind: '',
            // 链名称
            chainName: '',
            // 是否显示链名称弹窗
            showChain: false,
            // 是否显示钱包选择
            showWalletSelect: false,
            // 钱包地址列表
            walletList: [],
            // 当前选择的钱包
            currentWallet: null,
            // 当前选择钱包地址id
            walletId: 0,
            fundPwdVis: false,
            fundPwd: '',
            googleCode: ''
        }
    },
    watch: {
        // 监听链名称
        chainName () {
            // 获取取款配置
            this.queryWithdrawConfig()
            // 获取取款汇率
            this.queryWithdrawRate().then(() => {
                // 获取取款相关费用
                this.getWithdrawFee()
            })
        }
    },
    onLoad (options) {
        const { currency, accountId, tradeType, withdrawMethod, withdrawType } = options
        this.currency = currency
        this.accountId = accountId
        this.tradeType = Number(tradeType)
        this.withdrawMethod = withdrawMethod
        this.withdrawType = Number(withdrawType)
        this.coinKind = currency

        // 初始化
        this.$init().then(() => {
            this.skeletonShow = false
            this.pageInit()
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('withdraw_coin_view')
    },
    methods: {
        // 页面初始化
        pageInit () {
            // 获取所有资产列表
            this.getAssetsList()
            // 金额初始化
            this.amountInit()
            // 检测取款是否需要kyc
            this.checkKyc()
            // 获取提币币种和链名称
            this.getWithdrawCurrencyList()
        },
		
        // 获取所有资产列表
        getAssetsList () {
            getAssetsList().then(res => {
                const account = res.data.find(el => el.code === this.coinKind)
                if (account) {
                    this.withdrawCurrencyDigits = account.digits
                }
            })
        },

        // 获取提币币种和链名称
        getWithdrawCurrencyList () {
            const customerInfo = this.customerInfo
            getWithdrawCurrencyList({
                companyId: customerInfo.companyId,
                customerNo: customerInfo.customerNo,
                customerGroupId: customerInfo.customerGroupId,
                country: customerInfo.country,
                withdrawMethod: this.withdrawMethod
            }).then(res => {
                const { data } = res
                const coinKindList = []
                if (data.length > 0) {
                    data.map(elem => {
                        if (!coinKindList.some(v => v.name === elem.withdrawCurrency && elem.withdrawCurrency === this.currency)) {
                            coinKindList.push({ name: elem.withdrawCurrency })
                        }
                    })
                    this.allList = data
                    this.coinKindList = coinKindList
                    // 根据提币币种获取筛选链名称
                    this.filterChainName()
                }
            })
        },

        // 根据提币币种获取筛选链名称
        filterChainName () {
            const chainNameList = []
            const arr = this.allList.filter(v => v.withdrawCurrency === this.coinKind)
            arr.map(elem => {
                chainNameList.push({ name: elem.blockchainName })
            })
            // 设置链名称
            this.chainName = chainNameList[0].name
            this.chainNameList = chainNameList

            // 获取钱包地址
            this.getWalletAddressList()
        },

        // 获取钱包地址
        getWalletAddressList () {
            if (!this.coinKind || !this.chainName) {
                this.walletList = []
                this.currentWallet = null
                this.walletId = 0
                return
            }
            getWalletAddressList({
                currency: this.coinKind,
                chainName: this.chainName
            }).then(res => {
                const { data } = res
                const item = data[0]
                // 设置默认钱包地址
                this.walletList = data
                this.currentWallet = item || null
                this.walletId = item ? item.id : 0
            })
        },

        // 控制钱包选择弹窗
        toggleWalletSelect () {
            this.showWalletSelect = !this.showWalletSelect
        },

        // 选择钱包
        selectWallet (item) {
            this.currentWallet = item
            this.walletId = item.id
            this.showWalletSelect = false
        },

        // 点击选择链名称
        selectChainName (value) {
            const item = this.chainNameList[value]
            this.chainName = item.name
            // 获取钱包地址列表
            this.getWalletAddressList()
        },

        // 验证是否可发起取款
        checkWithdrawSubmit () {
            const withdrawAmount = parseFloat(this.withdrawAmount)
            const withdrawCount = parseFloat(this.withdrawCount)
            if (!this.coinKind) {
                uni.showToast({
                    title: this.$t('withdrawCoin.coinPlaceholder'),
                    icon: 'none'
                })
                return
            }
            if (!this.chainName) {
                uni.showToast({
                    title: this.$t('withdrawCoin.chainPlaceholder'),
                    icon: 'none'
                })
                return
            }
            if (!withdrawCount) {
                this.amountInit()
                return
            }
            if (withdrawCount < this.singleLowAmount) {
                uni.showToast({
                    title: `${this.$t('withdrawCoin.hint_4')}${this.singleLowAmount}`,
                    icon: 'none'
                })
                return
            }
            if (withdrawCount > this.singleHighAmount) {
                uni.showToast({
                    title: `${this.$t('withdrawCoin.hint_5')}${this.singleHighAmount}`,
                    icon: 'none'
                })
                return
            }
            if (withdrawCount > withdrawAmount) {
                uni.showToast({
                    title: this.$t('withdrawCoin.hint_3'),
                    icon: 'none'
                })
                return
            }
            if (this.amountDigitsLength > this.withdrawCurrencyDigits) {
                uni.showToast({
                    title: this.$t('withdraw.withdrawDigitsTip', { digit: this.withdrawCurrencyDigits }),
                    icon: 'none'
                })
                return
            }
            return true
        },
        confirmWithdraw (val) {
            this.fundPwd = val
            this.fundPwd = val.pwd
            this.googleCode = val.googleCode
            // 发起提现
            this.launchHandleWithdraw()
        },

        // 点击确定
        onConfirm () {
            // 验证是否可发起取款
            if (isEmpty(this.withdrawCount)) {
                return uni.showToast({
                    title: this.$t('withdrawCoin.coinCountPlaceholder'),
                    icon: 'none'
                })
            }
            if (!this.currentWallet) {
                return uni.showToast({
                    title: this.$t('withdrawCoin.walletSelect'),
                    icon: 'none'
                })
            }
            if (!this.checkWithdrawSubmit()) return
			
            // 显示资金密码弹窗
            this.fundPwdVis = true
        },
		
        // 发起提现
        launchHandleWithdraw () {
            // 发起取款
            uni.showLoading({
                title: this.$t('common.submiting'),
                mask: true
            })

            handleWithdraw({
                ...this.getParams(),
                amount: this.withdrawCount,
                withdrawCoinAmount: this.withdrawCount,
                rate: this.withdrawRate.exchangeRate,
                withdrawRateSerialNo: this.withdrawRate.withdrawRateSerialNo,
                bankAccountName: this.customerInfo.customerNo,
                bankName: '数字钱包',
                bankCardNo: this.currentWallet.address,
                fundPwd: md5(this.fundPwd),
                googleCode: this.googleCode
            }).then(() => {
                uni.hideLoading()
                this.fundPwdVis = false
                this.$refs['modalDialog'].show({
                    content: this.$t('withdraw.coinSuccessMsg')
                }).then(() => {
                    this.reset()
                    // 添加应用内事件
                    this.$addAppsEvent('complete_withdraw_coin')
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
    .box {
        @include flexAlign;
        @include styles('color', 'color');
        @include styles('border-bottom-color', 'lineColor');
        height: 90rpx;
        padding: 0 30rpx;
        border-bottom-width: 1rpx;
        border-bottom-style: solid;
        input {
            flex: 1;
            height: 100%;
        }
        .arrow {
            @include styles('color','mutedColor');
            margin-right: -8rpx;
            margin-left: 10rpx;
        }
    }
    .block {
        padding: 25rpx 30rpx;
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
        .may {
            @include flexBetween;
            margin-top: 20rpx;
            font-size: 25rpx;
            span {
                display: inline-flex;
                align-items: center;
                margin-right: 10rpx;
            }
            strong {
                @include styles('color', 'focusColor');
                display: inline-flex;
                align-items: center;
                font-weight: bold;
                b {
                    margin-left: 10rpx;
                    font-weight: bold;
                }
            }
        }
        .chunk {
            @include styles('color', 'minorColor');
            margin-top: 20rpx;
            font-size: 24rpx;
            .row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 12rpx;
                &:last-of-type {
                    margin-bottom: 0;
                }
                .unit {
                    margin-left: 10rpx;
                }
            }
        }
    }
}

// 钱包模块
.wallet-module {
    @include styles('background-color', 'contentColor');
    margin-top: 20rpx;
    padding: 30rpx;
    .title {
        font-size: 28rpx;
    }
    .hint {
        @include styles('color', 'focusColor');
        margin-top: 15rpx;
        font-size: 22rpx;
    }
    .wallet-have {
        @include styles('border-color', 'lineColor');
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 28rpx;
        padding: 20rpx 30rpx;
        border-style: solid;
        border-width: 1px;
        border-radius: 4rpx;
        .info {
            flex: 1;
            .row {
                display: flex;
                align-items: center;
                .name {
                    margin-right: 20rpx;
                    font-size: 30rpx;
                }
                .tag {
                    @include styles('color', 'primary');
                    @include styles('background-color', 'primaryAssistColor');
                    max-width: 100rpx;
                    padding: 5rpx 8rpx;
                    padding: 5px 10px;
                    font-size: 22rpx;
                    word-break: break-word;
                    border-radius: 4rpx;
                }
            }
            .code {
                margin-top: 10rpx;
                font-size: 24rpx;
            }
        }
    }
    .wallet-not {
        @include styles('border-color', 'lineColor');
        display: flex;
        align-items: center;
        height: 120rpx;
        margin-top: 28rpx;
        padding: 0 30rpx;
        border-style: solid;
        border-width: 1px;
        border-radius: 4rpx;
        .plus {
            @include styles('color', 'minorColor');
            margin-right: 10rpx !important;
        }
    }
}

// 底部按钮
.footer-btn {
    @include styles('background-color', 'contentColor');
}
</style>
