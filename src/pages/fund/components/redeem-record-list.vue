<template>
    <view class='record-list'>
        <redeem-record-item 
            v-for='(item, index) in list' 
            :key='index' 
            :current='current'
            :data='item'
            :index='index'
            @showDetail='showDetail(item)'
        />
    </view>
</template>

<script>
import redeemRecordItem from './redeem-record-item.vue'	
	
export default {
    components: {
        redeemRecordItem
    },
    inject: ['showDetail'],
    props: {
        // 列表数据
        list: {
            type: Array,
            default: () => []
        },
        // 当前模块 0:当前赎回 1:历史赎回
        current: {
            type: [Number, String],
            default: ''
        }
    }
}
</script>

<style lang="scss" scoped>
</style>
