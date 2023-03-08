<template>
    <view class='module-content'>
        <view class='assets-module'>
            <view class='total-assets'>
                <view class='label'>
                    <view class='name'>
                        {{ $t('assets.totalAssets') }}({{ assetsInfo.currency }})
                    </view>
                    <view v-if='Number(tradeType) === 3' class='tag'>
                        <span :class="['riskLevel', 'riskLevel' + assetsInfo.riskLevel]">
                            {{ riskLevelMap[assetsInfo.riskLevel] }}
                        </span>
                    </view>
                    <i class='iconfont icon_zijinmingxi' @click='$method.goAssetsRecord(tradeType)'></i>
                </view>
                <view class='amount'>
                    {{ assetsInfo.totalBalance }}
                </view>
            </view>
            <view v-if='Number(tradeType) !== 5' class='detail-assets'>
                <view class='row'>
                    <view class='col'>
                        <span>{{ $t('assets.netAssets') }}</span>
                        <strong>{{ assetsInfo.totalNetAssets }}</strong>
                    </view>
                    <view class='col'>
                        <span>{{ $t('assets.totalLoan') }}</span>
                        <strong>{{ assetsInfo.totalLiabilitiesPrincipal }}</strong>
                    </view>
                </view>
                <view class='row'>
                    <view class='col'>
                        <span>{{ $t('trade.swap_2') }}</span>
                        <strong>{{ assetsInfo.totalInterest }}</strong>
                    </view>
                </view>
            </view>
            <!-- 现货 -->
            <view v-if='isDepositWithdraw' class='handle-button'>
                <button class='btn state-1' @click='goDeposit'>
                    {{ $t('trade.desposit') }}
                </button>
                <button class='btn state-1' @click='goWithdraw'>
                    {{ $t('trade.withdraw') }}
                </button>
            </view>
            <view v-if='customerInfo.companyType === "demo"' class='handle-button'>
                <button class='btn state-1' @click='resetUserAccount'>
                    {{ $t('mockAccount.resetAccount') }}
                </button>
            </view>
            <view class='handle-button'>
                <button v-if='Number(tradeType) === 3' class='btn state-1' @click='goRepayment'>
                    {{ $t('trade.repayment') }}
                </button>
                <button v-if='plansLen > 1' class='btn state-2' @click='$method.goTransfer(accountList[0])'>
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
    </view>
</template>

<script>
// vuex
import store from '@/store/index.js'	
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
            riskLevelMap: {},
            // 是否显示说明弹窗
            isExplain: false,
            // 说明类型
            explainType: 0
        }
    },
    computed: {
        // 账户列表
        accountList () {
            const accountList = this.customerInfo?.accountList
            return accountList ? accountList.filter(el => Number(el.tradeType) === Number(this.tradeType)) : []
        },
        // 资产信息
        assetsInfo () {
            return store.state._user.assetsInfo[this.tradeType] || {}
        },
        // 用户账户资产
        userAccount () {
            return store.state._user.accountAssets[this.tradeType] || {}
        },
    },
    mounted () {
        this.riskLevelMap = {
            1: this.$t('riskLevel.safety'),
            2: this.$t('riskLevel.warn'),
            3: this.$t('riskLevel.danger')
        }
    },
    methods: {	
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
            this.$method.goTransfer(this.accountList[0])
            // 添加应用内事件
            this.$addAppsEvent('assets_transfer_click')
        },
		
        // 跳转到还款页面
        goRepayment () {
            const accountList = this.accountList
            if (accountList.length > 1) {
                uni.navigateTo({
                    url: `/pages/assets/choose?tradeType=${this.tradeType}&type=repayment`
                })
            } else {
                this.$method.goRepayment(accountList[0])
            }
            // 添加应用内事件
            this.$addAppsEvent('assets_repayment_click')
        },
        // 重置账户
        resetUserAccount () {
            store.dispatch('_user/resetUserAccount').then(res => {
                uni.showToast({
                    title: this.$t('mockAccount.resetSuccess'),
                    icon: 'none'
                })
                store.dispatch('_user/queryCustomerAssetsInfo', { tradeType: this.tradeType })
            })
        },
        // 显示说明弹窗
        showExplain (type) {
            this.explainType = type
            this.isExplain = true
        },
    }
}
</script>

<style lang="scss" scoped>
@import '../style/assetsHeader.scss';
</style>
