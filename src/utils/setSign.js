import jsrsasign from 'jsrsasign'
import uuid from 'uuid'

export const token = uuid.v4()

// 加密生成签名
export function rsaSign (customerNo, timestamp, pk = '') {
    const rs = jsrsasign
    // 签名
    const content = customerNo + '@' + timestamp + '@' + token
    // RSA加密签名
    const pubKey = ['-----BEGIN PUBLIC KEY-----']
    const splitLen = 65 // 以65位长度分割public key
    const count = Math.ceil(pk.length / splitLen)
    for (let i = 0; i < count; i++) {
        const currentIndex = i * splitLen
        const value = pk.substring(currentIndex, currentIndex + splitLen)
        if (value.length < splitLen) {
            // 最后一组拼上后缀
            pubKey.push(value + ' -----END PUBLIC KEY-----')
        } else {
            pubKey.push(value)
        }
    }
    const pub = rs.KEYUTIL.getKey(pubKey.join('\n'))
    const enc = rs.KJUR.crypto.Cipher.encrypt(content, pub)
    const sign = rs.hextob64(enc)
    return sign
}
