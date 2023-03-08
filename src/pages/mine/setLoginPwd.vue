<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar :title="$t(isFirstSet ? 'common.settings' : 'common.modify') + $t('login.loginPwd')" />
            <!-- 内容区域 -->
            <view class='layout-content'>
                <!-- <view class='header-title'>
                    {{ $t(isFirstSet ? 'common.settings' : 'common.modify') + $t('login.loginPwd') }}
                </view> -->
                <view class='header-tip'>
                    {{ $t('forgot.pwdRule') }}
                </view>
                <view class='form-module'>
                    <view v-if='!isFirstSet' class='box'>
                        <input
                            v-if='oldPwdVis'
                            v-model='oldPassword'
                            :placeholder='$t("login.originPwd")'
                            placeholderClass='placeholderClass'
                            type='password'
                        />
                        <input
                            v-else
                            v-model='oldPassword'
                            :placeholder='$t("login.originPwd")'
                            placeholderClass='placeholderClass'
                            type='text'
                        />
                        <tui-icon :name='!oldPwdVis ? "seen" : "unseen"' :size='20' @click='changeState("oldPwdVis")' />
                    </view>
                    <view class='box'>
                        <input
                            v-if='newPwdVis'
                            v-model='newPassword'
                            :placeholder='$t("forgot.inputNewPwd")'
                            placeholderClass='placeholderClass'
                            type='password'
                        />
                        <input
                            v-else
                            v-model='newPassword'
                            :placeholder='$t("forgot.inputNewPwd")'
                            placeholderClass='placeholderClass'
                            type='text'
                        />
                        <tui-icon :name='!newPwdVis ? "seen" : "unseen"' :size='20' @click='changeState("newPwdVis")' />
                    </view>
                    <view class='box'>
                        <input
                            v-if='againPwdVis'
                            v-model='againPassword'
                            :placeholder='$t("forgot.newPwdAgain")'
                            placeholderClass='placeholderClass'
                            type='password'
                        />
                        <input
                            v-else
                            v-model='againPassword'
                            :placeholder='$t("forgot.newPwdAgain")'
                            placeholderClass='placeholderClass'
                            type='text'
                        />
                        <tui-icon :name='!againPwdVis ? "seen" : "unseen"' :size='20' @click='changeState("againPwdVis")' />
                    </view>
                    <view v-if='googleCodeVis'>
                        <google-code @getGooleVerifyCode='getGooleVerifyCode' />
                    </view>
                </view>
                <view v-if='false' class='forgot'>
                    <view class='href' @click="goPage('/pages/mine/forgetLoginPwd?isBack=true')">
                        {{ $t('login.forgot') }}
                    </view> 
                </view>
            </view>
            <!-- 底部按钮 -->
            <button class='footer-btn' @click='onConfirm'>
                {{ $t('common.sure') }}
            </button>
        </view>

        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>
import store from '@/store/index.js'
import { setLoginPwd, modifyLoginPwd } from '@/api/user.js'
import md5 from 'js-md5'
import { pwdReg } from '@/utils/util'

export default {
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: false,
            // 设置完密码是否返回上一页
            isBack: false,
            // 是否第1次设置
            isFirstSet: true,
            // 原密码
            oldPassword: '',
            // 新密码
            newPassword: '',
            // 确认新密码
            againPassword: '',
            oldPwdVis: true,
            newPwdVis: true,
            againPwdVis: true,
            googleCode: ''
        }
    },
    onLoad (options) {
        this.isBack = !!options.isBack
        // 初始化
        this.$init().then(() => {
            this.isFirstSet = Number(this.customerInfo.loginPassStatus) === 1
        })
        // 添加应用内事件
        this.$addAppsEvent('set_login_password_view')
    },
    methods: {
        // 跳转页面
        goPage (url) {
            uni.navigateTo({
                url
            })
        },
		
        changeState (type) {
            this[type] = !this[type]
        },
		
        // 点击确定
        onConfirm () {
            if (!this.oldPassword && !this.isFirstSet) {
                return uni.showToast({
                    title: this.$t('login.originPwd'),
                    icon: 'none'
                })
            }
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
            if (!pwdReg.test(this.newPassword)) {
                return uni.showToast({
                    title: this.$t('forgot.pwdRule'),
                    icon: 'none'
                })
            }
            if (this.googleCodeVis && !this.googleCode) {
                return uni.showToast({
                    title: this.$t('common.inputGoogleCode'),
                    icon: 'none' 
                }) 
            }

            uni.showLoading({
                title: this.$t('common.submiting'),
                mask: true
            })
            // 设置登录密码
            if (this.isFirstSet) {
                this.setLoginPwd()
            } else {
                // 修改登录密码
                this.modifyLoginPwd()
            }
        },

        // 设置登录密码
        setLoginPwd () {
            setLoginPwd({
                pwd: md5(this.newPassword),
                googleCode: this.googleCode
            }).then(() => {
                uni.hideLoading()
                this.setSuccess()
            }).catch(res => {
                uni.hideLoading()
                this.$refs['modalDialog'].show({
                    content: res.msg
                })
            })
        },

        // 修改登录密码
        modifyLoginPwd () {
            modifyLoginPwd({
                oldPwd: md5(this.oldPassword),
                newPwd: md5(this.newPassword),
                googleCode: this.googleCode
            }).then(() => {
                uni.hideLoading()
                this.setSuccess()
            }).catch(res => {
                uni.hideLoading()
                this.$refs['modalDialog'].show({
                    content: res.msg
                })
            })
        },

        // 设置成功
        setSuccess () {
            // 设置密码
            if (this.isFirstSet) {
                uni.showToast({
                    title: this.$t('common.setSuccess'),
                    icon: 'none'
                })
                // 获取用户信息
                store.dispatch('_user/findCustomerInfo')
                setTimeout(() => {
                    if (this.isBack) {
                        uni.navigateBack({
                            delta: 1
                        })
                    } else {
                        uni.switchTab({
                            url: '/pages/home/index'
                        })
                    }
                }, 1500)
            } else {
                // 修改密码
                this.$refs['modalDialog'].show({
                    content: this.$t('login.pwdSuccess'),
                    confirmText: this.$t('forgot.goLogin')
                }).then(() => {
                    // 注销登录
                    store.dispatch('_user/logout').then(() => {
                        uni.reLaunch({
                            url: '/pages/mine/login'
                        })
                    })
                })
            }
        },
        getGooleVerifyCode (val) {
            this.googleCode = val
        }
    }
   
}
</script>

<style lang="scss" scoped>
.header-title {
    @include styles('color', 'color');
    margin-top: 40rpx;
    font-size: 40rpx;
    text-indent: 35rpx;
}
.header-tip {
    @include styles('color', 'color');
    font-size: 28rpx;
    padding: 30rpx;
}
.form-module {
    @include styles('background', 'contentColor');
    padding: 0 35rpx;
    font-size: 26rpx;
    .box {
        @include flexAlign;
        @include styles('border-bottom-color', 'lineColor');
        height: 90rpx;
        border-bottom-width: 1rpx;
        border-bottom-style: solid;
        &:last-of-type {
            border-bottom: none;
        }
        input {
            flex: 1;
            height: 100%;
            font-size: 28rpx;
        }
        .close {
            @include styles('color', 'minorColor');
            margin: 0 15rpx;
        }
    }
	&::v-deep {
		.box-cell {
			border: none;
		}
	}
}
.forgot {
    display: flex;
    justify-content: flex-end;
    padding-top: rem(20px);
    padding-right: rem(30px);
    .href {
        @include styles('color', 'primary');
        font-size: 27rpx;
    }
}
</style>
