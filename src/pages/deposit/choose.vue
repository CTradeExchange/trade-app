<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='layout-container'>
            <!-- 头部导航栏 -->
            <nav-bar is-custom show-custom-title :title="$t('cRoute.deposit')">
                <view class='nav-bar-action'>
                    <tui-icon name='explain' @click='toExplain' />
                    <tui-icon name='order' @click='toRecord' />
                </view>
            </nav-bar>
            <!-- 活动倒计时 -->
            <activity-countdown class='primaryBg' />
            <!-- 通道模块 -->
            <view class='payment-module'>
                <view v-if='paymentList.length > 0' class='payment-list'>
                    <view class='title'>
                        {{ $t('deposit.selectRechargeWay') }}
                    </view>
                    <ul>
                        <li v-for='(item, index) in paymentList' :key='index'
                            :class="{ 'active': item.id === paymentInfo.id }" @click='switchPayment(item)'
                        >
                            <image class='img' :src='item.imgUrl' />
                            <span class='name'>
                                {{ item.alias || item.paymentTypeAlias || item.paymentType }}
                            </span>
                        </li>
                        <li v-if='paymentList.length % 2 !== 0' class='empty-li'></li>
                    </ul>
                    <view class='line' />
                </view>
                <!-- 没有通道 -->
                <view v-else class='none-block'>
                    <none-data :text="$t('deposit.noneChannel')" />
                </view>
            </view>
            <!-- 直充 -->
            <direct-module v-if='rechargeType === 1' ref='directModuleRef' />
            <!-- 汇兑 -->
            <exchange-module v-if='rechargeType === 2' ref='exchangeModuleRef' />
        </view>

        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>
import store from '@/store'
import exchangeModule from './components/exchange-module.vue'
import directModule from './components/direct-module.vue'
import { checkKycApply, queryAllPayType } from '@/api/user'
import { isEmpty, localGet, localRemove } from '@/utils/util'
import { toService } from '@/utils/method'
import activityCountdown from '@/components/modules/activity-countdown.vue'

export default {
    components: {
        exchangeModule,
        directModule,
        activityCountdown
    },
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 玩法类型
            tradeType: '',
            // 当前选中币种
            currency: '',
            // 当前账户id
            accountId: '',
            // 是否回调跳转页面
            isCallback: false,
            // 通道列表
            paymentList: [],
            // 当前选择的通道
            paymentInfo: {}
        }
    },
    computed: {
        // 玩法列表
        plans () {
            return store.state._base.plans
        },
        // wp配置的支付通道图标
        paymentIconList () {
            return store.state._base.wpCompanyInfo.paymentIconList
        },
        // 当前充值方式 1:直充 2.汇兑
        rechargeType () {
            return this.paymentInfo?.paymentCode ? (this.paymentInfo.paymentCode === 'coin_mdpay' ? 1 : 2) : ''
        }
    },
    watch: {
        // 监听支付通道
        paymentInfo () {
            // 初始化模块
            this.initModule()
        }
    },
    onLoad (options) {
        // 初始化
        this.$init().then(() => {
            let tradeType = Number(options.tradeType)
            const item = this.plans.find(el => Number(el.tradeType) === tradeType)
            if (!item) {
                tradeType = Number(this.plans[0].tradeType)
            }
            this.tradeType = tradeType
            this.currency = options.currency || ''
            this.accountId = options.accountId || ''
            this.isCallback = options.isCallback === 'true'

            // 页面初始化
            this.pageInit()
        }).catch(() => {
            this.skeletonShow = false
        })
    },
    methods: {
        // 页面初始化
        pageInit () {
            // 检查是否需要KYC认证
            this.checkKyc()
            // 验证客户是否可存款
            this.checkCustomerDeposit()
            // 获取所有支付通道列表
            this.queryAllPayType()
        },

        // 检查是否需要KYC认证
        checkKyc () {
            checkKycApply({ businessCode: 'cashin' }).then(res => {
                if (Number(res.data) !== 2) {
                    this.$refs['modalDialog'].show({
                        content: Number(res.data) === 2 ? this.$t('deposit.KYCReviewing') : this.$t('deposit.needKYC'),
                        confirmText: Number(res.data) === 1 ? this.$t('common.goLook') : this.$t('login.goAuthenticate')
                    }).then(() => {
                        uni.redirectTo({
                            url: '/pages/person/authentication?businessCode=cashin'
                        })
                    })
                }
            })
        },

        // 验证客户是否可存款
        checkCustomerDeposit () {
            store.dispatch('_user/findCustomerInfo', false).then(res => {
                // 是否显示联系客服弹窗
                if (Number(this.customerInfo.deposit) === 0) {
                    this.$refs['modalDialog'].show({
                        title: this.$t('common.tip'),
                        content: this.$t('deposit.serviceTips1'),
                        showCancel: true,
                        confirmText: this.$t('common.serivce'),
                        cancelText: this.$t('common.close')
                    }).then(() => {
                        toService()
                    })
                }
            })
        },

        // 获取所有支付通道列表
        queryAllPayType () {
            const params = {
                tradeType: this.tradeType,
                clientType: 'mobile'
            }
            queryAllPayType(params).then(res => {
                this.skeletonShow = false
                const data = res.data || []
                // 设置通道图标并排序
                data.sort((a, b) => {
                    if (a.sort === b.sort) {
                        return 0
                    } else {
                        return a.sort > b.sort ? 1 : -1
                    }
                })
                data.map(el => {
                    const iconKey = el.paymentCode + '_' + el.paymentType + '_' + el.merchantNo
                    const isDirect = el.paymentCode === 'coin_mdpay'
                    if (this.paymentIconList[iconKey]) {
                        el.alias = this.paymentIconList[iconKey][this.currentLang].alias || ''
                        el.imgUrl = this.paymentIconList[iconKey][this.currentLang].imgUrl
                    }
                    el.imgUrl = el.imgUrl || (isDirect ? require('@/static/image/payment_icon/direct.png') : require('@/static/image/payment_icon/exchange.png'))
                })
                if (data.length > 0) { 
                    const paymentId = localGet('paymentId')
                    let index = data.findIndex(el => el.id === Number(paymentId))
                    index = index !== -1 ? index : 0
                    this.paymentList = data
                    this.paymentInfo = data[index]
                    localRemove('paymentId')
                }
            }).catch(() => {
                this.skeletonShow = false
            })
        },

        // 初始化模块
        initModule () {
            this.$nextTick(() => {
                const data = {
                    tradeType: this.tradeType,
                    currency: this.currency,
                    accountId: this.accountId,
                    isCallback: this.isCallback,
                    paymentInfo: this.paymentInfo
                }
                if (this.rechargeType === 1) {
                    // 直充模块初始化
                    this.$refs['directModuleRef'].init(data)
                    // 添加应用内事件
                    this.$addAppsEvent('deposit_direct_view')
                } else {
                    // 买币模块初始化
                    this.$refs['exchangeModuleRef'].init(data)
                    // 添加应用内事件
                    this.$addAppsEvent('deposit_buycoin_view')
                }
            })
        },

        // 切换支付通道
        switchPayment (item) {
            if (item.id !== this.paymentInfo.id) {
                this.isCallback = false
                this.paymentInfo = item
                uni.showLoading({
                    title: this.$t('common.loading'),
                    mask: true
                })
            }
        },

        // 跳转到说明页面
        toExplain () {
            uni.navigateTo({
                url: '/pages/deposit/answers?type=' + this.rechargeType
            })
        },

        // 跳转到记录页面
        toRecord () {
            uni.navigateTo({
                url: '/pages/deposit/record?type=' + this.rechargeType
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.nav-bar-action {
    display: flex;
    align-items: center;
    height: 100%;
    position: absolute;
    top: 0;
    right: 25rpx;

    &::v-deep {
        .tui-icon {
            margin-left: 12rpx !important;
            @include styles('color', 'normalColor');
            font-size: 38rpx !important;
        }
    }
}

.none-block {
    @include styles('border-color', 'lineColor');
    border-style: solid;
    border-width: 1px;
    border-radius: 16rpx;
    overflow: hidden;
}

.activity-title {
    text-align: center;
    padding: 20rpx 0;
    font-size: 32rpx;
    margin: 10rpx 0 20rpx;
    @include styles('background', 'contentColor');
}

.payment-module {
    width: 690rpx;
    margin: 30rpx auto;
    .title {
        @include styles('color', 'color');
        line-height: 1;
        margin-top: 32rpx;
        margin-bottom: 32rpx;
        font-size: 34rpx;
        font-weight: bold;
    }
}

.primaryBg{
    @include styles('background', 'primary');
}

.payment-list {

    @include styles('background', 'contentColor');
    @include styles('border-color', 'lineColor');
    padding: 40rpx 30rpx;
    border-radius: 16rpx;
    border-style: solid;
    border-width: 1px;

    ul {
        @include styles('border-color', 'lineColor');
        display: flex;
        flex-wrap: wrap;
        border-style: solid;
        border-width: 1px;
        border-radius: 16rpx;
        overflow: hidden;
    }

    li {
        @include styles('border-top-color', 'lineColor');
        display: inline-flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 50%;
        height: 144rpx;
        padding: 0 16rpx;
        box-sizing: border-box;
        position: relative;
        border-top-style: solid;
        border-top-width: 1px;

        &:nth-of-type(even) {
            @include styles('border-left-color', 'lineColor');
            border-left-style: solid;
            border-left-width: 1px;
        }

        &:nth-of-type(1) {
            border-top: none;

            &:after {
                border-top-left-radius: 16rpx;
            }
        }

        &:nth-of-type(2) {
            border-top: none;

            &:after {
                border-top-right-radius: 16rpx;
            }
        }

        &:nth-last-of-type(1) {
            &:after {
                border-bottom-right-radius: 16rpx;
            }
        }

        &:nth-last-of-type(2) {
            &:after {
                border-bottom-left-radius: 16rpx;
            }
        }

        .img {
            width: 56rpx;
            height: 56rpx;
            margin-bottom: 8rpx;
        }

        .name {
            @include text-clamp-one();
            @include styles('color', 'color');
            width: 100%;
            text-align: center;
            font-size: 28rpx;
            font-weight: bold;
        }
    }

    .active {
        @include styles('background', 'primaryBg');

        &:after {
            @include styles('border-color', 'primary');
            content: '';
            width: calc(100% - 4px);
            height: calc(100% - 4px);
            border-width: 2px;
            border-style: solid;
            position: absolute;
            top: 0;
            left: 0;
        }
    }

    .line {
        @include styles('border-top-color', 'lineColor');
        margin-top: 40rpx;
        margin-bottom: 10rpx;
        border-top-width: 1px;
        border-top-style: dashed;
    }
}
</style>
