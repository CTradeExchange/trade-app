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
                        {{ $t('forgot.forgot') }}
                    </view>
                    <tui-tabs
                        background-color='#fafafa'
                        bottom='50%'
                        color='#888'
                        :current-tab='currentTab > 1 ? 0 : currentTab'
                        :height='88'
                        item-width='50%'
                        :selected-color='$style.color'
                        :slider-bg-color='$style.lineColor'
                        :slider-height='60'
                        slider-radius='10rpx'
                        :slider-width='150'
                        :tabs='tabs'
                        unlined
                        :width='200'
                        @change='switchTab'
                    />
                    <view class='forget-form'>
                        <!-- 手机号 -->
                        <view v-show="currentValue === 'mobile'">
                            <view class='box'>
                                <view class='area' @click='handleCountrySelect(true)'>
                                    <image
                                        class='icon-country'
                                        :src="cdnUrl+'/images/countries_flags/' + stateAreaItem.countryCode +'.png'"
                                    />
                                    <span>
                                        {{ stateAreaItem.code }}
                                    </span>
                                    <tui-icon name='turningdown' :size='18' />
                                </view>
                                <input
                                    v-model='mobile'
                                    class='plr-20'
                                    :placeholder="$t('common.inputPhone')"
                                    placeholderClass='placeholderClass'
                                    type='number'
                                    @blur='checkUserMfa'
                                />
                                <tui-icon
                                    v-if='mobile'
                                    class='clear-close'
                                    name='close-fill'
                                    @click="mobile = ''"
                                />
                            </view>
                            <view class='box'>
                                <input v-model='codeMobile' :placeholder="$t('common.inputVerifyCode')" placeholderClass='placeholderClass' type='number' />
                                <tui-icon
                                    v-if='codeMobile'
                                    class='clear-close'
                                    name='close-fill'
                                    @click="codeMobile = ''"
                                />
                                <verify-code
                                    :area-code='stateAreaItem.code'
                                    :biz-type='3'
                                    :country='stateAreaItem.countryCode'
                                    :mode='currentValue'
                                    :value='mobile'
                                    @receive='receiveCodeMobile'
                                />
                            </view>
                            <view v-if='loginGoogleCodeVis' class='google-box'>
                                <google-code @getGooleVerifyCode='getGooleVerifyCode' />
                            </view>
                        </view>
                        <!-- 邮箱 -->
                        <view v-if="currentValue === 'mail'">
                            <view class='box'>
                                <input v-model='mail' :placeholder="$t('common.inputEmail')" placeholderClass='placeholderClass' @blur='checkUserMfa' />
                                <tui-icon
                                    v-if='mail'
                                    class='clear-close'
                                    name='close-fill'
                                    @click="mail = ''"
                                />
                            </view>
                            <view class='box'>
                                <input v-model='codeMail' :placeholder="$t('common.inputVerifyCode')" placeholderClass='placeholderClass' type='number' />
                                <tui-icon
                                    v-if='codeMail'
                                    class='clear-close'
                                    name='close-fill'
                                    @click="codeMail = ''"
                                />
                                <verify-code
                                    :biz-type='7'
                                    :mode='currentValue'
                                    :value='mail'
                                    @receive='receiveCodeMail'
                                />
                            </view>
                            <view v-if='loginGoogleCodeVis' class='google-box'>
                                <google-code @getGooleVerifyCode='getGooleVerifyCode' />
                            </view>
                        </view>
                    </view>
                </template>

                <!-- 设置登录密码 -->
                <template v-if='step === 2'>
                    <view class='header-title'>
                        {{ $t('forgot.resetPwd') }}
                    </view>
                    <view class='header-tip'>
                        {{ $t('forgot.pwdRule') }}
                    </view>
                    <view class='forget-form'>
                        <view class='box'>
                            <input v-model='newPassword' :password='newPwdVis' :placeholder="$t('forgot.inputNewPwd')" placeholderClass='placeholderClass' />
                            <tui-icon :name='!newPwdVis ? "seen" : "unseen"' :size='36' unit='rpx' @click='changeState("newPwdVis")' />
                        </view>
                        <view class='box'>
                            <input v-model='againPassword' :password='againPwdVis' :placeholder="$t('forgot.newPwdAgain')" placeholderClass='placeholderClass' />
                            <tui-icon :name='!againPwdVis ? "seen" : "unseen"' :size='36' unit='rpx' @click='changeState("againPwdVis")' />
                        </view>
                    </view>
                </template>

                <!-- 底部按钮 -->
                <view class='btn-wrap'>
                    <!-- 下一步 -->
                    <button v-if='step === 1' class='footer-btn' @click='onNext'>
                        {{ $t('common.nextStep') }}
                    </button>
                    <!-- 确定 -->
                    <button v-if='step === 2' class='footer-btn' @click='onConfirm'>
                        {{ $t('common.sure') }}
                    </button>
                </view>
                <view class='to-login'>
                    {{ $t('register.remebered') }}
                    <view
                        class='link'
                        @click='goLogin'
                    >
                        {{ $t('login.loginBtn') }}
                    </view>
                </view>
            </view>
        </view>

        <CountrySelect 
            ref='countrySelect'
            @change='changeStateArea' 
        />

        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>
import { verifyCodeCheck } from '@/api/base.js'
import { findPwd, checkGoogleMFAStatus } from '@/api/user.js'
import { localGetJSON, pwdReg } from '@/utils/util'
import md5 from 'js-md5'
import store from '@/store/index.js'
import CountrySelect from '@/components/modules/country-select'
const { cdnUrl } = require('@/apiConfig.js')

export default {
    components: {
        CountrySelect
    },
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: false,
            // 步骤 1:找回密码 2:设置登录密码
            step: 1,
            // tabs数据
            tabs: [
                { name: this.$t('forgot.retrievedByEmail'), value: 'mail' },
                { name: this.$t('forgot.retrievedByPhone'), value: 'mobile' }
            ],
            // 当前tab索引
            currentTab: 0,
            // 当前选择的国家地区
            stateAreaItem: {},
            // 当前tab value
            currentValue: 'mail',
            // 手机号
            mobile: '',
            // 邮箱
            mail: '',
            // 手机验证码
            codeMobile: '',
            // 手机验证码token
            codeTokenMobile: '',
            // 邮箱验证码
            codeMail: '',
            // 手机验证码token
            codeTokenMail: '',
            // 设置新密码token
            checkToken: '',
            // 新密码
            newPassword: '',
            // 再次确认密码
            againPassword: '',
            // 是否显示新密码
            newPwdVis: true,
            // 是否显示再次确认密码
            againPwdVis: true,
            loginGoogleCodeVis: false,
            googleCode: '',
            cdnUrl
        }
    },
    computed: {
        // 默认选择的国家地址
        defaultCountry () {
            return store.state.defaultCountry
        }
    },
    onLoad () {
        // 初始化
        this.$init().then(() => {
            // 设置默认数据
            this.setDefaultData()
        })
        // 添加应用内事件
        this.$addAppsEvent('forget_login_password_view')
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
		
        // 关闭当前页面跳转到登录页面
        goLogin () {
            uni.redirectTo({
                url: '/pages/mine/login'
            })
        },
		
        // 设置默认数据
        setDefaultData () {
            store.dispatch('getCountryListByParentCode').then(() => {
                const allCountryList = store.state.countryList
                const defaultCountry = store.state.defaultCountry
                let index = -1
                // 如果有缓存则显示缓存信息
                const loginInfo = localGetJSON('loginInfo')
                if (loginInfo?.country) {
                    index = allCountryList.findIndex(el => el.code === loginInfo.country)
                }
                // 设置默认登录信息
                if (loginInfo?.accountType) {
                    if (loginInfo.accountType === 1) {
                        // this.mail = loginInfo?.loginName || ''
                        this.currentTab = 0
                        this.currentValue = 'mail'
                    } else {
                        // this.mobile = loginInfo?.loginName || ''
                        this.currentTab = 1
                        this.currentValue = 'mobile'
                    }
                } 
                // 设置默认国家地址
                if (index === -1) {
                    this.stateAreaItem = defaultCountry
                } else {
                    this.stateAreaItem = {
                        code: allCountryList[index].countryCode,
                        countryCode: allCountryList[index].code,
                        countryName: allCountryList[index].displayName,
                        name: allCountryList[index].formatName
                    }
                }
            })
        },
		
        // 切换tab
        switchTab (e) {
            this.currentTab = e.index
            this.currentValue = this.tabs[e.index].value
        },

        // 设置是否显示密码
        changeState (type) {
            this[type] = !this[type]
        },

        // 手机接收验证码
        receiveCodeMobile (value, token) {
            this.codeTokenMobile = token
        },

        // 邮箱接收验证码
        receiveCodeMail (value, token, area) {
            this.codeTokenMail = token
        },

        // 点击下一步
        onNext () {
            // 手机验证
            if (this.currentValue === 'mobile') {
                if (!this.mobile) {
                    return uni.showToast({
                        title: this.$t('common.inputPhone'),
                        icon: 'none'
                    })
                }
                if (!this.codeTokenMobile) {
                    return uni.showToast({
                        title: this.$t('common.getVerifyCode'),
                        icon: 'none'
                    })
                }
                if (!this.codeMobile) {
                    return uni.showToast({
                        title: this.$t('common.inputVerifyCode'),
                        icon: 'none'
                    })
                }
            }
            // 邮箱验证
            if (this.currentValue === 'mail') {
                if (!this.mail) {
                    return uni.showToast({
                        title: this.$t('common.inputEmail'),
                        icon: 'none'
                    })
                }
                if (!this.codeTokenMail) {
                    return uni.showToast({
                        title: this.$t('common.getVerifyCode'),
                        icon: 'none'
                    })
                }
                if (!this.codeMail) {
                    return uni.showToast({
                        title: this.$t('common.inputVerifyCode'),
                        icon: 'none'
                    })
                }
            }

            if (this.loginGoogleCodeVis && !this.googleCode) {
                return uni.showToast({
                    title: this.$t('common.inputGoogleCode'),
                    icon: 'none' 
                }) 
            }

            // 忘记密码验证
            this.verifyCodeCheck()
        },

        // 忘记密码验证
        verifyCodeCheck () {
            verifyCodeCheck({
                bizType: this.currentValue === 'mobile' ? 'SMS_PASSWORD_VERIFICATION_CODE' : 'EMAIL_PASSWORD_VERIFICATION_CODE',
                toUser: this.currentValue === 'mobile' ? (this.stateAreaItem.code + ' ' + this.mobile) : this.mail,
                code: this.currentValue === 'mobile' ? this.codeMobile : this.codeMail,
                sendToken: this.currentValue === 'mobile' ? this.codeTokenMobile : this.codeTokenMail
            }).then(res => {
                const { data } = res
                // 进入下一步
                this.checkToken = data.token
                this.step = 2
            }).catch(res => {
                this.$refs['modalDialog'].show({
                    content: res.msg
                })
            })
        },

        // 点击确定
        onConfirm () {
            // 验证
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
            if (this.newPassword.length < 8 || this.newPassword.length > 18) {
                return uni.showToast({
                    title: this.$t('forgot.pwdRule'),
                    icon: 'none'
                })
            }
            if (!pwdReg.test(this.newPassword)) {
                return uni.showToast({
                    title: this.$t('forgot.pwdRule'),
                    icon: 'none'
                })
            }

            // 忘记密码修改
            this.findPwd()
        },

        // 忘记密码修改
        findPwd () {
            findPwd({
                type: this.currentValue === 'mail' ? 1 : 2,
                loginName: this.currentValue === 'mail' ? this.mail : this.mobile,
                phoneArea: this.stateAreaItem.code,
                verifyCode: this.currentValue === 'mobile' ? this.codeMobile : this.codeMail,
                newPwd: md5(this.newPassword),
                sendToken: this.currentValue === 'mobile' ? this.codeTokenMobile : this.codeTokenMail,
                verifyCodeToken: this.checkToken,
                googleCode: this.googleCode
            }).then(() => {
                // 跳转到设置成功页面
                uni.navigateTo({
                    url: '/pages/mine/resetSuccess'
                })
            }).catch(res => {
                this.$refs['modalDialog'].show({
                    content: res.msg
                })
            })
        },
		
        // 检测用户是否开启谷歌验证码
        checkUserMfa () {
            const account = this.currentValue === 'mobile' ? this.mobile : this.mail
            if (account) {
                checkGoogleMFAStatus({
                    loginName: account,
                    type: this.currentValue === 'mail' ? 1 : 2
                }).then(res => {
                    if (res.check()) {
                        this.loginGoogleCodeVis = res.data > 0
                    }
                }).catch(err => {
                    console.log('err', err)
                })
            }
        },
		
        // 设置谷歌验证码
        getGooleVerifyCode (val) {
            this.googleCode = val
        },

        // 改变国家地区
        changeStateArea (item) {
            this.stateAreaItem = item
        },
		
        // 打开选择国家
        handleCountrySelect () {
            this.$refs.countrySelect.handleVisible(true)
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
    margin-top: 16rpx;
    margin-bottom: 50rpx;
    font-size: 50rpx;
    text-indent: 35rpx;
    font-size: 40rpx;
    font-weight: bold;
}
.header-tip {
    @include styles('color', 'color');
    margin-bottom: 30rpx;
    font-size: 26rpx;
    padding:0 30rpx;
    line-height: 1.2;
}
.tabs {
    margin-top: 30rpx;
    margin-bottom: 20rpx;
}
.forget-form {
    padding: 20rpx 35rpx 0 35rpx;
    font-size: 26rpx;
    .box {
        @include flexAlign;
        @include styles('border-color', 'lineColor');
        height: 90rpx;
        margin-bottom: 20rpx;
        border-width: 1rpx;
        padding: 20rpx;
        border-style: solid;
        input {
            flex: 1;
            height: 100%;
            font-size: 28rpx;
        }
        .area {
			@include flexBetweenAlign;
			height: 90rpx;
			padding-right: 20rpx;
			position: relative;
            .icon-country{
                width: 50rpx;
                height: 37rpx;
                vertical-align:middle;
                margin-right: 10rpx;
                border: solid 1px #dcd8d8;
            }
			&::before {
				@include styles('background-color', 'lineColor');
				content: '';
				width: 1px;
				height: 60rpx;
				position: absolute;
				top: 50%;
				right: 0;
				transform: translateY(-50%);
			}
			span {
				margin-right: 5rpx;
                
			}
		}
    }
    .google-box{
        padding: 0 20rpx;
        border-width: 1rpx;
        border-style: solid;
        @include styles('border-color', 'lineColor');

    }
}
.btn-wrap{
    padding: 30rpx;
    .footer-btn {
        width: 100%;
        @include styles('background', 'primary');
        color: #fff!important;
    }
}
.to-login{
    margin-top: 20rpx;
    text-align: center;
    .link{
        display: inline-block;
        @include styles('color', 'primary');
    }
    
}

</style>
