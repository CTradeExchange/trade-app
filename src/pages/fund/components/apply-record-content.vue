<template>
    <view class='layout-content'>
        <!-- 筛选 -->
        <filter-box :assets-list='assetsList' @filter='filterData' />
        <!-- 内容区域 -->
        <scroll-view class='scroll-case' scroll-y @scrolltolower='loadMore'>
            <template v-if='applyRecordData.length > 0'>
                <apply-record-list :list='applyRecordData' />
                <loading-more :status='loadStatus' />
            </template>
            <none-data v-else />
        </scroll-view>
    </view>
</template>

<script>
import filterBox from '../components/filter-box.vue'
import applyRecordList from '../components/apply-record-list.vue'
import { getAssetsList } from '@/api/base'
import { fundApplyRecord } from '@/api/fund'

export default {
    components: {
        filterBox,
        applyRecordList
    },
    data () {
        return {
            // 资产列表
            assetsList: [],
            // 申购记录数据
            applyRecordData: [],
            // 请求参数
            params: {
                current: 1,
                size: 20,
                currencyShares: '',
                startTime: null,
                endTime: null
            },
            // 数据加载状态
            loadStatus: 'more'
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
            // 获取申购记录
            this.getApplyRecord()
        },
		
        // 获取资产列表
        getAssetsList () {
            getAssetsList({ type: 2 }).then(res => {
                this.assetsList = res.data
            })
        },
		
        // 获取申购记录
        getApplyRecord () {
            if (this.loadStatus !== 'more') return
            this.loadStatus = 'loading'
            fundApplyRecord(this.params).then(res => {
                uni.hideLoading()
                const { data } = res
                if (data) {
                    this.applyRecordData = this.params.current === 1 ? data.records : this.applyRecordData.concat(data.records)
                    this.loadStatus = this.applyRecordData.length === data.total ? 'noMore' : 'more'
                    this.params.current += 1
                } else {
                    this.loadStatus = 'noMore'
                }
            }).catch(() => {
                uni.hideLoading()
            })
        },
		
        // 选择数据
        filterData (data) {
            this.params = {
                current: 1,
                size: 20,
                currencyShares: data.currencyVal || '',
                startTime: data.startTime || null,
                endTime: data.endTime || null
            }
            this.loadStatus = 'more'
            uni.showLoading({
                title: this.$t('common.loading')
            })
            this.getApplyRecord()
        },
		
        // 加载更多
        loadMore () {
            this.getApplyRecord()
        }
    }
}
</script>

<style lang="scss" scoped>
.layout-content {
	display: flex;
	flex-direction: column;
	overflow: hidden;
	position: relative;
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
