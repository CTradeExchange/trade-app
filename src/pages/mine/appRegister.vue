<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar custom-back @back='onBack' />
            <!-- 内容区域 -->
            <view class='layout-content'>
                <!-- <view class='login-connect-warp'>
                    <view class='login-connect'>
                        <image
                            class='icon' 
                            src='/static/image/platform/telegram.png' 
                        />
                        <image
                            class='link'
                            src='/static/image/tg/link.svg'
                        />
                        <view class='logo'>
                            v
                        </view>
                    </view>
                    <view class='login-title'>
                        {{ $t('thirdRegister.bindAccount') }}
                    </view>
                </view> -->
                <!-- 授权成功 -->
                <view class='auth-success'>
                    <view class='text'>
                        {{ $t('thirdRegister.tip1') }}
                    </view>
                    <view class='text'>
                        {{ thirdInfo.thirdSource }} {{ $t('thirdRegister.tip2') }}
                    </view>
                </view>
                <view class='register-form'>
                    <view class='tip'>
                        {{ $t('thirdRegister.bindAccountTips') }}
                    </view>
                    <view class='tabs'>
                        <view :class="{ 'item': true, 'active': currentTab === 1 }" @click='switchTab(1)'>
                            {{ $t('thirdRegister.safetyEmail') }}
                        </view>
                        <view :class="{ 'item': true, 'active': currentTab === 0 }" @click='switchTab(0)'>
                            {{ $t('thirdRegister.safetyPhone') }}
                        </view>
                    </view>
                    <!-- 邮箱 -->
                    <view v-show='currentTab === 1'>
                        <view class='block'>
                            <view class='label'>
                                {{ $t('register.email') }}
                            </view>
                            <view class='box'>
                                <input v-model='mail' :placeholder="$t('common.inputEmail')" placeholderClass='placeholderClass' />
                                <tui-icon
                                    v-if='mail'
                                    class='clear-close'
                                    name='close-fill'
                                    @click="mail = ''"
                                />
                            </view>
                        </view>
                        <view class='block'>
                            <view class='label'>
                                {{ $t('login.verifyCode') }}
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
                                    v-show='currentTab === 1'
                                    :area-code='stateAreaItem.code'
                                    :biz-type='6'
                                    :check-user='false'
                                    :country='stateAreaItem.countryCode'
                                    mode='mail'
                                    :value='mail'
                                    @receive='receiveCodeMail'
                                    @showCountDown='handleCountdown'
                                />
                            </view>
                        </view>
                    </view>
                    <!-- 手机 -->
                    <view v-show='currentTab === 0'> 
                        <view class='block'>
                            <view class='label'>
                                {{ $t('register.phoneNo') }}
                            </view>
                            <view class='box'>
                                <view class='area' @click='handleCountrySelect(true)'>
                                    <image
                                        class='icon-country'
                                        :src="cdnUrl +'/images/countries_flags/' + stateAreaItem.countryCode +'.png'"
                                    />
                                    <span>
                                        {{ stateAreaItem.code }}
                                    </span>
                                    <tui-icon class='arrow' :color='$style.color' name='arrowdown' :size='36' unit='rpx' />
                                </view>
                                <template>
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
                                </template>
                            </view>
                        </view>
                        <view class='block'>
                            <view class='label'>
                                {{ $t('login.verifyCode') }}
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
                                    :check-user='false'
                                    :country='stateAreaItem.countryCode'
                                    mode='mobile'
                                    :value='mobile'
                                    @receive='receiveCodeMobile'
                                    @showCountDown='handleCountdown'
                                />
                            </view>
                        </view>
                    </view>
                    <view v-if='showCountdown' class='showTips' @click='showTipsAlert'>
                        {{ $t('thirdRegister.noReceiveCode') }}
                    </view>
                </view>
            </view>
            <!-- 底部按钮 -->
            <view class='confirm-set' @click='onConfirm'>
                {{ $t('thirdRegister.confirmSet') }}
            </view>
        </view>
		
        <!-- 选择国家地区组件 -->
        <CountrySelect
            ref='countrySelect'
            @change='changeStateArea' 
        />
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 验证码弹窗 -->
        <SendCodeTips
            :show.sync='showTips'
            :type='currentTab'
            :value="currentTab === 1 ? mail : stateAreaItem.code + ' ' + mobile"
        />
    </view>
</template>

<script>
import store from '@/store/index.js'
import CountrySelect from '@/components/modules/country-select'
import SendCodeTips from './components/sendcode-tips'
import { thirdRegist, checkUserStatus } from '@/api/user'
import { getDevice, localSet, localGetJSON, localRemove, setToken, getArrayObj } from '@/utils/util'
import { registerConfig } from '@/pages/mine/registerConfig.js'
import { MsgWsInit } from '@/plugins/socket/socket.js'
import { uniPushInit } from '@/plugins/uniPush'
const { cdnUrl } = require('@/apiConfig.js')

export default {
    components: {
        CountrySelect,
        SendCodeTips
    },
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: false,
            // tabs数据
            tabs: [
                { name: this.$t('register.phoneNo') },
                { name: this.$t('register.email') }
            ],
            // 当前tab 0:手机号 1:邮箱
            currentTab: 1,
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
            // cats返回的第三方信息
            thirdInfo: localGetJSON('thirdInfo') || {},
            // 图标地址
            cdnUrl,
            showCountdown: false, // 是否显示未收到验证码
            showTips: false
        }
    },
    computed: {
        // 默认选择的国家地区
        defaultCountry () {
            return store.state.defaultCountry
        },
        // 当前选择的国家地区代码
        countryCode () {
            return this.currentTab === 1 ? this.defaultCountry.countryCode : this.stateAreaItem.countryCode
        },
        // 当前选择的国家地区匹配的客户组id
        customerGroupId () {
            const customerGroupId = this.getCustomerGroupIdByCountry(this.countryCode).customerGroupId
            return customerGroupId
        },
        // 国家列表
        countryList () {
            return store.state.countryList
        },
        // 手机正则表达式
        mobileReg () {
            const country = this.stateAreaItem.countryCode || this.customerInfo?.country
            return getArrayObj(this.countryList, 'code', country).extend || ''
        }
    },
    onLoad () {
        this.$init().then(() => {
            this.skeletonShow = false
            // 设置默认数据
            this.setDefaultData()
        }).catch(() => {
            this.skeletonShow = false
        })
    },
    // 监听页在卸载
    onUnload () {
        // 删除缓存数据
        localRemove('thirdInfo')
    },
    methods: {
        // 返回
        onBack () {
            this.$refs['modalDialog'].show({
                content: this.$t('thirdRegister.tip5'),
                showCancel: true,
                confirmText: this.$t('thirdRegister.continue'),
                cancelText: this.$t('thirdRegister.back')
            }).then(() => {}).catch(() => {
                store.commit('_user/Update_BackFlag', true)
                uni.navigateBack({
                    delta: 1
                })
            })
        },
		
        // 设置默认数据
        setDefaultData () {
            store.dispatch('getCountryListByParentCode').then(() => {
                this.stateAreaItem = store.state.defaultCountry
            })	
        },
		
        // 切换选项卡
        switchTab (index) {
            this.currentTab = index 
        },
		
        // 打开选择国家地区弹窗
        handleCountrySelect () {
            this.$refs.countrySelect.handleVisible(true)
        },
		
        // 改变国家地区
        changeStateArea (item) {
            this.stateAreaItem = item
        },
		
        // 根据国家获取对应的客户组
        getCustomerGroupIdByCountry (country) {
            const registList = this.wpCompanyInfo.registList
            if (!country || !registList?.length) return null
            let _resultGroup = registList.find(el => el.registCountry.code === country)
            if (!_resultGroup) _resultGroup = registList.find(el => el.registCountry.isOther)
            return _resultGroup
        },
		
        // 手机注册接收验证码
        receiveCodeMobile (value, token) {
            this.codeTokenMobile = token
        },
		
        // 邮箱注册接收验证码
        receiveCodeMail (value, token) {
            this.codeTokenMail = token
        },
		
        // 点击确认按钮
        onConfirm () {
            // 手机注册验证
            if (this.currentTab === 0) {
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
            if (this.currentTab === 1) {
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
			
            // 处理第三方注册
            this.handleThirdRegister()
        },
		
        // 验证手机号邮箱是否存在 //先不提示此弹窗
        validatorUserStatus () {
            const params = {
                type: this.currentTab === 1 ? 1 : 2,
                loginName: this.currentTab === 1 ? this.mail : this.mobile
            }
            if (this.currentTab === 0) {
                params.phoneArea = this.stateAreaItem.code
            }
            uni.showLoading({
                title: this.$t('common.loading'),
                mask: true
            })
            checkUserStatus(params).then(res => {
                if (res.data?.status) {
                    if (Number(res.data.status) === 1) {
                        uni.hideLoading()
                        const type = this.currentTab === 0 ? this.$t('register.phoneNo') : this.$t('register.email')
                        const thirdSource = this.thirdInfo.thirdSource || ''
                        const tipThirdSource = thirdSource.slice(0, 1).toUpperCase() + thirdSource.slice(1)
                        this.$refs['modalDialog'].show({
                            content: this.$t('thirdRegister.registeredTips', [type, tipThirdSource]),
                            showCancel: true,
                            confirmText: this.$t('common.sure'),
                            cancelText: this.$t('common.cancel')
                        }).then(() => {
                            // 处理第三方注册
                            this.handleThirdRegister()
                        }).catch(() => { })
                    } else {
                        this.handleThirdRegister()
                    }
                } else {
                    uni.hideLoading()
                    this.$toast(res.msg)
                }
            }).catch((err) => {
                uni.hideLoading()
                if (err) this.$toast(err.msg)
            })
        },
		
        // 处理第三方注册
        handleThirdRegister () {
            const params = {
                companyId: this.wpCompanyInfo.companyId,
                userId: this.thirdInfo.userId,
                thirdSource: this.thirdInfo.thirdSource,
                customerGroupId: this.customerGroupId,
                country: this.countryCode,
                verifyCode: this.currentTab === 1 ? this.codeMail : this.codeMobile,
                sendToken: this.currentTab === 1 ? this.codeTokenMail : this.codeTokenMobile,
                registerSource: getDevice(),
                ...registerConfig()
            } 
            if (this.currentTab === 1) {
                params.email = this.mail
            } else {
                params.phone = this.mobile
                params.phoneArea = this.stateAreaItem.code
            }
           
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
                    if (list?.length > 0) {
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
        },

        handleCountdown (flag) {
            this.showCountdown = flag
        },
        showTipsAlert () {
            this.showTips = true
        }
    }
}
</script>

<style lang='scss' scoped>
.layout-container-full {
	@include styles('background-color', 'contentColor');
	padding: 0 50rpx;
}
.auth-success {
	@include styles('border-bottom-color', 'lineColor');
	text-align: center;
	font-size: 28rpx;
	padding-top: 20rpx;
	padding-bottom: 40rpx;
	border-bottom-width: 1rpx;
	border-bottom-style: solid;
}
.login-connect-warp{
    padding: 30rpx 0;
    .login-connect{
        display: flex;
        align-items: center;
        justify-content: center;
        width: 320rpx;
        margin: 40rpx auto;
        .connect{
            flex: 1;
            display: flex;
            align-items: center;
        }
        .icon{
            width: 100rpx;
            height: 100rpx;
        }
        .link{
            width: 140rpx;
            height: 100rpx;
        }
        .logo{
            border-radius: 50%;
            width: 100rpx;
            height: 100rpx;
            padding: 10rpx;
            background: #e57979;
            color: #fff;
            font-size: 24px;
            text-align: center;
            text-transform: uppercase;
            text-decoration: none !important;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }
    .login-title{
        font-weight: bold;
        font-size: 40rpx;
        text-align: center;
    }
}

.register-form {
	padding-top: 30rpx;
	font-size: 26rpx;
	.tip {
		line-height: 42rpx;
        @include styles('color', 'normalColor');
        padding-bottom: 30rpx;
        text-align: center;
	}
	.tabs {
		display: flex;
        justify-content: space-between;
        margin-top: 30rpx;
        margin-bottom: 30rpx;
		.item {
            @include styles('background-color', 'lineColor');
            display: inline-flex;
            justify-content: center;
            align-items: center;
			width: calc(50% - 30rpx);
			height: 60rpx;
		}
        .active {
            @include styles('background-color', 'primary');
            color: #fff;
        }
	}
    .block {
        margin-bottom: 30rpx;
        .label {
            margin-bottom: 12rpx;
        }
        .box {
            @include flexAlign;
            @include styles('color', 'color');
            @include styles('border-color', 'lineColor');
            border-width: 1rpx;
            border-style: solid;
            height: 80rpx;
            input {
                flex: 1;
                height: 100%;
                padding: 0 24rpx;
                font-size: 26rpx;
            }
            .arrow {
                margin-left: 10rpx;
                @include styles('color','mutedColor');
            }
            .box-flex{
                display: flex;
                justify-content: space-between;
                width: 100%;
            }
            .area {
                @include flexBetweenAlign;
                height: 80rpx;
                padding: 0 20rpx;
                position: relative;
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
				.icon-country {
					width: 50rpx;
					height: 37rpx;
					vertical-align:middle;
					margin-right: 10rpx;
					border: solid 1px #dcd8d8;
				}
                span {
                    margin-right: 5rpx;
                }
            }
			.clear-close {
				margin-right: 10rpx !important;
			}
	    }
        &::v-deep .verify-code {
            @include styles('border-left-color', 'lineColor');
            display: inline-flex;
            align-items: center;
            height: 100%;
            padding: 0 18rpx;
            border-left-width: 1rpx;
            border-left-style: solid;
        }
    }
}
.confirm-set {
    @include styles('background-color', 'primary');
    display: flex;
    justify-content: center;
    align-items: center;
    height: 90rpx;
    margin-bottom: 40rpx;
    font-size: 30rpx;
    color: #fff;
    border-radius: 10rpx;
}
.showTips{
    @include styles('color', 'normalColor');
}
</style>
