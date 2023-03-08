<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar :show-title-bar='false' />
            <!-- 玩法选项卡 -->
            <play-tabs :model-value.sync='tradeType' @switch='planSwitch' />
            <view class='header-search'>
                <view class='search-box'>
                    <i class='iconfont icon_sousuo1'></i>
                    <input
                        ref='searchInput'
                        v-model='searchVal'
                        :focus='autoFocus'
                        :placeholder="$t('search.keywords')"
                        placeholderClass='placeholderClass'
                        type='text'
                        @input='onSearch'
                    />
                    <tui-icon
                        v-if='searchVal'
                        class='clear-close'
                        name='close-fill'
                        @click='onClear'
                    />
                </view>
                <view class='cancel' @click='goBack'>
                    {{ $t('common.cancel') }}
                </view>
            </view>
            <!-- 内容区域 -->
            <view class='layout-content'>
                <search-result
                    v-if='list.length > 0'
                    :list='list'
                    :search-key='searchVal'
                    :trade-type='tradeType'
                    @collect='onCollect'
                />
                <none-data v-else />
            </view>
        </view>

        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>
// vuex
import { mapGetters, mapState } from 'vuex'
// api
import { getSymbolList } from '@/api/trade.js'
// util
import { debounce } from '@/utils/util.js'
// component
import searchResult from './components/search-result.vue'
// 获取自选数据
let getSymbolData = null

export default {
    components: {
        searchResult
    },
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: false,
            // 玩法类型
            tradeType: '',
            // 搜索的值
            searchVal: '',
            // 列表数据
            list: [],
            // 输入框是否聚集
            autoFocus: false
        }
    },
    computed: {
        ...mapGetters(['customerGroupId']),
        ...mapState('_quote', ['productMap']),
        ...mapState('_user', ['selfSymbolList'])
    },
    onLoad (options) {
        // 添加应用内事件
        this.$addAppsEvent('search_view')
		
        this.tradeType = Number(options.tradeType)
        getSymbolData = debounce(this.getSymbolList, 300)
		
        // 初始化
        this.$init().then(() => {
            this.skeletonShow = false 
            this.autoFocus = true
        }).catch(() => {
            this.skeletonShow = false
        })
    },
    methods: {
        // 返回上一页
        goBack () {
            uni.navigateBack({
                delta: 1
            })
        },
		
        // 搜索
        onSearch () {
            if (this.searchVal) {
                getSymbolData()
            } else {
                this.list = []
            }
        },

        // 清空
        onClear () {
            this.searchVal = ''
            this.list = []
        },

        // 获取自选列表
        getSymbolList () {
            if (!this.searchVal) return
            const tradeType = this.tradeType
            getSymbolList({
                tradeType,
                name: this.searchVal,
                customerGroupId: this.customerGroupId
            }).then(res => {
                let list = res.data || []
                list = list.map(el => this.productMap[`${el.id}_${tradeType}`]).filter(el => !!el)
                // 设置产品自选属性
                const currentSelfSymbolList = this.selfSymbolList[this.tradeType]
                list.map(item => {
                    item.isSelfSymbol = false
                    currentSelfSymbolList && currentSelfSymbolList.map(el => {
                        if (item.symbolId === el.symbolId) {
                            item.isSelfSymbol = true
                        }
                    })
                })
                this.list = list
            })
        },

        // planSwitch
        planSwitch (e) {
            this.searchVal = ''
            this.autoFocus = false
            this.$nextTick(function () {
                this.autoFocus = true
            })
        },

        // 添加、取消自选
        onCollect (item) {
            const index = this.list.findIndex(el => el.symbolId === item.symbolId)
            this.$set(this.list, index, item)
        }
    }
}
</script>

<style lang="scss" scoped>
.layout-container-full{
    @include styles('background-color', 'contentColor');
}
.header-search {
	@include flexEndAlign;
	width: 100%;
	height: 88rpx;
	padding-right: 30rpx;
	margin-top: 20rpx;
	.search-box {
		@include flexAlign;
		@include styles('background-color', 'bgColor');
		flex: 1;
		height: 80rpx;
		margin-right: 30rpx;
		border-radius: 10rpx;
		margin-left: 30rpx;
		padding: 0 15rpx;
        .icon_sousuo1{
            margin-left: 20rpx;
            @include styles('color', 'minorColor');
        }
		input {
			flex: 1;
			height: 100%;
			font-size: 27rpx;
		}
	}
	.cancel {
		@include styles('color', 'color');
		font-size: 27rpx;
	}
}
</style>
