import { unzip, localGetObj, localGet } from '@/utils/util.js'
import request_wp from '@/utils/request_wp.js'

/* 获取wp公司配置信息 */
export const wpCompanyConfig = () => {
    return pageConfig('SysSetting')
}
// 获取自选产品
export const wpSelfSymbolIndex = () => pageConfig('SelfSymbolIndex')
export const wpNav = () => pageConfig('Nav')

/* 获取页面配置信息 */
export function pageConfig (id) {
    const token = localGet('token')
    const lastAccountType = localGetObj('mockAccount', 'lastAccountType')
    const isDemo = token && lastAccountType === 'demo' // 当前是否为demo账户
    let url = ''
    if (isDemo) { 
        const lang = localGet('lang')
        const demo_domain = localGetObj('mockAccount', 'demo_domain')
        url = `https://${demo_domain}/${lang}/cats-manage-api/json`
    }
    return request_wp(`${url}/${id}.json?timestamp=${Date.now()}`).then(res => {
        const reg = /^(\{|\[)/
        let content = res?._content ?? res
        content = reg.test(content) || typeof (content) === 'object' ? content : unzip(content)
        const data = typeof (content) === 'string' ? JSON.parse(content) : content
        return data
    })
}
