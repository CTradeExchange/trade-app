import Vue from 'vue' 
import VueI18n from 'vue-i18n'
import { localGet } from '@/utils/util'

// 获取json数据key名称
function getKey (fileKey) {
    let key = fileKey.replace('.json', '')
    const index = key.lastIndexOf('/') + 1
    key = key.substring(index)
    return key
}

const locale = localGet('lang')
const commonFiles = require.context('./common', false, /\.json$/)
const plansFiles = require.context('./plans', false, /\.json$/)
const appFiles = require.context('./app', false, /\.json$/)
const messages = {}
commonFiles.keys().map(fileKey => {
    const key = getKey(fileKey)
    messages[key] = Object.assign({}, commonFiles(fileKey), messages[key])
})
plansFiles.keys().map(fileKey => {
    const key = getKey(fileKey)
    messages[key] = Object.assign({}, plansFiles(fileKey), messages[key])
})
appFiles.keys().map(fileKey => {
    const key = getKey(fileKey)
    messages[key] = Object.assign({}, appFiles(fileKey), messages[key])
})

Vue.use(VueI18n)

const i18n = new VueI18n({ 
    locale,
    messages 
})

export default i18n
