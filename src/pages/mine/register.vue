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
                        {{ $t('register.welcomeRegister') }}CATS
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
                    <view class='register-form'>
                        <!-- 手机 -->
                        <view v-show='currentTab === 1'>
                            <!-- <view class='box'>
                            <view class='box-flex' @click='handleCountrySelect(true)'>
                                <span>
                                    {{ stateAreaItem.countryName }}
                                </span>
                                <tui-icon class='arrow' :color='$style.color' name='arrowdown' :size='36' unit='rpx' />
                            </view>
                        </view> -->
                            <view class='box'>
                                <view class='area' @click='handleCountrySelect(true)'>
                                    <image
                                        class='icon-country'
                                        :src="cdnUrl+ '/images/countries_flags/' + stateAreaItem.countryCode +'.png'"
                                    />
                                    <span class='code'>
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
                                />
                                <tui-icon
                                    v-if='mobile'
                                    class='clear-close'
                                    name='close-fill'
                                    @click="mobile = ''"
                                />
                            </view>
                            <view class='box'>
                                <input 
                                    v-model='codeMobile' 
                                    :placeholder="$t('common.inputVerifyCode')" 
                                    placeholderClass='placeholderClass' 
                                    type='number' 
                                />
                                <tui-icon
                                    v-if='codeMobile'
                                    class='clear-close'
                                    name='close-fill'
                                    @click="codeMobile = ''" 
                                />
                                <verify-code
                                    :area-code='stateAreaItem.code'
                                    :biz-type='2'
                                    :country='stateAreaItem.countryCode'
                                    mode='mobile'
                                    module='register'
                                    :value='mobile'
                                    @receive='receiveCodeMobile'
                                />
                            </view>
                        </view>
                        <!-- 邮箱 -->
                        <view v-show='currentTab === 0'>
                            <view class='box'>
                                <input v-model='mail' :placeholder="$t('common.inputEmail')" placeholderClass='placeholderClass' />
                                <tui-icon
                                    v-if='mail'
                                    class='clear-close'
                                    name='close-fill'
                                    @click="mail = ''"
                                />
                            </view>
                            <view class='box'>
                                <input 
                                    v-model='codeMail' 
                                    :placeholder="$t('common.inputVerifyCode')" 
                                    placeholderClass='placeholderClass' 
                                    type='number'
                                />
                                <tui-icon
                                    v-if='codeMail'
                                    class='clear-close'
                                    name='close-fill'
                                    @click="codeMail = ''"
                                />
                                <verify-code
                                    v-show='currentTab === 0'
                                    :area-code='stateAreaItem.code'
                                    :biz-type='6'
                                    :country='stateAreaItem.countryCode'
                                    mode='mail'
                                    module='register'
                                    :value='mail'
                                    @receive='receiveCodeMail'
                                />
                            </view>
                        </view>
                        <!-- 注册邀请码 -->
                        <!-- <view v-if='inviteConfig.inviteEnable' class='invite-header' @click='inviteVis = !inviteVis'>
                        {{ $t("register.inviteCode") }}
                        <tui-icon 
                            margin='0 0 0 10rpx'
                            :name='inviteVis ? "turningup" : "turningdown" '
                            :size='20'
                        />
                    </view> 
                    <view v-if='inviteConfig.inviteEnable && inviteVis' class='box'>
                        <input
                            v-model='customerNo'
                            :placeholder='$t("register.inviteCode")'
                            placeholderClass='placeholderClass'
                        />
                    </view> -->
                        <label v-if='instructions' class='agreement'>
                            <checkbox :checked='isAgreement' @click='isAgreement = !isAgreement' />
                            <mp-html :content='instructions' />
                        </label>
                        <button class='btn' @click='onSubmit'>
                            {{ $t('register.registerBtn') }}
                        </button>
                        <view class='login-link'>
                            {{ $t('register.goLogin') }}
                            <view
                                class='link'
                                @click='goLogin'
                            >
                                {{ $t('register.hasAccount') }}
                            </view>
                        </view>
                    </view>
				
                    <!-- app授权组件 -->
                    <app-auth ref='appAuth' module='register' />
                </view>
                <powered-by />
            </view>
            <view v-else>
                <no-access />
            </view>
        </view>

        <!-- 国家地区选择组件 -->
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
import store from '@/store/index.js'
import { register, activityRegister } from '@/api/user.js'
import { setToken, getDevice, localSet, guid, sleep } from '@/utils/util.js'
import { MsgWsInit } from '@/plugins/socket/socket.js'
import { unescape } from 'lodash'
import { registerConfig } from './registerConfig.js'
import CountrySelect from '@/components/modules/country-select'
import appAuth from '@/components/modules/app-auth'
import { handleSwitchAccount } from '@/utils/method'
import noAccess from '@/components/modules/no-access'

const { cdnUrl } = require('@/apiConfig.js')

export default {
    components: {
        CountrySelect,
        appAuth,
        noAccess
    },
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 页面参数对象
            options: {},
            // tabs数据
            tabs: [
                { name: this.$t('register.email') },    
                { name: this.$t('register.phoneNo') }
                
            ],
            // 当前tab 1:手机号 0:邮箱
            currentTab: 0,
            // 当前选择的国家地区
            stateAreaItem: {},
            // 输入的手机号
            mobile: '',
            // 输入的邮箱
            mail: '',
            // 输入的手机验证码
            codeMobile: '',
            // 手机验证码token
            codeTokenMobile: '',
            // 输入的邮箱验证码
            codeMail: '',
            // 邮箱验证码token
            codeTokenMail: '',
            // 是否同意协议
            isAgreement: true,
            // 开户须知内容
            instructions: '',
            // 入口页面模块
            module: '',
            // 登录类型
            loginType: '', 
            // 推荐人客户编号
            customerNo: '',
            inviteVis: false, // 是否显示邀请框
            cdnUrl
        }
    },
    computed: {
        // 默认选择的国家地址
        defaultCountry () {
            return store.state.defaultCountry
        },
        // resultGroup
        resultGroup () {
            const registList = this.wpCompanyInfo?.registList
            const stateAreaItem = this.stateAreaItem
            let resultGroup = registList.find(el => el.registCountry.code === stateAreaItem.countryCode)
            if (!resultGroup) resultGroup = registList.find(el => el.registCountry.isOther)
            return resultGroup
        },

        // 当前国家手机号正则表达式
        mobileReg () {
            let result = ''
            this.$store.state.countryList.map(elem => {
                if (elem.countryCode === this.stateAreaItem.code) {
                    result = elem.extend
                }
            })
            return result
        },
        // 获取是否邀请码
        inviteConfig () {
            const config = this.$store.state._global.config
            return {
                inviteEnable: config?.inviteEnable || false,
                invitePK: config?.invitePK || '',
                inviteURL: config?.inviteURL || ''
            }
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
        this.loginType = options.loginType || ''
		
        this.$init().then(() => {
            this.skeletonShow = false
            this.options = options
            if (options.mobile) this.currentTab = 1
            this.mobile = options.mobile || ''
            this.mail = options.mail || ''
            // 设置默认数据
            this.setDefaultData()
            // 设置开户须知内容
            this.setInstructions()
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('register_view')
        this.$addAppsEvent(this.module ? this.module + 'register_view' : 'register_view')
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
    methods: {
        // 回到首页
        goHome () {
            uni.switchTab({
                url: '/pages/home/index'
            })
        },
		
        // 关闭所有页面跳转到登录页面
        goLogin () {
            uni.reLaunch({
                url: '/pages/mine/login'
            })
        },
		
        // 设置默认数据
        setDefaultData () {
            store.dispatch('getCountryListByParentCode').then(() => {
                this.stateAreaItem = store.state.defaultCountry
            })
        },
		
        // 设置开户须知内容
        setInstructions () {
            const lang = this.currentLang || 'zh-CN'
            const instructionMap = {
                'zh-CN': 'instructions_zh',
                'en-US': 'instructions_en',
                'zh-HK': 'instructions_hk'
            }
            const protocol = this.wpCompanyInfo[instructionMap[lang]]
            this.instructions = protocol ? decodeURIComponent(unescape(protocol)) : ''
        },

        // 切换选项卡
        switchTab (e) {
            this.currentTab = e.index
        },
		
        // 打开选择国家地区弹窗
        handleCountrySelect () {
            this.$refs.countrySelect.handleVisible(true)
        },

        // 改变国家地区
        changeStateArea (item) {
            this.stateAreaItem = item
        },

        // 手机注册接收验证码
        receiveCodeMobile (value, token) {
            this.codeTokenMobile = token
        },

        // 邮箱注册接收验证码
        receiveCodeMail (value, token) {
            this.codeTokenMail = token
        },

        // 点击提交
        onSubmit () {
            // 添加应用内事件
            this.$addAppsEvent('register_register_click')
            // 手机注册验证
            if (this.currentTab === 1) {
                if (!this.mobile) {
                    return uni.showToast({
                        title: this.$t('common.inputPhone'),
                        icon: 'none'
                    })
                }
                // 验证手机号是否匹配
                const mobileReg = new RegExp(this.mobileReg)
                if (this.mobileReg && !mobileReg.test(this.mobile)) {
                    return uni.showToast({
                        title: this.$t('common.inputRealPhone'),
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
            // 邮箱注册验证
            if (this.currentTab === 0) {
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
            if (!this.isAgreement) {
                return uni.showToast({
                    title: this.$t('register.protocolTip'),
                    icon: 'none'
                })
            }

            // 发起注册请求
            this.launchRegister()
        },

        // 发起注册请求
        launchRegister () {
            const stateAreaItem = this.stateAreaItem
            const defaultCountry = this.defaultCountry
            const resultGroup = this.resultGroup
            let params = {}
            // 判断是否填写了推荐id 设置不同的params
            if (this.inviteConfig.inviteEnable && this.customerNo) {
                params = {
                    checkVerifyCode: true,
                    companyId: this.wpCompanyInfo?.companyId,
                    customerNo: this.customerNo,
                    lang: this.currentLang,
                    loginName: this.currentTab === 0 ? this.mail : this.mobile,
                    registerSource: getDevice(),
                    sendToken: this.currentTab === 0 ? this.codeTokenMail : this.codeTokenMobile,
                    trace: guid(),
                    tradeTypeCurrencyList: resultGroup ? resultGroup.plans : this.wpCompanyInfo?.tradeTypeCurrencyList,
                    type: this.currentTab === 0 ? 1 : 2,
                    verifyCode: this.currentTab === 0 ? this.codeMail : this.codeMobile,
                    timestamp: Date.now(),
                    customerGroupId: resultGroup.customerGroupId,
                    protocol: true,
                    ...registerConfig()
                }
            } else {
                params = {
                    registerSource: getDevice(),
                    type: this.currentTab === 0 ? 1 : 2,
                    loginName: this.currentTab === 0 ? this.mail : this.mobile,
                    verifyCode: this.currentTab === 0 ? this.codeMail : this.codeMobile,
                    sendToken: this.currentTab === 0 ? this.codeTokenMail : this.codeTokenMobile,
                    protocol: true,
                    customerGroupId: resultGroup.customerGroupId,
                    tradeTypeCurrencyList: resultGroup ? resultGroup.plans : this.wpCompanyInfo?.tradeTypeCurrencyList,
                    ...registerConfig()
                }
            }
            if (params.type === 2) {
                params.phoneArea = stateAreaItem.code
                params.country = stateAreaItem.countryCode
            } else {
                params.emailArea = defaultCountry.code
                params.country = defaultCountry.countryCode
            }
           
            uni.showLoading({
                title: this.$t('common.submiting'),
                mask: true
            })
            if (params.customerNo) {
                // 活动注册成功接口
                activityRegister(params, this.inviteConfig).then(res => {
                    uni.hideLoading()
                    // 缓存注册信息
                    localSet('loginInfo', JSON.stringify({ 
                        accountType: params.type,
                        loginName: params.loginName,
                        country: params.country
                    }))
                    localSet('registerTime', res.data.registerTime)
                    MsgWsInit({ $store: store })
                    uni.showToast({
                        title: this.$t('register.pleaseLogin'),
                        duration: 2000,
                        icon: 'none'
                    })
                    setTimeout(() => {
                        // 跳转到登录页
                        uni.reLaunch({
                            url: '/pages/mine/login?loginType=2'
                        })
                    }, 1000)
                }).catch(res => {
                    uni.hideLoading()
                    this.$refs['modalDialog'].show({
                        content: res.msg
                    })
                })
            } else {
                register(params).then(async (res) => {
                    // 人工审核
                    if (res.code === 'CUSTOMER_API_00010001') {
                        // 关闭所有页面跳转到注册人工审核页面
                        uni.hideLoading()
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
                            country: params.country
                        }))
                        // 缓存注册时间
                        localSet('registerTime', res.data.registerTime)
                        if (this.loginType === 'demo') {
                            await sleep(800)
                            await handleSwitchAccount(this.loginType)
                        } else {
                            // 消息websocket初始化
                            MsgWsInit({ $store: store })
                        }
                        uni.hideLoading()

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
                    this.$addAppsEvent(this.module ? (this.module + '_complete_register') : 'complete_register')
                }).catch(res => {
                    uni.hideLoading()
                    this.$refs['modalDialog'].show({
                        content: res.msg
                    })
                })
            }
        },
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
    justify-content: flex-end;
    align-items: center;
    width: 100%;
    height: 100%;
    padding-right: 30rpx;
    button {
        @include flexAll;
        @include styles('color', 'color');
        @include styles('background-color', 'contentColor');
        padding: 5rpx 10rpx 5rpx 18rpx;
        span {
            font-size: 27rpx;
        }
    }
}
.icon-logo {
    width: 180rpx;
    height: 35rpx;
    margin: 20rpx 36rpx;
}
.header-title {
    @include styles('color', 'color');
    margin-top: 20rpx;
    margin-bottom: 30rpx;
    text-indent: 35rpx;
    font-size: 40rpx;
    font-weight: bold;
}
.tabs {
    margin-top: 30rpx;
    margin-bottom: 30rpx;
}
.register-form {
    padding: 20rpx 35rpx 0;
    font-size: 26rpx;
    .invite-header {
        display: flex;
        align-items: center;
        margin-bottom: 20rpx;
        @include styles('color', 'normalColor');
    }
    .box {
        @include flexAlign;
        @include styles('color', 'color');
        @include styles('border-color', 'lineColor');
        border-width: 1rpx;
        border-style: solid;
        margin-bottom: 30rpx;
        border-radius: 10rpx;
        padding: 20rpx;
        height: 100rpx;
        input {
            flex: 1;
            height: 100%;
            font-size: 26rpx;
        }
        .arrow {
            margin-left: 10rpx;
            @include styles('color','mutedColor');
        }
        .box-flex {
            display: flex;
            justify-content: space-between;
            width: 100%;
        }
        .area {
            @include flexBetweenAlign;
            height: 90rpx;
            padding-right: 20rpx;
            position: relative;
            .icon-country {
                width: 50rpx;
                height: 37rpx;
                border: solid 1px #DCD8D8;
                vertical-align: middle;
                margin-right: 10rpx;
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
            span {
                margin-right: 5rpx;
            }
        }
    }
    .agreement {
        @include flexAlign;
        @include styles('color', 'minorColor');
        margin-top: 20rpx;
        font-size: 26rpx;
        checkbox {
            margin-right: 10rpx;
        }
    }
    .btn {
        @include flexAll;
        @include styles('background-color', 'primary');
        @include styles('border-color', 'lineColor');
        color: #FFF;
        height: 100rpx;
        border-radius: 10rpx;
        margin-top: 60rpx;
        font-size: 32rpx;
        border-style: solid;
        border-width: 1rpx;
        border-radius: 10rpx;
    }
    .login-link {
        text-align: center;
        margin-top: 30rpx;
        font-size: 28rpx;
        .link {
            text-align: center;
            display: inline-block;
            @include styles('color', 'primary');
        }
    }
}
</style>
