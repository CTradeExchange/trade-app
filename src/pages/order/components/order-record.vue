<template>
    <view class='module-content'>
        <view class='header-case'>
            <tui-tabs
                class='tabs'
                :color='$style.minorColor'
                :current-tab='currentIndex'
                :height='88'
                item-width='105px'
                :padding='0'
                :selected-color='$style.primary'
                :slider-bg-color='$style.primary'
                :slider-width='90'
                :tabs='tabList'
                unlined
                :width='tabList.length * 105'
                @change='changeTab'
            />
            <i 
                v-if="current !== 'assets' && current !== 'position'" 
                class='link iconfont icon_mingxi1' 
                @click='goList'
            >
            </i>
        </view>
        <!-- 当前委托 -->
        <template v-if="current === 'pending'">
            <none-data v-if='pendingList.length === 0' :text="$t('trade.pendingEmpty')" />
            <trust-list v-else :list='pendingList' />
        </template>
        <!-- 成交记录 -->
        <template v-if="current === 'deal'">
            <none-data v-if='dealList.length === 0' :text="$t('trade.noDealData')" />
            <deal-list v-else :biz-type-text='bizTypeText' :list='dealList' :trade-type='tradeType' />
        </template>
        <!-- 持仓 -->
        <template v-if="current === 'position'">
            <position-list :list='positionList' :show-header='false' :show-trade-btn='false' :trade-type='tradeType' />
        </template>
        <!-- 资产 -->
        <template v-if="current === 'assets'">
            <account-currency :trade-type='tradeType' />
        </template>
    </view>
</template>

<script>
import store from '@/store'	
import { tradeRecordList } from '@/api/user'
import trustList from '../components/trust-list.vue'
import dealList from '../components/deal-list.vue'
import positionList from '@/pages/assets/components/position-list.vue'
import accountCurrency from '@/pages/assets/components/account-currency.vue'
	
export default {
    components: {
        trustList,
        dealList,
        positionList,
        accountCurrency
    },
    props: {
        // 玩法类型
        tradeType: {
            type: [Number, String],
            default: ''
        }
    },
    data () {
        return {
            // 选项卡列表
            tabList: [],
            // 当前选项卡
            current: '', 
            // 当前选项卡索引
            currentIndex: 0,
            // 成交记录列表数据
            dealList: [],
            // bizTypeText
            bizTypeText: {},
            // 需要订阅的产品symbolKey集合
            productKeys: []
        }
    },
    computed: {
        // 账户列表
        accountIds () {
            const accountList = this.customerInfo?.accountList?.filter(el => Number(el.tradeType) === Number(this.tradeType)) || []
            return accountList.map(el => {
                return el.accountId
            })
        },
        // 当前委托、当前挂单数据
        pendingList () {
            return store.state._trade.pendingList[this.tradeType] || []
        },
        // 持仓数据
        positionList () {
            return store.state._trade.positionList[this.tradeType] || []
        }
    },
    watch: {
        // 监听玩法类型
        tradeType: {
            handler () {
                if (this.tradeType) {
                    // 设置当前玩法
                    store.commit('_quote/Update_tradeType', this.tradeType)
                    // 设置选项卡数据
                    this.setTabList()
                }
            },
            immediate: true
        }
    },
    methods: {
        // 数据初始化
        init () {
            switch (this.current) {
                case 'pending':
                    this.getOrderPage()
                    break
                case 'deal':
                    this.dealList = []
                    this.bizTypeText = {}
                    this.getDealRecord()
                    break
                case 'position':
                    this.getPositionList()
                    break
                case 'assets':
                    this.getAssetsInfo()
                    break
            }
        },
		
        // 设置选项卡数据
        setTabList () {
            let tabList = []
            if (this.$includePlay_1(this.tradeType)) {
                tabList = [
                    { name: this.$t('trade.curTrust'), value: 'pending' },
                    { name: this.$t('trade.position'), value: 'position' },
                    { name: this.$t('trade.dealList'), value: 'deal' }
                ]
            }
            if (this.$includePlay_2(this.tradeType)) {
                tabList = [
                    { name: this.$t('trade.curTrust'), value: 'pending' },
                    { name: this.$t('trade.dealList'), value: 'deal' },
                    { name: this.$t('trade.asset'), value: 'assets' }
                ]
            }
            this.currentIndex = 0
            this.current = tabList[0].value
            this.tabList = tabList
            this.init()
        },
		
        // 切换选项卡
        changeTab (e) {
            this.currentIndex = e.index
            this.current = this.tabList[e.index].value
            this.init()
        },
		
        // 跳转到列表页面
        goList () {
            uni.navigateTo({
                url: `/pages/order/list?tradeType=${this.tradeType}&active=${this.current}`
            })
        },
		
        // 获取成交记录数据
        getDealRecord () {
            const params = {
                current: 1,
                size: 10,
                executeStartTime: this.$dayjs(this.$dayjs().subtract(7, 'day').format('YYYY/MM/DD')).valueOf(),
                executeEndTime: this.$dayjs(this.$dayjs(new Date()).format('YYYY/MM/DD 23:59:59')).valueOf(),
                accountIds: this.accountIds.toString(),
                tradeType: Number(this.tradeType),
                sortFieldName: 'executeTime',
                sortType: 'desc'
            }
            tradeRecordList(params).then(res => {
                if (res.check() && res.data) {
                    this.dealList = res.data.list
                    this.bizTypeText = res.data.bizTypeText
                    this.productKeys = []
                    this.subscribe()
                }
            })
        },
		
        // 获取资产数据
        getAssetsInfo () {
            store.dispatch('_user/queryCustomerAssetsInfo', { tradeType: this.tradeType }).then(() => {
                this.productKeys = []
                this.subscribe()
            })
        },
		
        // 获取当前持仓、当前挂单数据
        getOrderPage () {
            store.dispatch('_trade/queryPBOOrderPage', {
                tradeType: this.tradeType,
                sortFieldName: 'orderTime',
                sortType: 'desc',
                accountIds: this.accountIds.toString()
            }).then(res => {
                if (res.check()) {
                    const arr = []
                    if (res.data) {
                        res.data.map(elem => {
                            arr.push(elem.symbolId + '_' + elem.tradeType)
                        })
                    }
                    this.productKeys = [...new Set(arr)]
                    this.subscribe()
                }
            })
        },
		
        // 获取持仓列表数据
        getPositionList () {
            store.dispatch('_trade/queryPositionPage', {
                tradeType: this.tradeType,
                sortFieldName: 'openTime',
                sortType: 'desc',
                accountId: this.accountIds.toString()
            }).then(res => {
                if (res.check()) {
                    const arr = []
                    if (res.data) {
                        res.data.map(elem => {
                            arr.push(elem.symbolId + '_' + elem.tradeType)
                        })
                    }
                    this.productKeys = [...new Set(arr)]
                    this.subscribe()
                }
            })
        },
		
        // 通知父组件需要订阅的产品
        subscribe () {
            this.$emit('subscribe', this.productKeys)
        }
    }
}
</script>

<style lang="scss" scoped>
.module-content {
	margin-top: 20rpx;
	::v-deep {
		.deal-list, .trust-list, .account-currency {
			margin-bottom: 20rpx;
		}
	}
}
.header-case {
	@include styles('background', 'contentColor');
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 88rpx;
	position: sticky;
	top: -1px;
	z-index: 100;
	.tabs {
		margin-left: 10rpx;
	}
	.link {
		@include styles('color', 'normalColor');
		line-height: 1;
		margin-right: 25rpx;
		font-size: 34rpx;
	}
}
</style>
