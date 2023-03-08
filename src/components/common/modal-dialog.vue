<template>
    <tui-modal
        cancel='onMask'
        class='modal-box'
        custom
        :mask-closable='mask'
        padding='0rpx'
        :show='modal'
        @cancel='onCancel'
    >
        <view class='content'>
            <view v-if='title' class='title'>
                {{ title }}
            </view>
            <text class='text'>
                {{ content }}
            </text>
        </view>
        <view class='handle'>
            <button v-if='showCancel' class='btn cancel' :style="{ 'color': cancelTextColor }" @click='onCancel'>
                {{ cancelText || $t('common.cancel') }}
            </button>
            <button v-if='showConfirm' class='btn confirm' :style="{ 'color': confirmTextColor }" @click='onConfirm'>
                {{ confirmText || $t('common.sure') }}
            </button>
        </view>
    </tui-modal>
</template>

<script>	
let confirmCallback = () => {}
let cancelCallback = () => {}

export default {
    data () {
        return {
            // 是否显示弹窗
            modal: false,
            // 是否可点击遮罩层关闭
            mask: false,
            // 标题
            title: '',
            // 提示文字
            content: '',
            // 是否显示取消按钮
            showCancel: false,
            // 是否显示确定按钮
            showConfirm: true,
            // 取消按钮文字
            cancelText: '',
            // 取消按钮文字颜色
            cancelTextColor: '',
            // 确定按钮文字
            confirmText: '',
            // 确定按钮文字颜色
            confirmTextColor: ''
        }
    },
    methods: {
        // 显示弹窗
        show (data) {
            this.mask = data.mask || false
            this.title = data.title || ''
            this.content = data.content || ''
            this.showCancel = data.showCancel || false
            this.showConfirm = data.showConfirm || true
            this.cancelText = data.cancelText || ''
            this.cancelTextColor = data.cancelTextColor || this.$style.minorColor
            this.confirmText = data.confirmText || ''
            this.confirmTextColor = data.confirmTextColor || this.$style.color
            this.modal = true
            return new Promise((resolve, reject) => {
                confirmCallback = resolve
                cancelCallback = reject
            })
        },
		
        // 点击取消
        onCancel () {
            this.modal = false
            cancelCallback()
        },
		
        // 点击确定 
        onConfirm () {
            this.modal = false
            confirmCallback()
        }
    }
}
</script>

<style lang="scss" scoped>
.modal-box {
	.title {
		@include styles('color', 'color'); 
		text-align: center;
		margin-top: -10rpx;
		margin-bottom: 30rpx;
		font-size: 32rpx;
		font-weight: bold;
	}
	.content {
		padding: 60rpx 40rpx;
		.text {
			@include styles('color', 'normalColor');
			display: block;
			line-height: 36rpx;
			text-align: center;
			font-size: 28rpx;
		}
	}
	.handle {
		display: flex;
		.btn {
			@include styles('border-top-color', 'lineColor');
			flex: 1;
			display: flex;
			justify-content: center;
			align-items: center;
			height: 96rpx;
			font-size: 30rpx;
			border-top-width: 1rpx;
			border-top-style: solid;
			&.cancel {
				@include styles('border-right-color', 'lineColor');
				border-right-width: 1rpx;
				border-right-style: solid;
			}
		}
	}
}
</style>
