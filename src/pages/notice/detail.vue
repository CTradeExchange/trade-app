<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container'>
            <!-- 头部导航栏 -->
            <nav-bar :title="$t('route.notice')" />
            <!-- 内容区域 -->
            <view class='layout-content'>
                <view class='module-case'>
                    <view class='title'>
                        {{ detailInfo.title }}
                    </view>
                    <view class='des'>
                        <span class='time'>
                            {{ formatTime(detailInfo.pubTime) }}
                        </span>
                        <span class='sub'>
                            {{ detailInfo.resource }}
                        </span>
                    </view>
                    <mp-html :content='detailInfo.content' :tag-style='tagStyle' />
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
// api	
import { getNoticeDetail } from '@/api/user.js'
export default {
    data () {
        return { 
            // 是否显示骨架屏
            skeletonShow: true,
            // 详情id
            id: '',
            // 详情数据
            detailInfo: {},
            // 默认样式
            tagStyle: {},
        }
    },
    onLoad (options) {
        this.id = options.id
        this.tagStyle = {
            p: ('font-size: 28rpx; color:' + this.$style.color)
        }
        this.$init().then(() => {
            // 获取详情
            this.getArticleDetail()
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('notice_detail_view')
    },
    methods: {	
        // 获取详情
        getArticleDetail () {
            getNoticeDetail({
                current: 1,
                id: this.id,
                lang: this.currentLang,
                companyId: this.customerInfo.companyId,
            }).then(res => {
                this.skeletonShow = false
                if (res.check()) {
                    this.detailInfo = res.data
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.module-case {
    @include styles('background', 'contentColor');
    padding: 30rpx;
    .title {
        @include styles('color', 'color');
        font-size: 36rpx;
        font-weight: bold;
    }
    .des {
        @include styles('color', 'minorColor');
        display: flex;
        align-items: center;
        margin: 25rpx 0;
        font-size: 28rpx;
        .time {
            margin-right: 30rpx;
        }
    }
}
</style>
