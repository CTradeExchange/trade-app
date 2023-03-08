<template>
    <view class='module-content'>
        <view class='header-case'>
            <tui-tabs
                class='tabs'
                :color='$style.minorColor'
                :current-tab='currentIndex'
                :height='88'
                item-width='110px'
                :padding='0'
                :selected-color='$style.primary'
                :slider-bg-color='$style.primary'
             
                :tabs='tabList'
                unlined
                :width='tabList.length * 110'
                @change='changeTab'
            />
            <i 
                v-if="current !== 'assets'" 
                class='link iconfont icon_mingxi1' 
                @click='goList'
            >
            </i>
        </view>
        <!-- 申购记录 -->
        <template v-if="current === 'apply'">
            <apply-record-list v-if='applyRecordData.length > 0' :list='applyRecordData' />
            <none-data v-else />
        </template>
        <!-- 赎回记录 -->
        <template v-if="current === 'redeem'">
            <redeem-record-tabs :current.sync='sharesStatus' />
            <redeem-record-list v-if='redeemRecordData.length > 0' :list='redeemRecordData' />
            <none-data v-else />
        </template>
        <!-- 资产 -->
        <template v-if="current === 'assets'">
            <account-currency module='fund' :trade-type='5' />
        </template>
    </view>
</template>

<script>
import accountCurrency from '@/pages/assets/components/account-currency.vue'
import applyRecordList from './apply-record-list.vue'
import redeemRecordList from './redeem-record-list.vue'
import redeemRecordTabs from './redeem-record-tabs.vue'
import { fundApplyRecord, fundRedeemRecord } from '@/api/fund'
	
export default {
    components: {
        accountCurrency,
        applyRecordList,
        redeemRecordList,
        redeemRecordTabs
    },
    data () {
        return {
            // 选项卡数据
            tabList: [
                { name: this.$t('fundInfo.applyRecords'), value: 'apply' },
                { name: this.$t('fundInfo.redeemRecords'), value: 'redeem' },
                { name: this.$t('fundInfo.assets'), value: 'assets' }
            ],
            // 当前选项卡
            current: 'apply', 
            // 当前选项卡索引
            currentIndex: 0,
            // 申购记录数据
            applyRecordData: [],
            // 赎回记录数据
            redeemRecordData: [],
            // 赎回记录状态
            sharesStatus: 0
        }
    },
    watch: {
        // 监听sharesStatus
        sharesStatus () {
            this.getRedeem()
        }
    },
    mounted () {
        // 初始化
        this.init()
    },
    methods: {
        // 初始化
        init () {
            switch (this.current) {
                case 'apply':
                    this.getApplyRecord()
                    break
                case 'redeem':
                    this.getRedeem()
                    break
            }
        },
		
        // 获取申购记录
        getApplyRecord () {
            fundApplyRecord({ size: 10, current: 1 }).then(res => {
                this.applyRecordData = res.data ? res.data.records : []
            })
        },
		
        // 获取赎回记录
        getRedeem () {
            fundRedeemRecord({ size: 10, current: 1, sharesStatus: this.sharesStatus }).then(res => {
                this.redeemRecordData = res.data ? res.data.records : []
            })
        },
		
        // 切换选项卡
        changeTab (e) {
            this.currentIndex = e.index
            this.current = this.tabList[e.index].value
            this.init()
        },
		
        // 跳转到列表页面
        goList () {
            switch (this.current) {
                case 'apply':
                    uni.navigateTo({
                        url: '/pages/fund/applyRecord'
                    })
                    break
                case 'redeem':
                    uni.navigateTo({
                        url: '/pages/fund/redeemRecord'
                    })
                    break
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.module-content {
	margin-top: 20rpx;
}
.header-case {
	@include styles('background', 'contentColor');
	@include styles('border-bottom-color', 'lineColor');
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 88rpx;
	border-bottom-width: 1rpx;
	border-bottom-style: solid;
	position: sticky;
	top: -1px;
	z-index: 100;
	.tabs {
        justify-content: space-between; 
        :deep(.tui-tabs-item){
           &::last-child{
               width: 100px
           }
        }
	}
	.link {
		@include styles('color', 'normalColor');
		line-height: 1;
		margin-right: 25rpx;
		font-size: 34rpx;
	}
}
</style>
