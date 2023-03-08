<template>
    <view class='record-list'>
        <apply-record-item 
            v-for='(item, index) in list' 
            :key='index' 
            :data='item'
            :index='index'
            @showDetail='showDetail(item)'
        />
    </view>
</template>

<script>
import applyRecordItem from './apply-record-item.vue'

export default {
    components: {
        applyRecordItem
    },
    inject: ['showDetail'],
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
</style>
