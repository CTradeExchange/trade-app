<template>
    <tui-modal custom :show='show'>
        <view class='dialog-content'>
            <view class='no-remind' @click='onTip'>
                {{ $t('login.neverTip') }}
            </view>
            <view class='password-icon'>
                <i class='iconfont icon_password'></i>
            </view>
            <view class='text'>
                {{ $t('login.pwdTips') }}
            </view>
            <view class='handle'>
                <button class='btn set-btn' @click='onSet'>
                    {{ $t('login.goSet') }}
                </button>
                <span class='line'></span>
                <button class='btn next-btn' @click='onNext'>
                    {{ $t('login.nextTime') }}
                </button>
            </view>
        </view>
    </tui-modal>
</template>

<script>
import { localSet } from '@/utils/util.js'	
	
export default {
    props: {
        // 是否显示弹窗
        show: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        // 点击不再提示
        onTip () {
            localSet('loginPwdIgnore', true)
            this.$emit('update:show', false)
            uni.reLaunch({
                url: '/pages/home/index'
            })
        },
		
        // 点击去设置
        onSet () {
            this.$emit('update:show', false)
            uni.reLaunch({
                url: '/pages/mine/setLoginPwd'
            })
        },
		
        // 点击下次
        onNext () {
            this.$emit('update:show', false)
            uni.reLaunch({
                url: '/pages/home/index'
            })
        }
    }
}
</script>

<style lang="scss" scoped>
::v-deep .tui-modal-box {
	border-radius: 10rpx !important;
	padding: 0rpx !important;
}
.dialog-content {
	@include flexColumnCenter;
	padding-top: 80rpx;
	position: relative;
	.no-remind {
		@include styles('color', 'minorColor');
		font-size: 26rpx;
		position: absolute;
		top: 20rpx;
		right: 25rpx;
	}
	.password-icon {
		i {
			@include styles('color', 'primary');
			font-size: 60rpx;
		}
	}
	.text {
		text-align: center;
		line-height: 42rpx;
		margin-top: 40rpx;
		margin-bottom: 60rpx;
		padding: 0 50rpx;
		@include styles('color', 'color');
	}
	.handle {
		@include flexAlign;
		@include styles('border-top-color', 'lineColor');
		border-top-style: solid;
		border-top-width: 1rpx;
		width: 100%;
		.btn {
			@include flexAll;
			flex: 1;
			height: 100rpx;
			letter-spacing: 2rpx;
			font-size: 32rpx;
			&.next-btn {
				@include styles('color', 'minorColor');
			}
			&.set-btn{
				@include styles('color', 'primary');
			}
		}
		.line {
			@include styles('background', 'lineColor');
			width: 1rpx;
			height: 60rpx;
		}
	}
}
</style>
