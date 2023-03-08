<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container'>
            <!-- 头部导航栏 -->
            <nav-bar is-custom show-custom-title :title="$t('fundInfo.fundsList')">
                <view class='header-record'>
                    <i class='iconfont icon_mingxi1' @click='toRecords'></i>
                </view>
            </nav-bar>
            <!-- 内容区域 -->
            <view class='layout-content'>
                <none-data v-if='fundProductList.length === 0' />
                <view class='fund-list'>
                    <view v-for='(item, index) in fundProductList' :key='index' @click='goFundInfo(item)'>
                        <fund-card :fund='item' />
                    </view>
                </view>
            </view>
        </view>
		
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>	
import store from '@/store'
import fundCard from './components/fund-card.vue'

export default {
    components: {
        fundCard
    },
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true
        }
    },
    computed: {
        // 基金产品列表
        fundProductList () {
            return store.state._quote.fundProductList || []
        }
    },
    onLoad () {
        // 初始化
        this.$init().then(() => {
            this.getFundList()
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('fund_view')
    },
    methods: {
        // 获取基金产品列表
        getFundList () {
            store.dispatch('_quote/findFundPage', {
                isRealTime: true,
                name: ''
            }).then(() => {
                this.skeletonShow = false
            }).catch(() => {
                this.skeletonShow = false
            })
        },
		
        // 跳转到基金详情页面
        goFundInfo (item) {
            uni.navigateTo({
                url: '/pages/fund/info?fundId=' + item.fundId
            })
        },
		
        // 跳转到申购赎回页面
        toRecords () {
            this.$method.goPage('/pages/fund/record')
        }
    }
}
</script>

<style lang="scss" scoped>
.header-record {
	display: flex;
	align-items: center;
	height: 100%;
	position: absolute;
	top: 0;
	right: 25rpx;
	i {
		@include styles('color', 'normalColor');
		font-size: 40rpx;
	}
}
</style>
