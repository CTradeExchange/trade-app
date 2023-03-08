const { wpList } = require('./src/apiConfig.js')
const dayjs = require('dayjs')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
require('events').EventEmitter.defaultMaxListeners = 40

process.env.VUE_APP_buildTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
console.log(process.env.VUE_APP_buildTime)

// 设置代理地址 
const setProxy = () => {
    const proxy = {}
    wpList.map(el => {
        const item = {
            target: el.url,
            secure: false
        }
        if (el.isRewrite) {
            item.pathRewrite = { ['^/' + el.value]: '' }
        }
        // 设置wp接口代理
        proxy['^/' + el.value] = item
        // 设置api接口代理
        proxy['^/' + el.value + '/api'] = {
            target: el.url,
            secure: false
        }
        if (el.activityApi) {
            proxy['^/api/activity'] = {
                target: el.activityApi, 
                secure: false
            }
        }
    })
	
    return proxy
}

// 设置插件
const setPlugins = () => {
    const plugins = []
    // 生产环境插件
    if (process.env.NODE_ENV === 'production') {
        plugins.push(
            // 文件分析报告
            new BundleAnalyzerPlugin({
                analyzerMode: 'static', // 可选值有server static disabled
                generateStatsFile: false,
                statsOptions: { source: false },
                openAnalyzer: false
            })
        )
    }

    return plugins
}

const config = {
    lintOnSave: false,
    devServer: {
        hot: true,
        overlay: {
            warnings: false,
            errors: true
        },
        proxy: setProxy()
    },
    configureWebpack: {
        plugins: setPlugins()
    }
}

module.exports = config
