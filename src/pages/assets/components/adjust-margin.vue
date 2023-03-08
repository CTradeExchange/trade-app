<template>
    <view>
        <tui-bottom-popup background-color='transparent' :radius='false' :show='show' @close='close'>
            <view class='adjust-margin'>
                <tui-icon class='close' name='shut' :size='48' unit='rpx' @click='close' />
                <view class='header-module'>
                    <view class='title'>
                        {{ data.symbolName }}
                    </view>
                </view>
                <view class='body-module'>
                    <view class='title'>
                        {{ $t('trade.modifyMargin') }}
                    </view>
                    <view class='box'>
                        <view class='switch' @click='onSwitch'>
                            <i class='iconfont icon_qiehuan1'></i>
                            <span>{{ operType ? $t('trade.raise') : $t('trade.reduce') }}</span>
                        </view>
                        <view class='line' />
                        <input 
                            v-model='amount' 
                            :placeholder="$t('trade.modifyAmount')" 
                            placeholderClass='placeholderClass' 
                            type='digit'
                        />
                        <button class='all' @click='onAll'>
                            {{ $t('common.all') }}
                        </button>
                    </view>
                    <view class='tip'>
                        <span v-if='operType'>
                            {{ $t('trade.maxRaise') }}：{{ accountInfo.available }} {{ accountInfo.currency }}
                        </span>
                        <span v-else> 
                            {{ $t('trade.maxReduce') }}：{{ data.canReduceMargin }} {{ accountInfo.currency }}
                        </span>
                    </view>
                </view>
                <view class='footer-module'>
                    <button class='btn' @click='onConfirm'>
                        {{ $t('common.sure') }}
                    </button>
                </view>
            </view>
        </tui-bottom-popup>
		
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
    </view>
</template>

<script>	
// vuex
import store from '@/store/index.js'
// utils
import { isEmpty } from '@/utils/util.js'
import { pow } from '@/utils/calculation.js'
// api
import { updateOccupyTheMargin } from '@/api/user.js'

export default {
    props: {
        // 数据
        data: {
            type: Object,
            default: () => {}
        },
        // 产品
        product: {
            type: Object,
            default: () => {}
        }
    },
    data () {
        return {
            // 是否显示弹窗
            show: false,
            // 调整类型 true:追加 false:减少
            operType: true,
            // 调整的金额
            amount: ''
        }
    },
    computed: {
        // 账户信息
        accountInfo () {
            const tradeType = this.data.tradeType
            return this.customerInfo.accountList?.find(item => Number(item.tradeType) === Number(tradeType)) || {}
        }
    },
    methods: {
        // 显示弹窗
        open () {
            this.amount = ''
            this.operType = true
            this.show = true
            // 获取用户信息
            store.dispatch('_user/findCustomerInfo', false)
        },
		
        // 关闭弹窗
        close () {
            this.show = false
        },
		
        // 切换
        onSwitch () {
            this.operType = !this.operType
        },
		
        // 点击全部
        onAll () {
            this.amount = this.operType ? this.accountInfo.available : this.data.canReduceMargin
        },
		
        // 确定调整保证金
        onConfirm () {
            // 参数验证
            if (isEmpty(this.amount) || parseFloat(this.amount) === 0) {
                return uni.showToast({
                    title: this.$t('trade.enterMarginAmountRequire'),
                    icon: 'none'
                })
            }
            if (parseFloat(this.amount) < 0) {
                return uni.showToast({
                    title: this.$t('trade.enterMarginAmountTip'),
                    icon: 'none'
                })
            }
			
            this.updateOccupyTheMargin()
        },
		
        // 发起调整保证金请求
        updateOccupyTheMargin () {
            const data = this.data
            const accountInfo = this.accountInfo
            const margin = this.operType ? parseFloat(this.amount) : -parseFloat(this.amount)
            const occupyTheMargin = margin * pow(10, data.openAccountDigits)
            const params = {
                tradeType: data.tradeType,
                accountId: accountInfo.accountId,
                positionId: data.positionId,
                accountDigits: data.openAccountDigits,
                occupyTheMargin,
                orderId: data.orderId,
                remark: '',
                resp: ''
            }
            uni.showLoading({
                title: this.$t('common.submiting'),
                mask: true
            })
            updateOccupyTheMargin(params).then(() => {
                uni.hideLoading()
                uni.showToast({
                    title: this.$t('common.submitSuccess'),
                    icon: 'none'
                })
                this.close()
                this.queryPositionList()
            }).catch(res => {
                uni.hideLoading()
                this.$refs['modalDialog'].show({
                    content: res.msg
                })
            })
        },
		
        // 获取持仓列表
        queryPositionList () {
            const data = this.data
            const accountId = this.accountInfo.accountId
            store.dispatch('_trade/queryPositionPage', {
                tradeType: data.tradeType,
                sortFieldName: 'openTime',
                sortType: 'desc',
                accountId
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.adjust-margin {
	@include flexColumn;
	@include styles('background-color', 'contentColor');
	height: 680rpx;
	position: relative;
	.close {
		@include styles('color', 'normalColor');
		position: absolute;
		top: 20rpx;
		right: 20rpx;
	}
	.header-module {
		padding: 40rpx 30rpx;
		.title {
			@include styles('color', 'color');
			font-size: 45rpx;
			font-weight: bold;
		}
	}
	.body-module {
		flex: 1;
		padding: 0 30rpx;
		.box {
			@include flexAlign;
			@include styles('background-color', 'bgColor');
			height: 80rpx;
			margin-top: 30rpx;
			border-radius: 6rpx;
			.switch {
				@include flexAll;
				width: 140rpx;
				.iconfont {
					margin-right: 10rpx;
					font-size: 25rpx;
				}
				span {
					font-size: 26rpx;
				}
			}
			.line {
				@include styles('background-color', 'lineColor');
				width: 1px;
				height: 40rpx;
			}
			input {
				flex: 1;
				height: 100%;
				padding: 0 20rpx;
			}
			.all {
				@include styles('color', 'primary');
				margin-right: 20rpx;
				font-size: 26rpx;
			}
		}
		.tip {
			@include styles('color', 'minorColor');
			margin-top: 20rpx;
			font-size: 26rpx;
		}
	}
	.footer-module {
		.btn {
			@include flexAll;
			@include styles('background-color', 'primary');
			height: 90rpx;
			font-size: 30rpx;
			color: #fff;
		}
	}
}
</style>
