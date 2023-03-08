<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme' @click='onLayout'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar :back-show='false' :show-title-bar='false' />
            <!-- 切换真实模拟 -->
            <top-nav ref='topNavRef' />
            <!-- 玩法选项卡 -->
            <play-tabs :model-value.sync='tradeType' @complete='setSymbolKey' @switch='switchTradeType' />
            <!-- 产品信息 -->
            <product-info :product='product' @open='openSidebar' />
            <!-- 内容区域 -->
            <view class='layout-content'>
                <view class='main-content'>
                    <view class='main-module'>
                        <!-- 左侧模块 -->
                        <view v-if='product.symbolName && dealModeShowMap[product.dealMode].handicap'
                              class='left-module'
                        >
                            <handicap ref='handicapRef' :deal-mode-show-map='dealModeShowMap'
                                      :handicap-digit.sync='handicapDigit' :product='product'
                            />
                        </view>
                        <!-- 右侧模块 -->
                        <view class='right-module'>
                            <!-- 订单类型 -->
                            <order-type :deal-mode-show-map='dealModeShowMap' :model-value.sync='orderType'
                                        :multiple-val.sync='multipleVal' :product='product' :trade-type='tradeType'
                                        @change='changeOrderType'
                            />
                            <!-- 自动借还款 -->
                            <auto-circulate v-if='[3, 9].includes(tradeType)' :account='account' class='cell-m-t'
                                            :model-value.sync='operationType' :product='product'
                            />
                            <!-- 方向 -->
                            <direction class='cell-m-t' :deal-mode-show-map='dealModeShowMap' :direction='direction'
                                       :model-value.sync='direction' :product='product'
                            />
                            <!-- 挂单设置 -->
                            <template v-if='orderType === 10'>
                                <pending-set v-if='$includePlay_1(tradeType)' class='cell-m-t' :direction='direction'
                                             :model-value.sync='pendingPrice' :pending-warn.sync='pendingWarn'
                                             :product='product'
                                />
                                <!-- 限价单价格 -->
                                <view v-else class='price-box cell-m-t'>
                                    <input v-model='pendingPrice' :placeholder="$t('trade.priceLabel')"
                                           placeholderClass='placeholderClass' type='digit'
                                    />
                                </view>
                            </template>
                            <!-- 手数 -->
                            <order-volume class='cell-m-t' :entry-type.sync='entryType' :min-volume='minVolume'
                                          :model-value.sync='volume' :product='product' :trade-type='tradeType'
                                          @change='previewMarinHandler'
                            />
                            <!-- 订单资产 -->
                            <order-assets v-if='account' :account='account' :direction='direction'
                                          :preview-fee='previewFee' :preview-margin='previewMargin' :product='product'
                                          :volume='volume'
                            />
                            <!-- 过期类型 -->
                            <cell-type v-if='orderType === 10 && $includePlay_1(tradeType)' class='cell-m-t'
                                       :list='expireTypeList' :model-value.sync='expireType' :title="$t('trade.expireTime')"
                            />
                            <!-- 止盈止损设置 -->
                            <profitloss-set v-if='$includePlay_1(tradeType)' class='cell-zyzs'
                                            :deal-mode-show-map='dealModeShowMap' :direction='direction' :model-value.sync='enabled'
                                            :pending-price='pendingPrice' :product='product' :stop-loss-price.sync='stopLossPrice'
                                            :stop-profit-price.sync='stopProfitPrice'
                            />
                        </view>
                    </view>

                    <!-- 下单按钮 -->
                    <button class='handle-btn' :class="direction === 'buy' ? 'riseColorBg' : 'fallColorBg'"
                            @click='submitHandler'
                    >
                        <i class='iconfont' :class='direction === "buy" ? "icon_mairu" : "icon_maichu"'></i>
                        <span>{{ directionText }}</span>
                    </button>
                </view>

                <!-- 交易记录 -->
                <order-record v-if='customerInfo' ref='roderRecordRef' :trade-type='tradeType'
                              @subscribe='setProductKeys'
                />
            </view>
            <!-- 活动倒计时 -->
            <activity-countdown @handleSwitch='handleSwitch' />
        </view>

        <!-- 侧边栏切换产品 -->
        <sidebar-product ref='sidebar' show-category show-play @select='selectProduct' />
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>
// vuex
import store from '@/store/index.js'
// api
import { addMarketOrder, calculateMarketOrder } from '@/api/trade.js'
// utils
import { isEmpty, localGet, localSet, debounce } from '@/utils/util.js'
import { pow, mul } from '@/utils/calculation.js'
// components
import productInfo from './components/product-info.vue'
import orderType from './components/order-type.vue'
import autoCirculate from './components/auto-circulate.vue'
import direction from './components/direction.vue'
import cellType from './components/cell-type.vue'
import orderVolume from './components/order-volume.vue'
import pendingSet from './components/pending-set.vue'
import profitlossSet from './components/profitloss-set.vue'
import orderAssets from './components/order-assets.vue'
import handicap from './components/handicap.vue'
import orderRecord from './components/order-record.vue'
import sidebarProduct from '@/components/modules/sidebar-product.vue'
import activityCountdown from '@/components/modules/activity-countdown.vue'

// 轮询预估保证金
let intervalCalculateMargin = null
let intervalCalculating = false // 是否处于轮询获取预估保证金的状态

export default {
    components: {
        productInfo,
        orderType,
        autoCirculate,
        direction,
        cellType,
        orderVolume,
        pendingSet,
        profitlossSet,
        orderAssets,
        handicap,
        orderRecord,
        sidebarProduct,
        activityCountdown
    },
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 当前页面symbolKey
            symbolKey: '',
            // 玩法类型
            tradeType: '',
            // 方向
            direction: 'buy',
            // 订单类型索引
            currentIndex: 0,
            // 订单类型
            orderType: 1,
            // 手数
            volume: '',
            // 最小手数
            minVolume: '',
            // 下单类型  1.按数量下单 2.按成交额下单
            entryType: 1,
            // 过期类型
            expireType: 1,
            // 过期类型列表
            expireTypeList: [
                { title: this.$t('trade.expireType2'), val: 2 },
                { title: this.$t('trade.expireType1'), val: 1 }
            ],
            // 操作类型 1-普通 2-自动借款 3-自动还款
            operationType: 1,
            // 挂单价格
            pendingPrice: '',
            // 挂单提示
            pendingWarn: '',
            // 是否开启止盈止损
            enabled: false,
            // 止损价
            stopLossPrice: '',
            // 止盈价
            stopProfitPrice: '',
            // 止损价提示
            stopLossWarn: '',
            // 止盈价提示
            stopProfitWarn: '',
            // 当前玩法上次选择的产品
            productHistory: localGet('productHistory') ? JSON.parse(localGet('productHistory')) : {},
            // 杠杆倍数
            multipleVal: '',
            // 五档行情报价小数位
            handicapDigit: '',
            // 交易记录组件需要订阅的产品
            productKeys: [],
            // 预估保证金
            previewMargin: '',
            // 预估手续费
            previewFee: ''
        }
    },
    computed: {
        // 产品map数据
        productMap () {
            return store.state._quote.productMap
        },
        // 产品数据
        product () {
            return this.productMap[this.symbolKey] || {}
        },
        // 账户
        account () {
            let account = ''
            const customerInfo = this.customerInfo
            if (!this.product || !customerInfo) return account
            const accountList = customerInfo.accountList || []
            const tradeType = this.tradeType
            if (this.$includePlay_1(tradeType)) {
                account = accountList.find(el => el.tradeType === tradeType)
            } else {
                const outCurrency = this.product[this.direction === 'buy' ? 'profitCurrency' : 'baseCurrency']
                account = customerInfo.accountMap[`${tradeType}_${outCurrency}`]
            }
            return account
        },
        // 委托列表数据
        trustList () {
            return store.state._trade.pendingList[this.tradeType] || []
        },
        // 持仓列表数据
        positionList () {
            return store.state._trade.positionList[this.tradeType] || []
        },
        // 当前全仓产品的持仓杠杆倍数
        multipleValPosition () {
            const position = this.positionList.find(el => parseInt(el.symbolId) === parseInt(this.product.symbolId))
            return position ? position.crossLevelNum : ''
        },
        // 下单按钮文案
        directionText () {
            return this.direction === 'buy' ? this.$t('trade.buyText') : this.$t('trade.sellText')
        },
        // 成交模式: 1:MM(不展示盘口和成交记录) 2:蝴蝶（不显示挂单tab）3:撮合 4:聚合
        dealModeShowMap () {
            const product = this.product
            return {
                '1': {
                    handicap: false,
                    pendingTab: {
                        tradeType: [1, 2, 3, 5], // 哪些玩法显示限价单
                        show: true, // 限价单是否显示
                    }
                },
                '2': {
                    handicap: true && !product.isIndex,
                    pendingTab: {
                        tradeType: [1, 2, 3, 5], // 哪些玩法显示限价单
                        show: false, // 限价单是否显示
                    }
                },
                '3': {
                    handicap: true && !product.isIndex,
                    pendingTab: {
                        tradeType: [1, 2, 3, 5], // 哪些玩法显示限价单
                        show: true // 限价单是否显示
                    }
                },
                '4': {
                    handicap: true && !product.isIndex,
                    pendingTab: {
                        tradeType: [5], // 哪些玩法显示限价单
                        show: true // 限价单是否显示
                    }
                }
            }
        }
    },
    watch: {
        // 监听玩法类型
        tradeType () {
            // 设置订单类型
            this.orderType = 1
            // 设置操作类型
            this.operationType = 1
            // 设置下单类型
            this.setEntryType()
            // 订阅资产
            if (this.$MsgSocket) {
                this.$MsgSocket.subscribedListAdd(() => {
                    this.$MsgSocket.subscribeAsset(this.tradeType)
                })
            }
        },
        // 监听产品symbolKey
        symbolKey () {
            // 关闭止盈止损
            this.enabled = false
            // 设置产品数据
            if (!this.skeletonShow) this.setProduct()
        },
        // 监听买卖方向
        direction () {
            // 设置下单类型
            this.setEntryType()
            // 获取账户信息
            this.getAccountInfo()
            // 重新预估保证金
            this.previewMarinHandler()
        },
        // 监听五档行情报价小数位
        handicapDigit () {
            // 订阅五档行情
            if (this.handicapDigit) {
                this.subscribeHandicap()
            }
        },
        // 监听当前全仓产品的持仓杠杆倍数
        multipleValPosition (newVal) {
            if (newVal) this.multipleVal = newVal
        }
    },
    onLoad () {
        // 设置默认玩法类型
        if (localGet('defaultTradeType')) this.tradeType = localGet('defaultTradeType')
    },
    onShow () {
        // 添加应用内事件
        this.$addAppsEvent('trade_view')
        // 获取cats2系统维护配置
        store.dispatch('_global/getConfigSystem')
        // 初始化 
        this.$init().then(() => {
            this.skeletonShow = false
            // 页面初始化
            this.pageInit()
            // 老三表初始化
            this.$refs['roderRecordRef'].init()
        }).catch(() => {
            this.skeletonShow = false
        })
    },
    onHide () {
        this.pageHide()
        this.clearIntervalCalculate()
    },
    methods: {
        // 页面初始化
        pageInit () {
            // 设置默认参数
            const params = store.state._global.orderParams
            if (params) {
                const symbolKey = params.symbolId + '_' + params.tradeType
                this.tradeType = Number(params.tradeType)
                this.direction = params.direction
                this.symbolKey = symbolKey 
                this.productHistory[this.tradeType] = symbolKey
                // 缓存默认数据
                this.cacheDefault()
                store.commit('_global/setOrderParams')
            } else {
                // 设置当前产品的symbolKey
                this.setSymbolKey()
            }

            // 设置当前产品的symbolKey
            this.setSymbolKey()
            // 订阅资产
            this.$MsgSocket.subscribeAsset(this.tradeType)
            // 获取产品详情
            if (!this.skeletonShow) this.getProductInfo()
            this.resetPreviewMargin()
        },
        // 页面隐藏
        pageHide () {
            // 手数设置为空
            this.volume = ''
            // 取消订阅产品行情
            this.$QuoteSocket.cancel_subscribe()
            // 取消订阅资产
            if (this.$MsgSocket) {
                this.$MsgSocket.cancelSubscribeAsset() 
            }
            // 取消订阅五档行情
            this.handicapDigit = ''
            store.commit('_quote/Delete_dealList')
            // 取消资产订阅
            this.$MsgSocket.cancelSubscribeAsset()
        },

        // 点击页面任何位置
        onLayout () {
            // 关闭五档行情报价下拉框
            if (this.$refs['handicapRef']) this.$refs['handicapRef'].showPopover = false
        },

        // 获取产品详情数据
        getProductInfo () {
            const [symbolId, tradeType] = this.symbolKey.split('_')
            this.handicapDigit = ''
            if (!tradeType) return
            store.dispatch('_quote/querySymbolInfo', { symbolId, tradeType }).then(product => {
                // 设置默认手数为空
                this.volume = ''
                this.pendingPrice = ''
                this.minVolume = product?.minVolume
                // 获取账户信息
                this.getAccountInfo()
                // 设置五档行情报价小数位
                this.handicapDigit = pow(0.1, product?.symbolDigits)
                // 订阅当前页面的所有产品
                this.sendSubscribe()
                // 设置杠杆倍数
                this.setMultipleVal()
            })
        },

        // 获取账户信息
        getAccountInfo () {
            if (this.$includePlay_2(this.tradeType)) {
                const proCurrency = this.direction === 'buy' ? this.product?.profitCurrency : this.product?.baseCurrency
                const curAccount = this.customerInfo.accountList?.find(({ currency, tradeType }) => (currency === proCurrency && tradeType === this.tradeType))
                if (curAccount) {
                    store.dispatch('_user/queryAccountAssetsInfo', { accountId: curAccount.accountId, tradeType: this.tradeType })
                } else {
                    uni.showToast({
                        title: this.$t('trade.nullAssets'),
                        icon: 'none'
                    })
                }
            }
        },

        // 设置当前产品symbolKey
        async setSymbolKey () {	
            if (!this.tradeType) return
            await store.dispatch('_quote/querySymbolBaseInfoList')
            const product = this.$method.getDefaultProduct(this.tradeType)
            if (!product) return
            const key = product.symbolKey
            this.symbolKey = key
            this.productHistory[this.tradeType] = key
            // 缓存默认数据
            this.cacheDefault()
        },
		
        // 缓存默认数据
        cacheDefault () {
            store.commit('_quote/Update_productActivedID', this.symbolKey)
            // 设置玩法和产品缓存
            localSet('defaultTradeType', this.tradeType)
            localSet('productHistory', JSON.stringify(this.productHistory))
        },

        // 设置下单类型，切换产品或者切换方向时需要重新设置；现货撮合、杠杆玩法下单买入按额，其他都是按手数交易
        setEntryType () {
            const tradeType = Number(this.tradeType)
            // 按成交额下单
            if ([3, 5].includes(tradeType) && this.direction === 'buy') {
                this.entryType = 2
            } else {
                // 按数量下单
                this.entryType = 1
            }
        },

        // 设置杠杆倍数
        setMultipleVal () {
            const product = this.product
            let [symbolId, tradeType] = this.symbolKey.split('_')
            symbolId = Number(symbolId)
            tradeType = Number(tradeType)
            // 全仓杠杆
            if (tradeType === 1) {
                store.dispatch('_trade/queryPositionPage', { tradeType }).then(res => {
                    const position = res.data.find(el => el.tradeType === tradeType && el.symbolId === symbolId)
                    // 找到持仓产品设置相同的杠杆倍数
                    if (position && position.crossLevelNum) {
                        this.multipleVal = position.crossLevelNum
                    } else {
                        // 找不到持仓产品设置杠杆倍数
                        let val = 20
                        if (product.marginInfo?.type === '2') {
                            const [min, max] = product.marginInfo?.values?.split('-') || [1, 1]
                            if (min > val) {
                                val = min
                            }
                            if (max < val) {
                                val = max
                            }
                        }
                        this.multipleVal = val
                    }
                })
            } else {
                // 逐仓杠杆
                const [min] = product.marginInfo?.values?.split('-') || [1, 1]
                this.multipleVal = min
            }
        },

        // 设置产品数据
        setProduct () {
            store.commit('_quote/Update_productActivedID', this.symbolKey)
            // 获取产品详情数据
            this.getProductInfo()
            this.resetPreviewMargin()
        },

        // 设置交易记录组件需要订阅的产品
        setProductKeys (arr) {
            this.productKeys = arr
            this.sendSubscribe()
        },

        // 订阅当前页面的所有产品
        sendSubscribe () {
            let result = [...this.productKeys, this.symbolKey]
            result = [...new Set(result)]
            if (this.$QuoteSocket) {
                this.$QuoteSocket.send_subscribe(result)
                this.$QuoteSocket.send_subscribe24H(result)
            }
        },

        // 订阅五档行情
        subscribeHandicap () {
            const product = this.product
            const priceBreadth = Number(product.priceBreadth) >= 5 ? 5 : product.priceBreadth
            if ([5, 9].includes(this.tradeType) || this.product.dealMode === 2) {
                this.$QuoteSocket.deal_subscribe(this.product.symbolId, priceBreadth, this.handicapDigit, this.tradeType, 20)
            }
        },

        // 切换玩法类型
        switchTradeType () {
            // 设置当前产品symbolKey
            this.setSymbolKey()
        },

        // 打开侧边栏弹窗
        openSidebar () {
            this.$refs['sidebar'].show(this.tradeType)
        },

        // 选择产品
        selectProduct (tradeType, item) {
            this.orderType = 1
            this.tradeType = Number(tradeType)
            this.symbolKey = item.symbolKey
            this.productHistory[tradeType] = item.symbolKey
            // 设置产品缓存
            localSet('productHistory', JSON.stringify(this.productHistory))
        },

        // 跳转到交易列表页面
        goOrderList () {
            uni.navigateTo({
                url: '/pages/order/list?tradeType=' + this.tradeType
            })
        },

        // 改变订单类型
        changeOrderType () {
            this.pendingPrice = ''
            store.commit('_trade/Update_pendingEnable', this.orderType === 10)
            this.previewMarinHandler()
        },

        // 改变过期类型
        changeExpireType (item) {
            this.expireType = item.val
        },

        // 验证下单参数
        paramsInvalid () {
            // 参数验证
            if (isEmpty(this.volume)) {
                return this.$t('trade.inputVolume')
            }
            if (this.orderType === 10 && this.$includePlay_1(this.tradeType)) {
                if (!this.pendingPrice) {
                    return this.$t('trade.inputPendingPrice')
                }
                if (this.pendingWarn) {
                    return this.pendingWarn
                }
            }
            if (this.orderType === 10 && this.$includePlay_2(this.tradeType)) {
                if (!this.pendingPrice) {
                    return this.$t('trade.inputPendingPrice')
                }
            }
            if (!this.account) {
                return this.$t('trade.nullAssets')
            }
        },

        // 下单
        submitHandler () {
            const orderParamsInvalid = this.paramsInvalid()
            if (typeof (orderParamsInvalid) === 'string') {
                uni.showToast({
                    title: orderParamsInvalid,
                    icon: 'none'
                })
            } else {
                // 发起下单请求
                this.addMarketOrder()
            }
        },

        // CFD全仓和CFD逐仓 手数区分10-限价预埋单；11-停损预埋单，按额下单固定bizType 14
        bizTypeByPendingCFD () {
            // const requestPrice = this.pendingPrice
            // let bizType = ''
            // if (this.direction === 'buy') {
            //     bizType = lt(requestPrice, this.product.buy_price) ? 10 : 11 
            // } else {
            //     bizType = gt(requestPrice, this.product.sell_price) ? 10 : 11
            // }
            // return bizType
            // 限价单固定bizType 12
            return 12
        },

        // 获取bizType
        getBizType () {
            const tradeType = this.tradeType
            const orderType = this.orderType
            const entryType = this.entryType
            let bizType = ''
            if (this.$includePlay_1(tradeType)) {
                if (orderType === 1) {
                    bizType = 1
                } else {
                    bizType = this.bizTypeByPendingCFD()
                }
            }
            if (tradeType === 3) {
                if (orderType === 1) {
                    bizType = entryType === 1 ? 1 : 12
                } else {
                    bizType = entryType === 1 ? 13 : 14
                }
            }
            if (tradeType === 5) {
                // 现货撮合玩法 市价填写12, 限价填写13
                bizType = orderType === 1 ? 12 : 13
            }
            if (tradeType === 9) {
                bizType = orderType === 1 ? 1 : 13
            }
            return bizType
        },

        // 收集下单的参数
        orderParams () {
            let [symbolId, tradeType] = this.symbolKey.split('_')
            symbolId = Number(symbolId)
            tradeType = Number(tradeType)
            const product = this.product
            const direction = this.direction
            const directionVal = direction === 'buy' ? 1 : 2
            const orderType = this.orderType
            const account = this.account
            const bizType = this.getBizType()
            const digits = product.hasOwnProperty('price_digits') ? product.price_digits : product.symbolDigits
            const p = pow(10, digits)
            let requestPrice = direction === 'sell' ? product.sell_price : product.buy_price
            if (orderType === 10) {
                requestPrice = this.pendingPrice
            }
            const params = {
                accountCurrency: account.currency,
                accountId: account.accountId,
                accountDigits: account.digits,
                tradeType,
                symbolId,
                bizType: bizType,
                direction: directionVal,
                requestTime: Date.now(),
                requestNum: Number(this.volume),
                requestPrice: mul(requestPrice, p),
                entryType: this.entryType,
                expireType: this.expireType,
                operationType: this.operationType,
                stopLoss: mul(this.stopLossPrice, p),
                takeProfit: mul(this.stopProfitPrice, p)
            }
            if ([1, 2].includes(tradeType) && product.marginInfo?.type !== '1') params.crossLevelNum = Number(this.multipleVal)
            return params
        },

        // 发起下单请求
        addMarketOrder () {
            const params = this.orderParams()
            uni.showLoading({
                title: this.$t('common.submiting'),
                mask: true
            })
            addMarketOrder(params).then(res => { 
                const { data } = res
                // 延迟单
                if (data.hasDelay === 2) {
                    setTimeout(() => {
                        this.successCallback()
                    }, 2000)
                } else {
                    this.successCallback()
                }

                // 添加应用内事件
                this.$addAppsEvent('complete_' + this.direction)
            }).catch(res => {
                uni.hideLoading()
                const isReal = store.state._user.customerInfo.companyType === 'real'
                if (['E000027', '20010', 'E000030', 'E000033', 'E000031', 'E000029', 'E000025'].includes(res.code) && isReal) {
                    this.depositGuideDialog()
                    return false
                } else {
                    this.$refs['modalDialog'].show({
                        content: res.msg
                    })
                }
            })
        },
        // 下单时余额不足的充值引导
        depositGuideDialog () {
            const plans = store.state._base.plans
            const tradeType = this.product.tradeType
            const isTransferAction = plans.length > 1 && tradeType !== 5
            const btnText = isTransferAction ? this.$t('trade.transfer') : this.$t('common.deposit')
            this.$refs['modalDialog'].show({
                content: this.$t('withdrawMoney.hint_5'),
                showCancel: true,
                showConfirm: true,
                confirmText: btnText
            }).then(async () => {
                if (isTransferAction) {
                    this.$method.goTransfer(this.account)
                } else {
                    this.$method.goDeposit(this.account)
                }
            }).catch(() => {})
        },
        // 下单成功反馈
        successCallback () {
            const bizType = this.getBizType()
            uni.hideLoading()
            uni.showToast({
                title: [1, 12].includes(bizType) ? this.$t('trade.orderSuccessToast') : this.$t('trade.orderPendingSuccessToast'),
                icon: 'none'
            })
            this.volume = ''
            this.pendingPrice = ''
            this.resetPreviewMargin()

            // 更新交易记录数据
            this.$refs['roderRecordRef'].init()
            // 获取账户信息
            this.getAccountInfo()
        },
		
        // 请求预估保证金、手续费
        intervalCalculateMarginRequest (params) {
            calculateMarketOrder(params).then(res => {
                if (res.check() && params.symbolId === this.product.symbolId && intervalCalculating) {
                    this.previewFee = res.data.fee
                    this.previewMargin = res.data.margin
                } else {
                    this.resetPreviewMargin()
                }
            }).catch(() => {
                this.clearIntervalCalculate()
            })
        },
		
        // 切换订单类型、修改手数、挂单价格后触发重新获取预估保证金、手续费
        previewMarinHandler: debounce(function (type, e) {
            if ([1, 2].indexOf(parseInt(this.tradeType)) === -1) return false
            this.clearIntervalCalculate()
            const paramsInvalidResult = this.paramsInvalid()
            if (paramsInvalidResult) {
                this.previewFee = ''
                this.previewMargin = ''
                return null
            }
            const params = this.orderParams()
            this.intervalCalculateMarginRequest(params)
            // 500ms循环调用接口获取实时预估手续费和保证金
            intervalCalculating = true
            intervalCalculateMargin = setInterval(() => {
                const paramsInvalidResult = this.paramsInvalid()
                if (!paramsInvalidResult) this.intervalCalculateMarginRequest(this.orderParams())
            }, 500)
        }, 400),
		
        // 清理轮询获取预估保证金
        clearIntervalCalculate () {
            intervalCalculating = false
            intervalCalculateMargin && clearInterval(intervalCalculateMargin)
        },
		
        // 切换产品和下单成功清空预估保证金
        resetPreviewMargin () {
            this.previewFee = ''
            this.previewMargin = ''
            this.clearIntervalCalculate()
        },
        handleSwitch (type, callback) {
            this.$refs.topNavRef.goDeposit()
        }
    }
}
</script>

<style lang="scss" scoped>
.cell-m-t {
    margin-top: 40rpx;
}

.cell-zyzs {
    margin-top: 20rpx;
}

::v-deep .number-box {
    @include styles('background-color', 'assistColor');
}

.header-module {
    @include flexColumnAll;
    height: 100%;
    line-height: 1;

    .product-name {
        @include text-clamp-one;
        @include styles('color', 'color');
        width: 450rpx;
        text-align: center;
        padding-top: 8rpx;
        font-size: 34rpx;
    }

    .short-name {
        @include text-clamp-one;
        @include styles('color', 'minorColor');
        width: 450rpx;
        text-align: center;
        margin-top: 8rpx;
        font-size: 22rpx;
    }
}

.main-content {
    @include styles('background-color', 'contentColor');
    margin-top: 20rpx;
    padding: 0 30rpx 40rpx;
}

.main-module {
    display: flex;

    .left-module {
        width: 250rpx;
        margin-right: 30rpx;
    }

    .right-module {
        flex: 1;
    }
}

.price-box {
    @include styles('background-color', 'assistColor');
    height: 80rpx;

    input {
        flex: 1;
        height: 100%;
        text-align: center;
    }
}

.handle-btn {
    @include flexAll;
    height: 90rpx;
    margin-top: 80rpx;
    font-size: 30rpx;
    color: #fff;

    .iconfont {
        font-size: 18rpx;
        margin-right: 15rpx;
        opacity: .5;
    }

    &.buy-color {
        @include styles('background-color', 'riseColor');
    }

    &.sell-color {
        @include styles('background-color', 'fallColor');
    }

    span {
        font-weight: bold;
    }
}
</style>
