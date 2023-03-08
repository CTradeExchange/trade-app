<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container'>
            <!-- 头部导航栏 -->
            <nav-bar />
            <!-- 内容区域 -->
            <view class='layout-content'>
                <view class='success-header'>
                    <i class='iconfont icon_success'></i>
                    <view class='text'>
                        <view class='title'>
                            {{ $t('register.openHandler') }}
                        </view>
                        <view class='tip'>
                            <span>{{ $t('register.servicePlease') }}</span>
                        </view>
                    </view>
                </view>
                <view class='success-handle'>
                    <view class='btn' @click='goHome'>
                        {{ $t('common.sure') }}
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
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('register_handler_view')
    },
    methods: {
        // 关闭所有页面打开首页
        goHome () {
            uni.reLaunch({
                url: '/pages/home/index'
            })
        }
    }
}	
</script>

<style lang="scss" scoped>
.layout-container {
	@include styles('background-color', 'contentColor');
}
.success-header {
	@include flexAll;
	padding: 100rpx 30rpx 0;
	.icon_success {
		@include styles('color', 'success');
		margin-right: 30rpx;
		font-size: 100rpx;
	}
	.text {
		.title {
			font-size: 32rpx;
		}
		.tip {
			margin-top: 15rpx;
			span {
				@include styles('color', 'minorColor');
			}
		}
	}
}
.success-handle {
	@include flexAll;
	margin-top: 60rpx;
	.btn {
		@include flexAll;
		@include styles('background-color', 'primary');
		width: 600rpx;
		height: 100rpx;
		margin: 0 30rpx;
		border-radius: 10rpx;
		color: #fff;
	}
}
</style>
