<template>
    <view class='verify-code'>
        <view v-if='count > 0' class='tip'>
            {{ count }}s
        </view>
        <view v-else class='get' @click='getCodeMethod'>
            {{ getCodeText }}
        </view>
    </view>
</template>

<script>
import store from '@/store'
import { getArrayObj, throttle } from '@/utils/util'
// api
import { checkUserStatus } from '@/api/user.js'
import { verifyCodeSend } from '@/api/base.js'
export default {
    props: {
        // 手机号或邮箱
        value: {
            type: String,
            default: ''
        },
        // 发送类型 mobile:手机号 mail:邮箱 
        mode: {
            type: String,
            default: 'mobile'
        },
        // 验证码业务类型
        bizType: {
            type: Number,
            default: 0
        },
        // 选择的区号
        areaCode: {
            type: String,
            default: ''
        },
        // 国家
        country: {
            type: String,
            default: ''
        },
        // 是否需要检测手机号邮箱是否存在
        checkUser: {
            type: Boolean,
            default: true
        }
    },
    data () {
        return {
            // 0:SMS_COMMON_VERIFICATION_CODE-短信通用验证码；
            // 1:SMS_LOGIN_VERIFICATION_CODE-短信登录验证码；
            // 2:SMS_REGISTER_VERIFICATION_CODE-短信注册验证码
            // 3:SMS_PASSWORD_VERIFICATION_CODE-短信忘记密码验证码
            // 4:EMAIL_COMMON_VERIFICATION_CODE-邮件通用验证码；
            // 5:EMAIL_LOGIN_VERIFICATION_CODE-邮件登录验证码；
            // 6:EMAIL_REGISTER_VERIFICATION_CODE-邮件注册验证码
            // 7:EMAIL_PASSWORD_VERIFICATION_CODE-邮件忘记密码验证码
            // 8: SMS_LOGINED_VERIFICATION_CODE 已登录用户获取手机验证码
            // 9: EMAIL_LOGINED_VERIFICATION_CODE  已登录用户获取邮箱验证码
            bizTypeList: [
                'SMS_COMMON_VERIFICATION_CODE', 
                'SMS_LOGIN_VERIFICATION_CODE', 
                'SMS_REGISTER_VERIFICATION_CODE', 
                'SMS_PASSWORD_VERIFICATION_CODE',
                'EMAIL_COMMON_VERIFICATION_CODE',
                'EMAIL_LOGIN_VERIFICATION_CODE',
                'EMAIL_REGISTER_VERIFICATION_CODE',
                'EMAIL_PASSWORD_VERIFICATION_CODE',
                'SMS_LOGINED_VERIFICATION_CODE',
                'EMAIL_LOGINED_VERIFICATION_CODE'
            ],
            // 接口返回的区号
            phoneArea: '',
            // 接口返回的国家
            countryArea: '',
            // 当前倒计时时间
            count: 0,
            // 定时器
            timer: null,
            // 是否可发送验证码
            isSend: true,
            // 点击获取验证码方法
            getCodeMethod: throttle(this.clickGet, 1500),
            getCodeText: this.$t('login.getVerifyCode')
        }
    },
    computed: {
        // 国家列表
        countryList () {
            return store.state.countryList
        },
        // 手机正则表达式
        mobileReg () {
            const country = this.country || this.countryArea || this.customerInfo?.country
            return getArrayObj(this.countryList, 'code', country).extend || ''
        }
    },
    methods: {
        // 清除状态
        clear () {
            clearInterval(this.timer)
            this.count = 0
        },
		
        // 点击获取验证码按钮
        clickGet () {
            if ([8, 9].includes(Number(this.bizType))) {
                // 验证手机号或邮箱
                let isGet = true
                let tip = ''
                switch (this.mode) {
                    case 'mobile':
                        // 未绑定手机
                        if (!this.value) {
                            isGet = false
                            tip = this.$t('common.noBindPhone')
                        }
                        break
                    case 'mail':
                        // 未绑定邮箱
                        if (!this.value) {
                            isGet = false
                            tip = this.$t('common.noBindEmail')
                        }
                        break
                }
				
                // 验证不通过
                if (!isGet) {
                    return uni.showToast({
                        title: tip,
                        icon: 'none'
                    })
                } 
                // 发送验证码
                this.verifyCodeSend()
            } else {
                // 验证手机号或邮箱
                let isGet = true
                let tip = ''
                switch (this.mode) {
                    case 'mobile':
                        // 手机号不能为空
                        if (!this.value) {
                            isGet = false
                            tip = this.$t('common.inputPhone')
                        }
                        // 验证手机号格式
                        if (this.mobileReg) {
                            if (!RegExp(this.mobileReg).test(this.value)) {
                                isGet = false
                                tip = this.$t('common.inputRealPhone') 
                            }
                        }
                        break
                    case 'mail':
                        // 邮箱不能为空
                        if (!this.value) {
                            isGet = false
                            tip = this.$t('common.inputEmail')
                        }
                        // 验证邮箱格式
                        if (!this.$check.mail(this.value)) {
                            isGet = false
                            tip = this.$t('common.inputRealEmail')
                        }
                        break
                }
				
                // 验证不通过
                if (!isGet) {
                    return uni.showToast({
                        title: tip,
                        icon: 'none'
                    })
                } 
				
                // 检测客户是否存在并获取区号
                if (this.checkUser) {
                    this.checkUserStatus()
                } else {
                    this.verifyCodeSend()
                }
            }
        },

        // 倒计时
        countDown () {
            this.count = 60
            this.timer = setInterval(() => {
                this.count--
                if (this.count === 0) {
                    clearInterval(this.timer)
                    this.getCodeText = this.$t('register.reGet')
                }
            }, 1000)
        },
		
        // 检测客户是否存在并获取区号
        checkUserStatus () {
            if (!this.isSend) return
            this.isSend = false
            const params = {
                type: this.mode === 'mail' ? 1 : 2,
                loginName: this.value
            }
            checkUserStatus(params).then(res => {
                const { data } = res
                this.isSend = true
                // 验证手机号或邮箱是否加入黑名单
                if (data.status === -1) {
                    return uni.showToast({
                        title: this.$t('c.userDisable'),
                        icon: 'none'
                    })
                } 
                // 注册验证手机号或邮箱是否存在
                if ([2, 6].includes(this.bizType) && data.status === 1) {
                    return uni.showToast({
                        title: this.$t(this.mode === 'mail' ? 'common.existEmail' : 'common.existPhone'),
                        icon: 'none'
                    })
                }
                // 绑定手机或邮箱检测是否存在
                if ([0, 4].includes(this.bizType) && data.status === 1) {
                    return uni.showToast({
                        title: this.$t(this.mode === 'mail' ? 'common.emailBinded' : 'common.phoneBinded'),
                        icon: 'none'
                    })
                }
                // 登录、忘记密码验证手机号或邮箱不存在
                if ([1, 3, 5, 7].includes(this.bizType) && data.status === 2) {
                    return uni.showToast({
                        title: this.$t(this.mode === 'mail' ? 'common.noEmail' : 'common.noPhone'),
                        icon: 'none'
                    })
                }
				
                // 验证通过发送验证码
                this.phoneArea = data.phoneArea || ''
                this.countryArea = data.country || ''
                this.verifyCodeSend()
            }).catch(res => {
                this.isSend = true
                uni.showToast({
                    title: res.msg,
                    icon: 'none'
                })
            })
        },
		
        // 发起获取验证码请求
        verifyCodeSend () {
            const params = {
                bizType: this.bizTypeList[this.bizType],
                toUser: [8, 9].includes(Number(this.bizType)) ? '' : this.getToUser()
            }
            params.country = this.countryArea || this.country 
            verifyCodeSend(params).then(res => {
                const { data } = res
                uni.showToast({
                    title: this.$t('common.verifySended'),
                    icon: 'none'
                })
                this.$emit('receive', data.code, data.token, this.phoneArea)
                // 倒计时
                this.countDown()
            }).catch(res => {
                uni.showToast({
                    title: res.msg,
                    icon: 'none'
                })
            })
        },
		
        // 获取toUser
        getToUser () {
            // 邮箱
            if (this.mode === 'mail') {
                return this.value
            } else {
                // 手机号
                let result = ''
                if (this.areaCode) {
                    result = this.areaCode
                } else {
                    result = this.phoneArea || this.customerInfo.phoneArea
                }
                return result ? (result + ' ' + this.value) : this.value
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.verify-code {
	margin-left: 15rpx;
	font-size: 26rpx;
	.get {
		@include styles('color', 'primary');
	}
	.tip {
		@include styles('color', 'minorColor');
	}
}
</style>
