<template>
    <view class='signal-list'>
        <view class='title'>
            {{ $t('home.signalDesc') }}
        </view>
        <block v-for='(item, index) in list' :key='index'>
            <view class='item' @click='goQuote'>
                <view class='item-title'>
                    <view v-if='item.icon' class='item-icon-warp'>
                        <image v-for='(sitem, key) in item.icon' :key='key' class='item-icon' :src='getCurrencyIcon(sitem)' />
                    </view>
                    <view class='symbol'>
                        {{ item.symbol }}
                    </view>
                    <view class='name'>
                        {{ item.name }}
                    </view>
                </view>
                <view class='item-extra'>
                    <view class='item-time'>
                        {{ item.time }}
                    </view>
                    <view class='item-status' :class='item.color'>
                        <view>{{ item.color === 'up' ? $t('home.buy'): $t('home.sell') }}</view>
                    </view>
                    <tui-icon class='item-arrow' name='arrowright' :size='20' />
                </view>
            </view>
        </block>
    </view>
</template>

<script>
export default {
    data () {
        return {
            typeList: ['中性', '买入', '卖出'],
            list: [
                { 
                    icon: ['USOIL', 'US'],
                    symbol: 'USOIL',
                    color: 'down', // up 涨 down 跌 
                    time: this.$t('home.time1'),
                    name: this.$t('home.macd')
                },
                { 
                    icon: ['EU', 'US'],
                    symbol: 'EUR/USD',
                    color: 'up',
                    time: this.$t('home.time2'),
                    name: this.$t('home.ma')
                }
            ]
        }
    },
    methods: {
        getCurrencyIcon (currency) {
            try {
                return require('@/static/image/currency_icon/' + currency + '.png')
            } catch (error) {
                return require('@/static/image/currency_icon/default.png')
            }
        },
        goQuote () {
            uni.switchTab({
                url: '/pages/quote/index'
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.signal-list {
    overflow: hidden;
    .title {
        text-align: center;
        font-size: 46rpx;
        padding: 30rpx 0;
    }
    .item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16rpx;
        &:hover {
            @include styles('background-color', 'bgColor');
        }
        .item-icon-warp {
            display: flex;
            align-items: center;
            margin-right: 16rpx;
            .item-icon {
                border: 1px solid #FFF;
                border-radius: 100%;
                width: 34rpx;
                height: 34rpx;
                &:last-child {
                    margin-left: -16rpx;
                }
            }
        }
        .item-title {
            display: flex;
            align-items: center;
            .symbol {
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
                flex: 1;
                font-size: 32rpx;
                margin-right: 30rpx;
            }
            .name {
                font-size: 32rpx;
            }
        }
        .item-extra {
            display: flex;
            align-items: center;
            .item-time {
                @include styles('color', 'minorColor');
                font-size: 26rpx;
            }
            .item-status {
                padding: 2rpx 20rpx;
                border-radius: 20rpx;
                font-size: 22rpx;
                margin-left: 16rpx;
                color: #FFF;
                &.up {
                    @include styles('background-color', 'riseColor');
                }
                &.down {
                    @include styles('background-color', 'fallColor');
                }
            }
        }
        .item-arrow {
            font-size: 20rpx;
        }
    }
}
</style>
