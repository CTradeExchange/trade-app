import { getEnableAct, getActFinishStatus } from '@/api/activity'
import { localGet } from '@/utils/util.js'

export default {
    namespaced: true,
    state: {
        /** 进行中的新客活动信息 */
        info: {
            beginTime: null,
            endTime: null,
            finishVolume: null,
            // 充值金额
            rechargeAmount: null,
            // 注册到充值的或者时间间隔，单位小时
            rechargeGapHour: null,
            // 奖励金额
            rewardAmount: null,
            rewardCurrency: null,
            // 活动状态 1:未开启;2:开启;3:禁用;4:删除
            status: 1,
        },
        /** 活动完成状态，null:未参与 1:待完成 3:已结束 */
        finishStatus: '',
        remainingTime: '' // 剩余时间
    },
    getters: {
        activityStatusIsOpen (state, getters, rootState) {
            // 活动状态等于2开启活动
            return state.info.status === 2
        },
        countdownAvailable (state, getters, rootState) {
            if (rootState._user.customerInfo) {
                // 用户登录需要判断时效有没有过期，并且活动已经开启,用户未参与活动
                return getters.activityStatusIsOpen && getters.activityTime > 1 && !state.finishStatus
            }
            return false
        },
        activityTime (state, getters, rootState) {
            if (state.remainingTime) return state.remainingTime
            const rechargeGapHour = state.info.rechargeGapHour
            // 判断活动已开启并且用户未参与，显示倒计时
            if (!rechargeGapHour || !getters.activityStatusIsOpen) return
            // 注册时间
            
            const registerTime = localGet('registerTime') || rootState._user.customerInfo.registerTime
           
            // 服务器时间
            const serverTime = localGet('RESPONSE_HEADERS_DATE')
            const responseDateValue = new Date(serverTime).valueOf()
            // 注册时间加上活动充值间隔减去服务器时间等于充值倒计时时间
            const diffTime = registerTime + rechargeGapHour * 60 * 60 * 1000 - responseDateValue

            if (diffTime <= 0) {
                // console.warn('注册超过24小时')
                return
            }
            return diffTime / 1000
        },
         
    },
    mutations: {
        Update_activityInfo (state, data) {
            state.info = data
        },
        Update_finishStatus (state, data) {
            state.finishStatus = data
        },
        Update_remainingTime (state, data) {
            state.remainingTime = data
        }
    },
    actions: {
        // 获取进行中的新客活动信息
        getEnableAct ({ state, dispatch, commit, rootState }) {
            return getEnableAct().then((res) => {
                if (res.code === '0' && res.data) {
                    state.remainingTime = ''
                    commit('Update_activityInfo', res.data)
                    return res
                } else {
                    // 关闭活动后，不再显示活动倒计时
                    const defaultData = {
                        beginTime: null,
                        endTime: null,
                        finishVolume: null,
                        rechargeAmount: null,
                        rechargeGapHour: null,
                        rewardAmount: null,
                        rewardCurrency: null,
                        status: 1,
                    }
                    commit('Update_activityInfo', defaultData)
                }
            })
        },
        getActFinishStatus ({ dispatch, commit, rootState }) {
            const customerNo = rootState._user.customerInfo.customerNo
            if (!customerNo) return
            return getActFinishStatus({ customerNo: customerNo }).then((res) => {
                if (res.code === '0') {
                    commit('Update_finishStatus', res.data?.activityFinishStatus || '')
                    return res
                }
            })
        }
    }
}
