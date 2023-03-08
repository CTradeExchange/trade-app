import request from '@/utils/request'

/* unipush账户绑定clientId */
export function clientIdBindCustomer (data) {
    return request({
        url: '/global/messagepush.app.OfflinePushService.clientIdBindCustomer',
        method: 'post',
        data
    })
}
