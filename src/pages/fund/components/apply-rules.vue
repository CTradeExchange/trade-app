<template>
    <view class='fundRules'>
        <view class='block'>
            <h2 class='title'>
                {{ $t("fundInfo.applyRules") }}
            </h2>
            <ul class='olList'>
                <li>
                    <i class='n'>
                        1
                    </i>
                    <span>{{ $t('fundInfo.applyRule_tip1') }}</span>
                </li>
                <li>
                    <i class='n'>
                        2
                    </i>
                    <span>{{ $t('fundInfo.applyRule_tip2') }}</span>
                </li>
                <li>
                    <i class='n'>
                        3
                    </i>
                    <span>{{ $t('fundInfo.applyRule_tip4') }}</span>
                </li>
                <li>
                    <i class='n'>
                        4
                    </i>
                    <span>{{ $t('fundInfo.applyRule_tip3') }}</span>
                </li>
            </ul>
        </view>
        <view class='block'>
            <h2 class='title'>
                {{ $t('fundInfo.jz_formula') }}
            </h2>
            <p>1、{{ $t('fundInfo.jz_formulaContent') }}</p>
            <p>2、{{ $t('fundInfo.fundRedeemFormula4') }}</p>
            <p class='indent'>
                {{ $t('fundInfo.fundRedeemFormula5') }}
            </p>
            <p>3、{{ $t('fundInfo.fundRedeemFormula6') }}</p>
            <p class='indent'>
                {{ $t('fundInfo.fundRedeemFormula7',{ number: 'A' }) }}
            </p>
            <p class='indent'>
                {{ $t('fundInfo.fundRedeemFormula8',{ number: 'A' }) }}
            </p>
            <p class='indent'>
                {{ $t('fundInfo.fundRedeemFormula7',{ number: 'B' }) }}
            </p>
            <p class='indent'>
                {{ $t('fundInfo.fundRedeemFormula8',{ number: 'B' }) }}
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
                    <strong>{{ $t('fundInfo.deductRuletxt1') }}</strong>
                </view>
                <view v-for='(item, index) in fund.purchaseCurrencySetting' :key='index' class='row'>
                    <span class='label'>
                        {{ item.currencyCode === 'self' ? $t('fundInfo.basketAssets') : item.currencyName }}
                    </span>
                    <span class='value'>
                        {{ item.purchaseFeeProportion ? mul(item.purchaseFeeProportion, 100) : 0 }}%
                    </span>
                </view>
            </view>
            <view class='chunk'>
                <view class='name'>
                    <strong>{{ $t('fundInfo.deductRuletxt2') }}</strong>
                    <span>{{ fund.managementFee ? mul(fund.managementFee, 100) : 0 }}% {{ $t('fundInfo.deductRuletxt3') }}</span>
                </view>
                <view class='text'>
                    {{ $t('fundInfo.deductRuledesc', { 'time': dailySettlementTime }) }}
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import { isEmpty } from '@/utils/util.js'
import { mul } from '@/utils/calculation.js'
export default { 
    props: {
        // 基金信息
        fund: {
            type: Object,
            default: () => {}
        }
    },
    computed: {
        // 结算时间
        dailySettlementTime () {
            const value = this.fund.dailySettlementTime
            if (isEmpty(value)) {
                return ''
            } else {
                return this.$dayjs().utc().startOf('day').utcOffset(this.utcOffset).add(parseInt(value), 'minute').format('HH:mm')
            }
        }
    },
    methods: {
        mul
    }
}
</script>

<style lang="scss" scoped>
.fundRules {
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
			line-height: 36rpx;
			font-size: 26rpx;
		}
	}
}
</style>
