<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container'>
            <!-- 头部导航栏 -->
            <nav-bar custom-back :title="$t('cRoute.commonSetting')" @back='onBack' />   
            <!-- 内容区域 -->
            <view class='layout-content'>
                <!-- 功用列表 -->
                <view class='feature-list'>
                    <!-- <view class='item' @click='openLang'>
                        <view class='name'>
                            {{ $t('common.lang') }}
                        </view>
                        <view class='value'>
                            {{ langItem.name }}
                        </view>
                        <tui-icon class='arrow' name='arrowright' />
                    </view> -->
                    <view class='item' @click='openColor'>
                        <view class='name'>
                            {{ changeColorType === 1 ? $t("common.redDown") : $t("common.redUp") }}
                        </view>
                        <label>
                            <i class='iconfont icon_hongzhang riseColor'></i>
                            <i class='iconfont icon_lvdie fallColor'></i>
                        </label>
                        <tui-icon class='arrow' name='arrowright' />
                    </view>
                    <!-- <view class='item'>
                        <view class='name'>
                            {{ $t('common.dark') }}
                        </view>
                        <switch :checked='isNight' :color='$style.primaryAssistColor' @change='switchTheme' />
                    </view> -->
                    <!-- 运行环境 -->
                    <view class='item' @click='openEnv'>
                        <span class='name'>
                            {{ wpEnv }} ({{ buildTime }})
                        </span>
                        <tui-icon class='arrow' name='arrowright' />
                    </view>
                    <!-- 版本号 -->
                    <view class='item'>
                        <span class='tip'>
                            {{ $t('common.version') }} {{ appInfo.version }}
                        </span>
                    </view>
                </view>
            </view>
        </view>
		
        <!-- 涨跌设置弹窗 -->
        <tui-bottom-popup background-color='transparent' :height='0' :show='colorVisible' @close='closeColor'>
            <view class='popup-content'>
                <view class='popup-title'>
                    {{ $t('common.chartColor') }}
                </view>
                <scroll-view class='color-list' scroll-y>
                    <view class='item' @click='switchColor(1)'>
                        <view class='item-left'>
                            <label>
                                <span>{{ $t('common.up') }}</span>
                                <i class='iconfont icon_hongzhang color-1'></i>
                            </label>
                            <label>
                                <span>{{ $t('common.down') }}</span>
                                <i class='iconfont icon_lvdie color-2'></i>
                            </label>
                        </view>
                        <radio :checked='changeColorType === 1' class='item-radio' :color='$style.primary' />
                    </view>
                    <view class='item' @click='switchColor(2)'>
                        <view class='item-left'>
                            <label>
                                <span>{{ $t('common.up') }}</span>
                                <i class='iconfont icon_hongzhang color-2'></i>
                            </label>
                            <label>
                                <span>{{ $t('common.down') }}</span>
                                <i class='iconfont icon_lvdie color-1'></i>
                            </label>
                        </view>
                        <radio :checked='changeColorType === 2' class='item-radio' :color='$style.primary' />
                    </view>
                </scroll-view>
            </view>
        </tui-bottom-popup>
		
        <!-- 多语言弹窗 -->
        <tui-bottom-popup background-color='transparent' :height='0' :show='langVisible' @close='closeLang'>
            <view class='popup-content'>
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
		
        <!-- 运行环境弹窗 -->
        <tui-bottom-popup background-color='transparent' :height='0' :show='envVisible' @close='closeEnv'>
            <view class='popup-content'>
                <view class='popup-title'>
                    Env
                </view>
                <scroll-view class='popup-list' scroll-y>
                    <view class='block'>
                        <block v-for='(item, index) in wpList' :key='index'>
                            <view v-if='item.isSwitch' class='item' @click='switchEnv(item)'>
                                <span class='label'>
                                    {{ item.value }}
                                </span>
                                <tui-icon 
                                    v-if='item.value === wpEnv'
                                    class='check' 
                                    :color='$style.primary' 
                                    name='check' 
                                    :size='42' 
                                    unit='rpx' 
                                />
                            </view>
                        </block>
                    </view>
                </scroll-view>
            </view>
        </tui-bottom-popup>
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>
import store from '@/store'
import { setTradeTypeAlias } from '@/plugins/index.js'
import { getToken, localGet } from '@/utils/util' 
import { changeLang } from '@/api/base'
import { createJYGoogleSignin } from '@/plugins/JYGoogleSignin'
const apiConfig = require('@/apiConfig.js')

export default {
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: false,
            // 是否显示多语言弹窗
            langVisible: false,
            // 当前wp配置
            wpList: apiConfig.wpList,
            wpEnv: apiConfig.wpEnv,
            // 是否显示运行环境弹窗
            envVisible: false,
            // 涨跌显示方式 1:蓝涨红跌 2:红涨蓝跌
            changeColorType: localGet('changeColorType') || 1,
            // 是否显示涨跌设置弹窗
            colorVisible: false,
            buildTime: process.env.VUE_APP_buildTime
        }
    },
    computed: {
        // 当前主题是否为黑夜模式
        isNight () {
            return this.currentTheme === 'night'
        },
        // 语言列表
        supportLanguages () {
            return store.state.supportLanguages
        },
        // 当前选择的语言项
        langItem () {
            return this.supportLanguages.find(el => el.val === this.currentLang)
        }
    },
    onLoad () {
        // 初始化
        this.$init()
        // 添加应用内事件
        this.$addAppsEvent('common_view')
    },
    methods: {
        // 点击返回
        onBack () {
            uni.switchTab({
                url: '/pages/mine/index'
            })
        },
		
        // 打开涨跌设置弹窗
        openColor () {
            this.colorVisible = true
        },
		
        // 关闭涨跌设置弹窗
        closeColor () {
            this.colorVisible = false
        },
		
        // 切换涨跌颜色
        switchColor (value) {
            if (this.changeColorType === value) return
            this.changeColorType = value
            this.colorVisible = false
            store.commit('_global/setChangeColorType', value)
        },
		
        // 切换主题 
        switchTheme () { 
            const theme = this.currentTheme === 'night' ? 'light' : 'night'
            // 设置全局变量
            store.commit('Update_invertColor', theme)
            // 设置当前主题 
            store.commit('_global/setTheme', theme)
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
                this.langVisible = false
                const token = getToken()
                // api请求
                if (token) {
                    changeLang(item.val)
                }
                // 设置当前语言
                store.commit('_global/setLang', item.val)

                // 清除默认城市
                store.commit('Update_countryList', [])
				
                // 切换语言后需要重新获取配置信息
                await store.dispatch('_base/initBaseConfig')
                // 设置玩法别名
                const wpCompanyInfo = store.state._base.wpCompanyInfo
                setTradeTypeAlias(wpCompanyInfo)
				
                // 关闭所有页面跳转到当前页面
                uni.reLaunch({
                    url: '/pages/mine/common'
                })
            }
        },
		
        // 打开运行环境弹窗
        openEnv () {
            this.envVisible = true
        },
		
        // 关闭运行环境弹窗
        closeEnv () {
            this.envVisible = false
        },
		
        // 切换运行环境
        async switchEnv (item) {
            if (this.wpEnv !== item.value) {
                uni.showLoading({
                    title: this.$t('common.loading'),
                    mask: true
                })
                // 已登录需要退出登录
                if (this.customerInfo) {
                    await store.dispatch('_user/logout')
                }
				
                // 设置wp配置
                this.envVisible = false
                apiConfig.updateWpConfig(item)
                store.commit('_base/UPDATE_inited', false)
				
                // 获取app配置文件
                store.dispatch('_global/getAppConfig').then(() => {
                    // 创建谷歌登录插件
                    createJYGoogleSignin()
                })
				
                // 关闭弹窗并提示
                this.wpEnv = item.value
                uni.hideLoading()
                setTimeout(() => {
                    this.$toast(this.$t('common.switchAccountSuccess'))
                }, 500)
			
                // 关闭所有页面跳转到当前页面
                uni.reLaunch({
                    url: '/pages/mine/common'
                })
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.feature-list {
    margin-top: 10rpx;
    .item {
        @include flexAlign;
        @include styles('background', 'contentColor');
        height: 110rpx;
        padding: 0 30rpx;
        margin-bottom: 10rpx;
        .name {
            @include styles('color', 'color');
            flex: 1;
            font-size: 32rpx;
        }
        .arrow {
            @include styles('color', 'minorColor');
            margin-left: 15rpx !important;
            font-size: 45rpx !important;
        }
        label {
            display: inline-flex;
            align-items: center;
            i {
                margin-right: -12rpx;
                font-size: 45rpx;
            }
        }
        .lang-icon {
            width: 60rpx;
            height: 60rpx;
        }
        .tip {
            @include styles('color', 'minorColor');
            width: 100%;
            text-align: right;
        }
    }
}
.popup-content {
    @include styles('background', 'contentColor');
	padding: 0 30rpx;
    .popup-title {
        @include flexAlign;
        @include styles('color', 'color');
        height: 120rpx;
        font-size: 40rpx;
        font-weight: bold;
    }
    .popup-list {
        height: 75vh;
		.block {
			padding-bottom: 12rpx;
		}
        .item {
            @include styles('background', 'assistColor');
            @include flexBetweenAlign;
            height: 130rpx;
            padding: 0 25rpx;
            margin-top: 12rpx;
            font-size: 32rpx;
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
        .item {
            @include flexAlign;
            @include styles('background', 'assistColor');
            @include styles('color', 'normalColor');
            height: 130rpx;
            padding: 0 25rpx;
            margin-top: 12rpx;
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
                    font-size: 45rpx;
                    color: #26A69A;
                }
                .color-2 {
                    font-size: 45rpx;
                    color: #EF5353;
                }
            }
        }
    }
}
</style>
