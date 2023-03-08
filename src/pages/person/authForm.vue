<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar :title="$t('cRoute.authForm')" @back='onBack' />
            <!-- 内容区域 -->
            <view class='layout-content'>
                <view v-if='isRegister' class='register-tip'>
                    {{ $t('register.tips2') }}
                </view>
                <view class='conditon-wrap'>
                    <view v-for='(item, index) in elementList' :key='index' class='c-item'>
                        <!-- 输入框 -->
                        <view v-if="item.showType === 'input'" class='box'>
                            <view class='required'>
                                *
                            </view>
                            <view class='name'>
                                {{ item.elementName }}
                            </view>
                            <input
                                v-model='item.elementValue'
                                :placeholder='$t("common.input") + item.elementName'
                                placeholderClass='placeholderClass'
                            />
                            <tui-icon
                                v-if='item.elementValue'
                                class='clear-close'
                                name='close-fill'
                                @click="item.elementValue = ''"
                            />
                        </view>
                        <!-- 日期 -->
                        <view v-if="item.showType === 'date'" class='box' @click='openDatetime'>
                            <view class='required'>
                                *
                            </view>
                            <view class='name'>
                                {{ item.elementName }}
                            </view>
                            <input
                                disabled
                                :placeholder='$t("common.select") + item.elementName'
                                placeholderClass='placeholderClass'
                                :value="item.elementValue ? formatTime(Number(item.elementValue), 'YYYY-MM-DD') : ''"
                            />
                            <tui-icon class='arrow' name='arrowdown' />
                        </view>
                        <!-- 证件 -->
                        <template v-if="item.showType === 'inputGroup'">
                            <view class='box' @click='certificateVisible = true'>
                                <view class='required'>
                                    *
                                </view>
                                <view class='name'>
                                    {{ item.elementName }}
                                </view>
                                <input
                                    disabled
                                    :placeholder="$t('register.chooseCertificateType')"
                                    placeholderClass='placeholderClass'
                                    :value='currentCertificate.name'
                                />
                                <tui-icon class='arrow' name='arrowdown' />
                            </view>
                            <view class='box'>
                                <view class='required'>
                                    *
                                </view>
                                <view class='name'>
                                    {{ $t('register.certificateNo') }}
                                </view>
                                <input
                                    v-model='item.elementValueInputGroup'
                                    :placeholder="$t('register.pleaseEnter') + (currentCertificate.name || '')"
                                    placeholderClass='placeholderClass'
                                />
                            </view>
                        </template>
                        <!-- 图片 -->
                        <view v-if='imgTypeVis(item)' class='uploadBox'>
                            <view class='optionName'>
                                {{ item.elementName }}
                            </view>
                            <image-upload
                                :component-key='index'
                                :default-image="'/static/image/auth/upload.png'"
                                :height='260'
                                :limit='1'
                                :list='item.elementValue ? [item.elementValue] : []'
                                :width='400'
                                @complete='changeImg'
                            />
                        </view>
                    </view>
                </view>
            </view>

            <!-- 底部按钮 -->
            <button class='footer-btn' @click='onSubmit'>
                {{ $t('common.submit') }}
            </button>
        </view>
        <!-- 日历组件 -->
        <calendar ref='calendar' is-fixed :type='1' @change='selectCalendar' />
        <!-- 日期弹窗 -->
        <datetime ref='datetime' :type='2' @confirm='selectDatetime' />
        <!-- 证件类型弹窗 -->
        <picker-dialog :model-value.sync='certificateVisible' @change='changeCertificate'>
            <picker-view-column>
                <view
                    v-for='(item, index) in certificateTypes'
                    :key='index'
                    class='item'
                >
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
// components
import calendar from '@/components/calendar/calendar.vue'
import datetime from '@/components/datetime/datetime'
// api
import { findAllLevelKyc, kycLevelApply, kycApply } from '@/api/user.js'
import { getListByParentCode } from '@/api/base.js'
// util
import { getArrayObj, isEmpty, deepClone } from '@/utils/util.js'

export default {
    components: {
        datetime,
        calendar
    },
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 是否从注册页面跳转进来
            isRegister: false,
            // kyc等级
            levelCode: '',
            // 业务代码
            businessCode: '',
            // 默认选中area
            area: '',
            // 默认选中pathCode
            pathCode: '',
            // kyc列表
            list: [],
            // 页面数据
            elementList: [],
            // 是否显示证件类型弹窗
            certificateVisible: false,
            // 证件类型列表
            certificateTypes: [],
            // 证件类型对应的上传图片项
            cardTypeMap: {
                'identity_card': ['back_identity_card', 'front_identity_card'],
                'passport': ['proof_of_passpord'],
                'drving_license': ['proof_of_drive']
            },
            // 当前选择的证件类型
            currentCertificate: '',
            // 是否有inputGroup
            isInputGroup: false
        }
    },
    onLoad (options) {
        this.isRegister = !!options.isRegister
        this.levelCode = options.levelCode
        this.businessCode = options.businessCode || ''

        // 初始化
        this.$init().then(() => {
            this.getConditon()
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('kyc_perfect_view')
    },
    methods: {
        // 点击返回
        onBack () {
            // 没有开户注销登录
            if (!this.customerInfo.accountList && this.isRegister) {
                store.dispatch('_user/logout').then(() => {
                    uni.reLaunch({
                        url: '/pages/mine/login'
                    })
                })
            } else {
                uni.navigateBack({
                    delta: 1
                })
            }
        },
		
        // 判断指定KYC等级是否要KYC认证
        getConditon () {
            const that = this
            findAllLevelKyc({
                levelCode: this.levelCode
            }).then(res => {
                that.skeletonShow = false
                that.list = res.data
                // 只有一个路径的时候默认选中
                if (res.data.length === 1) {
                    that.area = res.data[0].pathName
                    that.pathCode = res.data[0].pathCode
                    that.elementList = getArrayObj(that.list, 'pathCode', that.pathCode).elementList
                    
                    // 处理证件类型数据回填
                    that.handleElementList()
                }
            }).catch(() => {
                that.skeletonShow = false
            })
        },
		
        // 处理证件类型数据回填
        handleElementList () {
            this.elementList.forEach(el => {
                // 如果是 inputGroup 单独处理
                if (el.showType === 'inputGroup') {
                    this.isInputGroup = true
                    this.getInputGroupData().then(res => {
                        this.certificateTypes = res
                        this.currentCertificate = res.find(item => item.code === el.elementCodeInputGroup) || {}
                    })
                }
            })
        },

        // 获取证件类型
        getInputGroupData () {
            return getListByParentCode({ parentCode: 'id_card_type' }).then(res => {
                this.certificateTypes = res.data
                return res.data
            })
        },

        // 判断image类型是否显示
        imgTypeVis (item) {
            if (item.showType !== 'image') return false
            // 判断是否在证件类型关联的元素里面
            const hasIdCardType = Object.values(this.cardTypeMap).flat().indexOf(item.elementCode) === -1
            if (this.isInputGroup && !hasIdCardType) {
                const cardList = this.cardTypeMap[this.currentCertificate.code] || []
                const isExists = cardList.includes(item.elementCode)
                return isExists
            } else {
                return true
            }
        },

        // 改变上传的图片
        changeImg (data) {
            const imageList = data.imageList
            this.elementList[data.componentKey].elementValue = imageList.length > 0 ? imageList[0] : ''
        },

        // 改变证件类型
        changeCertificate (value) {
            const chooseObj = this.certificateTypes[value]
            this.currentCertificate = chooseObj
            this.elementList.find(el => el.elementCode === 'id_card_type').elementValueInputGroup = ''
        },

        // 打开日期弹窗
        openDatetime () {
            this.$refs['calendar'].show()
        },

        // 选择日期
        selectDatetime (e) {
            const item = this.elementList.find(el => el.showType === 'date')
            item.elementValue = (new Date(e.result).getTime()).toString()
        },

        // 选择日期
        selectCalendar (e) {
            const item = this.elementList.find(el => el.showType === 'date')
            item.elementValue = (new Date(e.result).getTime()).toString()
        },

        // 提交
        onSubmit () {
            // 参数验证
            const elementList = deepClone(this.elementList)
            const arr = []
    
            for (let i = 0; i < elementList.length; i++) {
                const item = elementList[i]
                // 处理input
                if (item.showType === 'input') {
                    // 验证格式是否确定
                    if (item.extend) {
                        const valueReg = new RegExp(item.extend)
                        if (!valueReg.test(item.elementValue)) {
                            return uni.showToast({
                                title: item.elementName + ' ' + this.$t('register.incorrectlyFormed'),
                                icon: 'none'
                            })
                        }
                    }
                } 
                // 处理inputGroup
                if (item.showType === 'inputGroup') {
                    arr.push({
                        elementCode: this.currentCertificate.code,
                        elementValue: item.elementValueInputGroup
                    })
                } else if (item.showType === 'image') {
                    // 处理image
                    const cardList = this.cardTypeMap[this.currentCertificate.code] || []
                    const isExists = !this.isInputGroup || cardList.includes(item.elementCode)
                    // 判断是否在证件类型关联的元素里面
                    const hasIdCardType = Object.values(this.cardTypeMap).flat().indexOf(item.elementCode) === -1
                    if (isExists || hasIdCardType) {
                        arr.push({
                            elementCode: item.elementCode,
                            elementValue: item.elementValue
                        })
                    }
                } else {
                    arr.push({
                        elementCode: item.elementCode,
                        elementValue: item.elementValue
                    })
                }
            }
			
            // 验证是否有填写
            for (let i = 0; i < arr.length; i++) {
                const item = arr[i]
                if (!item.elementCode || !item.elementValue) {
                    return uni.showToast({
                        title: this.$t('auth.allAuthPlease'),
                        icon: 'none'
                    })
                }
            }
			
            // 提交kyc数据
            const params = {
                levelCode: this.levelCode,
                elementList: arr
            }
            this.launchKyc(params)
        },

        // 提交kyc数据
        launchKyc (params) {
            uni.showLoading({
                title: this.$t('common.submiting'),
                mask: true
            })
            // 具体业务的kyc验证
            if (!isEmpty(this.businessCode)) {
                params.businessCode = this.businessCode
                kycApply(params).then(() => {
                    this.successCallback()
                }).catch(res => {
                    this.failCallback(res)
                })
            } else {
                params.pathCode = this.pathCode
                kycLevelApply(params).then(() => {
                    this.successCallback()
                }).catch(res => {
                    this.failCallback(res)
                })
            }
        },

        // 提交成功反馈
        successCallback () {
            uni.hideLoading()
            uni.redirectTo({
                url: '/pages/person/authResult'
            })
            // 添加应用内事件
            this.$addAppsEvent('complete_kyc')
        },

        // 提交失败反馈
        failCallback (res) {
            uni.hideLoading()
            this.$refs['modalDialog'].show({
                content: res.msg
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.register-tip {
	@include styles('color',' color');
	padding-top: 20rpx;
	text-align: center;
	font-size: 26rpx;
}
.layout-content{
	@include styles('background-color', 'contentColor');
	.conditon-wrap {
		@include styles('background-color', 'contentColor');
		margin-top: 20rpx;
		margin-bottom: 40rpx;
		.c-item {
			.box {
				@include flexAlign;
				@include styles('color', 'color');
				@include styles('border-bottom-color', 'lineColor');
				border-bottom-width: 1rpx;
				border-bottom-style: solid;
				padding: 22rpx 32rpx;
				.required {
					@include styles('color', 'warn');
					margin-top: 10rpx;
					margin-right: 10rpx;
					font-size: 30rpx;
				}
				.name {
					width: 160rpx;
				}
				input {
					flex: 1;
					padding-left: 60rpx;
				}
				.arrow {
					@include styles('color', 'minorColor');
					font-size: 40rpx !important;
				}
			}
			.uploadBox {
				display: flex;
				flex-direction: column;
				align-items: center;
				padding: 50rpx 0;
				@include styles('border-bottom-color', 'lineColor');
				border-bottom-width: 1rpx;
				border-bottom-style: solid;
				.optionName {
					margin-bottom: 30rpx;
					font-size: 40rpx;
				}
               
			}
             &:last-child{
                .uploadBox,.box{
                    border: none;
                }
            }
		}
	}
}
.footer-btn {
	@include styles('background-color', 'contentColor');
}
</style>
