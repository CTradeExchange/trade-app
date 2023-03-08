<template>
    <tui-bottom-popup :background-color='$style.assistColor' :radius='false' :show='show' @close='close'>
        <scroll-view class='popup-content' scroll-y>
            <view class='rule-container'>
                <view class='header'>
                    {{ $t('depositActivity.rule') }}
                </view>
                <text class='h3'>
                    {{ $t('depositActivity.rule') }}：
                </text>
                <p> {{ $t('depositActivity.ruleText',{ hour: activityInfo.rechargeGapHour,amount: activityInfo.rechargeAmount ,rewardAmount: activityInfo.rewardAmount }) }} </p>
                <text class='h3'>
                    {{ $t('depositActivity.ruleTip1') }}：
                </text>
                <view>
                    <view class='rule-item'>
                        1.{{ $t('depositActivity.ruleTip3',{ amount: activityInfo.rechargeAmount ,amount: activityInfo.rechargeAmount, rewardAmount: activityInfo.rewardAmount }) }}
                    </view>

                    <view class='rule-item'>
                        2.{{ $t('depositActivity.ruleTip4',{ amount: handleToFixed(activityInfo.rewardAmount/activityInfo.finishVolume,2) }) }}
                    </view>

                    <view class='rule-item'>
                        3.{{ $t('depositActivity.ruleTip5') }}
                    </view>
                    <view class='rule-item'>
                        4.{{ $t('depositActivity.ruleTip2') }}
                    </view>

                    <view class='rule-item'>
                        5.{{ $t('depositActivity.ruleTip6',{ day: activityInfo.finishDay }) }}
                    </view>

                    <view class='rule-item'>
                        6.{{ $t('depositActivity.ruleTip7') }}
                        
                        <view class='sub'>
                            <view class='sub-item'>
                                -{{ $t('depositActivity.ruleTip8') }}
                            </view>
                            <view class='sub-item'>
                                -{{ $t('depositActivity.ruleTip9') }}
                            </view>
                            <view class='sub-item'>
                                -{{ $t('depositActivity.ruleTip10') }}
                            </view>
                        </view>
                        {{ $t('depositActivity.ruleTip11') }}
                    </view>

                    <view class='rule-item'>
                        7.{{ $t('depositActivity.ruleTip12') }}
                    </view>

                    <view class='rule-item'>
                        8.{{ $t('depositActivity.ruleTip13') }}
                    </view>
                </view>
            </view>
        </scroll-view>
        <button class='know' @click='close'>
            {{ $t('common.know') }}
        </button>
    </tui-bottom-popup>
</template>

<script >
import store from '@/store/index.js'
import { toFixed } from '@/utils/calculation'	
export default {
    props: {
        // 是否显示弹窗
        show: {
            type: Boolean,
            default: false
        },
    },
    computed: {
        activityInfo () {
            return store.state._activity.info
        }
    },
    methods: {
        // 关闭弹窗
        close () {
            this.$emit('update:show', false)
        },
        handleToFixed (amount, digit) {
            return toFixed(amount, digit)
        }
    }
}
</script>

<style lang='scss' scoped>
.popup-content {
	@include styles('background', 'assistColor');
	max-height: 85vh;
	.name {
		font-size: 36rpx;
	}
	.des {
		margin-top: 20rpx;
		font-size: 30rpx;
	}
}
.rule-container {
    text-align: left;
    margin-top: 20rpx;
    padding:  100rpx 30rpx 30rpx 30rpx;
    .header{
        text-align: center; 
        font-size: 42rpx;
        font-weight: bold;
        margin-bottom: 30rpx;
    }
    .h3{
        font-size: 36rpx;
        font-weight: bold;
    }
}
.sub{
    padding: 20rpx 0 30rpx 20rpx;

}
.rule-item{
    margin-top: 20rpx;
    .sub-item{
        margin-top: 10rpx;
    }
}
ol {
    padding-left: 28px;
    font-size: 16px;
    line-height: 32px;
    list-style-type: decimal;
    color: var(--color);
    text-align: left;
    li {
        padding-left: 8px;
        margin-top: 12px;
        margin-bottom: 12px;
        &::marker {
            font-weight: 400;
            color: var(--placeholdColor);
        }
    }
}
ul {
    text-align: left;
    list-style-type: disc;
    padding-left: 28px;
}
p {
    margin-top: 12px;
    margin-bottom: 12px;
    font-size: 16px;
}

.know {
	@include styles('background', 'primary'); 
	display: flex;
	justify-content: center;
	align-items: center;
	width: 240rpx;
	height: 80rpx;
	margin: 20rpx auto 40rpx;
	color: #fff;
	border-radius: 10rpx;
}
</style>
