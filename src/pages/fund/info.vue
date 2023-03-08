<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme' @click='onLayout'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar :title="$t('route.fundProductInfo')" />
            <!-- 内容区域 -->
            <view class='layout-content'>
                <fund-card :fund='fund' />
                <fund-information :fund='fund' :fund-id='fundId' />
            </view>
            <fund-bottom-btn :fund='fund' />
        </view>

        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>
import { vue_set } from '@/utils/vueUtil.js'
import store from '@/store'
import fundCard from './components/fund-card.vue'
import fundInformation from './components/fund-information.vue'
import fundBottomBtn from './components/fund-bottom-btn.vue'

export default {
    components: {
        fundCard,
        fundInformation,
        fundBottomBtn
    },
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 基金id
            fundId: ''
        }
    },
    computed: {
        productMap () {
            return store.state._quote.productMap
        },
        // 基金数据
        fund () {
            const fundInfo = store.state._quote.fundInfo || {}
            if (fundInfo?.trackIndex) {
                const trackProduct = this.productMap[`${fundInfo.trackIndex}_5`]
                vue_set(fundInfo, 'trackProduct', trackProduct)
            }
            return fundInfo
        }
    },
    onLoad (options) {
        this.fundId = options.fundId
        // 初始化
        this.$init().then(() => {
            // 获取基金产品详情
            this.getFundInfo()
            this.skeletonShow = false
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('fund_info_view')
    },
    methods: {
        // 页面点击事件
        onLayout () {
            uni.$emit('onLayout')
        },

        // 获取基金产品详情
        getFundInfo () {
            store.dispatch('_quote/fundNetValue', { fundId: this.fundId })
            store.dispatch('_quote/queryFundInfo', this.fundId)
        }
    }
}
</script>

<style lang="scss" scoped>
::v-deep {
	.fund-information {
		margin-bottom: 20rpx;
	}
}
</style>
