<template>
    <view v-if='countdownAvailable && customerInfo' class='countdown-wrap'>
        <countdown-time @endTime='end' />
        
        <view v-if="route !== 'pages/deposit/choose'" class='right-wrap'>
            <view class='deposit' @click='goDeposit'>
                {{ $t('depositActivity.get', { amount: activity.info.rewardAmount }) }}
            </view>
            <tui-icon class='close' name='close' size='20' @click='close' />
        </view>
        <view v-else class='right-wrap'>
            <view>
                {{ $t('depositActivity.activityText2', { amount: activity.info.rechargeAmount,rewardAmount : activity.info.rewardAmount }) }}
            </view>
        </view>
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
    </view>
</template>

<script>
import store from '@/store/index.js'
import { localGet, localSet } from '@/utils/util.js'
import countdownTime from './countdown-time.vue'
export default {
    components: { countdownTime },
    data: function () {
        return {
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
        countdownAvailable () {
            let closeStatus = false
            if (this.route !== 'pages/deposit/choose') {
                closeStatus = localGet(`CLOSE_REGISTER_ACTIVITY_NOTIFICATION${this.customerInfo.customerNo}`)
            }
            
            return store.getters['_activity/countdownAvailable'] && !closeStatus
        },
        route () {
            const pages = getCurrentPages()
            return pages[pages.length - 1]?.route
        }
        
    },
    methods: {
        goDeposit () {
            this.$emit('handleSwitch')
        },
        end (statu) {
            this.endTime = statu
        },
        close () {
            localSet('CLOSE_REGISTER_ACTIVITY_NOTIFICATION' + this.customerInfo.customerNo, true)
        }
        
    }
}
</script>

<style lang="scss" scoped>
.countdown-wrap {
    display: flex;
    align-items: center;
    padding: 20rpx 30rpx;
    justify-content: space-between;
    background: #181A20;
    color: #fff;
    // @include styles('background-color', 'assistColor');
    .right-wrap {
        display: flex;
        align-items: center;

        .deposit {
            margin-right: 20rpx;
            @include styles('background-color', 'primary');
            color: #fff;
            border-radius: 12rpx;
            padding: 10rpx 20rpx;
        }
    }

}
</style>
