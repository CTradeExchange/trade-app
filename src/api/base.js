
import request from '@/utils/request'
import Request from 'luch-request'

/* 获取国家区号列表 */
export function getListByParentCode (data) {
    return request({
        url: '/global/config.app.AppDictDubboService.getListByParentCode',
        method: 'post',
        data
    })
}

/* 发送验证码 */
export function verifyCodeSend (data) {
    return request({
        url: '/global/message.app.VerificationApiService.verifyCodeSend',
        method: 'post',
        headers: {
            version: '0.0.1',
        },
        data
    })
}

/* 验证验证码 */
export function verifyCodeCheck (data) {
    return request({
        url: '/global/message.app.VerificationApiService.verifyCodeCheck',
        method: 'post',
        headers: {
            version: '0.0.1',
        },
        data
    })
}

/* 上传 */
export function upload (data) {
    return request({
        url: '/upload',
        method: 'post',
        data,
        headers: { 'Content-Type': 'multipart/form-data' },
        isUpload: true
    })
}

/* 获取国家字典列表 */
export function getCountryListByParentCode (data) {
    return request({
        url: '/global/config.app.AppDictDubboService.getCountryListByParentCode',
        method: 'post',
        data
    })
}

/* 按父级ID获取基础字典列表 */
export function getListByParentId (data) {
    return request({
        url: '/global/config.app.AppDictDubboService.getListByParentId',
        method: 'post',
        data
    })
}

/* 设置语言信息 */
export function changeLang (lang) {
    return request({
        url: '/global/customer.app.CustomerWebApiService.changeLang',
        method: 'post',
        headers: {
            version: '0.0.1',
        },
        data: {
            newLang: lang
        }
    })
}

/* 获取三方登录配置信息 */
export function getThirdLoginConfig (data) {
    return request({
        url: '/global/customer.app.CustomerThirdLoginService.config',
        method: 'post',
        toastErr: false,
        headers: {
            version: '0.0.1'
        },
        data
    })
}

/* 获取公司资产列表 */
export function getAssetsList (data) {
    return request({
        url: '/global/config.app.AppAssetsDubboService.getAssetsList',
        method: 'post',
        toastErr: false,
        data
    })
}

/* 获取客户端IP所在国家 */
export function geoipCountry (data = {}) {
    return request({
        url: '/geoip/country',
        method: 'get',
        toastErr: false,
        data: {
            ...data,
            nonePrefix: true,
        }
    })
}
