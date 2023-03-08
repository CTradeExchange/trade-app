<template>
    <view :class="['popover-tips', value ? 'show' : 'hide']">
        <view class='popover-relative'>
            <span class='triangle'></span>
            <view class='text'>
                {{ text }}
            </view>
        </view>
    </view>
</template>

<script>
export default {
    props: {
        // 是否显示
        value: {
            type: Boolean,
            default: false
        },
        // 提示文案
        text: {
            type: String,
            default: ''
        },
        // 是否自动关闭
        autoClose: {
            type: Boolean,
            default: false
        },
        // 自动关闭的时间
        closeTime: {
            type: Number,
            default: 3000
        }
    },
    watch: {
        // 监听value
        value () {
            if (this.value && this.autoClose) {
                setTimeout(() => {
                    this.$emit('input', false)
                }, this.closeTime)
            }
        }
    },
    mounted () {
        this.$emit('input', false)
    }
}
</script>

<style lang="scss" scoped>
.popover-tips {
	display: flex;
	justify-content: center;
	width: 100%;
    position: absolute;
    top: -85rpx;
    transition: 0.15s ease-in;
    z-index: 100;
    opacity: 1;
    visibility: visible;
    &.hide {
        visibility: hidden;
        top: -120rpx;
        opacity: 0;
    }
}
.popover-relative {
	display: inline-flex;
	background: #4C5260;
	color: #fff;
	padding: 16rpx 24rpx;
	font-size: 27rpx;
	border-radius: 10rpx;
    position: relative;
    .triangle {
        border-width: 18rpx;
        border-style: solid;
		border-color: transparent;
        border-top-color: #4C5260;
        position: absolute;
        left: 50%;
        bottom: -28rpx;
        transform: translateX(-50%);
    }
}
</style>
