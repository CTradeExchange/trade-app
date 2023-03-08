<template>
    <view class='layout-content'>
        <!-- 选项卡 -->
        <redeem-record-tabs :current.sync='sharesStatus' />
        <!-- 当前赎回筛选 -->
        <filter-box ref='filterBox' :assets-list='assetsList' @filter='setFilter' />
        <!-- 内容区域 -->
        <scroll-view class='scroll-case' scroll-y @scrolltolower='loadMore'>
            <template v-if='redeemRecordData.length > 0'>
                <redeem-record-list :current='sharesStatus' :list='redeemRecordData' />
                <loading-more :status='loadStatus' />
            </template>
            <none-data v-else />
        </scroll-view>
    </view>
</template>

<script>
import redeemRecordTabs from '../components/redeem-record-tabs.vue'
import filterBox from '../components/filter-box.vue'
import redeemRecordList from '../components/redeem-record-list.vue'
import { getAssetsList } from '@/api/base'
import { fundRedeemRecord } from '@/api/fund'	
	
export default {
    components: {
        redeemRecordTabs,
        filterBox,
        redeemRecordList
    },
    data () {
        return {
            // 资产列表
            assetsList: [],
            // 赎回记录数据
            redeemRecordData: [],
            // 当前页数
            current: 1,
            // 页数数量
            size: 20,
            // 当前状态
            sharesStatus: 0,
            // 当前选择的币种
            currencyShares: '',
            // 开始时间
            startTime: null,
            // 结束时间 
            endTime: null,
            // 数据加载状态
            loadStatus: 'more'
        }
    },
    watch: {
        // 监听赎回状态
        sharesStatus (newVal) {
            this.$refs['filterBox'].reset()
            this.setFilter()
        }
    },
    methods: {
        // 获取数据
        getData () {
            uni.showLoading({
                title: this.$t('common.loading')
            })
            // 获取资产列表
            this.getAssetsList()
            // 获取赎回记录
            this.getRedeemRecord()
        },
		
        // 获取资产列表
        getAssetsList () {
            getAssetsList({ type: 2 }).then(res => {
                this.assetsList = res.data
            })
        },
		
        // 获取赎回记录
        getRedeemRecord () {
            if (this.loadStatus !== 'more') return
            this.loadStatus = 'loading'
            const result = {
                current: this.current,
                size: this.size,
                sharesStatus: this.sharesStatus,
                currencyShares: this.currencyShares
            }
            // 当前赎回参数
            if (this.sharesStatus === 0) {
                result.startTime = this.startTime
                result.endTime = this.endTime
            }
            // 历史赎回参数
            if (this.sharesStatus === 1) {
                result.updateStartTime = this.startTime
                result.updateEndTime = this.endTime
            }
            // 发起接口请求
            fundRedeemRecord(result).then(res => {
                uni.hideLoading()
                const { data } = res
                if (data) {
                    this.redeemRecordData = this.current === 1 ? data.records : this.redeemRecordData.concat(data.records)
                    this.loadStatus = this.redeemRecordData.length === data.total ? 'noMore' : 'more'
                    this.current += 1
                } else {
                    this.loadStatus = 'noMore'
                }
            }).catch(() => {
                uni.hideLoading()
            })
        },
		
        // 设置筛选条件
        setFilter (data = {}) {
            this.redeemRecordData = []
            this.currencyShares = data.currencyVal || ''
            this.startTime = data.startTime || null
            this.endTime = data.endTime || null
            this.filterData()
        },
		
        // 选择数据
        filterData () {
            this.current = 1
            this.loadStatus = 'more'
            uni.showLoading({
                title: this.$t('common.loading')
            })
            this.getRedeemRecord()
        },
		
        // 加载更多
        loadMore () {
            this.getRedeemRecord()
        }
    }
}
</script>

<style lang="scss" scoped>
.layout-content {
	display: flex;
	flex-direction: column;
	overflow: hidden;
}
.scroll-case {
	flex: 1;
	overflow: hidden;
}
::v-deep {
	.loadmore-case {
		margin-top: -20rpx;
	}
}
</style>
