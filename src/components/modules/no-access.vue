<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <view class='tui-skeleton layout-container'> 
            <!-- 内容区域 -->
            <view class='layout-content'>
                <view class='noaccess'>
                    <view class='title'>
                        <tui-icon :color='$style.warn' name='close' size='26' />
                        <text class='title-text'>
                            {{ $t('noAccess.ip') }}
                        </text>
                    </view>
                    <p>
                        {{ $t('noAccess.text') }}
                    </p>
                </view>
            </view>
        </view>
    </view>
</template>

<script>

export default {
}

</script>

<style lang="scss" scoped>
.layout-container {
    @include styles('background-color', 'contentColor');
    .noaccess{
        margin: 60rpx 60rpx 0 ;
        padding: 40rpx;
        border: solid 1px var(--lineColor);
        border-radius: 16rpx;
        .title{
            .title-text{
                margin-left: 20rpx;
            }
            font-size: 32rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 40rpx;
        }
        >p{
            color: var(--normalColor);
            line-height: 50rpx;
            width: 90%;
            margin: 0 auto;
        }
    }
}
</style>
