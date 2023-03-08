<template>
    <view class='fund-base'>
        <view class='cellTitle'> 
            {{ $t("fundInfo.fundSurvey") }}
        </view>
        <ul v-if='fundInfo' class='fundBaseList'>
            <li v-if='fundInfo.fundName' class='item'>
                <span class='hd'>
                    {{ $t('fundInfo.fundName') }}
                </span>
                <span class='ft'>
                    {{ fundInfo.fundName }}
                </span>
            </li>
            <li v-if='fundInfo.upDate' class='item'>
                <span class='hd'>
                    {{ $t('fundInfo.fundCreateTime') }}
                </span>
                <span class='ft'>
                    {{ fundInfo.upDate }}
                </span>
            </li>
            <li v-if='fundInfo.newShare' class='item'>
                <span class='hd'>
                    {{ $t('fundInfo.latestPart') }}
                </span>
                <span class='ft'>
                    {{ fundInfo.newShare }}
                </span>
            </li>
            <li v-if='fundInfo.shareTokenCode' class='item'>
                <span class='hd'>
                    {{ $t('fundInfo.shareCurrency') }}
                </span>
                <span class='ft'>
                    {{ fundInfo.shareTokenCode }}
                </span>
            </li>
            <li v-if='fundInfo.managerName' class='item'>
                <span class='hd'>
                    {{ $t('fundInfo.fundManager') }}
                </span>
                <span class='ft van-ellipsis'>
                    {{ fundInfo.managerName }}
                </span>
            </li>
            <li v-if='(fundInfo.trackIndex && fundInfo.trackProduct) || fundInfo.trackIndexOut' class='item'>
                <span class='hd'>
                    {{ $t('fundInfo.followIndex') }}
                </span>
                <span class='ft' @click='toTrackProduct'>
                    {{ fundInfo.trackProduct ? fundInfo.trackProduct.symbolName : fundInfo.trackIndexOut }}
                    <i v-if='fundInfo.trackProduct.symbolName'>
                        &gt;
                    </i>
                </span>
            </li>
            <li v-if='fundInfo.operationMode' class='item'>
                <span class='hd'>
                    {{ $t('fundInfo.operationMode') }}
                </span>
                <span class='ft'>
                    {{ fundInfo.operationMode === 1 ? $t('fundInfo.operationModeValue1') : $t('fundInfo.operationModeValue2') }}
                </span>
            </li>
            <li v-if='fundInfo.fundType' class='item'>
                <span class='hd'>
                    {{ $t('fundInfo.fundType') }}
                </span>
                <span class='ft van-ellipsis'>
                    {{ fundInfo.fundType }}
                </span>
            </li>
        </ul>
    </view>
</template>

<script>
export default {
    props: {
        // 基金数据
        fundInfo: {
            type: Object,
            default: () => {}
        }
    },
    methods: {
        // 跳转到指数产品
        toTrackProduct () {
            if (this.fundInfo.trackIndex && this.fundInfo.trackProduct) {
                const item = this.fundInfo.trackProduct
                this.$method.goChartPage(item)
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.fund-base {
	padding: 0 25rpx;
}
.cellTitle {
    font-size: rem(30px);
	font-weight: bold;
	padding-top: 30rpx;
	padding-bottom: 20rpx;
}
.fundBaseList{
    .item{
        display: flex;
        justify-content: space-between;
        font-size: rem(28px);
        line-height: rem(60px);
        .hd {
			@include styles('color', 'minorColor');
            white-space: nowrap;
        }
        .ft {
            word-break: break-word;
            padding-left: rem(80px);
        }
    }
}
</style>
