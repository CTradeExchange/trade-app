<template>
    <view class='mask flex-center'>
        <view class='content botton-radius'>
            <view class='content-top'>
                <text class='content-top-text'>
                    {{ title }}
                </text>
                <image class='content-top' height='100%' :src="require('../static/bg_top.png')" style='top: 0;' width='100%' />
            </view>
            <view class='content-header' />
            <view class='content-body'>
                <view class='title'>
                    <text>{{ subTitle }}</text>
                </view>
                <view class='body'>
                    <scroll-view class='box-des-scroll' scroll-y='true'>
                        <text class='box-des'>
                            {{ contents }}
                        </text>
                    </scroll-view>
                </view>
                <view class='footer flex-center'>
                    <template v-if='isiOS'>
                        <button class='content-button' plain style='border: none;color: #fff;' @click='jumpToAppStore'>
                            {{ downLoadBtnTextiOS }}
                        </button>
                    </template>
                    <template v-else>
                        <!-- 下载模块 -->
                        <template v-if='!downloadSuccess'>
                            <view v-if='downloading' class='progress-box flex-column'>
                                <progress
                                    activeColor='#3DA7FF'
                                    border-radius='35'
                                    class='progress'
                                    :percent='downLoadPercent'
                                    show-info
                                    stroke-width='10'
                                ></progress>
                                <view style='width:100%;font-size: 28rpx;display: flex;justify-content: space-around;'>
                                    <text>{{ downLoadingText }}</text>
                                    <text>({{ downloadedSize }}/{{ packageFileSize }}M)</text>
                                </view>
                            </view>
                            <button
                                v-else
                                class='content-button'
                                plain
                                style='border: none;color: #fff;'
                                @click='downloadPackage'
                            >
                                {{ downLoadBtnText }}
                            </button>
                        </template>
                        <!-- 整包 -->
                        <button
                            v-else-if='downloadSuccess && !installed'
                            class='content-button'
                            :disabled='installing'
                            :loading='installing'
                            plain
                            style='border: none;color: #fff;'
                            @click='installPackage'
                        >
                            {{ installing ? $t('upgrade.tip3') : $t('upgrade.tip4') }}
                        </button>
                        <!-- wgt资料包 -->
                        <button
                            v-if='installed && isWGT'
                            class='content-button'
                            plain
                            style='border: none;color: #fff;'
                            @click='restart'
                        >
                            {{ $t('upgrade.tip5') }}
                        </button>
                    </template>
                </view>
            </view>
            <!-- 关闭按钮 -->
            <image
                v-if='!is_mandatory'
                class='close-img'
                :src="require('../static/app_update_close.png')"
                @click.stop='closeUpdate'
            />
        </view>
    </view>
</template>

<script>
const localFilePathKey = '__localFilePath__'
const platform_iOS = 'iOS'
let downloadTask = null

/**
 * 对比版本号，如需要，请自行修改判断规则
 * 支持比对	("3.0.0.0.0.1.0.1", "3.0.0.0.0.1")	("3.0.0.1", "3.0")	("3.1.1", "3.1.1.1") 之类的
 * @param {Object} v1 
 * @param {Object} v2 
 * v1 > v2 return 1
 * v1 < v2 return -1
 * v1 == v2 return 0
 */
function compare (v1 = '0', v2 = '0') {
    v1 = String(v1).split('.')
    v2 = String(v2).split('.')
    const minVersionLens = Math.min(v1.length, v2.length)

    let result = 0
    for (let i = 0; i < minVersionLens; i++) {
        const curV1 = Number(v1[i])
        const curV2 = Number(v2[i])

        if (curV1 > curV2) {
            result = 1
            break
        } else if (curV1 < curV2) {
            result = -1
            break
        }
    }

    if (result === 0 && (v1.length !== v2.length)) {
        const v1BiggerThenv2 = v1.length > v2.length
        const maxLensVersion = v1BiggerThenv2 ? v1 : v2
        for (let i = minVersionLens; i < maxLensVersion.length; i++) {
            const curVersion = Number(maxLensVersion[i])
            if (curVersion > 0) {
                v1BiggerThenv2 ? result = 1 : result = -1
                break
            }
        }
    }

    return result
}

export default {
    data () {
        return {
            // 从之前下载安装
            installForBeforeFilePath: '',

            // 安装
            installed: false,
            installing: false,

            // 下载
            downloadSuccess: false,
            downloading: false,

            downLoadPercent: 0,
            downloadedSize: 0,
            packageFileSize: 0,
            // 要安装的本地包地址
            tempFilePath: '', 

            // 默认安装包信息
            title: this.$t('upgrade.title'),
            contents: '',
            // 是否强制更新
            is_mandatory: false,

            // 可自定义属性
            subTitle: this.$t('upgrade.tip6'),
            downLoadBtnTextiOS: this.$t('upgrade.tip7'),
            downLoadBtnText: this.$t('upgrade.tip8'),
            downLoadingText: this.$t('upgrade.tip9')
        }
    },
    onLoad (options) {
        // 验证参数
        const { local_storage_key } = options
        if (!local_storage_key) {
            console.error('local_storage_key为空，请检查后重试')
            uni.navigateBack()
            return
        };

        const localPackageInfo = uni.getStorageSync(local_storage_key)
        if (!localPackageInfo) {
            console.error('安装包信息为空，请检查后重试')
            uni.navigateBack()
            return
        };

        const requiredKey = ['version', 'url', 'type']
        for (const key in localPackageInfo) {
            if (requiredKey.indexOf(key) !== -1 && !localPackageInfo[key]) {
                console.error(`参数 ${key} 必填，请检查后重试`)
                uni.navigateBack()
                return
            }
        }
        
        Object.assign(this, localPackageInfo)
        // 检测安装包
        this.checkLocalStoragePackage()
    },
    // 监听页面返回
    onBackPress () { 
        // 强制更新不允许返回
        if (this.is_mandatory) {
            return true
        }
        // 取消下载任务
        downloadTask && downloadTask.abort()
    },
    computed: {
        // 是否为wgt资源包
        isWGT () {
            return this.type === 'wgt'
        },
        // 是否为ios平台
        isiOS () {
            return !this.isWGT ? this.platform.includes(platform_iOS) : false
        }
    },
    methods: {
        // 检测安装包
        checkLocalStoragePackage () {
            // 如果已经有下载好的包，则直接提示安装
            const localFilePathRecord = uni.getStorageSync(localFilePathKey)
            if (localFilePathRecord) {
                const {
                    version,
                    savedFilePath,
                    installed
                } = localFilePathRecord
					
                // 比对版本
                if (!installed && compare(version, this.version) === 0) {
                    this.downloadSuccess = true
                    this.installForBeforeFilePath = savedFilePath
                    this.tempFilePath = savedFilePath
                } else {
                    // 如果保存的包版本小 或 已安装过，则直接删除
                    this.deleteSavedFile(savedFilePath)
                }
            }
        },
		
        // 关闭升级更新
        async closeUpdate () {
            if (this.downloading) {
                if (this.is_mandatory) {
                    return uni.showToast({
                        title: this.$t('upgrade.tip10'),
                        icon: 'none',
                        duration: 500
                    })
                }
                uni.showModal({
                    title: this.$t('upgrade.tip11'),
                    cancelText: this.$t('upgrade.no'),
                    confirmText: this.$t('upgrade.yes'),
                    success: res => {
                        if (res.confirm) {
                            downloadTask && downloadTask.abort()
                            uni.navigateBack()
                        }
                    }
                })
                return
            }

            if (this.downloadSuccess && this.tempFilePath) {
                // 包已经下载完毕，稍后安装，将包保存在本地
                await this.saveFile(this.tempFilePath, this.version)
                uni.navigateBack()
                return
            }

            uni.navigateBack()
        },
		
        // 下载安装包
        downloadPackage () {
            this.downloading = true

            // 下载包
            downloadTask = uni.downloadFile({
                url: this.url,
                success: res => {
                    if (res.statusCode === 200) {
                        this.downloadSuccess = true
                        this.tempFilePath = res.tempFilePath
                        // 直接安装
                        this.installPackage()
                    }
                },
                complete: () => {
                    this.downloading = false

                    this.downLoadPercent = 0
                    this.downloadedSize = 0
                    this.packageFileSize = 0

                    downloadTask = null
                }
            })
			
            // 更新下载进度
            downloadTask.onProgressUpdate(res => {
                this.downLoadPercent = res.progress
                this.downloadedSize = (res.totalBytesWritten / Math.pow(1024, 2)).toFixed(2)
                this.packageFileSize = (res.totalBytesExpectedToWrite / Math.pow(1024, 2)).toFixed(2)
            })
        },
		
        // 安装app包
        installPackage () {
            // #ifdef APP-PLUS
            // wgt资源包安装
            if (this.isWGT) {
                this.installing = true
            }

            plus.runtime.install(this.tempFilePath, {
                force: false
            }, async res => {
                this.installing = false
                this.installed = true

                // wgt包，安装后会提示 安装成功，是否重启
                if (this.isWGT) {
                    // 安装完成重启
                    this.restart()
                } else {
                    const localFilePathRecord = uni.getStorageSync(localFilePathKey)
                    uni.setStorageSync(localFilePathKey, {
							...localFilePathRecord,
							installed: true
                    })
                }
            }, async err => {
                // 如果是安装之前的包，安装失败后删除之前的包
                if (this.installForBeforeFilePath) {
                    await this.deleteSavedFile(this.installForBeforeFilePath)
                    this.installForBeforeFilePath = ''
                }

                // 安装失败需要重新下载安装包
                this.installing = false
                this.installed = false

                uni.showModal({
                    title: this.$t('upgrade.tip14'),
                    content: err.message,
                    showCancel: false
                })
            })

            // 非wgt包，安装跳出覆盖安装，此处直接返回上一页
            if (!this.isWGT) {
                uni.navigateBack()
            }
            // #endif
        },
		
        // 重启app
        restart () {
            this.installed = false
            uni.hideLoading()
            // #ifdef APP-PLUS
            // 更新完重启app
            plus.runtime.restart()
            // #endif
        },
		
        // 保存安装包
        async saveFile (tempFilePath, version) {
            const [err, res] = await uni.saveFile({
                tempFilePath
            })
            if (err) {
                return
            }
            uni.setStorageSync(localFilePathKey, {
                version,
                savedFilePath: res.savedFilePath
            })
        },
		
        // 删除安装包
        deleteSavedFile (filePath) {
            uni.removeStorageSync(localFilePathKey)
            return uni.removeSavedFile({
                filePath
            })
        },
		
        // 跳转到app下载页面
        jumpToAppStore () {
            plus.runtime.openURL(this.url)
        }
    }
}
</script>

<style>
page {
	background: transparent;
}
.flex-center {
	/* #ifndef APP-NVUE */
	display: flex;
	/* #endif */
	justify-content: center;
	align-items: center;
}
.mask {
	position: fixed;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, .65);
}
.botton-radius {
	border-bottom-left-radius: 30rpx;
	border-bottom-right-radius: 30rpx;
}
.content {
	position: relative;
	top: 0;
	width: 600rpx;
	background-color: #fff;
	box-sizing: border-box;
	padding: 0 50rpx;
	font-family: Source Han Sans CN;
}
.text {
	/* #ifndef APP-NVUE */
	display: block;
	/* #endif */
	line-height: 200px;
	text-align: center;
	color: #FFFFFF;
}
.content-top {
	position: absolute;
	top: -195rpx;
	left: 0;
	width: 600rpx;
	height: 270rpx;
}
.content-top-text {
	font-size: 45rpx;
	font-weight: bold;
	color: #F8F8FA;
	position: absolute;
	top: 120rpx;
	left: 50rpx;
	z-index: 1;
}
.content-header {
	height: 70rpx;
}
.title {
	font-size: 33rpx;
	font-weight: bold;
	color: #3DA7FF;
	line-height: 38px;
}
.footer {
	height: 150rpx;
	display: flex;
	align-items: center;
	justify-content: space-around;
}
.box-des-scroll {
	box-sizing: border-box;
	padding: 0 40rpx;
	height: 200rpx;
	text-align: left;
}
.box-des {
	font-size: 26rpx;
	color: #000000;
	line-height: 50rpx;
}
.progress-box {
	width: 100%;
}
.progress {
	width: 90%;
	height: 40rpx;
	border-radius: 35px;
}
.close-img {
	width: 70rpx;
	height: 70rpx;
	z-index: 1000;
	position: absolute;
	bottom: -120rpx;
	left: calc(50% - 70rpx / 2);
}
.content-button {
	text-align: center;
	flex: 1;
	font-size: 30rpx;
	font-weight: 400;
	color: #FFFFFF;
	border-radius: 40rpx;
	margin: 0 18rpx;
	height: 80rpx;
	line-height: 80rpx;
	background: linear-gradient(to right, #1785ff, #3DA7FF);
}
.flex-column {
	display: flex;
	flex-direction: column;
	align-items: center;
}
</style>
