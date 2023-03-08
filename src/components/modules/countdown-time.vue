<template>
    <view class='countdown'>
        <tui-icon class='alarm' name='alarm' size='26' />
        <TuiCountdown ref='countdown' border-color='transparent' color='#fff' colonColor='#fff' :is-colon='false' :return-time='true' :size='54' :time='times' @end='end' @time='onTime' />
    </view>
</template>

<script>
import store from '@/store/index.js'
import { localGet, localSet } from '@/utils/util.js'
import TuiCountdown from '@/components/tui-countdown/tui-countdown'

export default {
    components: { TuiCountdown },
    data () {
        return {
        }
    },
    computed: {
        companyType () {
            return this.customerInfo?.companyType
        },
        activity () {
            return store.state._activity
        },
        remainingTime () {
            return this.activity.remainingTime
        },
        times () {
            return store.getters['_activity/activityTime']
        },
        countdownAvailable () {
            const closeStatus = localGet(`CLOSE_REGISTER_ACTIVITY_NOTIFICATION${this.customerInfo.customerNo}`)
            return store.getters['_activity/countdownAvailable'] && !closeStatus
        }
    },
    watch: {
        remainingTime (val) {
            if (val === 0) {
                this.$refs['countdown'].endOfTime()
            }
        }
    },
    mounted () {
        if (this.remainingTime === 0) {
            this.$refs['countdown'].endOfTime()
        }
    },
    methods: {
        end () {
            this.$emit('endTime', true)
        },
        onTime (e) {
            store.commit('_activity/Update_remainingTime', e.seconds)
        }
    }
}
</script>

<style lang="scss" scoped>
.countdown {
    display: flex;
    align-items: center;

    .alarm {
        color: #fff !important;
        // @include styles('color', 'color');
    }

    ::v-deep .tui-countdown-box {
        margin-left: 30rpx;
        align-items: baseline;
    }

    ::v-deep .tui-countdown-colon {
        margin-right: 30rpx;
        // @include styles('color', 'color');
    }

    ::v-deep .tui-countdown-item {
        margin-right: 20rpx;
        background: none !important;

        // .tui-countdown-time {
        //     @include styles('color', 'color');
        // }
    }
}
</style>
