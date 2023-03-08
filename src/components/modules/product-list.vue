<template>
    <view class='productList'>
        <ul ref='productListEl' class='productListUl'>
            <li v-for='(item, index) in productList' :key='index'>
                <productItem v-if='item.symbolName' :product='item' @open='openProduct(item)' />
            </li>
        </ul>
    </view>
</template>

<script>
import productItem from './product-item.vue'
export default {
    components: {
        productItem
    },
    props: {
        // 产品列表数据
        productList: {
            type: Array,
            default: () => []
        },
        // 模块
        module: {
            type: String,
            default: 'quote'
        }
    },
    mounted () {
        const itemHeight = uni.upx2px(112)
        this.$emit('setItemHeight', itemHeight)
    },
    methods: {
        // 打开图表页面
        openProduct (item) {
            this.$method.goChartPage(item)
            // 添加应用内事件
            this.$addAppsEvent(this.module + '_chart_click')
        }
    }
}
</script>

<style lang="scss" scoped>
</style>
