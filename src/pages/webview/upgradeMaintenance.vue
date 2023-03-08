<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar :back-show='false' :show-title-bar='false' />
            <!-- 内容区域 -->
            <view class='layout-content'>
                <view id='animation-block'>
                    <x-lottie 
                        ref='lottie'
                        :option="{ path: require('static/upgrading_anim.json'), loop: false }" 
                        style='width:100%; height:100%' 
                    />
                </view>
                <view class='warn-block'>
                    <view class='row'>
                        <view class='label'>
                            {{ $t('maintain.tip1') }}
                        </view>
                        <view class='text'>
                            {{ $t('maintain.tip2', { endTime: endTime }) }}
                        </view>
                    </view>
                </view>
            </view>
        </view>

        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>
import store from '@/store/index.js'
import xLottie from '@/components/x-lottie/x-lottie'

export default {
    components: {
        xLottie
    },
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 系统维护结束时间
            endTime: '',
            // 定时器
            timer: null
        }
    },
    onLoad () {
        // 初始化
        this.$init().then(() => {
            this.skeletonShow = false
            this.getConfigSystem()
            this.timer = setInterval(() => {
                this.getConfigSystem()
            }, 10000)
        }).catch(() => {
            this.skeletonShow = false
        })
    },
    onUnload () {
        clearInterval(this.timer)
        this.$refs.lottie.destroy()
    },
    methods: {
        // 获取cats2系统维护配置
        getConfigSystem () {
            store.dispatch('_global/getConfigSystem', true).then(res => {
                if (res) {
                    const {
                        endTime
                    } = res.data
                    this.endTime = this.$dayjs(parseInt(endTime)).format('HH:mm')
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.layout-content {
	justify-content: center;
}
#animation-block {
	padding: 0 30rpx;
	margin-top: -50rpx;
	heigth: 500rpx;
}
.warn-block {
	text-align: center;
	margin-top: 60rpx;
	padding: 0 80rpx;
	.row {
		line-height: 42rpx;
		.label {
			font-weight: bold;
			font-size: 30rpx;
		}
		.text {
			margin-top: 25rpx;
			font-size: 28rpx;

			span {
				margin: 0 10rpx;
			}
		}
	}
}
</style>
