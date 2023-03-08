<template>
    <view class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar :title="$t('cRoute.MFA_bind')" />
            <!-- 内容区域 -->
            <view class='layout-content'>
                <p class='desc'>
                    {{ $t('mfa.secretKeyDesc') }}
                </p>
                <view class='infoBox'>
                    <view class='qrcodeWrapper'>
                        <uqrcode v-if='qrcode' ref='uQRCode' :size='150' :text='qrcode' />
                    </view>
                    <view class='copy-bar'>
                        <text class='secret-text'>
                            {{ secret }}
                        </text>
                        <text class='copy-btn' @click='copySecret'>
                            {{ $t('common.copy') }}
                        </text>
                    </view>
                </view>
                <div class='footerBox'>
                    <view
                        class='bind-btn'
                        @click='toGoogleBind'
                    >
                        {{ $t('mfa.bind') }}
                    </view>
                </div>
            </view>
        </view>
    </view>
</template>

<script>
import { generateGoogleAccount } from '@/api/user'

export default {
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: false,
            secret: '',
            qrcode: '',
            secretId: ''
        }
    },
    onShow () {
        this.getQrcodeInfo()
    },
    methods: {
        // 跳转到谷歌绑定页面
        toGoogleBind () {
            uni.navigateTo({
                url: '/pages/googleMFA/bind?id=' + this.secretId
            })
        },
		
        toMFASecrect () {
            uni.navigateTo({
                url: 'pages/pages/googleMFA/secretKey'
            })
        },
		
        // 生成谷歌验证账号
        getQrcodeInfo  () {
            generateGoogleAccount({}).then(res => {
                if (res.check()) {
                    const data = res.data
                    this.secret = data.secret
                    this.qrcode = data.qrcode
                    this.secretId = data.id
                }
            })
        },
		
        // 复制地址 
        copySecret () {
            uni.setClipboardData({
                data: this.secret,
                showToast: false,
                success: () => {
                    uni.showToast({
                        title: this.$t('common.copySuccess'),
                        icon: 'none'
                    })
                }
            })
        }

    }
}
</script>

<style lang="scss" scoped>
.layout-content {
    .desc {
        margin: 0 30rpx;
        padding-top: 30rpx;
        // color: var(--minorColor);
        line-height: 1.7;
    }
    .infoBox {
        margin: 40rpx 30rpx 0;
        .qrcodeWrapper {
            display: flex;
            justify-content: center;
            width: 340rpx;
            padding: 20rpx;
            margin: 30rpx auto 80rpx;
            background: #fff
        }
        .copy-bar {
            @include styles('background-color', 'contentColor');
            display: flex;
            justify-content: space-between;
            padding: 0 30rpx;
            line-height: 80rpx;
            .secret-text {
                @include styles('color', 'normalColor');
            }
            .copy-btn {
                @include styles('color', 'primary');
            }
        }
    }
    .copyBtn {
        color: var(--primary);
    }
    .footerBox {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        .bind-btn {
            @include styles('background-color', 'primary');
            color: #fff;
            line-height: 90rpx;
            text-align: center;
        }
    }
}
</style>
