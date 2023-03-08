<template>
    <view class='module-content'>
        <view class='assets-module'>
            <view class='total-assets'>
                <view class='label'>
                    <view class='name'>
                        {{ $t('assets.balance') }}({{ assetsInfo.currency }})
                    </view>
                    <i class='iconfont icon_zijinmingxi' @click='$method.goAssetsRecord(tradeType)'></i>
                </view>
                <view class='amount'>
                    {{ userAccount.balance }}
                </view>
            </view>
            <view class='detail-assets'>
                <view class='row'>
                    <view class='col'>
                        <view class='label'>
                            <span @click='showExplain(1)'>
                                {{ $t('trade.jingzhi') }}
                            </span>
                            <tui-icon class='explain' name='explain' @click='showExplain(1)' />
                        </view>
                        <strong>{{ userAccount.netWorth || '--' }}</strong>
                    </view>
                    <view class='col'>
                        <view class='label'>
                            <span @click='showExplain(4)'>
                                {{ $t('trade.marginLevel') }}
                            </span>
                            <tui-icon class='explain' name='explain' @click='showExplain(4)' />
                        </view>
                        <strong>
                            <b>{{ userAccount.marginRadio }}%</b>
                            <em :class="['riskLevel', 'riskLevel' + userAccount.riskStatus]">
                                {{ riskLevelMap[userAccount.riskStatus] }}
                            </em>
                        </strong>
                    </view>
                </view>
                <view class='row'>
                    <view class='col'>
                        <view class='label'>
                            <span @click='showExplain(2)'>
                                {{ $t('trade.freeMargin') }}
                            </span>
                            <tui-icon class='explain' name='explain' @click='showExplain(2)' />
                        </view>
                        <strong>{{ userAccount.availableMargin || '--' }}</strong>
                    </view>
                    <view class='col'>
                        <view class='label'>
                            <span @click='showExplain(3)'>
                                {{ $t('trade.originalMargin') }}
                            </span>
                            <tui-icon class='explain' name='explain' @click='showExplain(3)' />
                        </view>
                        <strong>{{ userAccount.occupyMargin || '--' }}</strong>
                    </view>
                </view>
                <view class='row'>
                    <view class='col'>
                        <view class='label'>
                            <span>
                                {{ $t('fund.acceptAmount') }}
                            </span>
                            <tui-icon class='explain' name='explain' @click='showExplain(12)' />
                        </view>
                        <strong>{{ userAccount.withdrawAmount || '--' }}</strong>
                    </view>
                </view>
            </view>
            <view class='handle-button'>
                <template v-if='isDepositWithdraw'>
                    <button class='btn state-1' @click='goDeposit'>
                        {{ $t('trade.desposit') }}
                    </button>
                    <button class='btn state-1' @click='goWithdraw'>
                        {{ $t('trade.withdraw') }}
                    </button>
                </template>
                <button v-if='customerInfo.companyType === "demo"' class='btn state-1' @click='resetUserAccount'>
                    {{ $t('mockAccount.resetAccount') }}
                </button>
                <button v-if='plansLen > 1 && customerInfo.companyType === "real"' class='btn state-2' @click='$method.goTransfer(accountList[0])'>
                    {{ $t('trade.transfer') }}
                </button>
            </view>
            <view v-if='customerInfo.companyType === "demo"' class='reset-desc' @click='showExplain(11)'>
                {{ $t('assetsExplain.text29') }}
            </view>
        </view>
        <!-- 说明弹窗 -->
        <explain-popup  
            :explain-type='explainType'
            :show.sync='isExplain'
            :user-account='userAccount'
        />
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
    </view>
</template>

<script>	
import store from '@/store/index.js'
import { resetAccount, queryAccountById } from '@/api/user.js'
import explainPopup from './explain-popup.vue'

export default {
    components: {
        explainPopup
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
            // 是否显示说明弹窗
            isExplain: false,
            // 说明类型
            explainType: 0,
            // 保证金水平等级文案
            riskLevelMap: {
                1: this.$t('riskLevel.safety'),
                2: this.$t('riskLevel.warn'),
                3: this.$t('riskLevel.danger')
            }
        }
    },
    computed: {
        // 用户账户资产
        userAccount () {
            return store.state._user.accountAssets[this.tradeType] || {}
        },
        // 账户列表
        accountList () {
            return this.customerInfo?.accountList.filter(el => Number(el.tradeType) === Number(this.tradeType))
        },
        // 资产信息
        assetsInfo () {
            const accountList = this.customerInfo?.accountList
            return accountList?.find(el => Number(el.tradeType) === Number(this.tradeType)) || {}
        }
    },
    mounted () {
    },
    methods: {
        // 跳转到资金记录页面
        goAssetsRecord () {
            uni.navigateTo({
                url: '/pages/assets/record?tradeType=' + this.tradeType
            })
        },
		
        // 跳转到充值页面
        goDeposit () {
            this.$method.goDeposit(this.tradeType)
            // 添加应用内事件
            this.$addAppsEvent('assets_desposit_click')
        },
        
        // 跳转到提现页面
        goWithdraw () {
            this.$method.goWithdraw(this.accountList[0])
            // 添加应用内事件
            this.$addAppsEvent('assets_withdraw_click')
        },
		
        // 跳转到划转页面
        goTransfer () {
            uni.navigateTo({
                url: `/pages/assets/transfer?accountId=${this.assetsInfo.accountId}&tradeType=${this.tradeType}`
            })
        },
		
        // 显示说明弹窗
        showExplain (type) {
            this.explainType = type
            this.isExplain = true
        },
        // 重置账户
        resetUserAccount () {
            this.$refs['modalDialog'].show({
                tip: this.$t('mockAccount.resetTip2'),
                content: this.$t('mockAccount.resetTip1'),
                showCancel: true,
                confirmText: this.$t('common.sure'),
                cancelText: this.$t('common.cancel')
            }).then(() => {
                resetAccount().then(res => {
                    if (res.check()) {
                        uni.showToast({
                            title: this.$t('mockAccount.resetSuccess'),
                            icon: 'none'
                        })
                    }
                }).catch(err => {
                    uni.showToast({
                        title: err.msg,
                        icon: 'none'
                    })
                })
            }).catch(() => {
            })
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../style/assetsHeader.scss';
</style>
