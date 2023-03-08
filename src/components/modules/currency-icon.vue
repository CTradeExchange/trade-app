<template>
    <image 
        class='currency-img' 
        :src='getCurrencyIcon(currency)' 
        :style="{ 'width': size + 'rpx', 'height': size + 'rpx' }" 
    />
</template>

<script>
export default {
    name: 'CurrencyIcon',
    props: {
        // 当前币种
        currency: {
            type: String,
            default: ''
        },
        // 图标大小rpx
        size: {
            type: Number,
            default: 60
        }
    },
    methods: {
        // 获取币种图标
        getCurrencyIcon (currency) {
            try {
                return require('static/image/currency_icon/' + currency + '.png')
            } catch (error) {
                return require('static/image/currency_icon/default.png')  
            }
        }
    }
}
</script>

<style lang="scss" scoped>
</style>
