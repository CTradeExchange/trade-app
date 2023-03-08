<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container'>
            <!-- 头部导航栏 -->
            <nav-bar :fixed-title='title' :is-custom='true'>
                <view class='header-module'>
                    <view class='center-wrap' @click='openSidebar'>
                        <view class='title'>
                            <i class='iconfont icon_quanrejiaohuan-'></i>
                            <strong>{{ product.symbolName }}</strong>
                        </view>
                        <!-- <view class='code'>
                            {{ product.symbolCode }} {{ $t('trade.update') }}: {{ handleTime(product.tick_time) }}
                        </view> -->
                    </view>
                    <view class='right-wrap'>
                        <button class='collectIcon' @click='collect'>
                            <tui-icon v-if='isAdd' :color='$style.primary' name='star-fill' :size='42' unit='rpx' />
                            <tui-icon v-else :color='$style.minorColor' name='star' :size='42' unit='rpx' />
                        </button>
                        <button v-if='$includePlay_1(tradeType)' class='about' @click='toContractInfo'>
                            <span>
                                <tui-icon :color='$style.minorColor' name='about' :size='42' unit='rpx' />
                            </span>
                        </button>
                    </view>
                </view>
            </nav-bar>
            <!-- 内容区域 -->
            <view class='layout-content'>
                <!-- #ifdef H5 -->
                <web-view
                    v-if='showWebView' 
                    ref='webview'
                    class='webview'
                    :src='url'
                />
                <!-- #endif -->
            </view>
        </view>

        <!-- 侧边栏切换产品 -->
        <sidebar-product ref='sidebar' show-category show-play @close='closeSidebar' @select='selectProduct' />
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>
import store from '@/store/index.js'
import sidebarProduct from '@/components/modules/sidebar-product.vue'
import dayjs from 'dayjs'
import { isEmpty, localGet } from '@/utils/util.js'
import { addCustomerOptional, removeCustomerOptional } from '@/api/trade.js'

const { apiBase } = require('@/apiConfig.js')
let wv = ''
export default {
    components: {
        sidebarProduct
    },
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 是否显示web-view组件
            showWebView: true,
            // url地址
            url: '',
            // 标题
            title: '',
            // 玩法类型
            tradeType: '',
            // symbolId
            symbolId: '',
            // symbolName
            symbolName: '',
            // 价格小数位
            priceDigits: '',
            // 是否添加自选
            isAdd: false,
            // 用户组id
            customerGroupId: ''
        }
    },
    computed: {
        // 自选列表
        selfSymbolList () {
            return store.state._user.selfSymbolList[this.tradeType] || []
        },
        // 当前产品是否添加自选
        isSelfSymbol () {
            return !isEmpty(this.selfSymbolList.find(el => el.symbolId === this.symbolId))
        },
        // 产品信息
        product () {
            const productMap = store.state._quote.productMap
            const symbolKey = this.symbolId + '_' + this.tradeType
            return productMap[symbolKey] || {}
        },
        productMap () {
            return store.state._quote.productMap || {}
        },
    },
    watch: {
        // 监听isSelfSymbol
        isSelfSymbol () {
            this.isAdd = this.isSelfSymbol
        }
    },
    onLoad (options) {
        // 初始化
        this.$init().then(() => {
            this.skeletonShow = false
            // 设置url
            this.setUrl()
            // 创建web-view
            this.createWebView()
        }).catch(() => {
            this.skeletonShow = false
        })

        this.symbolId = Number(options.symbolId)
        this.symbolName = options.symbolName
        this.priceDigits = options.priceDigits
        this.symbolCode = options.symbolCode
        this.tradeType = Number(options.tradeType)

        // 添加应用内事件
        this.$addAppsEvent('chart_view')
		
        // #ifdef H5
        window.addEventListener('message', (evt) => {
            this.onMessage(evt.data.data?.arg)
        })
        // #endif
		
        // #ifdef APP-PLUS
        plus.globalEvent.addEventListener('plusMessage', this.plusMessageCallBack)
        // #endif 
    },
    onUnload () {
        // #ifdef H5
        window.removeEventListener('message', (evt) => {
            this.onMessage(evt.data.data?.arg)
        })
        // #endif
		
        // #ifdef APP-PLUS
        plus.globalEvent.removeEventListener()
        // #endif
    },
    methods: {
        // 创建web-view
        createWebView () {
            // #ifdef APP-PLUS
            const top = this.systemInfo.navbarHeight
            const height = this.systemInfo.windowHeight - top
            wv = plus.webview.create(this.url, 'custom-webview', {
                'uni-app': 'none', // 不加载uni-app渲染层框架，避免样式冲突
                top, // 放置在titleNView下方。如果还想在webview上方加个地址栏的什么的，可以继续降低TOP值
                height,
                background: 'transparent'
            })
            const currentWebview = this.$scope.$getAppWebview() // 此对象相当于html5plus里的plus.webview.currentWebview()。在uni-app里vue页面直接使用plus.webview.currentWebview()无效
            currentWebview.append(wv)// 一定要append到当前的页面里！！！才能跟随当前页面一起做动画，一起关闭
            // #endif
        },
		
        // 设置url
        setUrl () {
            const lang = localGet('lang')
            const param = this.$method.getUrlParam()
            this.url = `${apiBase}/${lang}/product?symbolId=${this.symbolId}&tradeType=${this.tradeType}&${param}`
            // this.url = `http://192.168.1.103:8090/${lang}/product?symbolId=${this.symbolId}&tradeType=${this.tradeType}&${param}`
        },

        // 打开侧边栏弹窗
        openSidebar () {
            this.$refs['sidebar'].show(this.tradeType)
            this.showWebView = false
            // #ifdef APP-PLUS
            wv.hide()
            // #endif
        },

        // 关闭侧边栏弹窗
        closeSidebar () {
            this.showWebView = true
            // #ifdef APP-PLUS
            wv.show()
            // #endif
        },

        // 选择产品
        selectProduct (tradeType, item) {
            this.symbolId = Number(item.symbolId)
            this.symbolName = item.symbolName
            this.priceDigits = item.priceDigits
            this.symbolCode = item.symbolCode
            this.tradeType = tradeType
            this.showWebView = true
            this.setUrl()
            // #ifdef APP-PLUS
            wv.loadURL(this.url)
            wv.show()
            // #endif
			
            // 添加应用内事件
            this.$addAppsEvent('chart_select_product')
        },
		
        // plusMessage回调
        plusMessageCallBack (e) {
            if (wv && wv['__uuid__'] === e.originId) {
                const result = e.data.args
                this.onMessage(result.data.arg)
            }  
        },

        // 接收数据
        onMessage (data) {
            if (data?.type === 'order') {
                this.goOrderPage(data.params)
            } else if (data?.type === 'fund') {
                this.goFundPage(data.params)
            } else if (data?.type === 'product') {
                this.goProductPage(data.params)
            } else if (data?.type === 'v10') {
                this.goV10Page()
            }
        },

        // 点击买入或卖出
        goOrderPage (params) {
            // 跳转到下单页面
            if (this.customerInfo) {
                store.commit('_global/setOrderParams', params)
                uni.switchTab({
                    url: '/pages/order/index'
                })
            } else {
                uni.reLaunch({
                    url: '/pages/mine/login?module=chart'
                })
            }
			
            // 添加应用内事件
            if (params.direction === 'buy') {
                this.$addAppsEvent('chart_buy_click')
            } else {
                this.$addAppsEvent('chart_sell_click')
            }
        },

        // 跳转基金详情页面
        goFundPage (params) {
            uni.navigateTo({
                url: `/pages/fund/info?fundId=${params.fundId}`
            })
			
            // 添加应用内事件
            this.$addAppsEvent('chart_fund_button_click')
        },
		
        // 跳转到v10页面
        goV10Page () {
            this.$method.goV10Page()
        },

        // 跳转产品详情页面
        goProductPage (params) {
            const symbolKey = params.symbolId + '_' + params.tradeType
            const product = this.productMap[symbolKey] || {}
            this.$method.goChartPage(product)
        },

        // 跳转到合约属性页面
        toContractInfo () {
            uni.navigateTo({
                url: `/pages/contract/index?symbolId=${this.symbolId}&tradeType=${this.tradeType}`
            })
        },

        // 添加或删除自选
        collect () {
            // 已登录
            if (this.customerInfo) {
                if (this.isSelfSymbol) {
                    removeCustomerOptional({
                        symbolList: [this.symbolId],
                        tradeType: this.tradeType
                    }).then(() => {
                        this.isAdd = false
                        store.dispatch('_user/queryCustomerOptionalList')
                        uni.showToast({
                            title: this.$t('trade.removeOptionalOk'),
                            icon: 'none'
                        })
                        // 添加应用内事件
                        this.$addAppsEvent('chart_cancel_optional')
                    })
                } else {
                    addCustomerOptional({
                        symbolList: [this.symbolId],
                        tradeType: this.tradeType
                    }).then(() => {
                        this.isAdd = true
                        store.commit('_user/Update_optional', 1)
                        store.dispatch('_user/queryCustomerOptionalList')
                        uni.showToast({
                            title: this.$t('trade.addOptionalOk'),
                            icon: 'none'
                        })
                        // 添加应用内事件
                        this.$addAppsEvent('chart_add_optional')
                    })
                }
            } else {
                // 未登录
                uni.reLaunch({
                    url: '/pages/mine/login?module=chart'
                })
            }
        },

        // 处理时间
        handleTime (val) {
            return dayjs(val).format('HH:mm:ss')
        }
    }
}
</script>

<style lang="scss" scoped>
.header-module {
	@include flexAll;
	width: 100%;
	height: 100%;
	position: relative;
	.center-wrap {
		@include flexColumnAll;
		width: 500rpx;
		height: 100%;
		.title {
			@include flexAlign;
			@include text-clamp-one;
			i {
				margin-right: 20rpx;
				font-size: 45rpx;
			}
			strong {
				@include styles('color', 'color');
				font-weight: 700;
				font-size: 45rpx;
			}
		}
		.code {
			@include styles('color', 'minorColor');
			@include text-clamp-one;
			font-size: 22rpx;
		}
	}
	.right-wrap {
		display: flex;
		align-items: center;
		height: 100%;
		position: absolute;
		top: 0;
		right: 20rpx;
		.about {
			margin-top: 5rpx;
			margin-left: 15rpx;
		}
	}
}
</style>
