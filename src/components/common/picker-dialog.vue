<template>
    <view>
        <mask-layer :show='show' @close='onClose' />
        <view 
            :class="['picker-layer', show ? 'picker-layer-show' : 'picker-layer-hide']"
            :style="{ marginBottom: bottom ? bottom + 'px' : 0 }"
        >
            <view class='handle'>
                <button class='btn cancel' @click='onClose'>
                    {{ $t('common.cancel') }}
                </button>
                <button class='btn confirm' @click='onConfirm'>
                    {{ $t('common.sure') }}
                </button>
            </view>
            <slot name='header'></slot>
            <picker-view
                v-if='$slots.default'
                class='picker-view'
                indicator-class='picker-indicator'
                mask-class='picker-mask'
                :value='value'
                @change='onChange'
            >
                <slot></slot>
            </picker-view>
        </view>
    </view>
</template>

<script>
export default {
    props: {
        // 是否显示弹窗（默认值）
        modelValue: {
            type: Boolean,
            default: false
        },
        // 默认选中项
        defaultValue: {
            type: Array,
            default: () => []
        },
        // 列数
        column: {
            type: Number,
            default: 1
        },
        // bottom高度
        bottom: {
            type: Number,
            default: 0
        }
    },
    data () {
        return {
            // 是否显示弹窗
            show: false,
            // picker-view-column 选择的第几项（下标从 0 开始）
            value: []
        }
    },
    watch: {
        // 监听modelValue
        modelValue () {
            this.show = this.modelValue
        },
        // 监听defaultValue
        defaultValue () {
            this.value = this.defaultValue
        }
    },
    mounted () {
        this.show = this.modelValue
        switch (this.column) {
            case 1: 
                this.value = [0]
                break
            case 2: 
                this.value = [0, 0]
                break
            case 3:
                this.value = [0, 0, 0]
                break
        }
    },
    methods: {
        // 点击取消
        onClose () {
            this.$emit('update:modelValue', false)
        },
		
        // 点击确定
        onConfirm () {
            this.$emit('change', this.value.length === 1 ? this.value[0] : this.value)
            this.$emit('update:modelValue', false)
        },
		
        // 改变当前选项
        onChange (e) {
            this.value = e.detail.value
            this.$emit('switch', this.value.length === 1 ? this.value[0] : this.value)
        }
    }
}
</script>

<style lang="scss" scoped>
::v-deep .mask-layer {
	top: 0;
	bottom: 0;
}
.picker-layer {
	width: 100%;
	position: fixed;
	left: 0;
	z-index: 1001;
	transition: all .3s ease-in-out;
	.handle {
		@include styles('background-color', 'contentColor');
		@include styles('border-bottom-color', 'lineColor');
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 90rpx;
		border-bottom-style: solid;
		border-bottom-width: 1rpx;
		.btn {
			display: inline-flex;
			justify-content: center;
			align-items: center;
			width: 120rpx;
			height: 100%;
			font-size: 28rpx;
			&.cancel {
				@include styles('color', 'minorColor');
			}
			&.confirm {
				@include styles('color', 'color');
			}
		}
	}
	.picker-view {
		@include styles('background-color', 'contentColor');
		width: 100%;
		height: 500rpx;
		&::v-deep .item {
			@include styles('color', 'color');
			display: flex;
			justify-content: center;
			align-items: center;
			height: 80rpx;
		}
	}
	.picker-indicator {
		height: 80rpx;
		&:before {
			@include styles('border-top-color', 'lineColor');
			border-top-width: 1rpx;
			border-top-style: solid;
			transform: scaleY(1);
		}
		&:after {
			@include styles('border-bottom-color', 'lineColor');
			border-bottom-width: 1rpx;
			border-bottom-style: solid;
			transform: scaleY(1);
		}
	}
	&::v-deep .picker-mask {
		background: none;
	}
}
.picker-layer-show {
	bottom: 0;
}
.picker-layer-hide {
	bottom: -590rpx;
    visibility: hidden;
}
</style>
