<template>
    <tui-bottom-popup :show='show' @close='close'>
        <view class='popup-content'>
            <button @click='goDeposit'>
                {{ $t('common.deposit') }}
            </button>
            <button @click='goTransfer'>
                {{ $t('cRoute.transfer') }}
            </button>
            <button class='cancel' @click='close'>
                {{ $t('common.cancel') }}
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
        },
        // 当前玩法
        tradeType: {
            type: Number,
            defalut: 0
        },
        // 当前账户
        account: {
            type: Object,
            defalut: () => {}
        }
    },
    methods: {
        // 关闭弹窗
        close () {
            this.$emit('update:show', false)
        },
		
        // 跳转到充值页面
        goDeposit () {
            this.$method.goDeposit(this.account)
            this.close()
        },
		
        // 跳转到划转页面
        goTransfer () {
            this.$method.goTransfer(this.account)
            this.close()
        }
    }
}
</script>

<style lang='scss' scoped>
.popup-content {
	@include styles('background', 'contentColor');
	button {
		@include styles('color', 'color');
		@include styles('background', 'contentColor');
		display: flex;
		justify-content: center;
		align-items: center;
		height: 84rpx;
		font-size: 30rpx;
		letter-spacing: 2rpx;
		&.cancel {
			margin-top: 16rpx;
		}
	}
}
</style>
