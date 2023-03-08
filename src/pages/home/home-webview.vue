<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar :back-show='false' :show-title-bar='false' />
            <!-- 切换真实模拟 -->
            <top-nav />
            <!-- 骨架屏内容 -->
            <view v-if='skeletonShow' class='skeleton-content'>
                <view class='swiper tui-skeleton-rect' />
                <view class='menu'>
                    <view v-for='(item, index) in 4' :key='index' class='menu-item'>
                        <view class='tui-skeleton-circular icon' />
                        <view class='tui-skeleton-rect desc' />
                    </view>
                </view>
                <view class='quick-nav'>
                    <view class='item tui-skeleton-rect' />
                    <view class='item tui-skeleton-rect' />
                </view>
                <view class='tabs-content'>
                    <view class='tabs-options tui-skeleton-rect' />
                    <view class='news-list'>
                        <block v-for='(item, index) in 5' :key='index'>
                            <view class='news-flex'>
                                <view class='news-tbox'>
                                    <view class='news-title tui-skeleton-rect'>
                                        USD/CNH keeps the range bound theme unchanged – UOB
                                    </view>
                                    <view class='sub-box'>
                                        <view class='sub-source tui-skeleton-rect'>
                                            fxstreet
                                        </view>
                                        <view class='sub-cmt tui-skeleton-rect'>
                                            <view>2 Minutes ago</view>
                                        </view>
                                    </view>
                                </view>
                                <view class='news-picbox tui-skeleton-rect'>
                                    <image class='thumb' lazy-load :src='item.image' />
                                </view>
                            </view> 
                        </block>
                    </view>
                </view>
            </view>
            <!-- 内容区域 -->
            <view v-else class='layout-content'>
                <web-view :src='url' @message='onMessage($event, "app")' />
            </view>
			
            <!-- 底部导航栏 -->
            <!-- <tab-bar current='Home' /> -->
        </view>
		
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>
import store from '@/store'
import { localGetObj } from '@/utils/util.js' 
const { apiBase } = require('@/apiConfig.js') 

export default {
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // url地址
            url: '',
            // 路由列表页
            routesList: [
                { name: 'Home', url: '/pages/home/index', isSwitch: true },
                { name: 'Mine', url: '/pages/mine/index', isSwitch: true },
                { name: 'Quote', url: '/pages/quote/index', isSwitch: true },
                { name: 'Order', url: '/pages/order/index', isSwitch: true, isLogin: true },
                { name: 'Assets', url: '/pages/assets/index', isSwitch: true, isLogin: true },
                { name: 'Register', url: '/pages/mine/register' },
                { name: 'Login', url: '/pages/mine/login' },
                { name: 'Msg', url: '/pages/mine/msg', isLogin: true },
                { name: 'Authentication', url: '/pages/person/authentication', isLogin: true },
                { name: 'SecuritySetting', url: '/pages/mine/setting', isLogin: true },
                { name: 'CommonSetting', url: '/pages/mine/common' }
            ],
            // 最后一次主题
            lastTheme: '',
            // 最后一次涨跌颜色
            lastChangeColor: '',
            accountVis: false,
            accountType: localGetObj('mockAccount', 'accountType'),
        }
    },
    computed: {
        customerGroupId () {
            return store.getters.customerGroupId
        }
    },
    onLoad () {
        // 页面初始化
        this.pageInit()
        // #ifdef H5
        window.addEventListener('message', (evt) => {
            this.onMessage(evt, 'h5')
        })
        // #endif
    },
    onShow () {
        // 添加应用内事件
        this.$addAppsEvent('home_view')
        // 切换主题后重新加载页面
        if (this.lastTheme && this.lastTheme !== this.currentTheme) {
            return this.pageInit()
        }
        // 修改涨跌颜色后重新加载页面
        if (this.lastChangeColor && this.lastChangeColor !== this.changeColor) {
            return this.pageInit()
        }
    },
    methods: {
        // 页面初始化
        pageInit () {
            this.skeletonShow = true
            this.url = ''
            this.lastTheme = this.currentTheme
            this.lastChangeColor = this.changeColor
            this.$init().then(() => {
                // 设置数据
                this.setData()
            }).catch(() => {
                // 设置数据
                this.setData()
            })
        },
		
        // 设置数据
        setData () {
            this.skeletonShow = false
            // 设置url
            this.setUrl()
            // 设置web-view样式
            this.$nextTick(() => {
                this.setStyle()
            })
        },
		
        // 设置web-view样式
        setStyle () {
            // #ifdef APP-PLUS
            setTimeout(() => {
                plus.nativeUI.showWaiting()
                const currentWebview = this.$scope.$getAppWebview()
                const systemInfo = this.systemInfo
                const top = systemInfo.statusBarHeight + 50
                const bottom = 50 + systemInfo.safeAreaInsets.bottom
                const height = systemInfo.windowHeight - (top + bottom)
                const wv = currentWebview.children()[0]
                wv.setStyle({ top, height }) 
                wv.addEventListener("loaded",function(){ 
                    plus.nativeUI.closeWaiting();
                })
            }, 200)
            // #endif
        },
		
        // 设置url
        setUrl () {
            // const apiBase = 'http://192.168.1.110:8090'
            const accountType = localGetObj('mockAccount', 'lastAccountType') || 'real'
            const demoDomain = localGetObj('mockAccount', 'demo_domain')
            const param = this.$method.getUrlParam() + `&accountType=${accountType}&demoDomain=${demoDomain}`
            this.url = `${apiBase}/${this.currentLang}/index?${param}`
            // this.url = 'https://www.baidu.com'
        },
		
        // 接收数据
        onMessage (e, type) {
            const data = type === 'app' ? e.detail.data[0] : e.data.data?.arg
            const params = data?.params
            switch (data?.type) {
                case 'notice_click':
                    var path = params.path
                    var url = `${apiBase}/${this.currentLang}${path}&customerGroupId=${this.customerGroupId}&isUniapp=1&lang=${this.currentLang}`
                    this.$method.goWebView(url, this.$t('route.noticeTitle'))
                    break
                case 'module_click':
                    this.onModule(params)
                    break
                case 'product_click':
                    this.$method.goChartPage(params)
                    break
                case 'open_new_page': 
                    this.$method.goWebView(params.url, params.title) 
                    break
            }
        },
		
        // 点击模块跳转页面
        onModule (params) {
            const { data } = params
            const name = data.name
            if (!name) return
            if (name === 'Nest') {
                this.$method.goWebView(data.query.url, data.query.title) 
            } else {
                const item = this.routesList.find(el => el.name === name)
                //	用户未登录关闭所有页面跳转到登录页
                if (item.isLogin && !this.customerInfo) {
                    return uni.reLaunch({
                        url: '/pages/mine/login'
                    })
                }
                // 切换到主页面
                if (item.isSwitch) {
                    uni.switchTab({
                        url: item.url
                    })
                } else {
                    // 跳转到对应页面
                    uni.navigateTo({
                        url: item.url
                    })
                }
            }
        }
    },
    onUnload () {
        // #ifdef H5
        window.removeEventListener('message', (evt) => {
            this.onMessage(evt, 'h5')
        })
        // #endif
    }
}
</script>

<style scoped lang='scss'>
.skeleton-content {
    .swiper {
        height: 340rpx;
    }
    .menu {
        display: flex;
        padding: 20rpx 0;
        .menu-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 1;
            padding: 0 30rpx;
            .icon {
                width: 88rpx;
                height: 88rpx;
            }
            .desc {
                width: 100rpx;
                height: 32rpx;
                margin-top: 12rpx;
            }
        }
    }
    .quick-nav {
        display: flex;
        justify-content: space-between;
        padding: 15rpx 0 6rpx;
        .item {
            width: 370rpx;
            height: 256rpx;
        }
    }
    .tabs-options {
        display: flex;
        height: 90rpx;
    }
    .news-list {
        @include styles('background-color', 'contentColor');
        .news-flex {
            display: flex;
            padding: 22rpx 25rpx;
            .news-tbox {
                flex: 1;
                padding-right: 28rpx;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                .news-title {
                    @include styles('color', 'color');
                    font-size: 28rpx;
                }
                .sub-box {
                    @include styles('color', 'minorColor');
                    display: flex;
                    font-size: 26rpx;
                    justify-content: space-between;
                }
            }
            .news-picbox {
                width: 240rpx;
                .thumb {
                    @include styles('background', 'assistColor');
                    width: 240rpx;
                    height: 160rpx;
                    border-radius: 6rpx;
                }
            }
        }
    }
}
</style>
