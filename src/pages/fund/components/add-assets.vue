<template>
    <tui-bottom-popup :show='show' @close='close'>
        <view class='add-wrap'>
            <h2>{{ $t('fundInfo.chooseGetAssets') }}</h2>
            <view class='item' @click="way = 'deposit'">
                <view class='left'>
                    <i
                        class='iconfont icon iconfong icon_icon_assets'
                    ></i>
                    <view class='text'>
                        <h3>{{ $t('fundInfo.deposit') }}</h3>
                        <h5>{{ $t('fundInfo.depositTip') }}</h5>
                    </view>
                </view>
                <tui-icon :color="way === 'deposit' ? $style.success : $style.minorColor" name='circle-fill' :size='44' unit='rpx' />
            </view>
            <view class='item' @click="way = 'trade'">
                <view class='left'>
                    <image class='icon' src='/static/image/icon/trade.png' />
                    <view class='text'>
                        <h3>{{ $t('trade.buy') }}</h3>
                        <h5>{{ $t('fundInfo.buyTip') }}</h5>
                    </view>
                </view>
                <tui-icon :color="way === 'trade' ? $style.success : $style.minorColor" name='circle-fill' :size='44' unit='rpx' />
            </view>
        </view>
        <view class='confirm-btn' @click='onConfirm'>
            {{ $t('common.sure') }}
        </view>
    </tui-bottom-popup>
</template>

<script>
import { getDepositCoinList } from '@/api/user'
export default {
    props: {
        // 是否显示弹窗
        show: {
            type: Boolean,
            default: false
        },
        // 基金信息
        fund: {
            type: Object,
            default: () => {}
        },
        // 需要添加的资产
        currency: {
            type: String,
            default: ''
        }
    },
    data () {
        return {
            // 当前账户
            curAccount: null,
            // 新增资产方式 deposit:存款 trade:买入
            way: 'deposit'
        }
    },
    computed: {
        // 现货玩法的账户列表
        accountList () {
            return this.customerInfo?.accountList?.filter(el => el.tradeType === 5) || []
        }
    },
    watch: {
        show: {
            handler (val) {
                if (val) {
                    this.way = 'deposit'
                    // 获取客户支持的存款币种列表
                    this.queryDepositCoinList()
                }
            },
            immediate: true
        }
    },
    methods: {
        // 获取客户支持的存款币种列表
        queryDepositCoinList () {
            getDepositCoinList({ clientType: 'mobile' }).then(res => {
                const data = res.data
                const list = this.accountList.filter(el => data.includes(el.currency))
                this.curAccount = list.find(el => el.currency === this.currency)
            })
        },
		
        // 关闭弹窗
        close () {
            this.$emit('update:show', false)
        },
		
        // 点击确定
        onConfirm () {
            switch (this.way) {
                case '':
                    this.$toast(this.$t('fundInfo.chooseGetAssets'))
                    break
                // 存款
                case 'deposit':
                    this.toDeposit()
                    break
                // 买入
                case 'trade':
                    this.toOrderFund()
                    break
            }
        },
		
        // 跳转到充值页面
        toDeposit () {
            const curAccount = this.curAccount
            if (!curAccount) {
                return this.$toast(this.$t('fundInfo.notDepositTip'))
            }
            this.close()
            const url = `/pages/deposit/choose?accountId=${curAccount.accountId}&currency=${curAccount.currency}&tradeType=5`
            uni.navigateTo({
                url
            })
        },
		
        // 点击前往交易页面的对应产品
        toOrderFund () {
            this.$method.goTrade.call(this, this.currency).then(() => {
                this.close()
            }).catch(() => {})
        }
    }
}
</script>

<style lang="scss" scoped>
.add-wrap {
    padding: 30rpx;
    h2 {
        margin: 20rpx 0 40rpx 0;
        text-align: center;
    }
    .item {
		@include styles('background', 'bgColor');
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 40rpx;
        padding: 40rpx 30rpx;
        .left {
            display: flex;
            .icon {
				@include styles('color', 'focusColor');
                width: 80rpx;
                height: 80rpx;
                margin-right: 40rpx;
                font-size: 80rpx;
            }
            .text {
                h5 {
					@include styles('color', 'minorColor');
					margin-top: 5rpx;
                }
            }
        }
    }
}
.confirm-btn {
	@include styles('background', 'primary');
	display: flex;
	height: 90rpx;
	justify-content: center;
	align-items: center;
	color: #fff;
	font-size: 30rpx;
}
</style>
