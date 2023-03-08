<template>
    <view class='item' :class='[bgClass, currentTheme]' @click='goChartPage(item)'>
        <view class='name'>
            {{ item.symbolName || '--' }}
        </view>
        <view class='price' :class='[item.last_color]'>
            {{ item.rolling_last_price || '--' }}
        </view>
        <div class='change' :class='[item.rolling_upDownColor]'>
            {{ item.rolling_upDownAmount || '--' }} {{ item.rolling_upDownWidth || '--' }}
        </div>
    </view>
</template>

<script>	
import store from '@/store/index.js'
export default {
    props: {
        symbolKey: String,
    },
    data () {
        return {
            bgClass: ''
        }
    },
    computed: {
        item () {
            return store.state._quote.productMap[this.symbolKey] || {}
        },
        changeColorType () {
            return store.state._global.changeColorType
        }
    },
    watch: {
        item: {
            deep: true,
            immediate: true,
            handler (newVal) {
                this.bgClass = ''
                this.$nextTick(() => {
                    if (this.changeColorType === 1) {
                        if (newVal.last_color === 'riseColor') {
                            this.bgClass = 'green-bg' 
                        } else {
                            this.bgClass = 'red-bg'
                        }
                    } else {
                        if (newVal.last_color === 'riseColor') {
                            this.bgClass = 'red-bg' 
                        } else {
                            this.bgClass = 'green-bg'
                        }
                    }
                })
            }
        }
    },
    methods: {
        // 跳转到图表页面
        goChartPage (product) {
            if (product?.symbolKey) {
                this.$method.goChartPage(product)
            }
        }
    }
}
</script>

<style lang="scss" scoped>

.item {
    @include flexColumnCenter;
    overflow: hidden;
    padding: 24rpx 0;
    width: 33.333%;
    &.green-bg,
    &.red-bg {
        transition-property: background;
        animation-duration: 1s;
        animation-timing-function: ease-out;
        animation-iteration-count: infinite;
        animation-iteration-count: 1;
        animation-direction: normal;
    }
    &.light.green-bg {
        animation-name: bg-green;
    }
    &.light.red-bg {
        animation-name: bg-red;
    }
    &.night.green-bg {
        animation-name: bg-green-night;
    }
    &.night.red-bg {
        animation-name: bg-red-night;
    }
    .name {
        font-size: 32rpx;
        line-height: 44rpx;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        width: 100%;
        text-align: center;
        padding: 0 16rpx;
    }
    .price {
        font-size: 34rpx;
        padding: 12rpx 0;
        font-weight: bold;
    }
    .change {
        font-size: 20rpx;
    }
}

@keyframes bg-red {
    0% {
        background: var(--bgColor);
    }
    30% {
        background: #FCF6F7;
    }
    80% {
        background: #FAF3F3;
    }
    100% {
        background: var(--bgColor);
    }
}

@keyframes bg-green {
    0% {
        background: var(--bgColor);
    }
    30% {
        background: #F0FAF8;
    }
    80% {
        background: #EAF8F6;
    }
    100% {
        background: var(--bgColor);
    }
}

@keyframes bg-red-night {
    0% {
        background: var(--bgColor);
    }
    30% {
        background: #4B3132;
    }
    80% {
        background: #614143;
    }
    100% {
        background: var(--bgColor);
    }
}

@keyframes bg-green-night {
    0% {
        background: var(--bgColor);
    }
    30% {
        background: #335545;
    }
    80% {
        background: #295F45;
    }
    100% {
        background: var(--bgColor);
    }
}
</style>
