<template>
    <view class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar :title="customerInfo.googleId>0 ? $t('cRoute.MFA_close'):$t('cRoute.MFA_bind')" />
            <!-- 内容区域 -->
            <view class='layout-content'>
                <view class='formBox'>
                    <view v-if='customerInfo.phone' class='cell'>
                        <view class='label'>
                            {{ $t('common.sendToYou') }}{{ customerInfo.phone }}
                        </view>
                        <view class='box'>
                            <input v-model='verifyCodeSMS' :placeholder="$t('walletAdd.codePlaceholder')" placeholderClass='placeholderClass' type='number' />
                            <verify-code
                                :biz-type='8'
                                mode='mobile'
                                :value='customerInfo.phone'
                                @receive='receiveCodeMobild'
                            />
                        </view>
                    </view>
                    <view v-if='customerInfo.email' class='cell'>
                        <view class='label'>
                            {{ $t('common.sendToYou') }}{{ customerInfo.email }}
                        </view>
                        <view class='box'>
                            <input v-model='verifyCodeEmail' :placeholder="$t('common.emailCodeInput')" placeholderClass='placeholderClass' type='number' />
                            <verify-code
                                :biz-type='9'
                                mode='email'
                                :value='customerInfo.email'
                                @receive='receiveCodeEmail'
                            />
                        </view>
                    </view>
                    <view class='cell'>
                        <view class='label'>
                            {{ $t('common.inputGoogleCode') }}
                        </view>
                        <view class='box-google'>
                            <google-code @getGooleVerifyCode='getGooleVerifyCode' />
                        </view>
                    </view>
                </view>

                <view class='footerBox'>
                    <button
                        :disabled='loading'
                        hover-class='button-hover'
                        :loading='loading'
                        open-type=''
                        type='primary'
                        @click='bindHanlder'
                    >
                        {{ customerInfo.googleId>0 ? $t('cRoute.MFA_close'):$t('cRoute.MFA_bind') }}
                    </button>
                </view>
            </view>
        </view>
		
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>
import store from '@/store/index.js'
import { enableOrForbidMFA } from '@/api/user'
export default {
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: false,
            loading: false,
            googleCode: '',
            sendTokenEmail: '',
            sendTokenSMS: '',
            verifyCodeSMS: '',
            verifyCodeEmail: '',
            id: ''
        }
    },
    onLoad (params) {
        this.id = params.id
    },
    onShow () {
        this.$init().then(() => {
        }).catch(() => {
            uni.getClipboardData({
                success: function (res) {
                    console.log(res.data)
                },
                fail: function (err) {
                }
            })
            this.skeletonShow = false
        })
    },
    computed: {
        customerInfo () {
            return store.state._user.customerInfo
        }
    },
    methods: {
        // 接收手机验证码
        receiveCodeMobild (value, token) {
            this.sendTokenSMS = token
        },
        // 接收邮箱验证码
        receiveCodeEmail (value, token) {
            this.sendTokenEmail = token
        },
        getGooleVerifyCode (val) {
            this.googleCode = val
        },

        // 绑定谷歌验证码
        bindHanlder  () {
            if (this.customerInfo.phone) {
                if (!this.verifyCodeSMS) {
                    return uni.showToast({
                        title: this.$t('common.smsCodeInput'),
                        icon: 'none'
                    })
                }
                if (!this.sendTokenSMS) {
                    return uni.showToast({
                        title: this.$t('common.getVerifyCode'),
                        icon: 'none'
                    })
                }
            }

            if (this.customerInfo.email) {
                if (!this.verifyCodeEmail) {
                    return uni.showToast({
                        title: this.$t('common.emailCodeInput'),
                        icon: 'none'
                    })
                }
                if (!this.sendTokenEmail) {
                    return uni.showToast({
                        title: this.$t('common.getVerifyCode'),
                        icon: 'none'
                    })
                }
            }
            if (!this.googleCode) {
                return uni.showToast({
                    title: this.$t('common.inputGoogleCode'),
                    icon: 'none'
                })
            }

            const that = this
            const googleId = this.customerInfo.googleId > 0 ? this.customerInfo.googleId : parseInt(this.id)
            const pramas = {
                type: this.customerInfo.googleId > 0 ? 2 : 1, // 1开启，2关闭
                googleCode: this.googleCode, // String 必填 谷歌验证码
                googleId: googleId, // Long 必填 谷歌Id
                verifyCodeSMS: this.verifyCodeSMS, // String 非必填 手机验证码
                sendTokenSMS: this.sendTokenSMS, // String 非必填 手机验证码发送票据
                verifyCodeEmail: this.verifyCodeEmail, // String 非必填 邮箱验证码
                sendTokenEmail: this.sendTokenEmail, // String 非必填 邮箱验证码发送票据
            }
           
            this.loading = true
            enableOrForbidMFA(pramas).then(res => {
                this.loading = false
                
                if (res.check()) {
                    this.$refs['modalDialog'].show({
                        title: that.$t('common.tip'),
                        showCancel: false,
                        confirmText: that.$t('common.sure'),
                        content: that.customerInfo.googleId > 0 ? that.$t('mfa.closeSuccess') : that.$t('mfa.bindSuccess')
                    }).then(() => {
                        uni.navigateBack({
                            delta: that.customerInfo.googleId > 0 ? 2 : 4
                        })
                        store.dispatch('_user/findCustomerInfo', false)
                    })
                    that.googleCode = ''
                    that.verifyCodeSMS = ''
                    that.sendTokenSMS = ''
                    that.verifyCodeEmail = ''
                    that.sendTokenEmail = ''
                } 
            }).catch(err => {
                this.loading = false
                uni.showToast({
                    title: err.msg,
                    icon: 'none'
                })
            })
        }
    }
}

</script>

<style lang="scss" scoped>
.formBox {
    margin: rem(30px);
    .cell {
        margin-bottom: rem(30px);
    }
    .van-cell {
        padding: 0 0 0 rem(20px);
    }
    .label {
        padding-bottom: rem(20px);
    }
    .box-google {
        .box-cell {
            padding: 0 30rpx;
        }
    }
    .box {
        @include flexAlign;
        @include styles('color', 'color');
        @include styles('background-color', 'contentColor');
        @include styles('border-bottom-color', 'lineColor');
        height: 90rpx;
        margin-bottom: 40rpx;
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
    .copyBtn {
        display: block;
        width: rem(150px);
        height: rem(66px);
        color: var(--primary);
        line-height: rem(66px);
        text-align: center;
    }
}
.footerBox {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    uni-button {
        @include styles('background-color','primary');
        height: 90rpx;
        line-height: 90rpx;
    }
}
</style>
