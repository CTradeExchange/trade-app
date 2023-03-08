<template>
    <tui-bottom-popup background-color='transparent' :radius='false' :show='show' @close='close'>
        <view class='bank-select'>
            <view class='bank-header'>
                <view class='title'>
                    {{ $t('withdrawMoney.bankPopupTitle') }}
                </view>
                <tui-icon class='close' name='shut' :size='40' unit='rpx' @click='close' />
            </view>
            <scroll-view v-if='list.length > 0' class='bank-content' scroll-y>
                <view class='bank-list'>
                    <label v-for='(item, index) in list' :key='index' :class="['item', { 'disable-item': item.bankCurrency !== currency }]" @click='selectBank(item)'>
                        <!-- <image class='icon' :src="'/static/image/bank_icon/BK_' + item.bankCode + '.png'" /> -->
                        <tui-icon :color='$style.minorColor' name='bankcard-fill' :size='48' unit='rpx' />
                        <view class='text'>
                            <view class='name'>
                                {{ item.bankName }}
                            </view>
                            <view v-if='item.bankAccount' class='no'>
                                {{ item.bankAccount }}
                            </view>
                            <view v-if='item.bankCurrency !== currency' class='tip'>
                                {{ $t('withdrawMoney.bankTips') }}
                            </view>
                        </view>
                        <tui-icon v-if='item.bankAccount === bankId' class='check' name='check' :size='40' unit='rpx' />
                    </label>
                </view>
            </scroll-view>
            <none-data v-else :text="$t('withdrawMoney.bankNone')" />
            <view class='add-bank' @click='addBank'>
                <tui-icon class='plus' :color='$style.color' name='plus' :size='36' unit='rpx' />
                <span>{{ $t('withdrawMoney.bankPopupBtn') }}</span>
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
        // 选择的银行卡id
        bankId: {
            type: [Number, String],
            default: 0
        },
        // 到账币种
        currency: {
            type: String,
            default: ''
        }
    },
    methods: {
        // 关闭弹窗
        close () {
            this.$emit('close')
        },
		
        // 选择银行卡
        selectBank (item) {
            if (item.bankCurrency !== this.currency) return
            this.$emit('select', item)
        },
		
        // 点击添加银行卡
        addBank () {
            uni.navigateTo({
                url: '/pages/person/addBank?isWithdraw=true'
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
.bank-select {
	@include styles('background-color', 'contentColor');
	padding-bottom: env(safe-area-inset-bottom);
}
.bank-header {
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
.bank-content {
	max-height: 800rpx;
	.bank-list {
		padding: 0 30rpx;
	}
	.item {
		@include styles('color', 'color');
		@include styles('border-top-color', 'lineColor');
		display: flex;
		align-items: center;
		padding: 30rpx 0;
		border-top-style: solid;
		border-top-width: 1px;
		.icon {
			width: 45rpx;
			height: 45rpx;
		}
		.text {
			flex: 1;
			margin: 0 20rpx;
			font-size: 26rpx;
			.no {
				margin-top: 10rpx;
			}
			.tip {
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
	.disable-item {
		@include styles('color', 'minorColor');
	}
}
.add-bank {
	@include styles('color', 'color');
	@include styles('border-top-color', 'lineColor');
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100rpx;
	padding: 0 30rpx;
	border-top-width: 1px;
	border-top-style: solid;
	.plus {
		margin-right: 15rpx;
	}
}
</style>
