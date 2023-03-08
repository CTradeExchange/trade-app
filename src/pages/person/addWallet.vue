<template>
    <view class='layout' :change-color='changeColor' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar :title="$t('cRoute.walletAdd')" />
            <!-- 内容区域 -->
            <view class='layout-content'>
                <!-- 占位 -->
                <view class='empty' />
                <view class='module-1'>
                    <view class='box' @click='openCoin'>
                        <view class='name'>
                            {{ $t('walletAdd.coinName') }}
                        </view>
                        <input class='text-right' disabled :placeholder="$t('walletAdd.coinPlaceholder')" placeholderClass='placeholderClass' :value='coinKind' />
                        <tui-icon class='arrow' :color='$style.minorColor' name='arrowdown' :size='45' unit='rpx' />
                    </view>
                    <view class='box' @click='openChain'>
                        <view class='name'>
                            {{ $t('walletAdd.chainName') }}
                        </view>
                        <input class='text-right' disabled :placeholder="$t('walletAdd.chainPlaceholder')" placeholderClass='placeholderClass' :value='chainName' />
                        <tui-icon class='arrow' :color='$style.minorColor' name='arrowdown' :size='45' unit='rpx' />
                    </view>
                </view>
                <!-- 占位 -->
                <view class='empty' />
                <view class='module-2'>
                    <view class='box'>
                        <input v-model='address' :placeholder="$t('walletAdd.addressPlaceholder')" placeholderClass='placeholderClass' />
                    </view>
                    <view class='box'>
                        <input v-model='name' :placeholder="$t('walletAdd.namePlaceholder')" placeholderClass='placeholderClass' />
                    </view>
                    <view v-if='customerInfo.phone' class='box'>
                        <span class='send-info'>
                            {{ $t('common.sendToYou') }} {{ customerInfo.phone }}
                        </span>
                    </view>
                    <view v-else-if='customerInfo.email' class='box'>
                        <span class='send-info'>
                            {{ $t('common.sendToYou') }} {{ customerInfo.email }}
                        </span>
                    </view>

                    <view class='box'>
                        <input v-model='code' :placeholder="$t('walletAdd.codePlaceholder')" placeholderClass='placeholderClass' type='number' />
                        <verify-code
                            :biz-type='phone ? 8 : 9'
                            :mode='phone ? "mobile":"email"'
                            :value='phone ? phone : email'
                            @receive='receiveCode'
                        />
                    </view>
                    <view v-if='googleCodeVis' class='form-item'>
                        <google-code @getGooleVerifyCode='getGooleVerifyCode' />
                    </view>
                </view>
            </view>
            <!-- 底部按钮 -->
            <button class='footer-btn' @click='onConfirm'>
                {{ $t('common.sure') }}
            </button>
        </view>

        <!-- 币种弹窗 -->
        <picker-dialog :model-value.sync='coinVisible' @change='selectCoinKind'>
            <picker-view-column>
                <view v-for='(item, index) in coinKindList' :key='index' class='item'>
                    {{ item.name }}
                </view>
            </picker-view-column>
        </picker-dialog>
        <!-- 链名称弹窗 -->
        <picker-dialog :model-value.sync='chainVisible' @change='selectChainName'>
            <picker-view-column>
                <view v-for='(item, index) in chainNameList' :key='index' class='item'>
                    {{ item.name }}
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
import { getAllWithdrawCurrencyList, addWalletAddressV1v1v2 } from '@/api/user.js'
import store from '@/store/index.js'
export default {
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 是否显示链名称弹窗
            coinVisible: false,
            // 是否显示链名称弹窗
            chainVisible: false,
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
            // 钱包地址
            address: '',
            // 钱包名称
            name: '',
            // 验证码
            code: '',
            // 发送验证码返回的信息
            verifyInfo: {
                code: '',
                token: ''
            },
            // 手机号码
            phone: '',
            email: '',
            // 是否从提现页面进入
            isWithdraw: false,
            googleCode: ''
        }
    },
    onLoad (options) {
        this.isWithdraw = options.isWithdraw || false

        this.$init().then(() => {
            this.skeletonShow = false
            this.phone = this.customerInfo?.phone
            this.email = this.customerInfo?.email
            // 获取客户提币币种和链名称
            this.getWithdrawCurrencyList()
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('wallet_add_view')
    },
    methods: {
        // 获取客户提币币种和链名称
        getWithdrawCurrencyList () {
            const customerInfo = this.customerInfo
            getAllWithdrawCurrencyList({
                companyId: customerInfo.companyId,
                customerNo: customerInfo.customerNo,
                customerGroupId: customerInfo.customerGroupId,
                country: customerInfo.country,
                withdrawMethod: 'digit_wallet'
            }).then(res => {
                const { data } = res
                const coinKindList = []
                data.map(elem => {
                    if (!coinKindList.some(v => v.name === elem.withdrawCurrency)) {
                        coinKindList.push({ name: elem.withdrawCurrency })
                    }
                })
                this.allList = data
                this.coinKindList = coinKindList
            })
        },

        // 根据提币币种筛选链名称
        filterChainName () {
            const chainNameList = []
            const arr = this.allList.filter(v => v.withdrawCurrency === this.coinKind)
            arr.map(elem => {
                chainNameList.push({ name: elem.blockchainName })
            })
            this.chainNameList = chainNameList
        },

        // 打开提币币种弹窗
        openCoin () {
            this.coinVisible = true
        },

        // 选择提币币种
        selectCoinKind (value) {
            const item = this.coinKindList[value]
            this.coinKind = item.name
            this.chainName = ''
            // 根据提币币种筛选链名称
            this.filterChainName()
        },

        // 打开链名称弹窗
        openChain () {
            if (!this.coinKind) {
                return uni.showToast({
                    title: this.$t('walletAdd.coinPlaceholder'),
                    icon: 'none'
                })
            }
            this.chainVisible = true
        },

        // 选择链名称
        selectChainName (value) {
            const item = this.chainNameList[value]
            this.chainName = item.name
        },

        // 接收验证码
        receiveCode (value, token) {
            this.verifyInfo.code = value
            this.verifyInfo.token = token
        },

        // 点击确定
        onConfirm () {
            if (!this.coinKind) {
                return uni.showToast({
                    title: this.$t('walletAdd.coinPlaceholder'),
                    icon: 'none'
                })
            }
            if (!this.chainName) {
                return uni.showToast({
                    title: this.$t('walletAdd.chainPlaceholder'),
                    icon: 'none'
                })
            }
            if (!this.address) {
                return uni.showToast({
                    title: this.$t('walletAdd.addressPlaceholder'),
                    icon: 'none'
                })
            }
            if (!this.verifyInfo.token) {
                return uni.showToast({
                    title: this.$t('common.getVerifyCode'),
                    icon: 'none'
                })
            }
            if (!this.code) {
                return uni.showToast({
                    title: this.$t('walletAdd.codePlaceholder'),
                    icon: 'none'
                })
            }
            if (this.googleCodeVis && !this.googleCode) {
                return uni.showToast({
                    title: this.$t('common.inputGoogleCode'),
                    icon: 'none' 
                }) 
            }

            // 发起api请求
            uni.showLoading({
                title: this.$t('common.submiting')
            })
            addWalletAddressV1v1v2({
                currency: this.coinKind,
                chainName: this.chainName,
                address: this.address,
                remark: this.name,
                phone: this.phone,
                verifyCode: this.code,
                phoneArea: this.customerInfo.phoneArea,
                sendToken: this.verifyInfo.token,
                googleCode: this.googleCode
            }).then(res => {
                uni.hideLoading()
                uni.showToast({
                    title: this.$t('common.handleSuccess'),
                    icon: 'none'
                })
                // 更新提现页面钱包地址列表数据
                if (this.isWithdraw) {
                    const pages = getCurrentPages()
                    const vm = pages[pages.length - 2]['$vm']
                    vm.getWalletAddressList()
                }
                // 返回上一页
                setTimeout(() => {
                    uni.navigateBack({
                        delta: 1
                    })
                }, 1500)
            }).catch(res => {
                uni.hideLoading()
                this.$refs['modalDialog'].show({
                    content: res.msg
                })
            })
        },
        getGooleVerifyCode (val) {
            this.googleCode = val
        }
    }
}
</script>

<style lang="scss" scoped>
.layout-content {
    @include styles('background-color', 'contentColor');
}
.empty {
    @include styles('background-color', 'bgColor');
    height: 20rpx;
}
.module-1 {
    .box {
        @include flexAlign;
        @include styles('color', 'color');
        @include styles('border-bottom-color', 'lineColor');
        height: 100rpx;
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
}
.module-2 {
    padding: 0 30rpx;
    .box {
        @include flexAlign;
        @include styles('color', 'color');
        @include styles('border-bottom-color', 'lineColor');
        height: 100rpx;
        border-bottom-width: 1rpx;
        border-bottom-style: solid;
        input {
            flex: 1;
            height: 100%;
        }
        .send-info {
            @include styles('color', 'minorColor');
        }
    }
}
</style>
