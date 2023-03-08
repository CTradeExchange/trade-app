import checkVersion from './check-version'
import i18n from '@/plugins/i18n'
import { localGet } from '@/utils/util'

// 推荐在App.vue中使用
const PACKAGE_INFO_KEY = '__package_info__'

// 检测app是否需要升级更新
export default function () {
    // #ifdef APP-PLUS
    return new Promise((resolve, reject) => {
        checkVersion().then(async (e) => {
            if (!e.result) return
			console.log('升级更新返回数据', e.result)
            const {
                code,
                message,
                is_silently, // 是否静默更新
                url, // 安装包下载地址
                platform, // 安装包平台
                type // 安装包类型
            } = e.result
			
			// 国际化文案
			const lang = localGet('lang')
			const { common, upgrade } = i18n.messages[lang]
			
            // 此处逻辑仅为实例，可自行编写
            if (code > 0) {
			    // 腾讯云和阿里云下载链接不同，需要处理一下，阿里云会原样返回
			    const { fileList } = await uniCloud.getTempFileURL({ fileList: [url] })
			    e.result.url = fileList[0].tempFileURL
			    resolve(e)
				
			    // 静默更新，只有wgt有
			    if (is_silently) {
			        uni.downloadFile({
			            url: e.result.url,
			            success: res => {
			                if (res.statusCode === 200) {
			                    // 下载好直接安装，下次启动生效
			                    plus.runtime.install(res.tempFilePath, {
			                        force: false
			                    }, (res) => {
									console.log('升级更新安装成功', res)
			                        uni.showModal({
			                            title: upgrade.tip1,
			                            content: upgrade.tip2,
										confirmText: common.sure,
			                            showCancel: false,
			                            success: res => {
			                                if (res.confirm) {
			                                    // 更新完重启app
			                                    plus.runtime.restart()
			                                }
			                            }
			                        })
			                    }, (err) => {
									console.log('升级更新安装失败', err)
								})
			                }
			            }
			        })
			        return
			    }
			
			    // 整包更新，跳转到弹窗页面
			    uni.setStorageSync(PACKAGE_INFO_KEY, e.result)
			    uni.navigateTo({
			        url: `/upgrade/pages/index?local_storage_key=${PACKAGE_INFO_KEY}`,
			        fail: (err) => {
			            console.error('更新弹框跳转失败', err)
			            uni.removeStorageSync(PACKAGE_INFO_KEY)
			        }
			    })
            } else if (code < 0) {
			    // TODO 云函数报错处理
			    console.error(message)
			    reject(e)
            }
        }).catch(err => {
            // TODO 云函数报错处理
            console.error(err.message)
            reject(err)
        })
    })
    // #endif
}
