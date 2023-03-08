<template>
    <view class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar :title="$t('cRoute.MFA_status')" />
            <!-- 内容区域 -->
            <view class='layout-content'>
                <div class='bigIcon'>
                    <i class='iconfont icon_shoujixiazai'></i>
                </div>
                <view class='stepsContent'>
                    <text class='title'>
                        {{ $t('mfa.installStepLabel') }}
                    </text>
                    <view class='title-dd'>
                        <view>{{ $t('mfa.step1') }}</view>
                        <view class='alignRight'>
                            <view class='download' target='_blank' @click='goDownload'>
                                <text class='download-text'>
                                    {{ $t('mfa.downBtnText') }}
                                </text>
                                <text class='iconfont icon_zhiding1' />
                            </view>
                        </view>
                    </view>
                    <view>
                        <text>{{ $t('mfa.step2') }}</text>
                    </view>
                    <view>
                        <text>{{ $t('mfa.step3') }}</text>
                    </view>
                </view>
            </view>
            <view class='footerBox'>
                <view
                    class='foot-btn'
                >
                    <span @click='toMFASecrect'>
                        {{ $t('mfa.hasInstalled') }}
                    </span>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import { getDevice } from '@/utils/util.js'
const androidUrl = 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=zh&gl=US'
const iosUrl = 'https://apps.apple.com/cn/app/google-authenticator/id388497605'

export default {
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: false,
        }
    },
    methods: {
        toMFASecrect () {
            uni.navigateTo({
                url: '/pages/googleMFA/secretKey'
            })
        },
		
        goDownload () {
            if (getDevice() === 2) {
                window.open(androidUrl)
            } else if (getDevice() === 3) {
                window.open(iosUrl)
            } else {
                const url = getDevice() === 6 ? androidUrl : iosUrl
                // this.$method.goWebView(url, '下载谷歌验证器')
                plus.runtime.openURL(url, function (res) {  
                    console.log(res)
                })
            }
        }
    }
} 
</script>

<style lang="scss" scoped>
.layout-content {
    position: relative;
    .bigIcon {
        @include styles('color', 'primary');
        padding-top: 60rpx;
        text-align: center;
        .iconfont {
            font-size: 180rpx;
        }
    }
    .stepsContent {
        margin: 50rpx 30rpx 0;
        line-height: 1.7;
        .title {
            padding-bottom: 20rpx;
            font-weight: bold;
            font-size: 30rpx;
        }
        .title-dd {
            padding-bottom: 20rpx;
            .alignRight {
                text-align: right;
            }
        }
        .download {
            @include styles('color', 'primary');
            position: relative;
            padding-right: 30rpx;
            .download-text {
                margin-right: 10rpx;
                vertical-align: middle;
            }
            .iconfont {
                font-size: 26rpx;
                vertical-align: middle;
            }
        }
        .icon_zhiding1 {
            position: absolute;
            right: 0;
            transform: rotate(180deg);
        }
    }
}
.footerBox {
	@include styles('color', 'primary');
	width: 100%;
	text-align: center;
	margin-bottom: 40rpx;
	.nobd {
		background: none;
		border: 0;
	}
}
</style>
