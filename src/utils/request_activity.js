import Request from 'luch-request'
import CheckAPI from './checkAPI'
import { guid, localSet, localGet } from '@/utils/util.js'
import { v4 } from 'uuid'
import store from '@/store/index.js'
export const token = v4()
const http = new Request()

// 全局配置
http.setConfig(config => { 
    config.timeout = 20000
    return config
}) 

// const headers = http.config.header
// headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'

// request interceptor
http.interceptors.request.use(
    config => {
        const { apiService } = store.state._base.wpCompanyInfo 
        const headers = config.header
        const companyId = localGet('companyId')
        const timestamp = Date.now()
        config.toastErr = config.toastErr ?? true
        let isProduction = process.env.NODE_ENV === 'production'
        // #ifdef APP
        isProduction = true
        // #endif
        
        config.baseURL = isProduction ? apiService + '/activity' : '/api/activity'
        headers.trace = guid()
        headers.timestamp = timestamp
        headers.lang = localGet('lang')
        headers.token = token
        headers.companyId = companyId
        if (config.method === 'get') {
            config.params = Object.assign({}, config.params || {})
        } else if (config.method === 'post') {
            const postData = config.data
            if (!postData.timestamp) {
                config.data = Object.assign({ timestamp: new Date().getTime() }, postData)
            }
        }

        return config
    },
    error => {
        console.log(error) // for debug
        return Promise.reject(error)
    }
)

// response interceptor
http.interceptors.response.use(
    response => {
        const { data, config } = response
        // 设置获取的服务器时间
        // #ifdef APP
        localSet('RESPONSE_HEADERS_DATE', response.header.Date)
        // #endif
        
        // #ifdef H5
        localSet('RESPONSE_HEADERS_DATE', response.header.date)
        // #endif
        
        const result = new CheckAPI(data)
        if (!result.check() && config.toastErr) {
            result.toast()
        }
        return result
    },
    error => {
        return Promise.reject(error)
    }
)

const httpFake = config => {
    if (config && config.headers) config.header = config.headers
    return http.request(config)
}

export default httpFake
