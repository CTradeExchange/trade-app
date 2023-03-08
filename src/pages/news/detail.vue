<template>
    <view class='layout' :change-color='changeColor' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container'>
            <!-- 头部导航栏 -->
            <nav-bar :title="$t('information.details')" />
            <!-- 内容区域 -->
            <view class='layout-content'>
                <view class='module-case'>
                    <view class='title'>
                        {{ detailInfo.title }}
                    </view>
                    <view class='des'>
                        <span class='time'>
                            {{ beforeTime(detailInfo.updatetime * 1000) }}
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
import { articleDetail } from '@/api/information.js'
// utils
import { beforeTime } from '@/utils/util.js'
export default {
    data () {
        return { 
            // 是否显示骨架屏
            skeletonShow: true,
            // 机构id
            orgid: '',
            // 详情id
            id: '',
            // 详情数据
            detailInfo: {},
            // 默认样式
            tagStyle: {},
            // 格式化时间
            beforeTime
        }
    },
    onLoad (options) {
        this.orgid = options.orgid
        this.id = options.id
        this.tagStyle = {
            p: ('font-size: 30rpx; color:' + this.$style.color)
        }
        this.$init().then(() => {
            // 获取资讯详情
            this.getArticleDetail()
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('news_detail_view')
    },
    methods: {	
        // 获取资讯详情
        getArticleDetail () {
            const params = {
                orgid: this.orgid,
                id: this.id
            }
            articleDetail(params, this.currentLang).then(res => {
                this.skeletonShow = false
                this.detailInfo = res
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
