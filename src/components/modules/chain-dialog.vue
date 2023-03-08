<template>
    <tui-bottom-popup :background-color='$style.bgColor' :show='modelValue' @close='onClose'>
        <view class='chain-dialog' @touchmove.stop>
            <view class='header'>
                <view class='header-title' />
                <i class='iconfont icon_guanbi' @click='onClose'></i>
            </view>
            <view class='chain-content'>
                <view class='chain-list'>
                    <view
                        v-for='(item, index) in list'
                        :key='index'
                        class='item'
                        :class='{ active: chainName === item }'
                        @click='selectChain(item)'
                    >
                        <view class='name'>
                            <view class='t1'>
                                {{ item }}
                            </view>
                        </view>
                        <view class='check'>
                            <tui-icon class='tick' name='check' :size='24' unit='rpx' />
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </tui-bottom-popup>
</template>

<script>
export default {
    props: {
        // 是否显示弹窗
        modelValue: {
            type: Boolean,
            default: false
        },
        // 列表数据
        list: {
            type: Array,
            defalut: () => []
        },
        // 选择的链名称
        chainName: {
            type: String, 
            defalut: ''
        }
    },
    methods: {
        // 关闭弹窗
        onClose () {
            this.$emit('update:modelValue', false)
        },
		
        // 选择链
        selectChain (item) {
            this.$emit('update:modelValue', false)
            if (item !== this.chainName) {
                this.$emit('update:chainName', item)
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.chain-dialog {
	display: flex;
	flex-direction: column;
	height: calc(100vh - 400rpx);
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 36rpx 30rpx;
		.header-title {
			@include styles('color', 'color');
			font-size: 45rpx;
			font-weight: bold;
		}
		.icon_guanbi {
			@include styles('color', 'color');
			font-size: 28rpx;
		}
	}
	.chain-content {
		padding: 0 30rpx;
		flex: 1;
		overflow-y: auto;
	}
	.chain-list {
		.item {
			@include styles('background', 'contentColor');
			display: flex;
			justify-content: center;
			align-items: center;
			height: 110rpx;
			margin-bottom: 30rpx;
			padding: 0 25rpx;
			border: 1rpx solid transparent;
			border-radius: 10rpx;
			position: relative;
			.t1 {
				font-size: 32rpx;
				@include styles('color', 'color');
			}
			.check {
				display: none;
			}
		}
		.active {
			@include styles('background', 'primarybg');
			@include styles('border-color', 'primary');
			.check {
				@include styles('background', 'primary');
				display: flex;
				justify-content: center;
				align-items: center;
				width: 30rpx;
				height: 30rpx;
				border-radius: 0 10rpx 0 10rpx;
				position: absolute;
				top: -1px;
				right: -1px;
				.tick {
					color: #fff !important;
				}
			}
		}
	}
}
</style>
