<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container'>
            <!-- 头部导航栏 -->
            <nav-bar :custom-back='true' :title="$t('cRoute.securitySetting')" @back='back' />   
            <!-- 内容区域 -->
            <view class='layout-content'> 
                <!-- 导航列表 -->
                <view class='nav-list'>
                    <view class='item' @click="onNav('/pages/mine/bindMobile')">
                        <span class='name'>
                            {{ $t('common.mobile') }}    
                        </span>
                        <span :class="['state', customerInfo.phone ? 'yet' : 'none']">
                            {{ customerInfo.phone ? $t('common.change') : $t('common.noneBind') }}
                        </span>
                        <tui-icon class='arrow' name='arrowright' />
                    </view>
                    <view class='item' @click="onNav('/pages/mine/bindEmail')">
                        <span class='name'>
                            {{ $t('common.email') }}
                        </span>
                        <span :class="['state', customerInfo.email ? 'yet' : 'none']">
                            {{ customerInfo.email ? $t('common.change') : $t('common.noneBind') }}
                        </span>
                        <tui-icon class='arrow' name='arrowright' />
                    </view>
                    <view class='item' @click="onNav('/pages/mine/setLoginPwd?isBack=true')">
                        <span class='name'>
                            {{ $t('login.loginPwd') }}
                        </span>
                        <span :class="['state', Number(customerInfo.loginPassStatus) === 2 ? 'yet' : 'none']">
                            {{ Number(customerInfo.loginPassStatus) === 2 ? $t('common.change') : $t('common.noSet') }}
                        </span>
                        <tui-icon class='arrow' name='arrowright' />
                    </view>
                    <view class='item' @click="onNav('/pages/mine/setFundPwd?isBack=true')">
                        <span class='name'>
                            {{ $t('common.fundPwd') }}
                        </span>
                        <span :class="['state', Number(customerInfo.assertPassStatus) === 2 ? 'yet' : 'none']">
                            {{ Number(customerInfo.assertPassStatus) === 2 ? $t('common.change') : $t('common.noSet') }}
                        </span>
                        <tui-icon class='arrow' name='arrowright' />
                    </view>
                    <view class='item' @click="onNav('/pages/person/bankList')">
                        <span class='name'>
                            {{ $t('bank.bankList') }}
                        </span>
                        <tui-icon class='arrow' name='arrowright' />
                    </view>
                    <view class='item' @click="onNav('/pages/person/walletAddress')">
                        <span class='name'>
                            {{ $t('withdraw.withdrawLink') }}
                        </span>
                        <tui-icon class='arrow' name='arrowright' />
                    </view>
                    
                    <view class='item' @click="onNav('/pages/googleMFA/status')">
                        <span class='name'>
                            {{ $t('mfa.routeTitile') }}
                        </span>
                        <span :class="['state', Number(customerInfo.googleId) > 0 ? 'yet' : 'none']">
                            {{ customerInfo.googleId>0 ? $t("mfa.status1"):$t("mfa.status0") }}
                        </span>
                        <tui-icon class='arrow' name='arrowright' />
                    </view>
                    <view class='item' @click='handleDestroy'>
                        <span class='name'>
                            {{ $t('setting.destroyAccount') }}
                        </span>
                        <tui-icon class='arrow' name='arrowright' />
                    </view>
                </view>
            </view>
        </view>
		
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>
import store from '@/store'
import { destroyAccountApply } from '@/api/user'

export default {
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true
        }
    },
    onLoad () {
        // 初始化
        this.$init().then(() => {
            this.skeletonShow = false
            // 获取用户信息
            store.dispatch('_user/findCustomerInfo', false)
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('setting_view')
    },
    methods: {
        // 点击导航选项
        onNav (url) {
            this.$method.goPage(url)
        },
		
        // 点击返回
        back () {
            uni.switchTab({
                url: '/pages/mine/index'
            })
        },
		
        // 点击销户申请
        handleDestroy () {
            if (this.customerInfo.status !== 1) {
                this.$refs['modalDialog'].show({
                    content: this.$t('setting.destroySuccessTip'),
                    confirmText: this.$t('setting.destroySuccessConfirm')
                })
            } else {
                this.$refs['modalDialog'].show({
                    content: this.$t('setting.destroyTip'),
                    showCancel: true
                }).then(() => {
                    destroyAccountApply({
                        remark: this.$t('setting.customerApply')
                    }).then(res => {
                        this.$refs['modalDialog'].show({
                            content: this.$t('setting.destroySuccessTip'),
                            confirmText: this.$t('setting.destroySuccessConfirm')
                        })
                        // 获取用户信息
                        store.dispatch('_user/findCustomerInfo', false)
                    }).catch(err => {
                        this.$refs['modalDialog'].show({
                            content: err.msg
                        })
                    })
                }).catch(() => {})
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.nav-list {
    margin-top: 10rpx;
    .item {
        @include flexAlign;
        @include styles('background', 'contentColor');
        height: 110rpx;
        margin-bottom: 10rpx;
        padding: 0 30rpx;
        .name {
            @include styles('color', 'color');
            flex: 1;
            font-weight: bold;
            font-size: 32rpx;
        }
        .state {
            @include styles('color', 'minorColor');
            font-weight: bold;
            font-size: 28rpx;
            &.yet {
                @include styles('color', 'minorColor');
            }
            &.none {
                @include styles('color', 'warn');
            }
        }
        .arrow {
            @include styles('color', 'minorColor');
            font-size: 45rpx !important;
        }
    }
}
</style>
