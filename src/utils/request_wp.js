import Request from 'luch-request'
import { localGet } from '@/utils/util.js'
const apiConfig = require('@/apiConfig.js')
const http = new Request()

// 全局配置
http.setConfig(config => { 
    config.timeout = 20000
    return config
}) 

// 请求拦截
http.interceptors.request.use(
    config => { 
        const lang = localGet('lang')
        const { wpEnv, wpUrl } = apiConfig
        let isProduction = process.env.NODE_ENV === 'production'
        const isManageApi = wpEnv !== 'vitatoken-config'
        // #ifndef H5
        isProduction = true
        // #endif
        config.baseURL = isProduction ? wpUrl : '/' + wpEnv
        if (isManageApi && !config.url.startsWith('https')) config.url = '/' + lang + '/cats-manage-api/json' + config.url
        
        config.sslVerify = false
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
            return Promise.resolve(response.data)
        }
    }, 
    error => {
        return Promise.reject(error)
    }
)

const httpFake = url => {
    return http.get(url)
}

export default httpFake
