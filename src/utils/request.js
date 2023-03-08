import Request from 'luch-request'
import store from '@/store/index.js'
import CheckAPI from '@/utils/checkAPI.js'
import { guid, localGet } from '@/utils/util.js'
import { encryptParams } from '@/utils/requestEncrypt.js'

const apiConfig = require('@/apiConfig.js')
const http = new Request()
const development = process.env.NODE_ENV === 'development'
// token过期是否需要执行退出登录
let isLogout = true

// 全局配置
http.setConfig(config => {
    config.timeout = 20000
    config.sslVerify = false
    return config
})

// 请求拦截
http.interceptors.request.use(
    config => {
        config.method = config.method.toUpperCase()
        const { apiService, pk } = store.state._base.wpCompanyInfo 
        const timestamp = Date.now()
        const { wpEnv } = apiConfig
        const isManageApi = wpEnv === 'vitatoken-config'
        let isProduction = process.env.NODE_ENV === 'production'
        // #ifdef APP
        isProduction = true
        // #endif
        let baseURL = ''
        baseURL = (isProduction || isManageApi) ? (apiService) : ('/' + wpEnv + '/api')
        config.baseURL = baseURL + (config.data?.nonePrefix ? '' : '/cats-gateway')
        config.header = {
            companyId: localGet('companyId'),
            token: localGet('token'),
            lang: localGet('lang'),
            timestamp,
            ...config.header,
        }
		
        // 请求参数加密
        config.header.trace = pk ? 'x-' + guid() : guid()
        config.data = { ...config.data }
        if (config.method === 'POST') {
            const postData = config.data
            // 参数加密
            if (pk) {
                if (development) console.warn('%c 请求原参数 %c ' + config.url, 'background-color:#5e5', 'background-color:#fe6', config.data)
                config.data = { data: encryptParams(config.data, timestamp, pk) }
            } else {
                // 参数不加密
                config.data = Object.assign({}, postData)
            }
        }
        return config
    },
    err => {
        return Promise.reject(err)
    }
)

// 请求响应
http.interceptors.response.use(
    response => {
        if (response.statusCode === 200) {
            const res = response.data
            const result = new CheckAPI(res)
            const switchAccounting = store.state._global.switchAccounting
            if (res.code === '0') {
                return Promise.resolve(result)
            } else if (!switchAccounting && ['GATEWAY_CODE_001', 'GATEWAY_CODE_005'].includes(res.code)) {
                // 退出登录 登录失败也会走CUSTOMER_API_0000102，暂时先屏蔽1228
                if (isLogout) {
                    isLogout = false
                    store.dispatch('_user/logout', { autoDirect: true }).then(() => {
                        isLogout = true
                    })
                }
                return Promise.reject(result)
            } else {
                // 接口错误
                
                return Promise.reject(res)
            }
        }
    },
    error => {
        return Promise.reject({
            msg: error.errMsg
        })
    }
)

const httpFake = config => {
    if (config && config.headers) config.header = config.headers
    return http.request(config)
}

export default httpFake
