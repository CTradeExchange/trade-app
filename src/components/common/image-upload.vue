<template>
    <view class='tui-container'>
        <view class='tui-upload-box'>
            <block v-for='(item,index) in imageList' :key='index'>
                <view class='tui-image-item' :style="{ width: width + 'rpx', height: height + 'rpx' }">
                    <!-- 删除按钮 -->
                    <view v-if='!forbidDel' class='tui-img-del' @click='delImage(index)' />
                    <!-- 显示的图片 -->
                    <image class='tui-item-img' lazy-load mode='aspectFill' :src='item' @click='previewImage(index)' />
                    <!-- 图片上传效果 -->
                    <view v-if='statusArr[index] != 1' class='tui-upload-mask'>
                        <view v-if='statusArr[index] == 2' class='tui-upload-loading' />
                        <text class='tui-tips'>
                            {{ statusArr[index] == 2 ? $t('upload.underway') : $t('upload.fail') }}
                        </text>
                        <view 
                            v-if='statusArr[index] == 3' 
                            class='tui-mask-btn' 
                            hover-class='tui-btn-hover' 
                            :hover-stay-time='150'
                            @click='reUpLoad(index)'
                        > 
                            {{ $t('upload.again') }}
                        </view>
                    </view> 
                </view>
            </block>
            <!-- 图片添加按钮 -->
            <view v-if='isShowAdd' class='tui-upload-add' :style="{ width: width + 'rpx', height: height + 'rpx' }" @click='chooseImage'>
                <image v-if='defaultImage' class='tui-default-image' :src='defaultImage' />
                <view v-else class='tui-upload-icon tui-icon-plus' />
            </view>
        </view>
    </view>
</template>

<script>	
import { guid, localGet } from '@/utils/util.js'

export default {
    props: {
        // 当前组件key值 
        componentKey: {
            type: [Number, String],
            default: ''
        },
        // 初始化图片路径
        list: {
            type: Array,
            default: () => []
        },
        // 禁用删除
        forbidDel: {
            type: Boolean,
            default: false
        },
        // 禁用添加
        forbidAdd: {
            type: Boolean,
            default: false
        },
        // 服务器地址
        serverUrl: {
            type: String,
            default: ''
        },
        // 是否需要上传图片
        isUpload: {
            type: Boolean,
            default: true
        },
        // 限制图片数量
        limit: {
            type: Number,
            default: 9
        },
        // 限制图片大小
        size: {
            type: Number,
            default: 5
        },
        // 项目名，默认为 file
        fileKeyName: {
            type: String,
            default: 'file'
        },
        // 图片宽度
        width: {
            type: Number,
            default: 180
        },
        // 图片高度
        height: {
            type: Number,
            default: 180
        },
        // 默认显示的图片
        defaultImage: {
            type: String,
            default: ''
        }
    },
    data () { 
        return {
            // 图片地址
            imageList: [],
            // 上传状态：1-上传成功 2-上传中 3-上传失败
            statusArr: []
        }
    },
    computed: {
        isShowAdd () {
            let isShow = true
            if (this.forbidAdd || (this.limit && this.imageList.length >= this.limit)) {
                isShow = false
            }
            return isShow
        },
        apiService () {
            const { wpEnv } = require('@/apiConfig.js')
            const isManageApi = wpEnv === 'vitatoken-config'
            let isProduction = process.env.NODE_ENV === 'production'
            let { apiService } = this.wpCompanyInfo
            // #ifndef H5
            isProduction = true
            // #endif
            apiService = (isProduction || isManageApi) ? apiService : ('/' + wpEnv + '/api')
            return apiService
        }
    },
    watch: { 
        list: {
            handler () {
                this.imageList = this.list
                for (let i = 0; i < this.imageList.length; i++) {
                    this.statusArr.push('1') 
                }
            },
            immediate: true
        }
    },
    methods: {
        // 重新上传
        reUpLoad (index) {
            this.$set(this.statusArr, index, '2')
            this.uploadImage(index, this.imageList[index]).then(() => {
                this.change()
            }).catch(() => {
                // this.change()
            })
        },
		
        // 通知父组件上传结果
        change () {
            this.$emit('complete', {
                imageList: this.imageList,
                componentKey: this.componentKey
            })
        },
		
        // 选择图片
        chooseImage () {
            uni.chooseImage({
                count: this.limit - this.imageList.length,
                success: e => {
                    const tempFiles = e.tempFiles
                    const imageArr = []
					
                    for (let i = 0; i < tempFiles.length; i++) {
                        const item = tempFiles[i]
                        const len = this.imageList.length
                        const imageSize = item.size / 1024 / 1024
                        // 图片大小超过最大限制不上传图片
                        if (imageSize > this.size) {
                            uni.showToast({
                                title: `${this.$t('upload.imgSizeLimit')}${this.size}MB`,
                                icon: 'none'
                            })
                            continue
                        }
                        // 图片数量超过最大限制后不上传图片
                        if (len >= this.limit) {
                            uni.showToast({
                                title: this.$t('upload.maxTip', [this.limit]), 
                                icon: 'none'
                            })
                            break
                        }
						
                        // 添加需要上传的图片文件
                        imageArr.push(item.path)
                        this.imageList.push(item.path)
                        this.statusArr.push('2')
                    }

                    const start = this.imageList.length - imageArr.length
                    for (let j = 0; j < imageArr.length; j++) {
                        const index = start + j
                        // 是否需要上传图片
                        if (this.isUpload) {
                            this.uploadImage(index, imageArr[j]).then(() => {
                                this.change()
                            }).catch(() => {
                                // this.change()
                            })
                        } else {
                            // 不需要则直接返回成功
                            this.$set(this.statusArr, index, '1')
                            this.change()
                        }
                    }
                }
            })
        },
        		
        // 上传图片
        uploadImage: function (index, url) {
            const trace = guid()
            const uploadUrl = (this.serverUrl || this.apiService) + '/cats-gateway/upload'
            return new Promise((resolve, reject) => {
                uni.uploadFile({
                    header: {
                        companyId: localGet('companyId'),
                        trace,
                        token: localGet('token'),
                        lang: this.currentLang
                    },
                    url: uploadUrl,
                    name: 'object',
                    fileType: 'image',
                    filePath: url,
                    success: res => {
                        console.log('上传图片成功', res)
                        const result = JSON.parse(res.data) 
                        if (Number(result.code) === 0) {
                            const url = result.data
                            // 上传成功
                            if (url) {
                                this.$set(this.imageList, index, url)
                                this.$set(this.statusArr, index, '1')
                            } else {
                                // 上传失败
                                this.$set(this.statusArr, index, '3')
                            }
                            resolve(index)
                        } else {
                            this.$toast(result.msg)
                            this.$set(this.statusArr, index, '3')
                            reject(index)
                        }
                    },
                    fail: res => {
                        console.log('上传图片失败', res)
                        this.$set(this.statusArr, index, '3')
                        reject(index)
                    }
                })
            })
        },
		
        // 删除图片
        delImage: function (index) {
            this.imageList.splice(index, 1)
            this.statusArr.splice(index, 1)
            this.$emit('remove', {
                index: index
            })
            this.change()
        },
		
        // 预览图片
        previewImage: function (index) {
            if (!this.imageList.length) return
            uni.previewImage({
                current: this.imageList[index],
                loop: true,
                urls: this.imageList
            })
        }
    }
}
</script>

<style scoped>
@font-face {
	font-family: 'tuiUpload';
	src: url(data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAATcAA0AAAAAByQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABGRlRNAAAEwAAAABoAAAAciR52BUdERUYAAASgAAAAHgAAAB4AKQALT1MvMgAAAaAAAABCAAAAVjxvR/tjbWFwAAAB+AAAAEUAAAFK5ibpuGdhc3AAAASYAAAACAAAAAj//wADZ2x5ZgAAAkwAAADXAAABAAmNjcZoZWFkAAABMAAAAC8AAAA2FpiS+WhoZWEAAAFgAAAAHQAAACQH3QOFaG10eAAAAeQAAAARAAAAEgwAACBsb2NhAAACQAAAAAwAAAAMAEoAgG1heHAAAAGAAAAAHwAAACABEgA2bmFtZQAAAyQAAAFJAAACiCnmEVVwb3N0AAAEcAAAACgAAAA6OMUs4HjaY2BkYGAAYo3boY/i+W2+MnCzMIDAzb3qdQj6fwPzf+YGIJeDgQkkCgA/KAtvAHjaY2BkYGBu+N/AEMPCAALM/xkYGVABCwBZ4wNrAAAAeNpjYGRgYGBl0GJgZgABJiDmAkIGhv9gPgMADTABSQB42mNgZGFgnMDAysDA1Ml0hoGBoR9CM75mMGLkAIoysDIzYAUBaa4pDA7PGJ9xMjf8b2CIYW5gaAAKM4LkANt9C+UAAHjaY2GAABYIVmBgAAAA+gAtAAAAeNpjYGBgZoBgGQZGBhBwAfIYwXwWBg0gzQakGRmYnjE+4/z/n4EBQksxSf6GqgcCRjYGOIeRCUgwMaACRoZhDwCiLwmoAAAAAAAAAAAAAAAASgCAeNpdjkFKw0AARf/vkIR0BkPayWRKQZtYY90ohJju2kOIbtz0KD1HVm50UfEmWXoAr9ADOHFARHHzeY//Fx8Ci+FJfIgdJFa4AhgiMshbrCuIsLxhFJZVs+Vl1bT1GddtbXTC3OhohN4dg4BJ3zMJAnccyfm468ZzHXddrH9ZKbHzdf9n/vkY/xv9sPQXgGEvBrHHwst5kTbXLE+YpYVPkxepPmW94W16UbdNJd6f3SAzo5W7m1jaKd+8ZZIvk5nlKw9SK6Wle7BLS3f/bTzQLmfAF2T1NsQAeNp9kD1OAzEQhZ/zByQSQiCoXVEA2vyUKRMp9Ailo0g23pBo1155nUg5AS0VB6DlGByAGyDRcgpelkmTImvt6PObmeexAZzjGwr/3yXuhBWO8ShcwREy4Sr1F+Ea+V24jhY+hRvUf4SbuFUD4RYu1BsdVO2Eu5vSbcsKZxgIV3CKJ+Eq9ZVwjfwqXMcVPoQb1L+EmxjjV7iFa2WpDOFhMEFgnEFjig3jAjEcLJIyBtahOfRmEsxMTzd6ETubOBso71dilwMeaDnngCntPbdmvkon/mDLgdSYbh4FS7YpjS4idCgbXyyc1d2oc7D9nu22tNi/a4E1x+xRDWzU/D3bM9JIbAyvkJI18jK3pBJTj2hrrPG7ZynW814IiU68y/SIx5o0dTr3bmniwOLn8owcfbS5kj33qBw+Y1kIeb/dTsQgil2GP5PYcRkAAAB42mNgYoAALjDJyIAOWMGiTIxMjMxsKak5qSWpbFmZiRmJ+QAmgAUIAAAAAf//AAIAAQAAAAwAAAAWAAAAAgABAAMABAABAAQAAAACAAAAAHjaY2BgYGQAgqtL1DlA9M296nUwGgA+8QYgAAA=) format('woff');
	font-weight: normal;
	font-style: normal;
}

.tui-upload-icon {
	font-family: "tuiUpload" !important;
	font-style: normal;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	padding: 10rpx;
}

.tui-icon-delete:before {
	content: "\e601";
}

.tui-icon-plus:before {
	content: "\e609";
}

.tui-upload-box {
	width: 100%;
	display: flex;
	flex-wrap: wrap;
}

.tui-upload-add {
	margin-bottom: 20rpx;
	font-size: 50rpx;
	font-weight: 100;
	color: #888;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0;
}

.tui-default-image {
	display: block;
	width: 100%;
	height: 100%;
}

.tui-image-item {
	position: relative;
	margin-right: 25rpx;
	margin-bottom: 20rpx;
}

.tui-image-item:nth-of-type(3n) {
	margin-right: 0;
}

.tui-item-img {
	width: 100%;
	height: 100%;
	display: block;
}

.tui-img-del {
	width: 36rpx;
	height: 36rpx;
	position: absolute;
	right: -12rpx;
	top: -12rpx;
	background-color: #EB0909;
	border-radius: 50%;
	color: white;
	font-size: 34rpx;
	z-index: 10;
}

.tui-img-del::before {
	content: '';
	width: 16rpx;
	height: 1px;
	position: absolute;
	left: 50%;
	top: 18rpx;
	transform: translateX(-50%);
	background-color: #fff;
}

.tui-upload-mask {
	width: 100%;
	height: 100%;
	position: absolute;
	left: 0;
	top: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-around;
	padding: 40rpx 0;
	box-sizing: border-box;
	background-color: rgba(0, 0, 0, 0.6);
}

.tui-upload-loading {
	width: 28rpx;
	height: 28rpx;
	border-radius: 50%;
	border: 2px solid;
	border-color: #B2B2B2 #B2B2B2 #B2B2B2 #fff;
	animation: tui-rotate 0.7s linear infinite;
}

@keyframes tui-rotate {
	0% {
		transform: rotate(0);
	}

	100% {
		transform: rotate(360deg);
	}
}

.tui-tips {
	font-size: 26rpx;
	color: #fff;
}

.tui-mask-btn {
	padding: 4rpx 16rpx;
	border-radius: 40rpx;
	text-align: center;
	font-size: 24rpx;
	color: #fff;
	border: 1rpx solid #fff;
	display: flex;
	align-items: center;
	justify-content: center;
}

.tui-btn-hover {
	opacity: 0.8;
}
</style>
