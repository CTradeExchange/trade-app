<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container'>
            <!-- 头部导航栏 -->
            <nav-bar custom-back :title="$t('cRoute.regKyc')" @back='onBack' />   
            <!-- 内容区域 -->
            <view class='layout-content'>
                <!-- 有数据 -->
                <view v-if='list.length > 0' class='auth-list'>
                    <view v-for='(item, index) in list' :key='index' class='auth-item'>
                        <view class='content'>
                            <view class='t1'>
                                {{ kycMap[item.levelCode] }}
                            </view> 
                            <view class='t2'>
                                {{ $t('auth.authPass') }} [{{ item.businessNameList.toString() }}]
                            </view>
                        </view>
                        <view v-if='item.preLevelObj && item.preLevelObj.status !== 2'>
                            <span class='notice'>
                                {{ $t('auth.executeAuth', [kycMap[item.preLevelObj.levelCode]]) }}
                            </span>
                        </view>
                        <view v-else>
                            <view v-if='[0,3].includes(Number(item.status))' class='auth-btn' @click='handleNext(item)'>
                                <span class='btn-text'>
                                    {{ kycAuditStatus[item.status] }}
                                </span>
                                <tui-icon
                                    class='arrow'
                                    :color='$style.warn'
                                    name='arrowright'
                                    :size='38'
                                    unit='rpx'
                                />
                            </view>
                            <view v-else class='state'>
                                {{ kycAuditStatus[item.status] }}
                            </view>
                        </view>
                    </view>
                </view>
                <!-- 无数据 -->
                <none-data v-else :text="$t('auth.noRequired')" />
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
import store from '@/store/index.js'
// api
import { findAllBizKycList } from '@/api/user.js'
// util
import { getArrayObj } from '@/utils/util.js'
	
export default {
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 业务代码
            businessCode: '',
            // 列表数据
            list: [],
            // kycMap
            kycMap: {},
            // kycAuditStatus
            kycAuditStatus: {}
        }
    },
    onLoad (options) {
        this.businessCode = options.businessCode
        this.kycMap = {
            level_1: this.$t('common.kycLevel1'),
            level_2: this.$t('common.kycLevel2'),
            level_3: this.$t('common.kycLevel3')
        }
        this.kycAuditStatus = this.$t('kycAuditStatus')
		
        // 添加应用内事件
        this.$addAppsEvent('kyc_view')
    },
    onShow () {
        // 初始化
        this.$init().then(() => {
            this.getAuthCondition()
        }).catch(() => {
            this.skeletonShow = false
        })
    },
    onUnload () {
        // 没有开户注销登录
        if (!this.customerInfo.accountList) {
            store.dispatch('_user/logout')
        }
    },
    methods: {
        // 点击返回
        onBack () {
            uni.switchTab({
                url: '/pages/mine/index'
            })
        },
		
        // 获取身份认证数据
        getAuthCondition () {
            findAllBizKycList().then(res => {
                this.skeletonShow = false
                if (res) {
                    res.data.forEach(item => {
                        if (item.preLevelName) {
                            const temp = getArrayObj(res.data, 'levelName', item.preLevelName) 
                            item.preLevelObj = temp
                        }
                    })
                    this.list = res.data 
                }
            }).catch(err => {
                this.skeletonShow = false
            })
        },
		
        // 跳转到身份认证详情页
        handleNext (item) {
            let url = '/pages/person/authForm?levelCode=' + item.levelCode
            if (this.businessCode) url += '&businessCode=' + this.businessCode
            uni.navigateTo({
                url
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.auth-list {
    margin-top: 10rpx;
    height: 192rpx;
    .auth-item {
        width: 100%;
        display: flex;
        align-items: center;
        padding: 40rpx 32rpx;
        margin-bottom: 10rpx;
        @include styles('background-color', 'contentColor');
        .content {
            flex: 1;
            .t1 {
                font-weight: bold;
                line-height: 54rpx;
            }
            .t2 {
                font-size: 24rpx;
            }
        }
        .auth-btn {
            @include flexAlign;
            .btn-text {
                @include styles('color', 'warn');
                font-size: 26rpx;
            }
            .arrow {
                margin-right: -12rpx;
            }
        }
        .state {
            @include styles('color', 'minorColor');
            font-size: 26rpx;
        }
        .notice {
            @include styles('color', 'minorColor');
            font-size: 26rpx;
        }
    }
}
</style>
