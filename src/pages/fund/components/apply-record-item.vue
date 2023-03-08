<template>
    <view class='recordItem' @click='full = true'>
        <view class='title'>
            <label class='riseColor'>
                {{ $t('fundInfo.buy') }}
            </label>
            <span>{{ data.fundName }}</span>
        </view>
        <ul class='infos' :class="{ 'full': full || index === 0 }">
            <li class='item'>
                <span class='label'>
                    {{ $t('fundInfo.applyAmount') }}
                    <template v-if="data.currencyPay !== 'self'">
                        ({{ data.currencyPay }})
                    </template>
                </span>
                <span v-if="data.currencyPay !== 'self'">
                    {{ data.amountPay }}
                </span>
                <span v-else class='look' @click="$emit('showDetail')">
                    {{ $t('common.look') }}
                </span>
            </li>
            <li class='item'>
                <span class='label'>
                    {{ $t('fundInfo.realtimeJZ') }}({{ data.currencyNet }})
                </span>
                <span>{{ data.sharesNet }}</span>
            </li>
            <li class='item'>
                <span class='label'>
                    {{ $t('fundInfo.applyFees') }}
                    <template v-if="data.currencyPay !== 'self'">
                        ({{ data.currencyPay }})
                    </template>
                </span>
                <span v-if="data.currencyPay !== 'self'">
                    {{ data.fees }}
                </span>
                <span v-else class='look' @click="$emit('showDetail')">
                    {{ $t('common.look') }}
                </span>
            </li>
            <li class='item'>
                <span class='label'>
                    {{ $t('fundInfo.applyShares') }}({{ data.currencyShares }})
                </span>
                <span>{{ data.shares }}</span>
            </li>
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
                <span>{{ data.sharesStatus === 1 ? $t("fundInfo.confirmed") : $t("fundInfo.willConfirmed") }}</span>
            </li>
            <li class='item'>
                <span class='label'>
                    {{ $t('fundInfo.purchaseTime') }}
                </span>
                <span>{{ formatTime(data.createTime) }}</span>
            </li>
            <li class='item'>
                <span class='label'>
                    {{ $t('trade.pendingNo') }}
                </span>
                <span>{{ data.proposalNo }}</span>
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
