<template>
    <view class='fundRules'>
        <view class='block'>
            <h2 class='title'>
                {{ $t('fundInfo.redeemRules') }}
            </h2>
            <div class='tDate'>
                <div class='start'>
                    <p>{{ $t('fundInfo.tDate') }}</p>
                    <p>{{ $t('fundInfo.redeemSubmit') }}</p>
                </div>
                <div class='center'>
                    <p>{{ $t('fundInfo.tDate') }}+1</p>
                </div>
                <div class='end'>
                    <p>{{ $t('fundInfo.tDate') }}+2</p>
                    <p>{{ $t('fundInfo.fundArrive') }}</p>
                </div>
            </div>
            <ul class='olList'>
                <li>
                    <i class='n'>
                        1
                    </i>
                    <span>{{ $t('fundInfo.redeem_tip1') }}</span>
                </li>
                <li>
                    <i class='n'>
                        2
                    </i>
                    <span>{{ $t('fundInfo.redeem_tip2') }}</span>
                </li>
                <li>
                    <i class='n'>
                        3
                    </i>
                    <span>{{ $t('fundInfo.redeem_tip3') }}</span>
                </li>
                <li>
                    <i class='n'>
                        4
                    </i>
                    <span>{{ $t('fundInfo.fundRedeemFormula9') }}</span>
                </li>
            </ul>
        </view>
        <view class='block'>
            <h2 class='title'>
                {{ $t('fundInfo.jz_formula') }}
            </h2>
            <p>1、{{ $t('fundInfo.jz_formulaContent') }}</p>
            <p>2、{{ $t('fundInfo.fundRedeemFormula10') }}</p>
            <p class='indent'>
                {{ $t('fundInfo.fundRedeemFormula11') }}
            </p>
            <p>3、{{ $t('fundInfo.fundRedeemFormula12') }}</p>
            <p class='indent'>
                {{ $t('fundInfo.fundRedeemFormula13',{ number: 'A' }) }}
            </p>
            <p class='indent'>
                {{ $t('fundInfo.fundRedeemFormula14',{ number: 'A' }) }}
            </p>
            <p class='indent'>
                {{ $t('fundInfo.fundRedeemFormula13',{ number: 'B' }) }}
            </p>
            <p class='indent'>
                {{ $t('fundInfo.fundRedeemFormula14',{ number: 'B' }) }}
            </p>
            <p class='indent'>
                ...
            </p>
        </view>
        <view v-if='fund.fundId' class='block'>
            <h2 class='title'>
                {{ $t('fundInfo.deductRuletit1') }}
            </h2>
            <view class='chunk'>
                <view class='name'>
                    <strong>{{ $t('fundInfo.deductRuletxt4') }}</strong>
                </view>
                <view v-for='(item, index) in fund.redemptionCurrencySetting' :key='index' class='row'>
                    <span class='label'>
                        {{ item.currencyCode === 'self' ? $t('fundInfo.basketAssets') : item.currencyName }}
                    </span>
                    <span class='value'>
                        {{ item.redemptionFeeProportion ? mul(item.redemptionFeeProportion, 100) : 0 }}%
                    </span>
                </view>
                <view class='text'>
                    {{ $t('fundInfo.deductRuledesc2') }}
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import { mul } from '@/utils/calculation.js'
export default {
    props: {
        // 基金信息
        fund: {
            type: Object,
            default: () => {}
        }
    },
    methods: {
        mul
    }
}
</script>

<style lang="scss" scoped>
.fundRules {
	.tDate {
		position: relative;
		display: flex;
		justify-content: space-between;
		padding-top: 15px;
		padding-bottom: rem(30px);
		&::before {
			@include styles('background', 'primary');
			position: absolute;
			top: 5px;
			right: 15px;
			left: 15px;
			height: 2px;
			content: '';
		}
		.end {
			text-align: right;
		}
		.start,
		.center,
		.end {
			position: relative;
			&::before {
				@include styles('background', 'contentColor');
				@include styles('border-color', 'primary');
				position: absolute;
				top: -14px;
				left: 10px;
				width: 5px;
				height: 5px;
				border-width: 2px;
				border-style: solid;
				border-radius: 100%;
				content: '';
			}
		}
		.end {
			&::before {
				right: 10px;
				left: initial;
			}
		}
	}
    .block {
		@include styles('background', 'contentColor');
        margin-bottom: 20rpx;
        padding: rem(30px) rem(30px);
		.title {
			font-size: 40rpx;
			margin-bottom: 20rpx;
		}
        .olList {
            line-height: 48rpx;
			font-size: 26rpx;
			li {
				margin-bottom: 10rpx;
				.n {
					@include styles('color', 'primary');
					@include styles('border-color', 'primary');
				    display: inline-flex;
				    width: 15px;
				    height: 15px;
					justify-content: center;
					align-items: center;
				    margin-right: 12rpx;
				    font-size: rem(28px);
					border-width: 2rpx;
					border-style: solid;
				    border-radius: 100%;
				}
			}
        }
		p {
			line-height: 48rpx;
			font-size: 26rpx;
			&.indent {
				text-indent: 38rpx;
			}
		}
    }
	.chunk {
		margin-bottom: 30rpx;
		&:last-of-type {
			margin-bottom: 0;
		}
		.name {
			display: flex;
			justify-content: space-between;
			margin-bottom: 10rpx;
			font-size: 30rpx;
			strong {
				font-weight: bold;
			}
			span {
				@include styles('color', 'normalColor');
				font-size: 26rpx;
			}
		}
		.row {
			@include styles('color', 'normalColor');
			display: flex;
			justify-content: space-between;
			align-items: center;
			height: 40rpx;
			font-size: 26rpx;
		}
		.text {
			@include styles('color', 'normalColor');
			margin-top: 15rpx;
			line-height: 36rpx;
			font-size: 26rpx;
		}
	}
}
</style>
