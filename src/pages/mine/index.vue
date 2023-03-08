<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>  
            <!-- 头部导航栏 -->
            <nav-bar :back-show='false' :show-title-bar='false' />
            <!-- 切换真实模拟 -->
            <top-nav ref='topNavRef' :show-register-btn='false' show-switch-btn show-theme-icon />

            <!-- 内容区域 --> 
            <view class='layout-content'>
                <view class='account-module'>
                    <!-- 已登录 -->
                    <view v-if='customerInfo' class='has-login'>    
                        <view class='personNo'>
                            <image class='faceImg' src='/static/image/mine/face.png' />
                            <view class='customerNo'>
                                <p class='text1'>     
                                    Hi,
                                    <span v-if='customerInfo.phone'>
                                        {{ customerInfo.phone }}
                                    </span>
                                    <span v-else>
                                        {{ customerInfo.email }} 
                                    </span>
                                </p>
                                <p class='text2'>
                                    ID: {{ customerInfo.customerNo }}
                                    <i class='iconfont icon_fuzhi copy-btn' @click='onCopy(customerInfo.customerNo)'></i>
                                </p>
                            </view>
                            <view v-if='isDepositWithdraw' class='handle'>
                                <button class='btn state-2' @click='goDeposit'>
                                    {{ $t('trade.desposit') }}
                                </button>
                                <button class='btn state-1' @click='goWithdraw'>
                                    {{ $t('trade.withdraw') }}
                                </button>
                            </view>
                        </view>
                    </view>
					
                    <!-- 未登录 -->
                    <view v-if='!customerInfo' class='not-login'>
                        <view class='head'>
                            <image src='/static/image/mine/face.png' />
                        </view>
                        <view class='handle'>
                            <view class='btn state-1' @click="onNav('/pages/mine/login?module=mine', false)">
                                {{ $t('login.loginBtn') }}
                            </view>
                            <view class='btn state-2' @click="onNav('/pages/mine/register?module=mine', false)">
                                {{ $t('register.registerBtn') }}
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 导航列表 -->
                <view class='nav-list'>
                    <view class='item' @click="onNav('/pages/mine/msg')">
                        <image class='icon' src='/static/image/mine/message.png?v=1' />
                        <span class='title'>
                            {{ $t('cRoute.msg') }}
                        </span>
                        <tui-icon class='arrow' name='arrowright' />
                    </view>
                    <view v-if='isReal' class='item' @click="onNav('/pages/person/authentication')">
                        <image class='icon' src='/static/image/mine/material.png?v=1' />
                        <span class='title'>
                            {{ $t('cRoute.regKyc') }}
                        </span>
                        <tui-icon class='arrow' name='arrowright' />
                    </view>
                    <view v-if='isReal' class='item' @click="onNav('/pages/mine/setting')">
                        <image class='icon' src='/static/image/mine/setting.png?v=1' />
                        <span class='title'>
                            {{ $t('cRoute.securitySetting') }}
                        </span>
                        <tui-icon class='arrow' name='arrowright' />
                    </view>
                    <view class='item' @click="onNav('/pages/mine/common', false)">
                        <image class='icon' src='/static/image/mine/common.png?v=1' />
                        <span class='title'>
                            {{ $t('cRoute.commonSetting') }}
                        </span>
                        <tui-icon class='arrow' name='arrowright' />
                    </view>
                    <view class='item' @click='openLang'>
                        <image class='icon' src='/static/image/mine/lang.png?v=1' />
                        <span class='title'>
                            {{ $t('common.lang') }}
                        </span>
                        <view class='value'>
                            {{ langItem.name }}
                        </view>
                        <tui-icon class='arrow' name='arrowright' />
                    </view>
                    <view v-if='customerInfo' class='item logout' @click='handleLogout'>
                        <span class='title'>
                            {{ $t('setting.logout') }}
                        </span>
                    </view>
                </view>
                <powered-by />
            </view>
            <!-- 活动倒计时 -->
            <activity-countdown @handleSwitch='handleSwitch' />
        </view>
		
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />

        <!-- 多语言弹窗 -->
        <tui-bottom-popup background-color='transparent' :height='0' :show='langVisible' @close='closeLang'>
            <view class='popup-content'>
                <tui-icon class='close' name='shut' @click='closeLang' />
                <view class='popup-title'>
                    {{ $t('common.lang') }}
                </view>
                <scroll-view class='popup-list' scroll-y>
                    <view v-for='(item, index) in supportLanguages' :key='index' class='item' @click='switchLang(item)'>
                        <span class='label'>
                            {{ item.name }}
                        </span>
                        <tui-icon v-if='item.val === currentLang' :color='$style.primary' name='check' :size='42' unit='rpx' />
                    </view>
                </scroll-view>
            </view>
        </tui-bottom-popup>
    </view>
</template>

<script>
import store from '@/store'	
import { getToken } from '@/utils/util' 
import { changeLang } from '@/api/base'
import activityCountdown from '@/components/modules/activity-countdown.vue'

export default {
    components: { activityCountdown },
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 是否显示多语言弹窗
            langVisible: false
        }
    },
    onLoad () {
        this.$init().then(() => {
            this.skeletonShow = false
        }).catch(() => {
            this.skeletonShow = false
        })
    },
    onShow () {
        // 添加应用内事件
        this.$addAppsEvent('mine_view')
        // 获取cats2系统维护配置
        store.dispatch('_global/getConfigSystem')

        if (!this.skeletonShow) {
            // 获取活动相关
            store.dispatch('_activity/getEnableAct')
            store.dispatch('_activity/getActFinishStatus')
        }
    },
    computed: {
        // 当前玩法
        tradeType () {
            const plans = store.state._base.plans
            const stopTrade = plans.find(el => el.tradeType === 5)
            if (stopTrade) {
                return 5
            } else {
                return Number(plans[0].tradeType)
            }
        },
        // 账户列表
        accountList () {
            const accountList = this.customerInfo?.accountList
            return accountList ? accountList.filter(el => Number(el.tradeType) === this.tradeType) : []
        },
        // 语言列表
        supportLanguages () {
            return store.state.supportLanguages
        },
        // 当前选择的语言项
        langItem () {
            return this.supportLanguages.find(el => el.val === this.currentLang) || {}
        },
        // 是否真实账户
        isReal () {
            return this.customerInfo?.companyType === 'real'
        },
        // 是否显示出入金按钮
        isDepositWithdraw () {
            return this.$config.mineShowCash && this.isReal
        },
    },
    methods: {
        // 点击导航项
        onNav (url, isAuth) {
            this.$method.goPage(url, isAuth)
        },
		
        // 点击复制
        onCopy (text) {
            uni.setClipboardData({
                data: text,
                showToast: false,
                success: () => {
                    uni.showToast({
                        icon: 'none',
                        title: this.$t('common.copySuccess')
                    })
                }
            })
        },
		
        // 跳转到充值页面
        goDeposit () {
            this.$method.goDeposit(this.tradeType)
            // 添加应用内事件
            this.$addAppsEvent('mine_deposit_click')
        },
			
        // 跳转到提现页面
        goWithdraw () {
            this.$method.goWithdraw(this.accountList[0])
            // 添加应用内事件
            this.$addAppsEvent('mine_withdraw_click')
        },

        // 打开多语言弹窗
        openLang () {
            this.langVisible = true
        },
		
        // 关闭多语言弹窗
        closeLang () {
            this.langVisible = false
        },

        // 切换语言
        async switchLang (item) {
            if (item.val !== this.currentLang) {
                uni.showLoading({
                    title: this.$t('common.loading'),
                    mask: true
                })
                const token = getToken()
                // api请求
                if (token) changeLang(item.val)
                // 设置当前语言
                store.commit('_global/setLang', item.val)
                // 重新请求wp配置数据
                store.commit('_base/UPDATE_inited', false)
				
                // 关闭弹窗并提示
                this.langVisible = false
                uni.hideLoading()
                setTimeout(() => {
                    this.$toast(this.$t('common.switchAccountSuccess'))
                }, 500)
				
                // 关闭所有页面跳转到当前页面
                uni.reLaunch({
                    url: '/pages/mine/index'
                })
            } else {
                this.langVisible = false
            }
        },

        // 点击退出登录
        async handleLogout () {
            this.$refs['modalDialog'].show({
                content: this.$t('setting.logoutConfirm'),
                showCancel: true
            }).then(async () => {
                await store.dispatch('_user/logout').then(() => {
                    // 关闭所有页面跳转到登录页面
                    uni.reLaunch({
                        url: '/pages/mine/login'
                    })
                })
            }).catch(() => {})
        },
        handleSwitch () {
            this.$refs.topNavRef.goDeposit()
        }
    }
}
</script>

<style lang="scss" scoped>
.account-module {
	@include styles('background-color', 'contentColor');
	.handle {
	    @include flexCenter;
	    margin-top: 40rpx;
	    .btn {
	        @include flexAll;
	        width: 300rpx;
	        height: 84rpx;
			line-height: 1;
	        margin: 0 20rpx;
	        font-size: 30rpx;
			font-weight: bold;
	        border-radius: 14rpx;
			&.state-1 {
				@include styles('background-color', 'primaryAssistColor');
				@include styles('color', 'color');
			}
			&.state-2 {
				@include styles('background-color', 'primary');
				color: #fff;
			}
	    }
	}
}
.has-login {
	padding: 40rpx 0 60rpx;
    .personNo {
        position: relative;
        text-align: center;
        .faceImg {
            display: block;
            width: 160rpx;
            height: 160rpx;
            margin: 0 auto;
            border-radius: 50%;
        }
        .customerNo {
            display: inline-block;
            padding-top: 24rpx;
            font-size: 32rpx;
            .text1 {
                margin-bottom: 6rpx;
                font-weight: bold;
                font-size: 48rpx;
            }
            .text2 {
                color: var(--minorColor);
                font-size: 28rpx;
                .copy-btn {
                    margin-left: 10rpx;
                    font-size: 22rpx;
                }
            }
        }
        .arrowIcon {
            color: var(--minorColor);
            vertical-align: 0;
        }
        .status {
            display: inline-block;
            height: rem(40px);
            margin-top: 3px;
            padding: 0 rem(20px) 0 rem(6px);
            color: var(--color);
            font-size: rem(20px);
            line-height: rem(40px);
            background: var(--bgColor);
            border-radius: rem(20px);
            &.unverified {
                color: var(--minorColor);
            }
            &.check {
                color: var(--primary);
                background: var(--primaryAssistColor);
            }
            &.success {
                color: #FF9E00;
                background: rgba(255, 158, 0, 0.08);
            }
            &.fail {
                color: var(--fallColor);
                background: rgba(239, 83, 83, 0.08);
            }
            &.custom {
                color: var(--success);
                background: rgba(38, 166, 154, 0.08);
            }
            .icon {
                margin-right: rem(12px);
            }
        }
    }
}
.not-login {
	padding: 40rpx 0 60rpx;
    .head {
        @include flexCenter;
        image {
            width: 120rpx;
            height: 120rpx;
        }
    }
}
.nav-list {
    margin-top: 10rpx;
    .item {
        @include flexAlign;
        @include styles('background', 'contentColor');
        height: 110rpx;
        margin-bottom: 10rpx;
        padding: 0 30rpx;
        &.logout {
            margin: 30rpx 0;
            text-align: center;
        }
        .icon {
            width: 40rpx;
            height: 40rpx;
            margin-right: 20rpx;
            margin-left: 10rpx;
        }
        .title {
            @include styles('color', 'color');
            flex: 1;
			line-height: 1;
            font-weight: bold;
            font-size: 30rpx;
        }
        .arrow {
            @include styles('color', 'minorColor');
            font-size: 45rpx !important;
        }
    }
}
.popup-content {
    @include styles('background', 'contentColor');
	position: relative;
	::v-deep {
		.close {
			@include styles('color', 'color');
			font-size: 52rpx !important;
			font-weight: bold;
			position: absolute;
			top: 30rpx;
			right: 25rpx;
		}
	}
    .popup-title {
        @include flexAlign;
        @include styles('color', 'color');
        height: 120rpx;
        padding: 0 30rpx;
        font-weight: bold;
        font-size: 40rpx;
    }
    .popup-list {
        height: 75vh;
		padding: 0 30rpx;
        .item {
            @include styles('background', 'assistColor');
            @include flexBetweenAlign;
            height: 120rpx;
            padding: 0 30rpx;
			margin-bottom: 20rpx;
			border-radius: 10rpx;
            .label {
                @include styles('color', 'color');
                font-size: 32rpx;
            }
            .img {
                width: 72rpx;
                height: 72rpx;
            }
        }
    }
    .color-list {
        height: 75vh;
        padding: 0 30rpx 30rpx;
        .item {
            @include flexAlign;
            @include styles('background-color', 'contentColor');
            @include styles('color', 'normalColor');
            height: 130rpx;
            margin-top: 12rpx;
            padding: 0 25rpx;
            font-size: 32rpx;
            border-radius: 10rpx;
        }
        .item-left {
            flex: 1;
            margin-left: 10rpx;
            label {
                display: inline-flex;
                align-items: center;
                margin-right: 50rpx;
                .color-1 {
                    color: #26A69A;
                    font-size: 45rpx;
                }
                .color-2 {
                    color: #EF5353;
                    font-size: 45rpx;
                }
            }
        }
    }
}
</style>
