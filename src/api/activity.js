import activityRequest, { token } from '@/utils/request_activity'
import jsrsasign from 'jsrsasign'

// 加密生成签名
export function rsaSign (customerNo, timestamp) {
    const rs = jsrsasign
    const pk = '-----BEGIN PUBLIC KEY-----\n' +
        'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCszs/Vm6jQWeaK0GAHP+XD50pWRLR4v/m+qlAh9lJCkdH9rh1r7vfuMwfhtaOOIoTz8X+GbWl1PazgDtidXrdnmU7fw3b0UlHOkr35EJaEFonfnP8XqzqygJ+bG/Lk3kwpeGTtt+bf7FUPCkmEov9tJTPJ0MoaHY+rwB1otk1WtwIDAQAB\n' +
        '-----END PUBLIC KEY-----'

    // 签名
    const content = customerNo + '@' + timestamp + '@' + token
    // RSA加密签名
    const pub = rs.KEYUTIL.getKey(pk)
    const enc = rs.KJUR.crypto.Cipher.encrypt(content, pub)
    const sign = rs.hextob64(enc)
    return sign
}

// 获取进行中的新客活动信息
export function getEnableAct () {
    return activityRequest({
        url: '/quotap/newCustAct/getEnableAct',
        method: 'post',
        data: {}
    })
}

// 获取客户参加活动的状态
export function getActFinishStatus (data) {
    const timestamp = new Date().getTime()
    const sign = rsaSign(data.customerNo, timestamp)
    return activityRequest({
        url: '/quotap/newCustAct/getActFinishStatus',
        method: 'post',
        data: {
            ...data,
            timestamp,
            sign
        }
    })
}
