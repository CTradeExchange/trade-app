<template>
    <view>
        <view class='top-nav'>
            <view class='logo'>
                <image
                    mode='aspectFit'
                    :src="`/static/image/home/${currentTheme === 'light' ? 'logo-white.png?v=1': 'logo.png?v=1'}`"
                />
            </view>
            <template v-if='showBtn'>
                <view v-if='showThemeIcon' class='mode' @click='switchTheme'>
                    <image
                        mode='aspectFit'
                        :src="`/static/image/icon/${ isNight ? 'sun.png': 'moon.png'}`"
                    />
                </view>
                <template v-if='customerInfo'>
                    <!-- 多玩法真实模拟切换 -->
                    <template v-if='!showFullNetAsset || showSwitchBtn'>
                        <view class='btn' :class="{ 'demo': customerInfo.companyType === 'demo' }" @click='onToggle'>
                            <span>{{ customerInfo.companyType === 'real' ? $t('mockAccount.real') : $t('mockAccount.demo') }}</span>
                            <tui-icon
                                v-if='customerInfo.associationCompanyId'
                                class='arrow-down'
                                color='#fff'
                                name='turningdown'
                                :size='30'
                                unit='rpx'
                            />
                        </view>
                    </template>
                    <!-- 全仓单玩法真实模拟切换 -->
                    <template v-else>
                        <view class='full-assets' @click='onToggle'>
                            <view class='name'>
                                <!-- <em :class="['riskLevel', 'riskLevel' + userAccount.riskStatus]"></em> -->
                                <span :class="[customerInfo.companyType === 'real' ? 'real' : 'demo']">
                                    {{ customerInfo.companyType === 'real' ? $t('mockAccount.realNet') : $t('mockAccount.demoNet') }}
                                </span>
                            </view>
                            <view class='amount'>
                                <span>${{ userAccount.netWorth || '--' }}</span>
                                <tui-icon v-if='customerInfo.associationCompanyId' class='arrow' name='turningdown' />
                            </view>
                        </view>
                    </template>
                </template>
                <template v-if='!customerInfo'>
                    <view v-if='showRegisterBtn' class='btn' @click='goRegister'>
                        <span>{{ $t('register.registerBtn') }}</span>
                    </view>
                </template>
            </template>
        </view>
       
        <!-- 下拉菜单 -->
        <tui-top-dropdown 
            background-color='transparent' 
            :show='isAccountEnv' 
            :translatey='translatey' 
            @close='onToggle'
        >
            <view class='account-sheet'>
                <view
                    class='account-type'
                    :class="{ 'active': customerInfo.companyType === 'real' }"
                    @click='onSwitchAccount("real")'
                >
                    <view class='radio' />
                    <span>{{ $t('mockAccount.realAccount') }}</span>
                </view>
                <view
                    class='account-type'
                    :class="{ 'active': customerInfo.companyType === 'demo' }"
                    @click='onSwitchAccount("demo")'
                >
                    <view class='radio' />
                    <text>{{ $t('mockAccount.demoAccount') }}</text>
                </view>
                <button class='account-btn' @click='goDeposit'>
                    {{ $t('trade.desposit') }}
                </button>
            </view>
        </tui-top-dropdown>
		
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
    </view>
</template>

<script>
import store from '@/store/index.js'
import { localGetObj, localSetObj } from '@/utils/util.js' 
import { handleSwitchAccount } from '@/utils/method'

export default {
    props: {
        // 是否显示主题切换图标
        showThemeIcon: {
            type: Boolean,
            default: false
        }, 
        // 是否显示真实模拟切换按钮
        showSwitchBtn: {
            type: Boolean,
            default: false
        },
        // 是否显示注册按钮
        showRegisterBtn: {
            type: Boolean,
            default: true
        }
    },
    data () {
        return {
            // 是否正在切换中
            isSwitching: false
        }
    },
    computed: {
        // 是否显示按钮
        showBtn () {
            const inited = store.state._base.inited
            return inited || this.isSwitching
            // const token = getToken() 
            // if (token) {
            //     return !!this.customerInfo
            // } else {
            //     return inited
            // }
        },
        // 是否显示切换环境下拉菜单
        isAccountEnv () {
            return store.state._global.isAccountEnv
        },
        // 向下偏移的距离
        translatey () {
            return Number((50 + this.systemInfo.statusBarHeight) / (uni.upx2px(100) / 100)) || 0
        },
        // 当前主题是否为黑夜模式
        isNight () {
            return this.currentTheme === 'night'
        },
        // 是否显示全仓玩法真实模拟净值
        showFullNetAsset () {
            return store.getters.showFullNetAsset
        },
        // 全仓账户资产
        userAccount () {
            return store.state._user.accountAssets[1] || {}
        },
    },
    methods: {
        // 跳转到注册页面
        goRegister () {
            uni.navigateTo({
                url: '/pages/mine/register'
            })
        },
		
        // 控制下拉菜单
        onToggle () {
            // 有模拟公司才显示切换功能
            if (this.customerInfo.associationCompanyId) {
                const boole = !this.isAccountEnv
                store.commit('_global/setAccountEnv', boole)
            }
        },
			
        // 切换真实模拟账号
        onSwitchAccount (type) {
            if (this.customerInfo.companyType === type) {
                store.commit('_global/setAccountEnv', false)
            } else {
                // 发起切换账户
                const pages = getCurrentPages()
                const url = '/' + pages[pages.length - 1]['route']
                
                // 控制不能切换太频繁，一分钟内不能多次切换
                const lastTime = localGetObj('mockAccount', 'lastTime') || 0
                const nowTime = Date.now()
                if (nowTime - lastTime < 1000 * 10) {
                    this.$toast(this.$t('common.switchAccountMuch'))
                    store.commit('_global/setAccountEnv', false)
                    return false
                }
                this.launchSwitchAccount(type).then(() => {
                    // 关闭所有页面打开当前页面
                    uni.reLaunch({
                        url
                    })
                })
            }
        },
		
        // 发起切换账户
        launchSwitchAccount (type) {
            // 关闭下拉菜单
            this.isSwitching = true
            uni.showLoading({
                mask: true
            })
            store.commit('_global/setAccountEnv', false)
            return handleSwitchAccount(type).then(async () => {
                this.isSwitching = false
                localSetObj('mockAccount', 'lastTime', Date.now())
                this.$toast(this.$t('common.switchAccountSuccess'))
            }).catch(() => {
                this.isSwitching = false
                uni.hideLoading()
            })
        },
		
        // 跳转到充值页面
        goDeposit () {
            // 模拟弹窗提示
            if (this.customerInfo?.companyType === 'demo') {
                this.$refs['modalDialog'].show({
                    title: this.$t('common.tip'),
                    content: this.$t('home.switchTips'),
                    showCancel: true
                }).then(() => {
                    // 发起切换账户
                    this.launchSwitchAccount('real').then(() => {
                        // 关闭所有页面跳转到充值页面
                        this.$method.goDeposit()
                        // 添加应用内事件
                        this.$addAppsEvent('topNav_desposit_click')
                    })
                }).catch(() => {})
            } else {
                this.$method.goDeposit()
                // 添加应用内事件
                this.$addAppsEvent('topNav_desposit_click')
            }
            store.commit('_global/setAccountEnv', false)
        },
		
        // 切换主题 
        switchTheme () { 
            const theme = this.currentTheme === 'night' ? 'light' : 'night'
            // 设置全局变量
            store.commit('Update_invertColor', theme)
            // 设置当前主题 
            store.commit('_global/setTheme', theme)
        }
    }
}
</script>

<style scoped lang='scss'>
::v-deep .tui-dropdown-box {
    left: 0;
    height: auto !important;
    border-radius: 0;
}
.top-nav {
    @include styles('background', 'contentColor');
    position: relative;
    z-index: 999;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 50px;
    padding: 0 30rpx;
    .logo {
        display: inline-flex;
        flex: 1;
        align-items: center;
        image {
            width: 40px;
            height: 30px;
        }
    }
    .mode {
        display: inline-flex;
        align-items: center;
        margin-right: 10rpx;
        image {
            width: 20px;
            height: 20px;
        }
    }
    .btn {
        @include styles('background', 'primary');
        display: flex;
        justify-content: center;
        align-items: center;
        width: 120rpx;
        border-radius: 8rpx;
        color: #FFF;
        font-size: 24rpx;
        height: 50rpx;
        margin-left: 12rpx;
        &.demo {
            background-color: #3099F5 !important;
        }
        &::v-deep .arrow-down {
            margin-right: -4rpx !important;
        }
    }
}
.full-assets {
    .name {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        font-size: 24rpx;
        .riskLevel {
            width: 12rpx;
            height: 12rpx;
            margin-right: 8rpx;
            border-radius: 50%;
            &.riskLevel1 {
                @include styles('background', 'success');
            }
            &.riskLevel2 {
                @include styles('background', 'focusColor');
            }
            &.riskLevel3 {
                @include styles('background', 'warn');
            }
        }
        span {
            &.real {
                @include styles('color', 'primary');
            }
            &.demo {
                color: #3099F5;
            }
        }
    }
    .amount {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        margin-top: 2rpx;
        font-size: 28rpx;
        &::v-deep .arrow {
            @include styles('color', 'color');
            margin-right: -6rpx !important;
            font-size: 28rpx !important;
        }
    }
}
.account-sheet {
    @include styles('background', 'contentColor');
    padding: 20rpx 25rpx 50rpx;
    .account-type {
        @include styles('color', 'color');
        @include styles('background', 'assistColor');
        display: flex;
        align-items: center;
        padding: 30rpx;
        line-height: 1;
        border-radius: 10rpx;
        &:last-of-type {
            margin-top: 20rpx;
        }
        .radio {
            @include styles('border-color', 'minorColor');
            width: 40rpx;
            height: 40rpx;
            margin-right: 20rpx;
            border-style: solid;
            border-width: 1px;
            border-radius: 50%;
            &.active {
                @include styles('border-color', 'primary');
                &::after {
                    @include styles('background', 'primary');
                    position: absolute;
                    top: 8rpx;
                    left: 8rpx;
                    width: 20rpx;
                    height: 20rpx;
                    border-radius: 50%;
                    content: '';
                }
            }
        }
        &.active {
            .radio {
                display: flex;
                align-items: center;
                justify-content: center;
                border-style: solid;
                border-width: 1px;
                &::after {
                    width: 20rpx;
                    height: 20rpx;
                    border-radius: 50%;
                    content: '';
                }
            }
        }
        &:nth-of-type(1) {
            &.active {
                @include styles('color', 'primary');
                .radio {
                    @include styles('border-color', 'primary');
                    &::after {
                        @include styles('background', 'primary');
                    }
                }
            }
        }
        &:nth-of-type(2) {
            &.active {
                color: #3099F5 !important;
                .radio {
                    border-color: #3099F5 !important;
                    &::after {
                        background: #3099F5;
                    }
                }
            }
        }
    }
    .account-btn {
        @include styles('background-color', 'primary');
        display: flex;
        justify-content: center;
        align-items: center;
        height: 90rpx;
        margin-top: 30rpx;
        color: #FFF;
        border-radius: 10rpx;
    }
}
</style>
