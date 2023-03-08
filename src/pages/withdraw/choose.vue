<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar :title="$t('cRoute.withdrawAccount')" />
            <!-- 内容区域 -->
            <view class='layout-content'>
                <view class='body-content'>
                    <template>
                        <view class='head-text'>
                            {{ $t('withdraw.outAccount') }}
                        </view>
                        <view class='select-box' @click='outVisible = true'>
                            <input disabled type='text' :value='outCurrency' />
                            <tui-icon class='arrow' name='arrowdown' :size='45' unit='rpx' />
                        </view>
                    </template>
                    <template>
                        <view class='head-text'>
                            {{ $t('withdraw.inAccount') }}
                        </view>
                        <view class='select-box' @click='inVisible = true'>
                            <input disabled type='text' :value='inCurrency' />
                            <tui-icon class='arrow' name='arrowdown' :size='45' unit='rpx' />
                        </view>
                    </template>
                    <template v-if='methodList.length > 1'>
                        <view class='head-text'>
                            {{ $t('withdraw.withdrawMethod') }}
                        </view>
                        <view class='select-box' @click='methodVisible = true'>
                            <input disabled type='text' :value='methodText' />
                            <tui-icon class='arrow' name='arrowdown' :size='45' unit='rpx' />
                        </view>
                    </template>
                </view>
            </view>
            <!-- 底部按钮 -->
            <button class='footer-button' @click='onNext'>
                {{ $t('common.nextStep') }}
            </button>
        </view>
		
        <!-- 提现账户币种弹窗 -->
        <picker-dialog :model-value.sync='outVisible' @change='selectOutCurrency'>
            <picker-view-column>
                <view v-for='(item, index) in outCurrencyList' :key='index' class='item'>
                    {{ item.currency }}
                </view>
            </picker-view-column>
        </picker-dialog>
        <!-- 到账账户币种弹窗 -->
        <picker-dialog :model-value.sync='inVisible' @change='selectInCurrency'>
            <picker-view-column>
                <view v-for='(item, index) in inCurrencyList' :key='index' class='item'>
                    {{ item.currency }}
                </view>
            </picker-view-column>
        </picker-dialog>
        <!-- 取款方式弹窗 -->
        <picker-dialog :model-value.sync='methodVisible' @change='selectMethod'>
            <picker-view-column>
                <view v-for='(item, index) in methodList' :key='index' class='item'>
                    {{ item.text }}
                </view>
            </picker-view-column>
        </picker-dialog>
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>
// api
import { checkKycApply, withdrawCurrencyList } from '@/api/user.js'
import store from '@/store/index.js'
import { localGet } from '@/utils/util.js'

export default {
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 玩法类型
            tradeType: '',
            // 账户id
            accountId: '',
            // 是否显示提现币种弹窗
            outVisible: false,
            // 提现账户币种
            outCurrency: '',
            // 是否显示到账币种弹窗
            inVisible: false,
            // 到账币种
            inCurrency: '',
            // 到账币种列表
            inCurrencyList: [],
            // 是否显示取款方式弹窗
            methodVisible: false,
            // 取款方式map数据
            withdrawMap: {},
            // 取款方式
            withdrawMethod: '',
            // 取款方式列表
            methodList: [],
            // 取款方式名称
            methodText: '',
            // 取款方式value值
            methodValue: ''
        }
    },
    computed: {
        // 账户列表
        accountList () {
            const accountList = this.customerInfo?.accountList
            return accountList ? accountList.filter(el => Number(el.tradeType) === Number(this.tradeType)) : []
        },
        // 提现账户币种列表
        outCurrencyList () {
            const arr = this.accountList.map(el => {
                return {
                    currency: el.currency,
                    accountId: el.accountId
                }
            })
            return arr
        },
        activity () {
            return store.state._activity
        },
        activityStatusIsOpen () {
            // 活动状态等于2开启活动
            return this.activity.info.status === 2
        },
        times () {
            return store.getters['_activity/activityTime']
        },
    },
    onLoad (options) {
        this.tradeType = options.tradeType
        this.accountId = options.accountId
        this.outCurrency = options.currency
		
        // 初始化
        this.$init().then(() => {
            this.skeletonShow = false
            // 检测取款是否需要kyc
            this.checkKyc()
            // 获取到账币种
            this.queryInCurrency()
            // 检测活动是否结束
            this.checkActivityStatus()
            // 获取活动相关
            store.dispatch('_activity/getEnableAct')
            store.dispatch('_activity/getActFinishStatus')
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('withdraw_choose_view')
    },
    watch: {
        
    },
    methods: {
        checkActivityStatus () {
            if (this.activityStatusIsOpen && this.times && ['', 1].includes(Number(this.activity.finishStatus))) {
                this.$refs['modalDialog'].show({
                    content: this.$t('depositActivity.endActivity', {
                        amount: this.activity.info.rechargeAmount,
                        rewardAmount: this.activity.info.rewardAmount
                    }),
                    showCancel: true
                }).then(() => {
                    
                }).catch(() => {
                    uni.navigateBack()
                })
            }
        },
        // 检测取款是否需要kyc
        checkKyc () {
            checkKycApply({
                businessCode: 'withdraw'
            }).then(res => {
                const status = Number(res.data)
                if (status !== 2) {
                    this.$refs['modalDialog'].show({
                        content: status === 1 ? this.$t('withdraw.kycMsg_1') : this.$t('withdraw.kycMsg_2'),
                        confirmText: status === 1 ? this.$t('withdraw.kycBtn_1') : this.$t('withdraw.kycBtn_2')
                    }).then(() => {
                        uni.redirectTo({
                            url: '/pages/person/authentication'
                        })
                    })
                }
            })
        },
		
        // 获取到账币种
        queryInCurrency () {
            withdrawCurrencyList({
                customerGroupId: this.customerInfo.customerGroupId,
                customerNo: this.customerInfo.customerNo,
                tradeType: this.tradeType,
                accountId: this.accountId
            }).then(res => {
                const { data } = res
                if (data.list.length > 0) {
                    const inCurrencyList = []
                    data.list.map(el => {
                        inCurrencyList.push({
                            currency: el.currency,
                            withdrawMethod: el.withdrawMethod
                        })
                    })
                    this.inCurrencyList = inCurrencyList
                    this.inCurrency = inCurrencyList[0].currency
                    this.withdrawMethod = inCurrencyList[0].withdrawMethod
                    this.withdrawMap = data.map
                    this.setMethodList()
                }
            })
        },
		
        // 选择提现账户币种
        selectOutCurrency (value) {
            const item = this.outCurrencyList[value]
            this.accountId = item.accountId
            this.outCurrency = item.currency
        },
		
        // 选择到账币种
        selectInCurrency (value) {
            const item = this.inCurrencyList[value]
            this.inCurrency = item.currency
            this.withdrawMethod = item.withdrawMethod
            this.setMethodList()
        },
		
        // 选择取款方式
        selectMethod (value) {
            const item = this.methodList[value]
            this.methodText = item.text
            this.methodValue = item.value
        },
		
        // 设置取款方式
        setMethodList () {
            const methods = this.withdrawMethod.split(',')
            const methodList = []
            methods.map(el => {
                methodList.push({
                    text: this.withdrawMap[el][this.currentLang],
                    value: el
                })
            })
            this.methodList = methodList
            this.methodText = methodList[0].text
            this.methodValue = methodList[0].value
        },
		
        // 点击下一步
        onNext () {
            const params = `&currency=${this.inCurrency}&accountId=${this.accountId}&tradeType=${this.tradeType}&withdrawMethod=${this.methodValue}`
            // 跳转到提现页面
            if (['bank', 'otc365_cny', 'micropay'].includes(this.methodValue)) {
                uni.navigateTo({
                    url: '/pages/withdraw/money?withdrawType=1' + params
                })
            } else if (['payredeem'].includes(this.methodValue)) {
                // 跳转到payRedeem页面
                uni.navigateTo({
                    url: '/pages/withdraw/payRedeem?withdrawType=1' + params
                })
            } else {
                // 跳转到提币页面
                uni.navigateTo({
                    url: '/pages/withdraw/coin?withdrawType=2' + params
                })
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.layout-content {
	@include styles('background-color', 'contentColor');
}
.body-content {
	padding: 20rpx 30rpx;
	.head-text {
		@include flexAlign;
		@include styles('color', 'minorColor');
		height: 90rpx;
		font-size: 28rpx;
	}
	.select-box {
		@include flexAlign;
		@include styles('background-color', 'assistColor');
		height: 90rpx;
		font-size: 28rpx;
		border-radius: 6rpx;
		input {
			flex: 1;
			height: 100%;
			padding: 0 30rpx;
		}
		.arrow {
			@include styles('color', 'minorColor');
			margin-right: 20rpx !important;
		}
	}
}
.footer-button {
	@include flexAll;
	@include styles('background-color', 'primary');
	height: 90rpx;
	margin: 20rpx;
	font-size: 28rpx;
	color: #fff;
	border-radius: 6rpx;
}
</style>
