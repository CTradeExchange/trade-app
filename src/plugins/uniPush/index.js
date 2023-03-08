import store from '@/store'
import { clientIdBindCustomer } from '@/api/app.js'

// 当前cid
let clientId = ''

// uniPush初始化
export function uniPushInit () {
    // #ifdef APP-PLUS
    // if (clientId) {
    //     clientIdBind()
    // } else {
    //     plus.push.getClientInfoAsync((info) => {
    //         console.log('clientId获取成功', info['clientid'])   
    //         clientId = info['clientid']
    //         clientIdBind()
    //     })
    // }
    // #endif
}

// unipush账户绑定clientId
export function clientIdBind () {
    const { companyId } = store.state._base.wpCompanyInfo
    const customerInfo = store.state._user.customerInfo
    const params = {
        clientId,
        companyId
    }
    if (customerInfo) {
    	params.customerId = Number(customerInfo.customerNo)
    }
    clientIdBindCustomer(params).then(() => {
        console.log('clientId绑定成功')
    }).catch(() => {
        console.log('clientId绑定失败')
    })
}
