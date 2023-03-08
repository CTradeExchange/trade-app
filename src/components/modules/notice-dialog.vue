<template>
    <tui-top-dropdown :mask='false' :show='show' :translatey='translatey'>
        <view class='notice-module' @click='goMsg'>
            <tui-icon class='close' name='shut' :size='40' unit='rpx' @click='show = false' />
            <view class='title'>
                {{ title }}
            </view> 
            <view class='content'>
                {{ content }}
            </view>
        </view>
    </tui-top-dropdown>
</template>

<script>
// util
import { computeHtmlTime } from '@/utils/util.js'
	
export default {
    data () {
        return {
            // 是否显示弹窗
            show: false,
            // 向下移动的距离
            translatey: 0,
            // 弹窗标题
            title: '',
            // 弹窗内容
            content: ''
        }
    },
    mounted () {
        // #ifdef APP-PLUS
        this.translatey = this.systemInfo.statusBarHeight + 30
        // #endif
    },
    methods: {
        // 打开通知弹窗
        open (title = '', content = '') {
            this.title = title
            this.content = computeHtmlTime(content) 
            this.show = true
            // 定时关闭弹窗
            setTimeout(() => {
                this.show = false
            }, 5000)
        },
		
        // 跳转到消息页面
        goMsg () {
            if (!this.show) return
            uni.navigateTo({
                url: '/pages/mine/msg'
            })
        }
    }
}
</script>

<style lang="scss" scoped>
::v-deep .tui-dropdown-box {
	height: auto !important;
	background: transparent !important;
	visibility: hidden;
	overflow: visible;
	z-index: 9999;
}	
::v-deep .tui-dropdown-show {
	visibility: visible;
}
.notice-module {
	@include styles('color', 'color');
	@include styles('background-color', 'contentColor');
	width: 700rpx;
	margin: 20rpx auto 0;
	padding: 30rpx;
	border-radius: 10rpx;
	box-shadow: 0rpx 5rpx 15rpx #9294a3;
	position: relative;
	.title {
		font-weight: bold;
	}
	.close {
		@include styles('color', 'minorColor');
		position: absolute;
		top: 0;
		right: 0;
		padding: 15rpx;
	}
	.content {
		margin-top: 10rpx;
	}
}
</style>
