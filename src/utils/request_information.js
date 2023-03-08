import Request from 'luch-request'

const http = new Request()

// 全局配置
http.setConfig(config => { 
    config.timeout = 20000
    config.sslVerify = false
    return config
})

// 请求拦截
http.interceptors.request.use(
    config => { 
        config.method = 'POST'
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
            return Promise.resolve(res.data)
        }
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
