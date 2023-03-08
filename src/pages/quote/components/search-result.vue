<template>
    <view class='search-result'>
        <view v-for='(item, index) in list' :key='index' class='item'>
            <view class='left' @click='openProduct(item)'>
                <view class='name'>
                    <view 
                        v-for='(childName, subIndex) in item.symbolName' 
                        :key='subIndex'
                        class='result-text' 
                        :class="{ 'activeText':isSearchText(childName) }"
                    >
                        <span>{{ childName }}</span>
                    </view>
                    <etf-icon v-if='item.etf' />
                </view> 
            </view>
            <view v-if='customerInfo' class='right' @click='collect(item)'>
                <i 
                    class='iconfont' 
                    :class="[item.isSelfSymbol ? 'icon_zixuan2' : 'icon_zixuan11']"
                >
                </i>
            </view> 
        </view>
    </view>
</template>

<script>
import store from '@/store'
import { addCustomerOptional, removeCustomerOptional } from '@/api/trade.js'	
	
export default {
    props: {
        list: {
            type: Array,
            default: () => []
        },
        tradeType: [String, Number],
        searchKey: [String]
    },
    methods: {
        // 跳转产品详情页 
        openProduct (item) {
            this.$store.commit('_quote/Update_productActivedID', item.symbolId)
            this.$method.goChartPage(item)
            // 添加应用内事件
            this.$addAppsEvent('search_chart_click')
        },
		
        // 添加删除自选
        collect (item) {
            if (item.isSelfSymbol) {
                removeCustomerOptional({
                    symbolList: [item.symbolId],
                    tradeType: this.tradeType
                }).then(() => {
                    item.isSelfSymbol = false
                    store.dispatch('_user/queryCustomerOptionalList')
                    uni.showToast({
                        title: this.$t('trade.removeOptionalOk'),
                        icon: 'none'
                    })
                    this.$emit('collect', item)
					
                    // 添加应用内事件
                    this.$addAppsEvent('search_cancel_optional')
                })
            } else {
                addCustomerOptional({
                    symbolList: [item.symbolId],
                    tradeType: this.tradeType
                }).then(() => {
                    item.isSelfSymbol = true
                    store.dispatch('_user/queryCustomerOptionalList')
                    uni.showToast({
                        title: this.$t('trade.addOptionalOk'),
                        icon: 'none'
                    })
                    this.$emit('collect', item)
					
                    // 添加应用内事件
                    this.$addAppsEvent('search_add_optional')
                })
            }
        },
		
        isSearchText (val) {
            if (this.searchKey.indexOf(val) !== -1) {
                return true
            } else {
                return false
            }
        }
    }
}
</script>

<style lang="scss" scoped> 
.search-result {
    .item {
        @include styles('background-color', 'contentColor');
        @include styles('border-color', 'lineColor');
        padding: 0rpx 40rpx;
        border-width: 1px;
        border-bottom-style: solid;
        display: flex;
        align-items: center;
        height: 112rpx;
        .left {
            flex: 1;
            .result-text {
                display: inline;
                &.activeText {
                    @include styles('color','primary');
                }
            }
        }
        .right {
            padding: 0 10rpx;
            .iconfont {
                @include styles('color','minorColor');
                font-size: 36rpx;
            }
            .icon_zixuan2 {
                @include styles('color', 'primary');
            }
        }
        .code {
            margin-top: 10rpx;
            font-size: 24rpx;
        }
        ::v-deep .etf-icon {
            margin-top: 4rpx;
        }
    }
}
</style>
