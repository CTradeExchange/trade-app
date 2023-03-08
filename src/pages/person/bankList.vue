<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar :title="$t('cRoute.bankList')" />   
            <!-- 内容区域 -->
            <view class='layout-content'>
                <!-- 银行卡列表 -->
                <view v-if='bankList.length > 0' class='nav-list'>
                    <view v-for='(item,index) in bankList' :key='index' class='bank-item'>
                        <tui-icon :color='$style.minorColor' name='bankcard-fill' :size='48' unit='rpx' />
                        <view class='text'>
                            <view class='name'>
                                {{ item.bankName }}
                            </view>
                            <view v-if='item.bankAccount' class='account'>
                                {{ item.bankAccount }}
                            </view>
                        </view>
                        <view class='currency'>
                            {{ item.bankCurrency }}
                        </view>
                    </view>
                </view>
                <!-- 无数据 -->
                <none-data v-else :text="$t('bank.noBanks')" />
            </view>
			
            <!-- 底部按钮 -->
            <view class='footer-btn' @click="goPage('/pages/person/addBank')">
                <i class='iconfont icon_icon_plus'></i>
                <span>{{ $t('bank.addBank') }}</span>
            </view>
        </view>
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>
// vuex
import { queryBankList } from '@/api/user.js'

export default {
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 银行卡列表
            bankList: []
        }
    },
    onLoad () {
        // 添加应用内事件
        this.$addAppsEvent('bank_list_view')
    },
    onShow () {
        // 初始化
        this.$init().then(() => {
            this.getBankList()
        }).catch(() => {
            this.skeletonShow = false
        })
    },
    methods: {
        // 跳转到指定页面
        goPage (url) {
            uni.navigateTo({
                url
            })
        },
		
        // 获取银行卡列表
        getBankList () {
            queryBankList().then(res => {
                this.skeletonShow = false
                this.bankList = res.data || []
            }).catch(err => {
                this.skeletonShow = false
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.footer-btn {
	@include styles('background-color', 'contentColor');
	i {
		margin-right: 5rpx;
	}
}
.nav-list {
	padding: 0 30rpx;
	margin-top: 30rpx;
	.bank-item {
		@include styles('background-color', 'contentColor');
		@include styles('border-color', 'lineColor');
		display: flex;
		align-items: center;
		min-height: 160rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		border-radius: 10rpx;
		border-width: 1rpx;
		border-style: solid;
		.text {
			flex: 1;
			margin: 0 20rpx;
			.account {
				margin-top: 8rpx;
			}
		}
	}
}
</style>
