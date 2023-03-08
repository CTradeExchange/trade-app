<template>
    <view class='module-content'>
        <view class='assets-module'>
            <view class='total-assets'>
                <view class='label'>
                    <view class='name'>
                        <span @click='showExplain(5)'>
                            {{ $t('trade.freeMargin') }}({{ assetsInfo.currency }})
                        </span>
                        <tui-icon class='explain' name='explain' @click='showExplain(5)' />
                    </view>
                    <i class='iconfont icon_zijinmingxi' @click='$method.goAssetsRecord(tradeType)'></i>
                </view>
                <view class='amount'>
                    {{ userAccount.availableMargin || '--' }}
                </view>
            </view>
            <view class='detail-assets'>
                <view class='row'>
                    <view class='col'>
                        <view class='label'>
                            <span @click='showExplain(6)'>
                                {{ $t('trade.allOriginalMargin') }}
                            </span>
                            <tui-icon class='explain' name='explain' @click='showExplain(6)' />
                        </view>
                        <strong>{{ userAccount.occupyMargin || '--' }}</strong>
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
                <view class='handle-button'>
                    <button v-if='customerInfo.companyType === "demo"' class='btn state-1' @click='resetUserAccount'>
                        {{ $t('mockAccount.resetAccount') }}
                    </button>
                </view>
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
    </view>
</template>

<script>
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
            // 是否显示说明弹窗
            isExplain: false,
            // 说明类型
            explainType: 0
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
    methods: {
        // 显示说明弹窗
        showExplain (type) {
            this.explainType = type
            this.isExplain = true
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
		
        // 重置账户
        resetUserAccount () {
            store.dispatch('_user/resetUserAccount').then(res => {
                uni.showToast({
                    title: this.$t('mockAccount.resetSuccess'),
                    icon: 'none'
                })
                store.dispatch('_user/queryCustomerAssetsInfo', { tradeType: this.tradeType })
            })
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../style/assetsHeader.scss';
</style>
