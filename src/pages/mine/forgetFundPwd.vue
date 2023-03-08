<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar custom-back @back='onBack' />
            <!-- 内容区域 -->
            <view class='layout-content'>
                <!-- 找回密码 -->
                <template v-if='step === 1'>
                    <view class='header-title'>
                        {{ $t('forgot.forgotFund') }}
                    </view>
                    <tui-tabs
                        class='tabs'
                        :color='$style.minorColor'
                        :current-tab='currentTab'
                        :item-width="(100 / tabs.length) + '%'"
                        :padding='185'
                        :selected-color='$style.color'
                        :slider-bg-color='$style.color'
                        :slider-height='4'
                        :tabs='tabs'
                        unlined
                        @change='switchTab'
                    />
                    <view class='forget-form'>
                        <!-- 手机号 -->
                        <view v-show='currentValue === "mobile"'>
                            <view class='info'> 
                                {{ $t('common.sendToYou') }} {{ customerInfo.phone }}
                            </view>
                            <view class='box'>
                                <input v-model='mobileCode' :placeholder="$t('common.inputVerifyCode')" placeholderClass='placeholderClass' type='number' />
                                <tui-icon
                                    v-if='mobileCode'
                                    class='clear-close'
                                    name='close-fill'
                                    @click="mobileCode = ''"
                                />
                                <verify-code
                                    :biz-type='8'
                                    :mode='currentValue'
                                    :value='customerInfo.phone'
                                    @receive='receiveMobileCode'
                                />
                            </view>
                        </view>
                        <!-- 邮箱 -->
                        <view v-show='currentValue === "mail"'>
                            <view class='info'>
                                {{ $t('common.sendToYou') }} {{ customerInfo.email }}
                            </view>
                            <view class='box'>
                                <input v-model='mailCode' :placeholder="$t('common.inputVerifyCode')" placeholderClass='placeholderClass' type='number' />
                                <tui-icon
                                    v-if='mailCode'
                                    class='clear-close'
                                    name='close-fill'
                                    @click="mailCode = ''"
                                />
                                <verify-code
                                    :biz-type='9'
                                    :mode='currentValue'
                                    :value='customerInfo.email'
                                    @receive='receiveMailCode'
                                />
                            </view>
                        </view>
                        <view v-if='googleCodeVis' class='google-box'>
                            <google-code @getGooleVerifyCode='getGooleVerifyCode' />
                        </view>
                    </view>
                </template>
				 
                <!-- 设置资金密码 -->
                <template v-if='step === 2'>
                    <view class='header-title'>
                        {{ $t('forgot.forgotFund') }}
                    </view>
                    <view class='header-tip'>
                        {{ $t('common.fundPwdTip') }}
                    </view>
                    <view class='forget-form'>
                        <view class='box'>
                            <input
                                v-model='newPassword' 
                                maxlength='6'
                                :password='newPwdVis'
                                :placeholder="$t('forgot.inputNewPwd')"
                                placeholderClass='placeholderClass'
                                @blur='((e,name)=>{handleInput(e,"newPassword")})'
                            />
                            <tui-icon :name='!newPwdVis ? "seen" : "unseen"' :size='36' unit='rpx' @click='changeState("newPwdVis")' />
                        </view>
                        <view class='box'>
                            <input
                                v-model='againPassword'
                                maxlength='6'
                                :password='againPwdVis'
                                :placeholder="$t('forgot.newPwdAgain')"
                                placeholderClass='placeholderClass'
                                @blur='((e,name)=>{handleInput(e,"againPassword")})'
                            />
                            <tui-icon :name='!againPwdVis ? "seen" : "unseen"' :size='36' unit='rpx' @click='changeState("againPwdVis")' />
                        </view>
                    </view>
                </template>
            </view>
			
            <!-- 底部按钮 -->
            <view>
                <!-- 下一步 -->
                <button v-if='step === 1' class='footer-btn' @click='onNext'>
                    {{ $t('common.nextStep') }}
                </button>
                <!-- 确定 -->
                <button v-if='step === 2' class='footer-btn' @click='onConfirmFund'>
                    {{ $t('common.sure') }}
                </button>
            </view>
        </view>
		
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>
import md5 from 'js-md5'
import { forgetAssertsPwdV1v1v2 } from '@/api/user.js'
	
export default {
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 步骤 1:找回密码 2:设置资金密码 
            step: 1,
            // tabs数据
            tabs: [
                { name: this.$t('forgot.retrievedByPhone'), value: 'mobile' },
                { name: this.$t('forgot.retrievedByEmail'), value: 'mail' }
            ],
            // 当前tab索引 
            currentTab: 0,
            // 当前tab value
            currentValue: 'mobile',
            // 手机验证码
            mobileCode: '',
            // 手机验证码token
            mobileCodeToken: '',
            // 邮箱验证码
            mailCode: '',
            // 邮箱验证码token
            mailCodeToken: '',
            // 新密码
            newPassword: '',
            // 再次确认密码
            againPassword: '',
            // 是否显示新密码
            newPwdVis: true,
            // 是否显示再次确认密码
            againPwdVis: true,
            googleCode: ''
        }
    },
    onLoad (options) {
        // 初始化
        this.$init().then(() => {
            this.skeletonShow = false
            // 设置默认数据
            this.setDefault()
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('forget_fund_password_view')
    },
    methods: {
        // 返回
        onBack () {
            if (this.step === 1) {
                uni.navigateBack({
                    delta: 1
                })
            } else {
                this.step = 1
            }
        },
		
        // 只能输入6位数字的资金密码
        handleInput (e, type) {
            this[type] = e.target.value.replace(/[^\d]/g, '')
        },
		
        // 设置默认数据
        setDefault () {
            const customerInfo = this.customerInfo
            if (customerInfo.phone) {
                this.currentTab = 0
                this.currentValue = 'mobile'
            } else {
                this.currentTab = 1
                this.currentValue = 'mail'
            }
        },
		
        // 切换tab
        switchTab (e) {
            this.currentTab = e.index
            this.currentValue = this.tabs[e.index].value
        },
		
        // 接收手机验证码
        receiveMobileCode (value, token) {
            this.mobileCodeToken = token
        },
		
        // 接收邮箱验证码
        receiveMailCode (value, token) {
            this.mailCodeToken = token
        },
		
        // 设置是否显示密码
        changeState (type) {
            this[type] = !this[type]
        },
		
        // 点击下一步 
        onNext () {
            // 验证手机
            if (this.currentValue === 'mobile') {
                if (!this.mobileCodeToken) {
                    return uni.showToast({
                        title: this.$t('common.getVerifyCode'),
                        icon: 'none'
                    })
                }
                if (!this.mobileCode) {
                    return uni.showToast({
                        title: this.$t('common.inputVerifyCode'),
                        icon: 'none'
                    })
                }
            }
            // 验证邮箱 
            if (this.currentValue === 'mail') {
                if (!this.mailCodeToken) {
                    return uni.showToast({
                        title: this.$t('common.getVerifyCode'),
                        icon: 'none'
                    })
                }
                if (!this.mailCode) {
                    return uni.showToast({
                        title: this.$t('common.inputVerifyCode'),
                        icon: 'none'
                    })
                }
            }

            if (this.googleCodeVis && !this.googleCode) {
                return uni.showToast({
                    title: this.$t('common.inputGoogleCode'),
                    icon: 'none' 
                }) 
            }
			
            this.step = 2
        },
		
        onConfirmFund () {
            if (!this.newPassword) {
                return uni.showToast({
                    title: this.$t('forgot.inputNewPwd'),
                    icon: 'none'
                })
            }
            if (!this.againPassword) {
                return uni.showToast({
                    title: this.$t('forgot.newPwdAgain'),
                    icon: 'none'
                })
            }
            if (this.newPassword !== this.againPassword) {
                return uni.showToast({
                    title: this.$t('forgot.pwdDiff'),
                    icon: 'none'
                })
            }
            if (this.newPassword.length < 6) {
                return uni.showToast({
                    title: this.$t('common.fundPwdTip'),
                    icon: 'none'
                })
            }
			
            // 修改资金密码
            this.findFundPwd()
        },
		
        // 修改资金密码
        findFundPwd () {
            forgetAssertsPwdV1v1v2({
                type: this.currentValue === 'mail' ? 1 : 2,
                loginName: this.currentValue === 'mail' ? this.mail : (this.customerInfo.phoneArea + ' ' + this.mobile),
                verifyCode: this.currentValue === 'mail' ? this.mailCode : this.mobileCode,
                sendToken: this.currentValue === 'mail' ? this.mailCodeToken : this.mobileCodeToken,
                verifyCodeToken: '',
                newPwd: md5(this.newPassword),
                googleCode: this.googleCode
            }).then(() => {
                uni.showToast({
                    title: this.$t('forgot.fundPwdSetSuccess'),
                    icon: 'none'
                })
                // 返回
                setTimeout(() => {
                    uni.navigateBack({
                        delta: 2
                    })
                }, 1500)
            }).catch(res => {
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
.layout-container-full {
    @include styles('background-color', 'contentColor');
}
.header-title {
    @include styles('color', 'color');
    margin-top: 40rpx;
    font-size: 50rpx;
    text-indent: 35rpx;
}
.header-tip {
    @include styles('color', 'color');
	margin-top: 10rpx;
    margin-bottom: 30rpx;
    font-size: 26rpx;
    text-indent: 35rpx;
}
.tabs {
    margin-top: 30rpx;
    margin-bottom: 20rpx;
}
.forget-form {
    padding: 0 35rpx;
    font-size: 26rpx;
    .box {
        @include flexAlign;
        @include styles('border-bottom-color', 'lineColor');
        height: 90rpx;
        border-bottom-width: 1rpx;
        border-bottom-style: solid;
        input {
            flex: 1;
            height: 100%;
            font-size: 28rpx;
        }
    }
    .info {
        @include styles('color', 'normalColor');
        padding: 20rpx 0  30rpx;
    }
}
.footer-btn {
    @include styles('background', 'bgColor');
}
</style>
