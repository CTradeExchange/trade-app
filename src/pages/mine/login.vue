<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container'> 
            <!-- 头部导航栏 -->
            <nav-bar :back-show='true' :custom-back='true' @back='back' />
            <!-- 内容区域 -->
            <view v-if='accessFlag' class='wrap'>
                <view class='layout-content'>
                    <view class='header-title'>
                        {{ $t('login.welcomeLogin') }}CATS
                    </view>
                    <tui-tabs
                        bottom='50%'
                        :color='$style.minorColor'
                        :current-tab='currentTab > 1 ? 0 : currentTab'
                        :height='88'
                        item-width='50%'
                        selected-color='#fff'
                        :slider-bg-color='$style.primary'
                        :slider-height='60'
                        slider-radius='10rpx'
                        :slider-width='150'
                        :tabs='tabs'
                        unlined
                        :width='200'
                        @change='switchTab'
                    />
                    <view class='login-form'>
                        <view class='box'>
                            <!-- 手机 -->
                            <view v-if='currentTab === 1' class='area' @click='handleCountrySelect(true)'>
                                <image
                                    class='icon-country'
                                    :src="cdnUrl +'/images/countries_flags/' + stateAreaItem.countryCode +'.png'"
                                />
                                <text>
                                    {{ stateAreaItem.code }}
                                </text>
                                <tui-icon name='turningdown' :size='18' />
                            </view>
                            <!-- 手机 -->
                            <template v-if='currentTab === 1'>
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
                            </template>
                            <template v-if='currentTab === 0'>
                                <input v-model='mail' :placeholder="$t('common.inputEmail')" placeholderClass='placeholderClass' @blur='checkUserMfa' />
                                <tui-icon
                                    v-if='mail'
                                    class='clear-close'
                                    name='close-fill'
                                    @click="mail = ''"
                                />
                            </template>
                        </view>
                        <!-- 账号密码登录 -->
                        <view v-show='loginType === 1'>
                            <view class='box'>
                                <input v-model='password' :password='showPwd' :placeholder="$t('common.inputPwd')" placeholderClass='placeholderClass' @focus='checkUserMfa' />
                                <tui-icon
                                    v-if='password'
                                    class='clear-close'
                                    name='close-fill'
                                    @click="password = ''"
                                />
                                <i :class="['iconfont control-pwd', showPwd ? 'icon_icon_default' : 'icon_icon_pressed']" @click='showPwd = !showPwd'></i>
                            </view>
                        </view>
                        <!-- 验证码登录  -->
                        <view v-show='loginType === 2'>
                            <view class='box'>
                                <input v-model='code' :placeholder="$t('common.inputVerifyCode')" placeholderClass='placeholderClass' type='number' @focus='checkUserMfa' />
                                <tui-icon
                                    v-if='code'
                                    class='clear-close'
                                    name='close-fill'
                                    @click="code = ''"
                                />
                                <verify-code
                                    ref='verifyCode'
                                    :biz-type='currentTab === 0 ? 5 : 1'
                                    :mode="currentTab === 0 ? 'mail' : 'mobile'"
                                    :value='currentTab === 0 ? mail : mobile'
                                    @receive='receiveCode'
                                />
                            </view>
                        </view>
                        <view v-if='loginGoogleCodeVis' class='google-box'>
                            <google-code @getGooleVerifyCode='getGooleVerifyCode' />
                        </view>
                        <view class='forgot-link' @click="goPage('/pages/mine/forgetLoginPwd')">
                            {{ $t('login.forgot') }}
                        </view>
                        <button class='btn' @click='onLogin'>
                            {{ $t('login.loginBtn') }}
                        </button>
                    </view>
                    <view class='login-nav'>
                        <view>
                            <span>{{ $t('register.goRegister') }}</span>
                            <view class='link' @click="goPage('/pages/mine/register?module=' + module)">
                                {{ $t('login.register') }}
                            </view>
                        </view>
                        <button class='login-type' @click='switchLoginType'>
                            <text>{{ loginType === 1 ? $t('login.loginByCode') : $t('login.loginByPwd') }}</text>
                        </button>
                    </view>
                
                    <!-- app授权组件 -->
                    <app-auth ref='appAuth' module='login' />
                </view>
			
                <powered-by />
            </view>
            <view v-else>
                <no-access />
            </view>
		
            <!-- 国家地区选择组件 -->
            <CountrySelect 
                ref='countrySelect'
                @change='changeStateArea' 
            />
            <!-- 设置登录密码 -->
            <login-pwd-dialog :show.sync='showPwdDialog' />
            <!-- 提示弹窗 -->
            <modal-dialog ref='modalDialog' />
            <!-- 通知弹窗 -->
            <notice-dialog ref='noticeDialog' />
        </view>
    </view>
</template>

<script>
import md5 from 'js-md5'	
import store from '@/store/index.js'
import loginPwdDialog from './components/login-pwd-dialog.vue'
import { localSet, localGet, localGetJSON, localRemove, localGetObj } from '@/utils/util.js'
import { checkGoogleMFAStatus } from '@/api/user'
import CountrySelect from '@/components/modules/country-select'
import appAuth from '@/components/modules/app-auth'
import { MsgWsInit } from '@/plugins/socket/socket.js'
import { uniPushInit } from '@/plugins/uniPush'
import { handleSwitchAccount } from '@/utils/method'
import noAccess from '@/components/modules/no-access'

const { cdnUrl } = require('@/apiConfig.js')

export default {
    components: {
        loginPwdDialog,
        CountrySelect,
        appAuth,
        noAccess
    },
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: false,
            // 当前登录类型 1:账户密码 2:验证码
            loginType: 1,
            // 输入的手机号
            mobile: '',
            // 输入的邮箱
            mail: '',
            // 登录密码
            password: '',
            // 验证码
            code: '',
            // 验证码token
            codeToken: '',
            // 登录信息
            loginInfo: null,
            // 是否隐藏登录密码
            showPwd: true,
            // 是否显示设置登录密码弹窗
            showPwdDialog: false,
            // 入口页面模块
            module: '',
            // 是否显示谷歌验证码
            loginGoogleCodeVis: false,
            // 谷歌验证码
            googleCode: '',
            // 当前tab 0:手机号 1:邮箱
            tabs: [
                { name: this.$t('register.email') },    
                { name: this.$t('register.phoneNo') }
                
            ],
            currentTab: 0,
            // 当前选择的国家地区
            stateAreaItem: {},
            // cats返回的第三方信息
            thirdInfo: localGetJSON('thirdInfo') || {},
            cdnUrl
        }
    },
    computed: {
        // 默认选择的国家地址
        defaultCountry () {
            return store.state.defaultCountry
        },
        // 当前国家手机号正则表达式
        mobileReg () {
            let result = ''
            if (this.stateAreaItem.code) {
                result = store.state.countryList.find(item => item.countryCode === this.stateAreaItem.code)?.extend
            }
            return result
        },
        tgLoginInfo () {
            return store.state._user.tgLoginInfo
        },
        backFlag () {
            return store.state._user.backFlag
        },
        // 当前IP访问权限
        accessFlag () {
            return store.state._global.accessFlag
        }
    },
    onLoad (options) {
        // #ifdef APP-PLUS
        plus.runtime.arguments = ''
        // #endif
		
        // 设置参数
        this.module = options.module || ''
        this.loginType = options.loginType === '2' ? 2 : 1
        // 初始化
        this.$init().then(() => {
            // 设置默认数据
            this.setDefaultData()
        })
        // 添加应用内事件
        this.$addAppsEvent('login_view')
        this.$addAppsEvent(this.module ? this.module + 'login_view' : 'login_view')
    },
    onShow () {
        // #ifdef APP-PLUS
        setTimeout(() => {
            if (!this.backFlag && plus.runtime.arguments) {
                const args = plus.runtime.arguments
                const params = decodeURIComponent(args.split('=')[1])
                store.commit('_user/Update_TgInfo', params)
                this.$refs['appAuth'].handleCBLogin('tg')
            }
        }, 0)
        // #endif
    },
    // 监听页面卸载
    onUnload () {
        // 删除缓存
        localRemove('thirdInfo')
    },
    methods: {
        goPage (url) {
            uni.navigateTo({
                url
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
                        this.mail = loginInfo?.loginName || ''
                        this.currentTab = 0
                    } else {
                        this.mobile = loginInfo?.loginName || ''
                        this.currentTab = 1
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
		
        // 回到首页
        goHome () {
            uni.switchTab({
                url: '/pages/home/index'
            })
        },

        // 切换选项卡
        switchTab (e) {
            this.password = ''
            this.code = ''
            this.codeToken = ''
            this.currentTab = e.index
            this.$refs.verifyCode.clear()
        },
		
        // 切换登录方式
        switchLoginType () {
            this.loginType = this.loginType === 1 ? 2 : 1
        },
		
        // 打开选择国家地区弹窗
        handleCountrySelect () {
            this.$refs.countrySelect.handleVisible(true)
        },
		
        // 改变国家地区
        changeStateArea (item) {
            this.stateAreaItem = item
        },
		
        // 接收验证码
        receiveCode (code, codeToken) {
            this.codeToken = codeToken
        },
		
        // 点击登录
        onLogin () {
            if (this.currentTab === 1) {
                // 验证手机号
                if (!this.mobile) {
                    return uni.showToast({
                        title: this.$t('common.inputPhone'),
                        icon: 'none'
                    })
                }
                // 验证手机号是否匹配
                const mobileReg = new RegExp(this.mobileReg)
                if (!mobileReg.test(this.mobile)) {
                    return uni.showToast({
                        title: this.$t('common.inputRealPhone'),
                        icon: 'none'
                    })
                }
            } else {
                // 验证邮箱
                if (!this.mail) {
                    return uni.showToast({
                        title: this.$t('common.inputEmail'),
                        icon: 'none'
                    })
                }
            }
            // 账号密码登录验证
            if (this.loginType === 1 && !this.password) {
                return uni.showToast({
                    title: this.$t('common.inputPwd'),
                    icon: 'none'
                })
            }
            // 验证码登录验证
            if (this.loginType === 2) {
                if (!this.codeToken) {
                    return uni.showToast({
                        title: this.$t('common.getVerifyCode'),
                        icon: 'none' 
                    })
                }
                if (!this.code) {
                    return uni.showToast({
                        title: this.$t('common.inputVerifyCode'),
                        icon: 'none' 
                    })
                }
            }
            // 发起登录请求
            this.launchLogin()
        },
		
        // 发起登录请求
        launchLogin () {
            uni.showLoading({
                title: this.$t('login.loginIng'),
                mask: true
            })
            if (this.loginGoogleCodeVis && !this.googleCode) {
                return uni.showToast({
                    title: this.$t('common.inputGoogleCode'),
                    icon: 'none' 
                }) 
            }
            let countryCode = ''
            const params = {
                type: this.currentTab === 0 ? 1 : 2,
                loginName: this.currentTab === 0 ? this.mail : this.mobile,
                loginPwd: md5(this.password),
                verifyCode: this.loginType === 2 ? this.code : '',
                sendToken: this.loginType === 2 ? this.codeToken : '',
                googleCode: this.googleCode,
                thirdSource: this.thirdInfo.thirdSource || '',
                bindThirdUserId: this.thirdInfo.bindThirdUserId || '',
                isThird: false // true为三方登录 false 系统登录
            }
            if (params.type === 2) {
                params.phoneArea = this.stateAreaItem.code
                countryCode = this.stateAreaItem.countryCode
            } else {
                countryCode = this.defaultCountry.countryCode
            }
            this.$store.dispatch('_user/login', params).then(async (res) => {
                const { data } = res
                this.loginInfo = data
				
                // 缓存登录账号
                localSet('loginInfo', JSON.stringify({ 
                    accountType: params.type,
                    loginName: params.loginName,
                    country: countryCode 
                }))

                const lastAccountType = localGetObj('mockAccount', 'lastAccountType')
                const isReal = !lastAccountType || lastAccountType === 'real'
                
                if (isReal) {
                    // 消息websocket初始化
                    MsgWsInit({ $store: store })
                    // uniPush初始化
                    uniPushInit()
                } else {
                    await handleSwitchAccount('demo')
                }
			    
                // kyc认证 companyKycStatus 公司KYC开户状态，1:开启 2:未开启
                if (isReal && data.companyKycStatus === 1 && data.kycAuditStatus !== 2) {
                    // kyc认证
                    this.kycAuth()
                } else {
                    // 设置登录密码
                    this.setLoginPwd()
                }
                // 登录成功提示
                uni.hideLoading()
                // 添加应用内事件
                this.$addAppsEvent(this.module ? (this.module + '_complete_login') : 'complete_login')
            }).catch(res => {
                uni.hideLoading()
                if (res.msg) {
                    this.$refs['modalDialog'].show({
                        content: res.msg
                    })
                }
            })
        },
		
        // kyc认证
        kycAuth () {
            // kycAuditStatus 0:未认证 1:待审核 2:审核通过 3:审核不通过
            const kycAuditStatus = this.loginInfo.kycAuditStatus
            const kycAuditRemark = this.loginInfo.kycAuditRemark
            let content = ''
            let confirmText = ''
            switch (kycAuditStatus) {
                case 0:
                    content = this.$t('login.goAuthenticateMsg')
                    confirmText = this.$t('login.goAuthenticate')
                    break
                case 1:
                    content = this.$t('common.inReview')
                    confirmText = this.$t('common.close')
                    break
                case 2:
                    content = this.$t('common.reviewSuccess')
                    confirmText = this.$t('common.ok')
                    break
                case 3:
                    content = this.$t('common.reviewFailed') + '\n' + this.$t('common.reviewReson') + kycAuditRemark
                    confirmText = this.$t('common.reSubmit')
                    break
            }
            this.$refs['modalDialog'].show({
                content,
                confirmText
            }).then(() => {
                // 未认证、审核不通过
                if (kycAuditStatus === 0 || kycAuditStatus === 3) {
                    // 跳转到kyc页面
                    uni.reLaunch({
                        url: '/pages/person/authentication'
                    })
                }
                // 待审核
                if (kycAuditStatus === 1) {
                    // 退出登录
                    store.dispatch('_user/logout').then(() => {
                        this.mobile = ''
                        this.mail = ''
                        this.code = ''
                        this.password = ''
                        this.$refs['verifyCode'].clear()
                    })
                }
            })
        },
			
        // 设置登录密码
        setLoginPwd () {
            const lastAccountType = localGetObj('mockAccount', 'lastAccountType')
            const isReal = !lastAccountType || lastAccountType === 'real'

            if (isReal && Number(this.loginInfo.loginPassStatus) === 1 && !localGet('loginPwdIgnore')) {
                this.showPwdDialog = true
            } else {
                uni.reLaunch({
                    url: '/pages/home/index'
                })
            }
        },
		
        // 检测用户是否开启谷歌验证码
        checkUserMfa () {
            if ((this.currentTab === 0 && this.mail) || (this.currentTab === 1 && this.mobile)) {
                checkGoogleMFAStatus({
                    loginName: this.currentTab === 0 ? this.mail : this.mobile,
                    type: this.currentTab === 0 ? 1 : 2,
                    phoneArea: this.stateAreaItem.code
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
		
        // 返回
        back () {
            if (this.accessFlag) {
                uni.switchTab({ url: '/pages/mine/index' })
            } else {
                uni.switchTab({ url: '/pages/home/index' })
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.wrap {
    -webkit-overflow-scrolling: touch;
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: auto;
    position: relative;
}
.layout-container {
    @include styles('background-color', 'contentColor');
}
.header-tabs {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    height: 100%;
    padding-right: 30rpx;
    button {
        @include flexAll;
        @include styles('color', 'color');
        @include styles('background-color', 'contentColor');
        @include styles('border-color', 'lineColor');
        padding: 5rpx 10rpx 5rpx 18rpx;
        text {
            font-size: 27rpx;
        }
    }
}
.header-title {
    @include styles('color', 'color');
    margin-top: 16rpx;
    margin-bottom: 50rpx;
    text-indent: 35rpx;
    font-size: 40rpx;
    font-weight: bold;
}
.icon-logo {
    width: 180rpx;
    height: 35rpx;
    margin: 20rpx 36rpx 0;
}
.tabs {
    margin-top: 30rpx;
    margin-bottom: 30rpx;
}
.login-form {
    padding: 20rpx 35rpx 0;
    .title {
        margin-bottom: 50rpx;
        font-size: 50rpx;
    }
    .box {
        @include flexAlign;
        @include styles('border-color', 'lineColor');
        height: 90rpx;
        margin-bottom: 30rpx;
        border-width: 1rpx;
        border-style: solid;
        margin-bottom: 30rpx;
        padding: 20rpx;
        border-radius: 10rpx;
        &:last-of-type {
            //margin-bottom: 0;
        }
        input {
            flex: 1;
            height: 100%;
            padding: 0 10rpx;
            font-size: 28rpx;
        }
        .control-pwd {
            @include styles('color', 'minorColor');
            margin-left: 15rpx;
            font-size: 40rpx;
        }
        .area {
            @include flexBetweenAlign;
            height: 90rpx;
            padding-right: 20rpx;
            position: relative;
            .icon-country {
                width: 50rpx;
                height: 37rpx;
                vertical-align: middle;
                margin-right: 10rpx;
                border: solid 1px #DCD8D8;
            }
            .code {
                vertical-align: middle;
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
            text {
                margin-right: 5rpx;
                font-size: 26rpx;
            }
        }
    }
    .google-box {
        padding: 0 30rpx;
        @include styles('border-color', 'lineColor');
        border-width: 1rpx;
        border-style: solid;
        border-radius: 10rpx;
        .box-cell {
            border: none;
        }
    }
    .btn {
        @include flexAll;
        color: #FFF;
        @include styles('background-color', 'primary');
        @include styles('border-color', 'lineColor');
        height: 100rpx;
        margin-top: 60rpx;
        font-size: 32rpx;
        border-style: solid;
        border-width: 1rpx;
        border-radius: 10rpx;
    }
    .forgot-link {
        @include styles('color', 'primary');
        text-align: right;
        margin-top: 20rpx;
    }
}
.login-nav {
    @include flexBetween;
    line-height: 44rpx;
    padding: 0 36rpx;
    margin-top: 20rpx;
    font-size: 28rpx;
    span {
        margin: 0 15rpx;
    }
    .login-type {
        @include styles('color', 'color');
    }
    .link {
        display: inline-block;
        @include styles('color', 'primary');
    }
}
</style>
