<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar :title="$t(isFirstSet ? 'common.settings' : 'common.modify') + $t('common.fundPwd')" />  
            <!-- 内容区域 -->
            <view class='layout-content'>
                <!-- <view class='header-title'>
                    {{ $t(isFirstSet ? 'common.settings' : 'common.modify') + $t('common.fundPwd') }}
                </view> -->
                <view class='header-tip'>
                    {{ $t('common.fundPwdTip') }}
                </view>
                <view class='form-module'>
                    <view v-if='!isFirstSet' class='box'>
                        <input
                            v-model='oldPassword'
                            class='uni-input'
                            maxlength='6'
                            :password='oldPwdVis'
                            :placeholder='$t("login.originPwd")'
                            placeholderClass='placeholderClass'
                            @blur='((e,name)=>{handleInput(e,"oldPassword")})'
                        />
                        
                        <tui-icon :name='!oldPwdVis ? "seen" : "unseen"' :size='36' unit='rpx' @click='changeState("oldPwdVis")' />
                    </view>
                    <view class='box'>
                        <input
                            v-model='newPassword'
                            maxlength='6'
                            :password='newPwdVis'
                            :placeholder='$t("forgot.inputNewPwd")'
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
                            :placeholder='$t("forgot.newPwdAgain")'
                            placeholderClass='placeholderClass'
                            @blur='((e,name)=>{handleInput(e,"againPassword")})'
                        />
                        <tui-icon :name='!againPwdVis ? "seen" : "unseen"' :size='36' unit='rpx' @click='changeState("againPwdVis")' />
                    </view>
                    <view v-if='googleCodeVis'>
                        <google-code @getGooleVerifyCode='getGooleVerifyCode' />
                    </view>
                </view>
                <view v-if='!isFirstSet' class='forgot'>
                    <view class='href' @click="goPage('/pages/mine/forgetFundPwd?isBack=true')">
                        {{ $t('login.forgotFundPwd') }}
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
import { bindAssertsPwd, updateAssertsPwd } from '@/api/user.js'
import md5 from 'js-md5'
	
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
            // 是否显示原密码
            oldPwdVis: true,
            // 是否显示新密码
            newPwdVis: true,
            // 是否显示确认密码
            againPwdVis: true,
            googleCode: ''

        }
    },
    onLoad (options) {
        this.isBack = !!options.isBack
        // 初始化
        this.$init().then(() => {
            this.isFirstSet = Number(this.customerInfo.assertPassStatus) === 1
        })
		
        // 添加应用内事件
        this.$addAppsEvent('set_fund_password_view')
    },
    
    methods: {
        // 跳转页面
        goPage (url) {
            uni.navigateTo({
                url
            })
        },
		
        handleInput (e, type) {
            this[type] = e.target.value.replace(/[^\d]/g, '')
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
            if (this.oldPassword === this.newPassword) {
                return uni.showToast({
                    title: this.$t('forgot.pwdSame'),
                    icon: 'none'
                })
            }
            if (this.newPassword.length < 6) {
                return uni.showToast({
                    title: this.$t('common.fundPwdTip'),
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
                this.setFundPwd()
            } else {
                // 修改登录密码 
                this.modifyLoginPwd()
            }
        },
		
        // 设置登录密码
        setFundPwd () {
            bindAssertsPwd({
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
            updateAssertsPwd({
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
                    title: this.$t('forgot.fundPwdSetSuccess'),
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
                    content: this.$t('forgot.fundPwdModifySuccess'),
                }).then(() => {
                    uni.navigateBack({
                        delta: 1
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
