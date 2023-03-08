<template>
    <tui-bottom-popup
        background-color='transparent'
        :mask-z-index='9'
        :radius='false'
        :show='show'
        z-index='9'
        @close='close'
    >
        <view class='module-content'>
            <view class='module-header'>
                <view class='title' />
                <tui-icon class='close' name='shut' :size='40' unit='rpx' @click='close' />
            </view>
            <view class='module-body'>
                <view class='box'>
                    <input
                        v-model='pinCode'
                        :placeholder="$t('deposit.inputPIN')"
                        placeholder-class='placeholderClass'
                    />
                    <tui-icon
                        v-if='pinCode'
                        class='clear-close'
                        name='close-fill'
                        @click="pinCode = ''"
                    />
                </view>
            </view>
            <button class='confirm-btn' @click='onConfirm'>
                <span>{{ $t('common.sure') }}</span>
            </button>
        </view>
    </tui-bottom-popup>
</template>

<script>
export default {
    props: {
        // 是否显示弹窗
        show: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            // pin码
            pinCode: ''
        }
    },
    methods: {
        // 关闭弹窗
        close () {
            this.$emit('update:show', false)
            this.pinCode = ''
        },
		
        // 点击确定
        onConfirm () {
            if (!this.pinCode) {
                return this.$toast(this.$t('deposit.inputPIN'))
            }
            this.$emit('confirm', this.pinCode)
        }
    }
}
</script>

<style lang="scss" scoped>
.module-content {
	@include flexColumn;
	@include styles('background-color', 'contentColor');
	height: 500rpx;
	border-radius: 20rpx 20rpx 0 0;
}
.module-header {
	@include flexAll;
	position: relative;
	.title {
		@include flexAll;
		@include styles('color', 'color');
		height: 90rpx;
		font-size: 28rpx;
	}
	.close {
		@include styles('color', 'normalColor');
		position: absolute;
		right: 30rpx;
	}
}
.module-body {
	flex: 1;
	.box {
	    @include styles('border-color', 'lineColor');
	    display: flex;
	    justify-content: space-between;
	    margin: 50rpx 30rpx 0;
	    padding-bottom: 20rpx;
	    border-bottom: solid 1px #DDD;
	    input {
	        flex: 1;
	    }
	}
}
.confirm-btn {
	@include styles('background-color', 'primary');
	display: flex;
	align-items: center;
	justify-content: center;
	height: 90rpx;
	margin: 30rpx;
	font-size: 28rpx;
	color: #fff;
	border-radius: 6rpx;
}
</style>
