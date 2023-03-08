<template>
    <view class='trust-list'>
        <block v-for='(item, index) in list' :key='index'>
            <trust-item :data='item' />
        </block>
    </view>
</template>

<script>	
// components
import trustItem from './trust-item.vue'

export default {
    components: {
        trustItem
    },
    props: {
        // 列表数据
        list: {
            type: Array,
            default: () => []
        }
    }
}
</script>

<style lang="scss" scoped>
.trust-list {
	padding: 0 20rpx;
}
</style>
