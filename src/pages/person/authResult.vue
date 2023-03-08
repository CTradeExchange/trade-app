<template>
    <view class='layout' :change-color='changeColor' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container'>
            <!-- 头部导航栏 -->
            <nav-bar />   
            <!-- 内容区域 -->
            <view class='layout-content'>
                <view class='module'>
                    <i class='iconfont icon_success'></i>
                    <view class='title'>
                        {{ $t('auth.tips0') }}
                    </view>
                    <view class='tip'>
                        {{ $t('auth.tips1') }}
                    </view>
                    <view class='handle'>
                        <button class='btn color-1' @click='backHome'>
                            {{ $t('common.backHome') }}
                        </button>
                        <button class='btn color-2' @click='lookProcess'>
                            {{ $t('common.lookProcess') }}
                        </button>
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
        this.$addAppsEvent('kyc_result_view')
    },
    methods: {
        // 返回首页
        backHome () {
            uni.switchTab({
                url: '/pages/home/index'
            })
        },
		
        // 查看进度
        lookProcess () {
            uni.reLaunch({
                url: '/pages/person/authentication'
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.layout-container {
	@include styles('background-color', 'contentColor');
}
.module {
	@include flexColumnCenter;
	padding: 100rpx 40rpx 30rpx;
	.icon_success {
		@include styles('color', 'primary');
		font-size: 100rpx;
	}
	.title {
		margin-top: 50rpx;
		font-size: 40rpx;
		font-weight: bold;
	}
	.tip {
		@include styles('color', 'normalColor');
		margin-top: 20rpx;
		font-size: 28rpx;
	}
	.handle {
		@include flex;
		margin-top: 70rpx;
		.btn {
			@include flexAll;
			width: 280rpx;
			height: 84rpx;
			margin: 0 22rpx;
			border-radius: 6rpx;
			&.color-1 {
				@include styles('background-color', 'primary');
				color: #fff;
			}
			&.color-2 {
				@include styles('color', 'primary');
				@include styles('border-color', 'primary');
				border-width: 1px;
				border-style: solid;
			}
		}
	}
}
</style>
