<template>
    <view class='fundCard'>
        <view class='currencyImg'>
            <currency-icon :currency='fund.shareTokenCode' :size='120' />
        </view>
        <view class='fundCurrency'>
            {{ fund.fundName }}
        </view>
        <view class='fundType'>
            <span class='operation'>
                {{ fund.operationMode === 1 ? $t('fundInfo.operationModeValue1') : $t('fundInfo.operationModeValue2') }}
            </span>
            <span class='title'>
                {{ fund.fundType }}
            </span>
        </view>
        <view class='desc'>
            {{ fund.introduction }}
        </view>
        <ul class='valueList'>
            <li class='item'>
                <p class='muted'>
                    {{ $t('fundInfo.realtimeJZ') }}({{ fund.currency || fund.currencyCode }})
                </p>
                <p>
                    <span>{{ fund.netValue }}</span>
                </p>
                <p>
                    <span>
                        {{ fund.netValueChangeQuote }}
                    </span>
                    <span class='hours24' :class="[parseFloat(fund.netValueChangeQuote) < 0 ? 'down':'up']">
                        <em>24H</em>
                        <tui-icon name='turningdown' :size='32' unit='rpx' />
                    </span>
                </p>
            </li>
            <li class='item'>
                <p class='muted'>
                    {{ $t('fundInfo.marketPrice') }}({{ fund.currency || fund.currencyCode }})
                </p>
                <p>
                    <span>{{ fund.marketPrice }}</span>
                </p>
                <p>
                    <span>
                        {{ fund.marketPriceChangeQuote }}
                    </span>
                    <span class='hours24' :class="[parseFloat(fund.marketPriceChangeQuote) < 0 ? 'down':'up']">
                        <em>24H</em>
                        <tui-icon name='turningdown' :size='32' unit='rpx' />
                    </span>
                </p>
            </li>
            <li class='item'>
                <p class='muted'>
                    {{ $t('fundInfo.totalMarketValue') }}({{ fund.currency || fund.currencyCode }})
                </p>
                <p>
                    <span>{{ fund.totalBalance }}</span>
                </p>
            </li>
            <li class='item'>
                <p class='muted'>
                    {{ $t('fundInfo.latestPart') }}
                </p>
                <p>
                    <span>{{ fund.newShare }}</span>
                </p>
            </li>
        </ul>
    </view>
</template>

<script>
export default {
    props: {
        // 基金数据
        fund: {
            type: Object,
            default: () => {}
        }
    }
}
</script>

<style lang="scss" scoped>
.fundCard {
	@include styles('background', 'contentColor');
    padding: 0 rem(30px) rem(30px);
    margin: rem(100px) rem(30px) rem(30px) rem(30px);
    border-radius: rem(15px);
    box-shadow: 0 0 rem(12px) rgba(0, 0, 0, .2);
    position: relative;
}
.currencyImg {
	@include flexAll;
	::v-deep .currency-img {
		margin-top: -60rpx;
	}
}
.fundCurrency {
	margin-top: rem(20px);
	text-align: center;
	font-size: rem(50px);
	font-weight: bold;
}
.fundType {
    margin-top: rem(70px);
    text-align: center;
    font-size: rem(32px);
    font-weight: bold;
    .operation {
        display: inline-block;
        padding-right: rem(20px);
        line-height: 1;
    }
}
.desc {
    margin-top: 5px;
    line-height: 1.4;
    font-size: rem(28px);
    word-break: break-word;
}
.muted {
	@include styles('color', 'minorColor');
}
.valueList{
	@include styles('border-top-color', 'lineColor');
    margin-top: rem(30px);
	border-top-style: solid;
	border-top-width: 1rpx;
    padding-top: rem(30px);
	display: flex;
	justify-content: space-between;
	flex-wrap: wrap;
	.item {
		@include styles('background', 'bgColor');
		width: calc(50% - 15rpx);
		position: relative;
		border-radius: rem(10px);
		padding: rem(18px) rem(20px);
		margin-bottom: rem(15px);
		box-sizing: border-box;
		p {
			margin-bottom: 8rpx;
			&:last-of-type {
				margin-bottom: 0;
			}
		}
		.hours24 {
			@include styles('background', 'lineColor');
			display: inline-flex;
			align-items: center;
			margin-left: 10rpx;
			padding-left: 8rpx;
			font-size: rem(22px);
			border-radius: rem(6px);
			&.up {
				@include styles('color', 'riseColor');
				// @include styles('background', 'quoteFallBg');
				::v-deep .tui-icon {
					@include styles('color', 'riseColor');
					transform: rotate(180deg);
				}
			}
			&.down {
				@include styles('color', 'fallColor');
				// @include styles('background', 'quoteRiseBg');
				::v-deep .tui-icon {
					@include styles('color', 'fallColor');
				}
			}
		}
	}
}
</style>
