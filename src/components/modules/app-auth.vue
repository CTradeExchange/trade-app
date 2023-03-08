<template>
    <view>
        <view v-if='isAPP' class='auth-module'>
            <view v-if='isShowText' class='auth-tip'>
                <em></em>
                <span>{{ $t('thirdRegister.orContinueWith') }}</span>
                <em></em>
            </view>
            <view class='auth-third'>
                <view v-if='$config.isGoogle' class='item' @click='onGoogleLogin'>
                    <view class='box'>
                        <image src='/static/image/platform/google.png' />
                    </view>
                    <span>Google</span>
                </view>
                <view v-if='$config.isTelegram' class='item' @click='loginByTg'>
                    <view class='box'>
                        <image src='/static/image/platform/telegram.png' />
                    </view>
                    <span>Telegram</span>
                </view>
                <view v-if='isAppleLogin && $config.isApple' class='item ' @click="onAppLogin('apple')">
                    <view class='box'>
                        <tui-icon class='icon' name='ios' :size='22' />
                    </view>
                    <span>Apple</span>
                </view>
            </view>
        </view>
		
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 设置登录密码 -->
        <login-pwd-dialog :show.sync='showPwdDialog' />
    </view>
</template>

<script>
import loginPwdDialog from '@/pages/mine/components/login-pwd-dialog.vue'
import store from '@/store'
import { googleLoginVerify, appleLoginVerify, thirdRegist, telegramLoginVerify } from '@/api/user'
import { getDevice, localSet, localGet, setToken, localSetJSON, isEmpty, throttle } from '@/utils/util'
import { registerConfig } from '@/pages/mine/registerConfig.js'
import { MsgWsInit } from '@/plugins/socket/socket.js'
import { JYGoogleLogin, JYGoogleLogout } from '@/plugins/JYGoogleSignin'
import { uniPushInit } from '@/plugins/uniPush'

export default {
    components: {
        loginPwdDialog
    },
    props: {
        // 模块
        module: {
            type: String,
            default: ''
        }
    },
    data () {
        let isAPP = false
        // #ifdef APP-PLUS
        isAPP = true
        // #endif
        return {
            // google登录
            onGoogleLogin: throttle(this.googleLogin),
            // app登录
            onAppLogin: throttle(this.appLogin),
            // app授权信息
            authResult: {},
            // app用户信息
            userInfo: {},
            // cats返回的第三方信息
            thirdInfo: {},
            // cats用户登录信息
            loginInfo: {},
            // 是否显示设置登录密码弹窗
            showPwdDialog: false,
            authService: [],
            // 上一个页面
            referrer: '',
            isAPP
        }
    },
    computed: {
        // 是否显示文案
        isShowText () {
            return this.$config.isGoogle || this.$config.isTelegram || this.$config.isApple
        },
        // 是否显示apple登录，ios版本大于等于13才开放
        isAppleLogin () {
            const versions = parseInt(this.systemInfo.system.split(' ')[1])
            return this.systemInfo.platform === 'ios' && versions >= 13
        },
        // 默认选择的国家地区
        defaultCountry () {
            return store.state.defaultCountry
        },
        // 当前选择的国家地区代码
        countryCode () {
            return this.defaultCountry.countryCode
        },
        // 当前选择的国家地区匹配的客户组id
        customerGroupId () {
            const customerGroupId = this.getCustomerGroupIdByCountry(this.countryCode).customerGroupId
            return customerGroupId
        },
        tgLoginInfo () {
            return store.state._user.tgLoginInfo
        }
    },
    created () {
        // #ifdef APP-PLUS
        // 初始化认证服务
        plus.oauth.getServices((services) => {
            this.authService = services
        })
        // #endif
    },
    onLoad (options) {
        this.referrer = options.referrer
    },
    methods: {
        // telegram登录
        loginByTg () {
            // 添加应用内事件
            this.$addAppsEvent(this.module + '_telegram_click')
            // #ifdef APP-PLUS
            store.commit('_user/Update_BackFlag', false)
            const botName = this.$appConfig['telegram_client_id']
            const schemeName = 'cats' // app跳转前缀
            const url = `${this.$config.telegramUrl}/tgLogin.html?botName=${botName}&schemeName=${schemeName}`
            plus.runtime.openURL(url)
            // #endif
        },
		
        // google登录
        googleLogin () {
            // 添加应用内事件
            this.$addAppsEvent(this.module + '_google_click')
            // #ifdef APP-PLUS
            JYGoogleLogin().then(res => {
                if (res.errorCode === '0') {
                    console.log('google登录成功', res)
                    this.userInfo = res.data
                    // 处理与cats系统交互
                    this.handleCBLogin('google')
                } else {
                    console.log('google登录失败', res)
                    this.userInfo = {}
                    const { statusCode } = res.data
                    if (statusCode === 12500) {
                        this.$refs['modalDialog'].show({
                            content: this.$t('thirdRegister.google12500')
                        })
                    } else if (statusCode !== 8 && statusCode !== 12501 && statusCode !== 12502) {
                        this.$refs['modalDialog'].show({
                            content: statusCode
                        })
                    }
                }
            })
            // #endif
        },
		
        // app登录
        appLogin (provider) {
            // 添加应用内事件
            this.$addAppsEvent(this.module + '_apple_click')
            // #ifdef APP-PLUS
            const currentService = this.authService.find(item => item.id === provider)
            if (currentService && currentService.id) {
                currentService.login((res) => {
                    const infoRes = res?.target?.appleInfo || {}
                    this.userInfo = infoRes
                    console.log('app获取用户信息成功', this.userInfo)
                    // 处理与cats系统交互
                    this.handleCBLogin(provider)
                }, (err) => {
                    console.log('app获取用户信息失败', err)
                    this.userInfo = {}
                }, {  
                    scope: 'email'  
                })  
            }       
            // #endif
        },
			
        // 处理与cats系统交互
        handleCBLogin (provider, extra = {}) {
            // apple注销
            const currentService = this.authService.find(item => item.id === provider)
            if (currentService && currentService.authResult) {
                currentService.logout(e => {
                    console.log('apple注销成功')
                }, e => {
                    console.log('apple注销失败')
                })
            }
			
            // 设置请求方法
            let loginVerifyUrl = null
            const { companyId } = this.wpCompanyInfo
            const params = {
                companyId,
                ...extra
            }
            switch (provider) { 
                // google
                case 'google':
                    loginVerifyUrl = googleLoginVerify
                    // 安卓使用idToken，ios使用assessToken
                    if (this.userInfo.idToken) {
                        params.idToken = this.userInfo.idToken
                    } else {
                        params.accessToken = this.authResult.access_token
                    }
                    // 谷歌退出登录
                    JYGoogleLogout()
                    break
                // apple
                case 'apple':
                    loginVerifyUrl = appleLoginVerify
                    params.openId = this.userInfo.user
                    params.identityToken = this.userInfo.identityToken
                    // apple只有首次授权可以获取到邮箱，所以需要传给后端保存
                    if (this.userInfo.email && (this.userInfo.email.indexOf('privaterelay.appleid.com') === -1)) {
                        params.email = this.userInfo.email
                    }
                    break
                case 'tg':
                    params.userJsonStr = this.tgLoginInfo
                    params.channelSource = 'pc'
                    loginVerifyUrl = telegramLoginVerify
                    break
            }
            if (!loginVerifyUrl) return
			
            // 发起cats接口请求
            uni.showLoading({
                title: '',
                mask: true
            })
            loginVerifyUrl(params).then(res => {
                console.log('cats获取第三方信息成功', res)
                // #ifdef APP-PLUS
                if (provider === 'tg') {
                    plus.runtime.arguments = ''
                }
                // #endif
                uni.hideLoading()
                const { action, failReason } = res.data
                this.thirdInfo = res.data
                console.log('action', action)
                switch (action) {
                    // 注册
                    case 'register':
                        this.handleThirdRegister()
                        break
                    // 登录
                    case 'login':
                        this.handleThirdLogin()
                        break
                    // 绑定
                    case 'bind':
                        this.handleThirdLogin(false)
                        break
                }
                // 提示错误信息
                if (failReason) {
                    this.$refs['modalDialog'].show({
                        title: this.$t('tip'),
                        content: failReason
                    })
                }
            }).catch(err => {
                console.log('cats获取第三方信息失败', err)
                uni.hideLoading()
                this.$refs['modalDialog'].show({
                    title: this.$t('tip'),
                    content: err.msg
                })
            })
        },
		
        // 处理第三方注册
        handleThirdRegister () {
            // 有邮箱或者手机号直接发起注册
            if (this.thirdInfo.email || this.thirdInfo.phone) {
                const params = {
                    companyId: this.wpCompanyInfo.companyId,
                    userId: this.thirdInfo.userId,
                    thirdSource: this.thirdInfo.thirdSource,
                    customerGroupId: this.customerGroupId,
                    country: this.countryCode,
                    registerSource: getDevice(),
                    ...registerConfig()
                } 
                if (this.thirdInfo.email) {
                    params.email = this.thirdInfo.email
                } else {
                    params.phone = this.thirdInfo.phone
                }
                console.log('params', params)
                // 发起接口请求 
                uni.showLoading({
                    title: this.$t('login.loginIng'),
                    mask: true
                })
                thirdRegist(params).then(res => {
                    console.log('cats第三方注册成功')
                    uni.hideLoading()
                    // 人工审核
                    if (res.code === 'CUSTOMER_API_00010001') {
                        // 关闭所有页面跳转到注册人工审核页面
                        uni.reLaunch({
                            url: '/pages/mine/registerHandler'
                        })
                    } else {
                        // 存储token
                        if (res.data.token) setToken(res.data.token)
					
                        // 缓存注册信息
                        localSet('loginInfo', JSON.stringify({ 
                            accountType: params.type,
                            loginName: params.loginName,
                            phoneArea: params.phoneArea,
                        }))
					
                        // 消息websocket初始化
                        MsgWsInit({ $store: store })
                        // uniPush初始化
                        uniPushInit()
					
                        // 需要kyc验证
                        const list = res.data.list
                        if (list.length > 0) {
                            // 关闭所有页面跳转到kyc验证页面
                            uni.reLaunch({
                                url: '/pages/person/authForm?levelCode=' + list[0].levelCode + '&isRegister=true'
                            })
                        } else {
                            // 关闭所有页面跳转到注册成功页
                            uni.reLaunch({
                                url: '/pages/mine/registerSuccess'
                            })
                        }
                    }
                    // 添加应用内事件
                    this.$addAppsEvent(this.thirdInfo.thirdSource + '_complete_register')
                }).catch(err => {
                    console.log('cats第三方注册失败', err)
                    uni.hideLoading()
                    this.$refs['modalDialog'].show({
                        title: this.$t('tip'),
                        content: err.msg
                    })
                })
            } else {
                // 没有邮箱或者手机号跳转到app注册页面
                localSetJSON('thirdInfo', this.thirdInfo)
                uni.navigateTo({
                    url: '/pages/mine/appRegister'
                })
            }
        },
		
        // 处理三方登录
        handleThirdLogin (isVerify = true) {
            // 请求参数
            const params = {
                companyId: this.wpCompanyInfo.companyId,
                userId: this.thirdInfo.userId,
                thirdSource: this.thirdInfo.thirdSource,
                isThird: isVerify // true为三方登录 false 系统登录
            }
            if (!isVerify) {
                params.isCheckVerifyCode = false
                params.type = 1
                params.device = getDevice()
                params.loginName = this.thirdInfo.email
                params.bindThirdUserId = this.thirdInfo.userId
            }
            if (this.thirdInfo.email) {
                params.email = this.thirdInfo.email
            } else {
                params.phone = this.thirdInfo.phone
            }
            // 发起接口请求
            uni.showLoading({
                title: this.$t('login.loginIng'),
                mask: true
            })
            this.$store.dispatch('_user/login', params).then(res => {
                console.log('cats第三方登录成功')
                const { data } = res
                this.loginInfo = data
				
                // 登录成功提示
                uni.hideLoading()
				 
                // 消息websocket初始化
                MsgWsInit({ $store: store }) 
			    
                // kyc认证 companyKycStatus 公司KYC开户状态，1:开启 2:未开启
                if (data.companyKycStatus === 1 && data.kycAuditStatus !== 2) {
                    // kyc认证
                    this.kycAuth()
                } else {
                    // 设置登录密码
                    this.setLoginPwd()
                }
                // 添加应用内事件
                this.$addAppsEvent(this.thirdInfo.thirdSource + '_complete_login')
            }).catch(res => {
                console.log('cats第三方登录失败', res)
                uni.hideLoading()
                this.$refs['modalDialog'].show({
                    content: res.msg
                })
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
            if (Number(this.loginInfo.loginPassStatus) === 1 && !localGet('loginPwdIgnore')) {
                this.showPwdDialog = true
            } else {
                uni.reLaunch({
                    url: this.referrer || '/pages/home/index'
                })
            }
        },
		
        // 根据国家获取对应的客户组
        getCustomerGroupIdByCountry (country) {
            const registList = this.wpCompanyInfo.registList
            if (!country || !registList?.length) return null
            let _resultGroup = registList.find(el => el.registCountry.code === country)
            if (!_resultGroup) _resultGroup = registList.find(el => el.registCountry.isOther)
            return _resultGroup
        }
    }
}
</script>

<style scoped lang="scss">
.auth-module {
	margin-top: 80rpx;
	margin-bottom: 60rpx;
	padding: 0 35rpx;
}
.auth-tip {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-bottom: 40rpx;
	em {
		@include styles('background-color', 'lineColor');
		flex: 1;
		height: 1rpx;
	}
	span {
		@include styles('color', 'normalColor');
		margin: 0 12rpx;
		font-size: 26rpx;
	}
}
.auth-third {
	display: flex;
	justify-content: space-around;
    justify-content: space-evenly;
	flex-wrap: wrap;
	.item {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		.box {
			@include styles('border-color', 'lineColor');
            @include styles('background-color', 'assistColor');
            border-style: solid;
            border-width: 1rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			width: 44px;
			height: 44px;
			margin-bottom: 10rpx;
			border-radius: 22px;
		}
		image {
			width: 22px;
			height: 22px;
		}
		&::v-deep {
			.icon {
				@include styles('color', 'color');
				margin-top: -2px !important;
				font-size: 26px !important;
			}
		}
		span {
			@include styles('color', 'normalColor');
			font-size: 26rpx;
		}
	}
}
</style>
