<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar :title="currentIndex === 0 ? $t('fundInfo.applyRecords') : $t('fundInfo.redeemRecords')" />
            <!-- 选项卡 -->
            <tui-tabs 
                :current-tab='currentIndex' 
                :item-width="(100 / tabs.length) + '%'"
                :tabs='tabs'
                @change='changeTabs'
            />
            <!-- 申购记录 -->
            <apply-record-content v-if='currentIndex === 0' ref='applyRecordContent' />
            <!-- 赎回记录 -->
            <redeem-record-content v-if='currentIndex === 1' ref='redeemRecordContent' />
        </view>
		
        <!-- 申购费用弹窗 -->
        <apply-cost-dialog ref='applyCostDialog' />
        <!-- 赎回费用弹窗 -->
        <redeem-cost-dialog ref='redeemCostDialog' />
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>
import applyRecordContent from './components/apply-record-content.vue'
import redeemRecordContent from './components/redeem-record-content.vue'
import applyCostDialog from './components/apply-cost-dialog.vue'
import redeemCostDialog from './components/redeem-cost-dialog.vue'

export default {
    components: {
        applyRecordContent,
        redeemRecordContent,
        applyCostDialog,
        redeemCostDialog
    },
    provide () {
        return {
            showDetail: (item) => {
                switch (this.currentIndex) {
                    case 0:
                        this.$refs['applyCostDialog'].open(item)
                        break
                    case 1:
                        this.$refs['redeemCostDialog'].open(item)
                        break
                }
            }
        }
    },
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // tabs
            tabs: [
                { name: this.$t('fundInfo.applyRecords') },
                { name: this.$t('fundInfo.redeemRecords') }
            ],
            // 当前选项卡下标
            currentIndex: 0
        }
    },
    onLoad (options) {
        this.currentIndex = Number(options.current) || 0
		
        // 初始化
        this.$init().then(() => {
            this.skeletonShow = false
            this.pageInit()
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('fund_record_view')
    },
    methods: {	
        // 页面初始化
        pageInit () {
            this.$nextTick(() => {
                switch (this.currentIndex) {
                    case 0:
                        this.$refs['applyRecordContent'].getData()
                        break
                    case 1:
                        this.$refs['redeemRecordContent'].getData()
                        break
                }
            })
        },
		
        // 切换选项卡
        changeTabs (e) {
            if (this.currentIndex === e.index) return
            this.currentIndex = e.index
            this.pageInit()
        }
    }
}
</script>

<style lang="scss" scoped>
</style>
