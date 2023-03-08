<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container'>
            <!-- 内容区域 -->
            <view class='layout-content'>
                <view class='success-header'>
                    <i class='iconfont icon_success'></i>
                    <view class='text'>
                        <view class='title'>
                            {{ $t('register.openSuccess') }}
                        </view>
                    </view>
                </view>
                
                <view v-if='countdownAvailable'>
                    <productList />
                    <view class='recharge-btn' @click='goDeposit'>
                        <view class='text1'>
                            {{ $t('depositActivity.deposit') }} 
                        </view>
                        <view class='text2'>
                            {{ $t('depositActivity.activityText2',{ amount: activity.info.rechargeAmount,rewardAmount : activity.info.rewardAmount }) }}
                        </view>
                    </view>
                    <view class='countdown'>
                        <view class='text'>
                            {{ $t('depositActivity.activityText',{ hour:activity.info.rechargeGapHour, amount: activity.info.rechargeAmount,rewardAmount : activity.info.rewardAmount }) }}
                        </view>
                        <view class='countdown-time'>
                            <countdown-time />
                        </view>
                    </view>
                </view>
                <view v-else class='success-handle'>
                    <view class='btn state-2' @click='goQuote'>
                        {{ $t('register.tradingOpportunity') }}
                    </view>
                    <view v-if='isReal' class='btn state-1' @click='goDeposit'>
                        {{ $t('deposit.immediateRecharge') }}
                    </view>
                </view>
            </view>
        </view>

        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>
// import { registerSuccessBanner } from '@/components/registerActivity'
import productList from './components/productList'
import store from '@/store/index.js'
import { localGet } from '@/utils/util.js'
import countdownTime from '@/components/modules/countdown-time.vue'
export default {
    components: {
        productList,
        countdownTime
    },
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true
        }
    },
    computed: {
        // 是否真实账户
        isReal () {
            return this.customerInfo?.companyType === 'real'
        },
        activity () {
            return store.state._activity
        },
        countdownAvailable () {
            return store.getters['_activity/countdownAvailable']
        }

    },
    onLoad () {
        // 初始化
        this.$init().then(() => {
            this.skeletonShow = false
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('register_success_view')
        store.dispatch('_activity/getEnableAct')
        store.dispatch('_activity/getActFinishStatus')
    },
    methods: {
        // 跳转到行情页面
        goQuote () {
            uni.switchTab({
                url: '/pages/quote/index'
            })
        },
        goDeposit () {
            uni.redirectTo({
                url: '/pages/deposit/choose'
            })
            // 添加应用内事件
            this.$addAppsEvent('register_success_deposit_click')
        }
        
    }
}	
</script>

<style lang="scss" scoped>
.layout-container {
    @include styles('background-color', 'contentColor');
}
.success-header {
    @include flexColumnCenter;
    padding: 160rpx 80rpx 20rpx;
    .icon_success {
        @include styles('color', 'primary');
        margin-right: 30rpx;
        font-size: 100rpx;
    }
    .text {
        text-align: left;
        margin-top: 40rpx;
        @include styles('color', 'primary');
        .title {
            font-size: 28rpx;
            font-weight: bold;
            margin-bottom: 40rpx;
        }
        .no {
            margin-top: 15rpx;
            span {
                @include styles('color', 'primary');
            }
        }
        .config-text {
            @include styles('color', 'color');
            font-weight: bold;
            font-size: 32rpx;
            margin-bottom: 20rpx;
        }
    }
}
.recharge-btn {
    margin: 50rpx 30rpx 0;
    @include styles('background-color', 'primary');
    color: #FFF;
    text-align: center;
    border-radius: 12rpx;
    padding: 20rpx 0;
    .text1 {
        font-size: 36rpx;
    }
}
.countdown {
    margin-top: 60rpx;
    text-align: center;
    .text {
        font-size: 32rpx;
    }
    .countdown-time {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    ::v-deep .alarm {
        @include styles('color', 'color');
    }
    ::v-deep .tui-countdown-colon {
        @include styles('color', 'color');
    }

    ::v-deep .tui-countdown-item {
        .tui-countdown-time {
            @include styles('color', 'color');
        }
    }
}
.success-handle {
    @include flexColumnAll;
    .config-banner {
        padding: 0 30rpx;
        margin-top: 40rpx;
        .banner-image {
            width: 600rpx;
            height: 240rpx;
        }
    }
    .btn {
        @include flexAll;
        width: 600rpx;
        height: 100rpx;
        margin: 0 30rpx;
        border-radius: 10rpx;
        &.state-1 {
            @include styles('background-color', 'primary');
            color: #FFF;
        }
        &.state-2 {
            @include styles('color', 'primary');
            background-color: #F3F8FE;
            margin-bottom: 50rpx;
        }
    }
}
</style>
