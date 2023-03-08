<template>
    <view class='recordItem' @click='full = true'>
        <view class='title'>
            <label class='fallColor'>
                {{ $t('fundInfo.sell') }}
            </label>
            <span>{{ data.fundName }}</span>
        </view>
        <ul class='infos' :class='{ "full": full || index === 0 }'>
            <li class='item'>
                <span class='label'>
                    {{ $t('fundInfo.redeemShares') }}({{ data.currencyShares }})
                </span>
                <span>{{ data.shares }}</span>
            </li>
            <template v-if='data.sharesStatus === 1'>
                <li class='item'>
                    <span class='label'>
                        {{ $t('fundInfo.realtimeJZ') }}({{ data.currencyNet }})
                    </span>
                    <span>{{ data.sharesNet }}</span>
                </li>
                <li class='item'>
                    <span class='label'>
                        {{ $t('fundInfo.redeemFees') }}
                        <template v-if="data.currencyRedeem !== 'self'">
                            ({{ data.currencyRedeem }})
                        </template>
                    </span>
                    <span v-if="data.currencyRedeem !== 'self'">
                        {{ data.fees }}
                    </span>
                    <span v-else class='look' @click="$emit('showDetail')">
                        {{ $t('common.look') }}
                    </span>
                </li>
                <li class='item'>
                    <span class='label'>
                        {{ $t('fundInfo.redeemAmount') }}
                        <template v-if="data.currencyRedeem !== 'self'">
                            ({{ data.currencyRedeem }})
                        </template>
                    </span>
                    <span v-if="data.currencyRedeem !== 'self'">
                        {{ data.amountRedeem }}
                    </span>
                    <span v-else class='look' @click="$emit('showDetail')">
                        {{ $t('common.look') }}
                    </span>
                </li>
            </template>
            <li class='item'>
                <span class='label'>
                    {{ $t('fundInfo.shareCurrency') }}
                </span>
                <span>{{ data.currencyShares }}</span>
            </li>
            <li class='item'>
                <span class='label'>
                    {{ $t('fundInfo.sureSharesStatus') }}
                </span>
                <span v-if='current === 0'>
                    {{ data.sharesStatus === 1 ? $t("fundInfo.confirmed") : $t("fundInfo.willConfirmed") }}
                </span>
                <span v-else>
                    {{ data.sharesStatus === 1 ? $t("fundInfo.confirmed") : $t("fundInfo.confirmFailure") }}
                </span>
            </li>
            <template v-if='data.sharesStatus === 0'>
                <li class='item'>
                    <span class='label'>
                        {{ $t('fundInfo.customerAsset') }}
                    </span>
                    <span v-if="data.currencyRedeem !== 'self'">
                        {{ data.currencyRedeem }}
                    </span>
                    <span v-else>
                        {{ $t('fundInfo.basketAssets') }}
                    </span>
                </li>
                <li class='item'>
                    <span class='label'>
                        {{ $t('fundInfo.applicationTime') }}
                    </span>
                    <span>
                        {{ formatTime(data.createTime) }}
                    </span>
                </li>
            </template>
            <li v-if='data.sharesStatus === 1' class='item'>
                <span class='label'>
                    {{ $t('fundInfo.confirmTime') }}
                </span>
                <span>{{ formatTime(data.updateTime) }}</span>
            </li>
            <li class='item'>
                <span class='label'>
                    {{ $t('trade.pendingNo') }}
                </span>
                <span>
                    {{ data.proposalNo }}
                </span>
            </li>
        </ul>
        <view v-if='!full && index !== 0' class='control'>
            <tui-icon :color='$style.minorColor' name='arrowdown' :size='48' unit='rpx' />
        </view>
    </view>
</template>

<script>
export default {
    props: {
        // 数据
        data: {
            type: Object,
            default: () => {}
        },
        // 索引
        index: {
            type: Number,
            default: -1
        },
        // 当前模块 0:当前赎回 1:历史赎回
        current: {
            type: [Number, String],
            default: ''
        }
    },
    data () {
        return {
            // 是否展开
            full: false
        }
    }
}
</script>

<style lang="scss" scoped>
.recordItem {
	@include styles('background', 'contentColor');
    padding: rem(20px) rem(30px);
    margin-bottom: rem(20px);
    .title {
		padding: 10rpx 0;
        font-size: rem(28px);
		label {
			margin-right: rem(8px);
		}
    }
    .infos {
		font-size: 26rpx;
		max-height: 160rpx;
		overflow: hidden;
		transition: 2s;
		&.full {
			max-height: 10000rpx;
		}
        .item {
            display: flex;
            justify-content: space-between;
			align-items: center;
			height: 40rpx;
			font-size: rem(25px);
			.label {
				@include styles('color', 'minorColor');
			}
			.look {
				@include styles('color', 'primary');
			}
        }
    }
	.control {
		display: flex;
		justify-content: center;
	}
}
</style>
