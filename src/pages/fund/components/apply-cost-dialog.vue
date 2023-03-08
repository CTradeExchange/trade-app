<template>
    <tui-modal custom padding='0rpx' :show='show'>
        <view class='info-wrap'>
            <view class='info-content'>
                <view class='title'>
                    {{ $t('fundInfo.applyDetail') }}
                </view>
                <view class='info-item header'>
                    <span>{{ $t('fundInfo.applyAssets') }}</span>
                    <span>{{ $t('fundInfo.applyAmount') }}</span>
                    <span>{{ $t('fundInfo.applyFees') }}</span>
                </view>
                <view v-for='item in infoList' :key='item.currency' class='info-item'>
                    <span>{{ item.currency }}</span>
                    <span>{{ item.amount }}</span>
                    <span>{{ item.fees }}</span>
                </view>
            </view>
            <view class='confirm-btn' @click='onConfirm'>
                {{ $t('common.sure') }}
            </view>
        </view>
    </tui-modal>
</template>

<script>
import { getFundCurrencyList } from '@/api/fund'
export default {
    data () {
        return {
            // 是否显示弹窗
            show: false,
            // 详情列表数据
            infoList: []
        }
    },
    methods: {
        // 显示详情弹窗
        open (item) {
            getFundCurrencyList({
                proposalNo: item.proposalNo
            }).then(res => {
                this.show = true
                this.infoList = res.data
            })
        },
		
        // 点击确定
        onConfirm () {
            this.show = false
        }
    }
}
</script>

<style lang="scss" scoped>
::v-deep {
	.tui-modal-box {
		overflow: hidden;
	}
}
.info-content {
	padding: 30rpx 40rpx;
	.title {
		@include styles('color', 'normalColor');
		text-align: center;
		margin-bottom: 20rpx;
		font-size: 30rpx;
	}
	.info-item {
		display: flex;
		justify-content: space-between;
		&:last-of-type {
			span {
				@include styles('border-bottom-color', 'lineColor');
				border-bottom-width: 1px;
				border-bottom-style: solid;
			}
		}
		span {
			@include styles('color', 'normalColor');
			@include styles('border-top-color', 'lineColor');
			@include styles('border-left-color', 'lineColor');
			flex: 1;
			padding: 12rpx;
			font-size: 24rpx;
			border-top-width: 1px;
			border-top-style: solid;
			border-left-width: 1px;
			border-left-style: solid;
			&:nth-of-type(3n) {
				@include styles('border-right-color', 'lineColor');
				border-right-width: 1px;
				border-right-style: solid;
			}
		}
		&.header {
			span {
				@include styles('color', 'normalColor');
				font-weight: bold;
			}
		}
	}
}
.confirm-btn {
	display: flex;
	height: 90rpx;
	justify-content: center;
	align-items: center;
	font-size: 30rpx;
	position: relative;
	&::before {
		@include styles('background', 'lineColor');
		content: '';
		width: 100%;
		height: 1px;
		position: absolute;
		top: 0;
		left: 0;
	}
}
</style>
