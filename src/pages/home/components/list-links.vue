<template>
    <view class='list-links-module'>
        <view v-for='(item, index) in list' :key='index' class='item' @click='goDetail(item)'>
            <image v-if='item.icon' class='icon' mode='widthFix' :src='item.icon' />
            <view class='title'>
                {{ item.title || '--' }}
            </view>
        </view>
    </view>
</template>

<script>
import { toService } from '@/utils/method'
const { apiBase } = require('@/apiConfig.js')
export default {
    data () {
        return {
            list: [
                { 
                    icon: '/static/image/home/home-faqs.png?v=1',
                    title: this.$t('home.faqs'),
                    type: 'faqs'
                },
                { 
                    icon: '/static/image/home/home-academy.png?v=1',
                    title: this.$t('route.quote'),
                    type: 'quote'
                },
                { 
                    icon: '/static/image/home/home-about.png?v=1',
                    title: this.$t('home.about'),
                    type: 'about'
                },
                { 
                    icon: '/static/image/home/home-service.png?v=1',
                    title: this.$t('home.service'),
                    type: 'service'
                }
            ]
        }
    },
    methods: {
        // 跳转到图表页面
        goDetail (item) {
            switch (item.type) {
                case 'invite':
                    break
                case 'quote':
                    uni.switchTab({
                        url: '/pages/quote/index'
                    })
                    break
                case 'about':
                    this.$method.goWebView(`${apiBase}/${this.currentLang}/aboutus?isUniapp=1&lang=${this.currentLang}&theme=${this.currentTheme}`, item.title)
                    break
                case 'service':
                    toService(item.title)
                    break
                case 'faqs':
                    this.$method.goWebView(`${apiBase}/${this.currentLang}/faqs?isUniapp=1&lang=${this.currentLang}&theme=${this.currentTheme}`, item.title)
                    break
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.list-links-module {
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    .item {
        padding: 18rpx 0;
        flex: 1;
        text-align: center;
        .icon {
            width: 100%;
            max-width: 100%;
        }
        .title {
            font-size: 32rpx;
            padding: 8rpx 0;
        }
    }
}
</style>
