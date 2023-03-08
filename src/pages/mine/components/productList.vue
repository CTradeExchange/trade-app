<template>
    <view
        v-if='productList && productList.length > 0'
        class='product-list'
    >
        <view class='h3'>
            {{ $t('depositActivity.transaction') }}
        </view>
        <view class='header'>
            <view class='flex2'>
                {{ $t('trade.nameCode') }}
            </view>
            <view class='flex1 t-right'>
                {{ $t('trade.lastPrice') }} 
            </view>
            <view class='flex1 t-right'>
                {{ $t('depositActivity.change') }} 
            </view>
        </view>
        <view v-for='(item,index) in productList' :key='index' 
              class='content' @click='$method.goChartPage(item)'
        >
            <view class='flex2 flex'>
                <view class='icon'>
                    <!-- <currency-icon currency='USDT' :size='48' /> -->
                    <image :src='getCurrencyIcon(item.baseCurrency)' />
                    <image :src='getCurrencyIcon(item.profitCurrency)' />
                </view>
                <view class='name'>
                    {{ item.symbolName }}
                </view>
            </view>
            <view class='flex1 t-right'>
                {{ item.rolling_last_price || "--" }}
            </view>
            <view class='flex1 t-right' 
                  :class="[
                      item.rolling_upDownColor,
                      'font-medium',
                  ]"
            >
                {{ item.rolling_upDownWidth || "--" }}
            </view>
        </view>
    </view>
</template>

<script>
import { localSet, isEmpty, localGet } from '@/utils/util.js'
export default {
    components: {
        
    },
    props: {
       
    },
    data () {
        return {
        }
    },
    computed: {
        productList () {
            const ids = this.$store.state._global.config?.registerSuccessProductIds
            const list = this.$store.state._quote.productList.filter(item => ids.includes(item.symbolId)).map(item => {
                return item
            })
            
            return list
        },
        productKeys () {
            const productKeys = []
            this.productList.map(item => {
                productKeys.push(item.symbolId + '_' + item.tradeType)
            })
            return productKeys
        }
    },
    watch: {
        productList (newVal) {
            this.subscribeQuote()
        }
    },
    created () {
        this.subscribeQuote()
    },
    methods: {
        // 获取货币图标
        getCurrencyIcon (currency) {
            try {
                return require('@/static/image/currency_icon/' + currency + '.png')
            } catch (error) {
                return require('@/static/image/currency_icon/default.png')
            }
        },
        // 订阅产品行情
        subscribeQuote () {
            const productList = this.productList
            if (productList.length > 0) {
                // 订阅产品数据
                this.$QuoteSocket.send_subscribe24H(this.productKeys)
            }
        }
    }
}
</script>

<style scoped lang="scss">
.product-list {
    margin-bottom: 40rpx;
    padding: 0 30rpx;
    .h3{
        font-size: 32rpx;
        margin-bottom: 30rpx;
    }
    .header{
        display: flex;
        @include styles('color', 'normalColor');
       
    }
    .content{
        margin-top: 20rpx;
        display: flex;
        align-items: center;
    }
    .flex2{
        flex: 2;
    }
    .flex1{
        flex: 1;
    }
    .flex{
        display: flex;
        align-items: center;
    }
    .t-right{
        text-align: right;
    }
    .icon {
        display: flex;
        align-items: center;
        margin-right: 16rpx;
        image {
            width: 48rpx;
            height: 48rpx;
            border-radius: 100%;
            &:last-child {
                margin-left: -20rpx;
            }
        }
    }
    .name {
        max-width: 260rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    
    .product-list-title {
        color: var(--minorColor);
        padding: 12px 0;
    }
    .product-list-content {
        padding: 12px 0;
        &:hover {
            background-color: var(--bgColor);
        }
        .van-col:not(:nth-of-type(1)) {
            display: flex;
            align-items: center;
            justify-content: flex-end;
        }
    }
    .list-title {
        display: flex;
        align-items: center;
        color: var(--color);
        font-size: 14px;
        .name {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .icon {
            display: flex;
            align-items: center;
            margin-right: 8px;
            img {
                width: 24px;
                height: 24px;
                border-radius: 100%;
                &:last-child {
                    margin-left: -10px;
                }
            }
        }
    }
}
.text-right {
    text-align: right;
}
.font-medium {
    font-weight: 500;
}
</style>
