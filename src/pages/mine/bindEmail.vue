<template>
    <view class='layout' :change-color='changeColor' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar :title="customerInfo.email ? $t('cRoute.changeBindEmail') : $t('cRoute.bindEmail')" />   
            <!-- 内容区域 -->
            <view class='layout-content'>
                <view class='form-module'>
                    <view class='form-item'>
                        <view class='title'>
                            {{ $t("common.inputEmail") }}
                        </view>
                        <view class='box'>
                            <!-- <view class='area' @click='openStateArea'>
                            <span>{{ stateAreaItem.name }}</span>
                            <tui-icon
                                v-if='isEdit'
                                class='arrow'
                                :color='$style.color'
                                name='arrowdown'
                                :size='36'
                                unit='rpx'
                            />
                        </view> -->
                            <input v-model='email' :placeholder="isBound ?$t('common.inputNewEmail') : $t('common.inputEmail')" placeholderClass='placeholderClass' />
                            <tui-icon
                                v-if='email'
                                class='clear-close'
                                name='close-fill'
                                @click="email = ''"
                            />
                        </view>
                    </view>
                    <view v-if='isBound' class='form-item'>
                        <view class='title'>
                            {{ $t('common.sendToYourEmail') }}
                        </view>
                        <view class='box'>
                            <input v-model='code' :placeholder="$t('common.inputVerifyCode')" placeholderClass='placeholderClass' type='number' />
                            <tui-icon
                                v-if='code'
                                class='clear-close'
                                name='close-fill'
                                @click="code = ''"
                            />
                            <verify-code
                                :area-code='stateAreaItem.code'
                                :biz-type='4'
                                class='btn'
                                mode='mail'
                                :value='email'
                                @receive='receiveCode'
                            />
                        </view>
                    </view>
                    <view v-if='isBound' class='form-item'>
                        <view class='title'>
                            {{ $t('common.sendToYou') }} {{ customerInfo.email }}
                        </view>
                        <view class='box'>
                            <input v-model='codeOld' :placeholder="$t('common.inputVerifyCode')" placeholderClass='placeholderClass' type='number' />
                            <tui-icon
                                v-if='codeOld'
                                class='clear-close'
                                name='close-fill'
                                @click="codeOld = ''"
                            />
                            <verify-code
                                :area-code='stateAreaItem.code'
                                :biz-type='9'
                                class='btn'
                                mode='mail'
                                :value='email'
                                @receive='receiveCodeOld'
                            />
                        </view>
                    </view>

                    <view v-else class='form-item'>
                        <view class='title'>
                            {{ $t('common.emailCodeInput') }}
                        </view>
                        <view class='box'>
                            <input v-model='code' :placeholder="$t('common.inputVerifyCode')" placeholderClass='placeholderClass' type='number' />
                            <tui-icon
                                v-if='code'
                                class='clear-close'
                                name='close-fill'
                                @click="code = ''"
                            />
                            <verify-code
                                :area-code='stateAreaItem.code'
                                :biz-type='4'
                                class='btn'
                                mode='mail'
                                :value='email'
                                @receive='receiveCode'
                            />
                        </view>
                    </view>
                    <view v-if='googleCodeVis' class='form-item'>
                        <view class='title'>
                            {{ $t('common.inputGoogleCode') }}
                        </view>
                        <google-code @getGooleVerifyCode='getGooleVerifyCode' />
                    </view>
                </view>
            </view>
            <!-- 底部按钮 -->
            <button class='footer-btn' @click='onConfirm'>
                {{ $t('common.sure') }}
            </button>
        </view>
		
        <!-- 国家地区弹窗 -->
        <picker-dialog :model-value.sync='stateAreaVisible' @change='changeStateArea'>
            <picker-view-column>
                <view v-for='(item, index) in countryList' :key='index' class='item'>
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
// vuex
import store from '@/store/index.js'
// api
import { bindEmail, changeEmail } from '@/api/user.js'

export default {
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 邮箱
            email: '',
            // 输入的验证码
            code: '',
            codeOld: '',
            // 正确的验证码
            confirmCode: '',
            // 验证码token
            codeToken: '',
            codeTokenOld: '',
            // 全部国家的列表数据
            allCountryList: [],
            // 是否显示国家地区弹窗
            stateAreaVisible: false,
            // 当前选择的国家地区
            stateAreaItem: {},
            // 国家地区是否可编辑
            isEdit: true,
            googleCode: ''
        }
    },
    computed: {
        // 国家地区列表数据
        countryList () { 
            const countryList = store.state.countryList
            const tempArr = []
            countryList.forEach(item => {
                tempArr.push({
                    name: item.name + ' (' + item.countryCode + ')',
                    code: item.countryCode,
                    countryCode: item.code,
                    countryName: item.name
                })
            })
            return tempArr
        },
        isBound () {
            return this.customerInfo?.email
        }
    },
    onLoad () {
        // 初始化
        this.$init().then(() => {
            // 获取国家区号
            this.getCountryListByParentCode()
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('email_view')
    },
    methods: {

        // 获取国家区号
        getCountryListByParentCode () {
            store.dispatch('getCountryListByParentCode').then(res => {
                this.skeletonShow = false
                this.allCountryList = res.data
                const defaultZone = this.wpCompanyInfo?.defaultZone
                const country = this.customerInfo.country
                // 设置默认选中项
                if (country) {
                    res.data.map(elem => {
                        if (elem.code === country) {
                            this.stateAreaItem = {
                                code: elem.countryCode,
                                countryCode: elem.code,
                                countryName: elem.name,
                                name: elem.name + ' (' + elem.countryCode + ')'
                            }
                            this.isEdit = false
                        }
                    })
                } else if (defaultZone) {
                    this.stateAreaItem = {
                        code: defaultZone.country_code,
                        countryCode: defaultZone.code,
                        countryName: defaultZone.name,
                        name: defaultZone.name + ' (' + defaultZone.country_code + ')'
                    }
                } else {
                    this.stateAreaItem = this.countryList[0]
                } 
            }).catch(() => {
                this.skeletonShow = false
            })
        },
		
        // 打开国家地区弹窗
        openStateArea () {
            if (!this.isEdit) return
            this.stateAreaVisible = true
        },
		
        // 改变国家地区
        changeStateArea (value) {
            this.stateAreaItem = this.countryList[value]
        },
		
        // 接收验证码
        receiveCode (value, token) {
            this.confirmCode = value
            this.codeToken = token
        },
        receiveCodeOld (value, token) {
            this.codeTokenOld = token
        },
		
        // 点击确定
        onConfirm () {
            if (!this.email) {
                return uni.showToast({
                    title: this.$t('common.inputEmail'),
                    icon: 'none'
                })
            }
            if (!this.$check.mail(this.email)) {
                return uni.showToast({
                    title: this.$t('common.inputRealEmail'),
                    icon: 'none' 
                })
            }
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
			
            if (this.isBound) {
                if (!this.codeOld) {
                    return uni.showToast({
                        title: this.$t('common.inputVerifyCode'),
                        icon: 'none' 
                    })
                }
                if (!this.codeTokenOld) {
                    return uni.showToast({
                        title: this.$t('common.getVerifyCode'),
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
			
            // 请求参数
            const param = {
                email: this.email,
                verifyCode: this.code,
                sendToken: this.codeToken,
                emailArea: '+' + this.stateAreaItem.code,
                verifyCodeOld: this.codeOld,
                sendTokenOld: this.codeTokenOld,
                googleCode: this.googleCode
            }

            uni.showLoading({
                title: this.$t('common.submiting'),
                mask: true
            })
            // 更换邮箱
            if (this.customerInfo.email) {
                this.changeEmail(param)
            } else {
                // 绑定邮箱
                this.bindEmail(param)
            }
        },
		
        // 绑定邮箱
        bindEmail (param) {
            bindEmail(param).then(() => {
                this.setSuccess()
            }).catch(res => {
                uni.hideLoading()
                this.$refs['modalDialog'].show({
                    content: res.msg
                })
            })
        },
		
        // 更换邮箱
        changeEmail (param) {
            changeEmail(param).then(() => {
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
            uni.hideLoading()
            uni.showToast({
                title: this.customerInfo.email ? this.$t('common.replaceEmailSuccess') : this.$t('common.emailBindSuccess'),
                icon: 'none'
            })
            // 获取用户信息
            store.dispatch('_user/findCustomerInfo')
            setTimeout(() => {
                // 返回上一页
                uni.navigateBack({
                    delta: 1
                })
            }, 1500)
        },
        getGooleVerifyCode (val) {
            this.googleCode = val
        }
    }
}
</script>

<style lang="scss" scoped>
.form-module {
    font-size: 26rpx;
    .form-item {
        @include styles('background', 'contentColor');
        margin-top: 30rpx;
        padding: 0 36rpx;
        .title {
            @include styles('color', 'normalColor');
            padding-top: 20rpx;
        }
    }
    .box {
        @include flexAlign;
        @include styles('border-bottom-color', 'lineColor');
        height: 100rpx;
        border-bottom-width: 1rpx;
        border-bottom-style: solid;
        &:last-of-type {
            border-bottom: none;
        }
        .area {
            @include flexBetweenAlign;
            position: relative;
            height: 90rpx;
            margin-right: 20rpx;
            padding-right: 20rpx;
            &::before {
                @include styles('background-color', 'lineColor');
                position: absolute;
                top: 50%;
                right: 0;
                width: 1px;
                height: 60rpx;
                transform: translateY(-50%);
                content: '';
            }
            span {
                margin-right: 5rpx;
            }
        }
        input {
            flex: 1;
            height: 100%;
            font-size: 28rpx;
        }
        .btn {
            margin-left: 15rpx !important;
        }
    }
}
</style>
