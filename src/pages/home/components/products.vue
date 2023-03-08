<template>
    <view v-if='list.length > 0' class='products-module' :data-theme='currentTheme'>
        <product-item
            v-for='item in list'
            :key='item'
            :symbol-key='item'
        />
    </view>
</template>

<script>
import productItem from './product-item.vue'
	
export default {
    components: {
        productItem
    },
    props: {
        list: {
            type: Array,
            default: () => []
        }
    }
}
</script>

<style lang="scss" scoped>
.products-module {
    display: flex;
    flex-wrap: wrap;
}
</style>
