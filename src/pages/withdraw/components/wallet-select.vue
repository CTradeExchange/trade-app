<template>
    <tui-bottom-popup background-color='transparent' :radius='false' :show='show' @close='close'>
        <view class='wallet-select'>
            <view class='wallet-header'>
                <view class='title'>
                    {{ $t('withdrawCoin.walletSelect') }}
                </view>
                <tui-icon class='close' name='shut' :size='40' unit='rpx' @click='close' />
            </view>
            <view v-if='list.length > 0' class='wallet-list'>
                <label v-for='(item, index) in list' :key='index' class='item' @click='selectWallet(item)'>
                    <view class='info'>
                        <view class='row'>
                            <span class='name'>
                                {{ item.currency }}-{{ item.chainName }}
                            </span>
                            <span v-if='item.remark' class='tag'>
                                {{ item.remark }}
                            </span>
                        </view>
                        <view class='code'>
                            {{ item.address }}
                        </view>
                    </view>
                    <tui-icon v-if='item.id === walletId' class='check' name='check' :size='36' unit='rpx' />
                </label>
            </view>
            <none-data v-else text='No address is added' />
            <view class='add-wallet' @click='addWallet'>
                <tui-icon class='plus' name='plus' :size='36' unit='rpx' />
                <span>{{ $t('withdrawCoin.walletAdd') }}</span>
            </view>
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
        // 列表数据
        list: {
            type: Array,
            default: () => []
        },
        // 选择的钱包id
        walletId: {
            type: [Number, String],
            default: 0
        }
    },
    methods: {
        // 关闭弹窗
        close () {
            this.$emit('close')
        },

        // 选择钱包
        selectWallet (item) {
            this.$emit('select', item)
        },

        // 点击添加钱包
        addWallet () {
            uni.navigateTo({
                url: '/pages/person/addWallet?isWithdraw=true'
            })
            setTimeout(() => {
                this.$emit('close')
            }, 200)
        }
    }
}
</script>

<style lang="scss" scoped>
::v-deep .tui-bottom-popup {
	padding-bottom: 0;
}
.wallet-select {
	@include styles('background-color', 'contentColor');
	padding-bottom: env(safe-area-inset-bottom);
}
.wallet-header {
	@include flexAll;
	position: relative;
	.title {
		@include flexAll;
		@include styles('color', 'color');
		height: 90rpx;
		font-size: 28rpx;
	}
	.close {
		@include styles('color', 'minorColor');
		position: absolute;
		right: 30rpx;
	}
}
.wallet-list {
	padding: 0 30rpx;
	min-height: 300rpx;
	.item {
		@include styles('border-top-color', 'lineColor');
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 0;
		border-top-style: solid;
		border-top-width: 1px;
		.info {
			flex: 1;
			.row {
				display: flex;
				align-items: center;
				.name {
					@include styles('color', 'color');
					margin-right: 15rpx;
					font-size: 30rpx;
				}
				.tag {
					@include styles('color', 'primary');
					@include styles('background-color', 'primaryAssistColor');
					padding: 5rpx 8rpx;
					font-size: 22rpx;
					border-radius: 4rpx;
                    word-break: break-word;
                    padding: 5px 10px;
				}
			}
			.code {
				margin-top: 10rpx;
				font-size: 24rpx;
			}
		}
		.check {
			@include styles('color', 'primary');
			font-weight: bold;
			margin-right: 10rpx;
		}
	}
}
.add-wallet {
	@include styles('border-top-color', 'lineColor');
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100rpx;
	padding: 0 30rpx;
	border-top-style: solid;
	border-top-width: 1rpx;
	.plus {
		margin-right: 15rpx;
	}
}
</style>
