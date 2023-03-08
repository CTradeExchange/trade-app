<template>
    <view class='app-bottom' :style="{ 'height': height + 'rpx' }">
        <!-- 底部导航栏 -->
        <view class='tab-bar' :style="{ 'height': height + 'rpx' }">
            <block v-for='item in tabbarList' :key='item.value'>
                <view
                    :class="{ 'item': true, 'item-active': item.value === current }"
                    @click='onSwitch(item)'
                >
                    <image v-if='item.src' class='img-icon' :src='item.src' />
                </view>
            </block>
        </view>
    </view>
</template>

<script>
export default {
    props: {
        // 当前导航栏
        current: {
            type: String,
            default: 'Home'
        }
    },
    data () {
        return {
            // 底部导航栏
            tabbarList: [],
            // 导航栏高度
            height: 100
        }
    },
    mounted () {
        // 设置导航栏
        this.setTabbar()
    },
    methods: {
        // 设置导航栏
        setTabbar () {
            const tabbarList = [
                {
                    value: 'Home',
                    path: '/pages/home/index',
                    src: '/static/image/nav/home.png',
                    isLogin: false
                },
                {
                    value: 'Quote',
                    path: '/pages/quote/index',
                    src: '/static/image/nav/quote.png',
                    isLogin: false
                },
                {
                    value: 'Order',
                    path: '/pages/order/index',
                    src: '/static/image/nav/trade.png',
                    isLogin: true
                },
                {
                    value: 'Assets',
                    path: '/pages/assets/index',
                    src: '/static/image/nav/assets.png',
                    isLogin: true
                },
                {
                    value: 'Mine',
                    path: '/pages/mine/index',
                    src: '/static/image/nav/mine.png',
                    isLogin: false
                }
            ]
            this.tabbarList = tabbarList
        },
		
        // 切换导航栏
        onSwitch (item) {
            if (item.value === this.current) return
            // 当前页面需要登录才有打开
            if (item.isLogin && !this.customerInfo) {
                let moduleName = '' 
                if (item.value === 'Order') moduleName = 'trade'
                if (item.value === 'Assets') moduleName = 'assets'
                uni.navigateTo({
                    url: '/pages/mine/login?module=' + moduleName
                })
            } else {
                uni.switchTab({
                    url: item.path
                })
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.tab-bar {
	@include styles('background-color', 'contentColor');
	position: fixed;
	bottom: env(safe-area-inset-bottom);
	left: 0;
	z-index: 999;
	display: flex;
	align-items: center;
	width: 100%;
	&::before {
		@include styles('background-color', 'lineColor');
		position: absolute;
		top: 0;
		z-index: 999;
		width: 100%;
		height: 1px;
		transform: scaleY(.5);
		content: '';
	}
	.item {
		@include styles('color', 'placeholdColor');
		display: inline-flex;
		flex: 1;
		flex-direction: column;
		align-items: center;
		cursor: pointer;
		.img-icon {
			width: 50rpx;
			height: 50rpx;
			opacity: 0.6;
			filter: grayscale(1);
		}
		.iconfont {
			margin-top: 12rpx;
			font-size: 45rpx;
		}
		.text {
			line-height: 1;
			margin-top: 8rpx;
			font-size: 25rpx;
		}
	}
	.item-active {
		@include styles('color', 'primary');
		.img-icon {
			opacity: 1;
			filter: grayscale(0);
		}
	}
}
</style>
