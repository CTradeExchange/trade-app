<template>
    <tui-modal custom :show='show'>
        <view class='withdraw-time'>
            <view class='title'>
                {{ $t('common.tip') }}
            </view>
            <view class='hint'>
                {{ $t('withdraw.timeHint') }}
            </view>
            <view class='content'>
                <view class='time-title'>
                    {{ $t('withdraw.timeName') }}
                </view>
                <view v-for='(item, index) in list' :key='index' class='item'>
                    <template v-if='item.openTimeLocal'>
                        <span class='label'>
                            {{ item.weekDay }}：
                        </span>
                        <span class='value'>
                            {{ item.openTimeLocal.toString() }}
                        </span>
                    </template>
                </view>
            </view>
            <tui-button height='72rpx' shape='circle' :size='28' @click='onConfirm'>
                {{ $t('common.sure') }}
            </tui-button>
        </view>
    </tui-modal>
</template>

<script>
export default {
    props: {
        // 是否显示弹窗
        show: {
            type: Boolean,
            default: false
        },
        // 列表数据
        list: {
            type: Array,
            default: () => []
        }
    },
    methods: {
        // 点击确定
        onConfirm () {
            this.$emit('confirm')
        }
    }
}
</script>

<style lang="scss" scoped>
.withdraw-time {
	.title {
		@include flexAll;
		font-size: 30rpx;
	}
	.hint {
		@include flexAll;
		margin-top: 15rpx;
		font-size: 27rpx;
	}
	.time-title {
		margin-bottom: 5rpx;
	}
	.item {
		display: flex;
		.label {
			width: 140rpx;
		}
	}
	.content {
		@include styles('color', 'normalColor');
		padding: 40rpx 0;
		font-size: 27rpx;
	}
	::v-deep .tui-btn {
		@include styles('background-color', 'warn');
	}
}
</style>
