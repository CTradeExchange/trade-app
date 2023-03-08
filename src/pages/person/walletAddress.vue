<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar :title="$t('cRoute.walletAddress')" />
            <!-- 内容区域 -->
            <view class='layout-content'>
                <view v-if='addressList.length > 0' class='address-list'>
                    <view v-for='item in addressList' :key='item.id' class='item'>
                        <view class='above'>
                            <view class='info'>
                                <span class='name'>
                                    {{ item.currency }}-{{ item.chainName }}
                                </span>
                                <span v-if='item.remark' class='tag'>
                                    {{ item.remark }}
                                </span>
                            </view>
                            <view class='code'>
                                {{ item.address }}
                            </view>
                        </view>
                        <view class='below'>
                            <span class='delete' @click='deleteWallet(item.id)'>
                                {{ $t('walletAddress.deleteBtn') }}
                            </span>
                        </view>
                    </view>
                </view>
                <none-data v-else :text="$t('walletAddress.none')" />
            </view>

            <!-- 底部按钮 -->
            <view class='footer-btn' @click="$method.goView('/pages/person/addWallet')">
                <i class='iconfont icon_icon_plus'></i>
                <span>{{ $t('walletAddress.addBtn') }}</span>
            </view>
        </view>

        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>
import { getWalletAddressList, deleteWalletAddress } from '@/api/user.js'

export default {
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 钱包地址列表
            addressList: []
        }
    },
    onLoad () {
        // 添加应用内事件
        this.$addAppsEvent('wallet_view')
    },
    onShow () {
        this.$init().then(() => {
            this.getWalletAddress()
        }).catch(() => {
            this.skeletonShow = false
        })
    },
    methods: {
        // 获取钱包地址列表
        getWalletAddress () {
            getWalletAddressList({
                currency: '',
                chainName: ''
            }).then(res => {
                const { data } = res
                this.skeletonShow = false
                this.addressList = data
            }).catch(() => {
                this.skeletonShow = false
            })
        },

        // 删除钱包
        deleteWallet (id) {
            this.$refs['modalDialog'].show({
                content: this.$t('walletAddress.addHint'),
                showCancel: true
            }).then(() => {
                deleteWalletAddress({ id }).then(res => {
                    uni.showToast({
                        title: this.$t('common.handleSuccess'),
                        icon: 'none'
                    })
                    this.addressList = this.addressList.filter(v => v.id !== id)
                }).catch(res => {
                    this.$refs['modalDialog'].show({
                        content: res.msg
                    })
                })
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.address-list {
    margin-top: 30rpx;
    .item {
        @include styles('background-color', 'contentColor');
        @include styles('border-color', 'lineColor');
        width: 690rpx;
        margin: 0 auto 30rpx;
        padding: 0 32rpx;
        border: 1px solid;
        border-radius: 4rpx;
        .above {
            @include styles('border-bottom-color', 'lineColor');
            padding-top: 20rpx;
            border-bottom: 1px solid;
            .info {
                display: flex;
                align-items: center;
                justify-content: space-between;
                .name {
                    font-size: 30rpx;
                }
                .tag {
                    @include styles('color', 'primary');
                    @include styles('background-color', 'primaryAssistColor');
                    max-width: 100rpx;
                    padding: 9rpx 7rpx;
                    padding: 5px 10px;
                    font-size: 20rpx;
                    word-break: break-word;
                    border-radius: 4rpx;
                }
            }
            .code {
                margin: 20rpx 0;
                font-size: 24rpx;
                word-break: break-all;
            }
        }
        .below {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            height: 68rpx;
            .delete {
                @include styles('color', 'minorColor');
                font-size: 26rpx;
            }
        }
    }
}
.footer-btn {
    @include styles('background-color', 'contentColor');
    i {
        margin-right: 5rpx;
    }
}
</style>
