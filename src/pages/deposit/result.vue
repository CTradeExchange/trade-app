<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container'>
            <!-- 头部导航栏 -->
            <nav-bar :title="$t('cRoute.despositCb')" />
            <!-- 内容区域 -->
            <view class='layout-content'>
                <view v-if='despositInfo.proposalNo' class='desposit-module'>
                    <view class='header'>
                        <tui-icon class='icon' :name='statusMap[despositInfo.paymentStatus].iconName' :size='100' unit='rpx' />
                        <view class='status'>
                            {{ statusMap[despositInfo.paymentStatus].stateText }}
                        </view>
                    </view>
                    <view class='details'>
                        <view class='row'>
                            <span class='label'>
                                {{ $t('deposit.proposalNo') }}
                            </span>
                            <span class='value'>
                                {{ despositInfo.proposalNo }}
                            </span>
                        </view>
                        <view class='row'>
                            <span class='label'>
                                {{ $t('deposit.proposalAmount') }}
                            </span>
                            <span class='value'>
                                {{ despositInfo.intendAmount || '--' }}{{ despositInfo.depositCurrency }}
                            </span>
                        </view>
                        <view class='row'>
                            <span class='label'>
                                {{ $t('deposit.lastAmount') }}
                            </span>
                            <span class='value'>
                                {{ despositInfo.finalAmount || '--' }}{{ despositInfo.depositCurrency }}
                            </span>
                        </view>
                        <view class='row'>
                            <span class='label'>
                                {{ $t('common.fee') }}
                            </span>
                            <span class='value'>
                                {{ despositInfo.depositFee || '--' }}{{ despositInfo.depositCurrency }}
                            </span>
                        </view>
                        <view class='row'>
                            <span class='label'>
                                {{ $t('common.status') }}
                            </span>
                            <span class='value'>
                                {{ statusMap[despositInfo.paymentStatus].stateText }}
                            </span>
                        </view>
                        <view class='row'>
                            <span class='label'>
                                {{ $t('common.remark') }}
                            </span>
                            <span class='value'>
                                {{ despositInfo.remark || '--' }}
                            </span>
                        </view>
                        <view class='row'>
                            <span class='label'>
                                {{ $t('common.time') }}
                            </span>
                            <span class='value'>
                                {{ formatTime(despositInfo.createTime) || '--' }}
                            </span>
                        </view>
                    </view>
                </view>
            </view>
            <!-- 底部按钮 -->
            <view v-if='despositInfo.proposalNo' class='footer-btn' @click='goHome'>
                {{ $t('common.backHome') }}
            </view>
        </view>
		
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>
// api
import { queryDepositProposal } from '@/api/user.js'
	
export default {
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 订单id
            orderId: '',
            // 存款信息
            despositInfo: {},
            // 支付状态数据
            statusMap: {}
        }
    },
    onLoad (options) {
        this.orderId = uni.getStorageSync('proposalNo')
        uni.removeStorageSync('proposalNo')
        this.statusMap = {
            1: {
                stateText: this.$t('deposit.tobePay'),
                iconName: 'about'
            },
            2: {
                stateText: this.$t('deposit.paySuccess'),
                iconName: 'circle-fill'
            },
            3: {
                stateText: this.$t('deposit.payFail'),
                iconName: 'close-fill'
            }
        }
		
        // 初始化
        this.$init().then(() => {
            this.queryDepositProposal()
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('deposit_result_view')
    },
    methods: {
        // 回到首页
        goHome () {
            uni.switchTab({
                url: '/pages/home/index'
            })
        },
		
        // 查询存款结果
        queryDepositProposal () {
            queryDepositProposal({
                customerNo: this.customerInfo.customerNo,
                proposalNo: this.orderId
            }).then(res => {
                this.skeletonShow = false
                this.depositInfo = res.data
            }).catch(res => {
                this.skeletonShow = false
                this.$refs['modalDialog'].show({
                    title: this.$t('common.tip'),
                    content: this.$t('deposit.serviceTips2'),
                    cancelText: this.$t('common.serivce'),
                    confirmText: this.$t('common.backHome')
                }).then(() => {
                    // 返回首页
                    uni.switchTab({
                        url: '/pages/home/index'
                    })
                }).catch(() => {
                    // 返回个人中心
                    uni.switchTab({
                        url: '/pages/mine/index'
                    })
                })
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.layout-content {
	@include styles('background-color', 'contentColor');
}
.desposit-module {
	text-align: center;
	.header {
		padding-top: 50rpx;
		::v-deep .tui-icon-about {
			@include styles('color', 'focusColor');
		}
		::v-deep .tui-icon-circle-fill {
			@include styles('color', 'success');
		}
		::v-deep .tui-icon-close-fill {
			@include styles('color', 'warn');
		}
		.status {
			margin-top: 10rpx;
			font-size: 32rpx;
		}
	}
	.details {
		padding: 0 35rpx;
		margin-top: 80rpx;
		.row {
			@include flexBetweenAlign;
			padding: 10rpx 0;
			.label {
				@include styles('color', 'minorColor');
			}
			.value {
				@include styles('color', 'color');
			}
		}
	}
}
</style>
