<template>
    <view class='wrap'>
        <view class='quick-options' :class='currentTheme'>
            <!-- 未登录 -->
            <template v-if='!customerInfo'>
                <view class='left-wrap'>
                    <view v-if='activityStatusIsOpen' class='bubble'>
                        + {{ activity.info.rewardAmount }}USD
                    </view>
                    <button class='btn primary' @click='goRegister("real")'>
                        <view class='text'>
                            {{ $t('home.register') }}
                        </view>
                        <view v-if='activityStatusIsOpen' class='desc'>
                            {{ $t('depositActivity.activityText2',{ amount: activity.info.rechargeAmount,rewardAmount : activity.info.rewardAmount }) }}
                        </view>
                        <view v-else class='desc'>
                            {{ $t('home.registerDesc') }}
                        </view>
                    </button>
                </view>
                <button class='btn outline' @click='goRegister("demo")'> 
                    <view class='text'>
                        {{ $t('home.demo') }}
                    </view>
                    <view class='desc'>
                        {{ $t('home.demoDesc') }}
                    </view>
                </button>
            </template>
            <!-- 已登录 -->
            <template v-else>
                <!-- 活动未结束 -->
                <template v-if='countdownAvailable'>
                    <view class='activity'>
                        <view class='recharge-btn' @click='goRecharge'>
                            <view class='bubble'>
                                + {{ activity.info.rewardAmount }}USD
                            </view>
                            <view class='text1'>
                                {{ $t('depositActivity.activityText2', { amount: activity.info.rechargeAmount,rewardAmount : activity.info.rewardAmount }) }}
                            </view>
                        </view>
                        <view class='countdown-wrap'>
                            <countdown-time @endTime='end' />
                            <view class='text'>
                                {{ $t('depositActivity.end') }}
                            </view>
                        </view>
                        
                        <view class='rule' @click='ruleVis = true'>
                            {{ $t('depositActivity.rule') }}
                        </view>
                    </view>
                </template>
                <!-- 活动已结束 -->
                <template v-else>
                    <button class='btn primary' @click='goRecharge'>
                        <view class='text'>
                            {{ $t('home.deposit') }}
                        </view>
                        <view class='desc'>
                            {{ $t('home.registerDesc') }}
                        </view>
                    </button>
                    <button class='btn outline' @click='goQuote'>
                        <view class='text'>
                            {{ $t('home.signal') }}
                        </view>
                        <view class='desc'>
                            {{ $t('home.signalDesc') }}
                        </view>
                    </button>
                </template>
            </template>
        </view>
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <activity-modal :show.sync='ruleVis' />
    </view>
</template>

<script>
import store from '@/store/index.js'
import { localSetObj, localGet } from '@/utils/util.js'
import activityModal from './activity-modal.vue'
import countdownTime from '@/components/modules/countdown-time.vue'

export default {
    components: {
        activityModal,
        countdownTime
    },
    data () {
        return {
            ruleVis: false,
            endTime: false
        }
    },
    computed: {
        companyType () {
            return this.customerInfo?.companyType
        },
        activity () {
            return store.state._activity
        },
        activityStatusIsOpen () {
            return store.getters['_activity/activityStatusIsOpen']
        },
        times () {
            return store.getters['_activity/activityTime']
        },
        countdownAvailable () {
            return store.getters['_activity/countdownAvailable']
        },
    },
    methods: {
        // 跳转到登录页面
        goLogin () {
            uni.navigateTo({
                url: '/pages/mine/login?module=home'
            })
        },
        goDeposit () {
            this.$emit('goDeposit')
        },

        // 跳转到注册页面
        goRegister (type) {
            uni.navigateTo({
                url: '/pages/mine/register?module=home&loginType=' + type
            })
        },
        
        // 跳转到交易页面
        goTrade () {
            uni.switchTab({
                url: '/pages/order/index'
            })
        },
        goRecharge () {
            this.$emit('goDeposit')
        },
		
        // 跳转行情页
        goQuote () {
            uni.switchTab({
                url: '/pages/quote/index'
            })
        },
        end (statu) {
            this.endTime = statu 
        }
    }
}
</script>

<style lang="scss" scoped>
.wrap {
    padding-top: 10rpx;
    .quick-options {
        display: flex;
        justify-content: space-between;
        padding: 30rpx 16rpx;
        .left-wrap {
            position: relative;
            flex: 1;
            @include styles('background-color', 'contentColor');
            border-radius: 8rpx;
            max-width: 359rpx;
            .bubble {
                top: -36rpx;
                right: 13rpx;
                z-index: 1;
                text-align: center;
                padding: 8rpx 20rpx;
                border-radius: 40rpx 40rpx 40rpx 0;
                position: absolute;
                @include styles('background', 'focusColor');
                color: #FFF;
            }
        }
        .btn {
            flex: 1;
            @include styles('background-color', 'contentColor');
            padding: 10rpx 0;
            border-radius: 8rpx;
            max-width: 359rpx;
            &:last-child {
                margin-left: 16rpx;
            }
            &.primary {
                color: #FFF;
                @include styles('background-color', 'primary');
                position: relative;
            }
            &.outline {
                border-width: 2rpx;
                border-style: solid;
                @include styles('border-color', 'lineColor');
                @include styles('color', 'primary');
            }
            .text {
                font-size: 32rpx;
            }
            .desc {
                font-size: 22rpx;
            }
        }
        .activity {
            flex: 1;
            .recharge-btn {
                margin: 50rpx 30rpx 0;
                @include styles('background-color', 'primary');
                color: #FFF;
                text-align: center;
                border-radius: 12rpx;
                padding: 20rpx 0;
                position: relative;
                .bubble {
                    top: -44rpx;
                    right: 13rpx;
                    z-index: 1;
                    text-align: center;
                    padding: 8rpx 20rpx;
                    border-radius: 40rpx 40rpx 40rpx 0;
                    position: absolute;
                    @include styles('background', 'focusColor');
                    color: #FFF;
                }
                .text1 {
                    font-size: 36rpx;
                }
            }
            .countdown-wrap {
                display: flex;
                justify-content: center;
                align-items: center;
                margin-top: 40rpx;
                .text {
                    line-height: 52rpx;
                }
                .countdown {
                    text-align: center;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    ::v-deep .tui-countdown-box {
                        margin-left: 20rpx;
                    }
                    ::v-deep .tui-countdown-colon {
                        margin-right: 30rpx;
                        @include styles('color', 'color');
                    }
                    ::v-deep .tui-countdown-item {
                        margin-right: 20rpx;
                        background: none !important;
                        .tui-countdown-time {
                            @include styles('color', 'color');
                        }
                    }
                }
            }
            .rule {
                margin-top: 20rpx;
                text-align: center;
                @include styles('color', 'normalColor');
                text-decoration: underline;
            }
        }
    }
}
</style>
