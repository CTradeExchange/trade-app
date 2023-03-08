<template>
    <view class='swiper-module'>
        <swiper
            autoplay
            :circular='true'
            class='swiper'
            :duration='500'
            :interval='4000'
            :style="{ width: width + 'rpx', height: height + 'rpx', margin: margin }"
            @animationfinish='finishSwiper'
        >
            <swiper-item 
                v-for='(item, index) in list' 
                :key='index' 
                class='swiper-item'
                @click='goPage'
            >
                <image lazy-load mode='aspectFill' :src='item.image' />
            </swiper-item>
        </swiper>
        <view v-if='showDot && list.length > 1' class='swiper-dots'>
            <block v-for='(item, index) in list' :key='index'>
                <view :class="['li', current === index ? 'active' : '']" />
            </block>
        </view>
    </view>
</template>
  
<script>      
export default {      
    props: {
        // 轮播图列表
        list: {
            type: Array,
            default: () => []
        },
        // 是否显示指示点
        showDot: {
            type: Boolean,
            default: false
        },
        // 轮播图模块的宽度
        width: {
            type: Number,
            default: 750
        },
        // 轮播图模块的高度
        height: {
            type: Number,
            default: 280
        },
        // 轮播图外边距
        margin: {
            type: String,
            default: '0 auto'
        }
    },
    data () {
        return {
            // 当前轮播的图片索引
            current: 0
        }
    },
    methods: {
        // 图片轮播完成
        finishSwiper (e) {
            const { current } = e.detail
            this.current = current
        },
		
        // 点击banner跳转
        goPage () {
            if (this.customerInfo) {
                uni.navigateTo({
                    url: '/pages/deposit/choose?tradeType=5'
                })
            } else {
                uni.navigateTo({
                    url: '/pages/mine/register'
                })
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.swiper-module {
	@include flexAll;
	@include styles('background-color', 'contentColor');
	position: relative;
	.swiper {
		width: 100%;
		overflow: hidden;
	}
	.swiper-item {
		image {
			width: 100%;  
			height: 100%;
		}
	}
	.swiper-dots {
		@include flexAll;
		width: 100%;
		position: absolute;
		left: 0;
		bottom: 14rpx;
		.li {
			width: 14rpx;
			height: 14rpx;
			margin: 0 7rpx;
			background-color: rgba(255,255,255,.6);
			border-radius: 50%;
			box-shadow: 0 2rpx 5rpx rgba(0,0,0,.2);
		}
		.active {
			background-color: rgba(255,255,255,1);
		}
	}
}
</style>
