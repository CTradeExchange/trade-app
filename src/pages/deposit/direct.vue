<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='layout-container'>
            <!-- 头部导航栏 -->
            <nav-bar :title="$t('cRoute.deposit')" />
            <!-- 内容区域 -->
            <view class='layout-content'>
                <view class='module'>
                    <view class='currency-info'>
                        <image :src="'/static/image/currency_icon/' + currency + '.png'" />
                        <p class='name'>
                            {{ currency }}
                        </p>
                        <p class='des'>
                            {{ assetsMap[currency] }}
                        </p>
                    </view>
                    <scroll-view class='chain-scroll' :scroll-into-view="'scroll-' + currentIndex" scroll-with-animation scroll-x>
                        <view class='chain-list'>
                            <view v-for='(item, index) in chainList' :id="'scroll-' + index" :key='index' :class="['item', { 'active': item === chainName }]" @click='selectChain(item, index)'>
                                <view class='check'>
                                    <tui-icon class='tick' name='check' :size='24' unit='rpx' />
                                </view>
                                <span class='name'>
                                    {{ item }}
                                </span>
                            </view>
                        </view>
                    </scroll-view>
                    <view class='qr-code'>
                        <!-- 有地址 -->
                        <uqrcode v-if='address' ref='uQRCode' :size='150' :text='address' />
                        <!-- 无地址 -->
                        <view v-else class='none-address'>
                            <image src='/static/image/icon/code.png' />
                            <view class='mask'>
                                <button v-if='showGet' class='get' @click='applyBindAddress'>
                                    {{ $t('deposit.getAddress') }}
                                </button>
                            </view>
                        </view>
                    </view>
                    <view class='min'>
                        {{ $t('deposit.minAmount') }} {{ paymentInfo.singleLowAmount }} {{ currency }}
                    </view>
                    <!-- 有地址 -->
                    <view v-if='address' class='address-box'>
                        <view class='text'>
                            {{ address }}
                        </view>
                        <button id='copy' class='copy' @click='copyAddress'>
                            {{ $t('common.copy') }}
                        </button>
                    </view>
                </view>
                <view class='warn-box'>
                    <view class='title'>
                        {{ $t('common.warning') }}
                    </view>
                    <view class='des'>
                        {{ $t('deposit.directTip') }}
                    </view>
                </view>
            </view>
		
            <!-- 提示弹窗 -->
            <modal-dialog ref='modalDialog' />
            <!-- 通知弹窗 -->
            <notice-dialog ref='noticeDialog' />
        </view>
    </view>
</template>

<script>
// api
import { getCryptoBlockchainInfo, getBindRechargeAddress, applyRechargeBindAddress } from '@/api/user'
// utils
import { localGet } from '@/utils/util'
import { assetsMap } from '@/utils/enum'
	
export default {
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 请求参数
            params: {},
            // 资产数据
            assetsMap,
            // 货币
            currency: '',
            // 账户id
            accountId: '',
            // 链名称列表
            chainList: [],
            // 当前选中链名称
            chainName: '',
            // 当前链名称下标
            currentIndex: 0,
            // 充值地址
            address: '',
            // 支付通道信息
            paymentInfo: JSON.parse(localGet('paymentInfo')),
            // 是否显示获取地址按钮
            showGet: false,
            // 是否可获取地址
            isGet: true
        }
    },
    onLoad (options) {
        this.currency = options.currency
        this.accountId = options.accountId
		
        // 初始化
        this.$init().then(() => {
            this.skeletonShow = false
            // 设置请求参数
            this.setParams()
            // 获取直充支付通道支持币种信息
            this.getChainInfo()
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('deposit_direct_view')
    },
    methods: {
        // 跳转到充值记录页面
        onLink () {
            uni.navigateTo({
                url: '/pages/deposit/record'
            })
        },
		
        // 设置请求参数
        setParams () {
            this.params = {
                companyId: this.customerInfo.companyId,
                customerNo: this.customerInfo.customerNo,
                customerGroupId: this.customerInfo.customerGroupId,
                country: this.customerInfo.country,
                accountCurrency: this.currency,
                paymentChannelClientType: 'mobile',
                paymentChannelCode: this.paymentInfo.paymentCode,
                paymentChannelType: this.paymentInfo.paymentType,
                paymentMerchantNo: this.paymentInfo.merchantNo
            }
        },
		
        // 获取直充支付通道支持币种信息
        getChainInfo () {
            getCryptoBlockchainInfo({
                currency: this.currency,
                paymentCode: this.paymentInfo.paymentCode
            }).then(res => {
                this.chainList = res.data.blockchainList 
                if (this.chainList.length > 0) {
                    this.currentIndex = 0
                    this.chainName = this.chainList[0]
                    this.getRechargeAddress()
                }
            })
        },
		
        // 获取直充支付钱包地址
        getRechargeAddress () {
            if (this.isGet) {
                this.isGet = false
                this.params.blockchainName = this.chainName
                getBindRechargeAddress(this.params).then(res => {
                    this.isGet = true
                    this.address = res.data.address
                    this.showGet = false
                }).catch(() => {
                    this.isGet = true 
                    this.address = ''
                    this.showGet = true
                })
            }
        },

        // 申请绑定直充支付钱包地址
        applyBindAddress () {
            if (this.isGet) {
                this.isGet = false
                this.params.blockchainName = this.chainName
                applyRechargeBindAddress(this.params).then(res => {
                    this.isGet = true
                    this.address = res.data.address
                }).catch(res => {
                    this.isGet = true
                    this.$toast(res.msg)
                })
            }
        },

        // 选择链名称
        selectChain (value, index) {
            if (this.chainName !== value) {
                this.chainName = value
                this.currentIndex = index
                // 获取直充支付钱包地址
                this.getRechargeAddress()
            }
        },
		
        // 复制地址 
        copyAddress () {
            uni.setClipboardData({
                data: this.address,
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
::v-deep .nav-title-bar {
	@include styles('background', 'bgColor');
}
.layout-content {
	padding: 0 30rpx;
}
.module {
	@include styles('background', 'contentColor');
    min-height: 780rpx;
    margin-top: 80rpx;
    padding: 0 30rpx 35rpx;
    border-radius: 10rpx;
	.currency-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		image {
			width: 96rpx;
			height: 96rpx;
			margin-top: -48rpx;
		}
		.name {
			@include styles('color', 'color');
			line-height: 1;
			margin-top: 20rpx;
			font-size: 40rpx;
            word-break: break-word;
		}
		.des {
			@include styles('color', 'minorColor');
			line-height: 1;
			margin-top: 5rpx;
			font-size: 28rpx;
		}
	}
	.chain-list {
		display: flex;
		margin-top: 50rpx;
		padding-bottom: 30rpx;
		.item {
			@include styles('background', 'assistColor');
			display: flex;
            flex: 1;
			justify-content: center;
			align-items: center;
			padding: 0 25rpx;
			height: 80rpx;
			margin-left: 20rpx;
			border: 1px solid transparent;
			border-radius: 10rpx;
			position: relative;
            align-items: center;
            text-align: center;
            &:first-child{
                margin-left: 0;
            }
			.check {
				display: none;
			}
			.name {
				@include styles('color', 'color');
				font-size: 26rpx;
                word-wrap: break-word;
			}
		}
		.active {
			@include styles('background', 'primarybg');
			@include styles('border-color', 'primary');
			.check {
				@include styles('background', 'primary');
			    display: flex;
			    justify-content: center;
			    align-items: center;
			    width: 30rpx;
			    height: 30rpx;
			    border-radius: 0 10rpx 0 10rpx;
			    position: absolute;
			    top: -1px;
			    right: -1px;
				.tick {
					color: #fff !important;
				}
			}
		}
	}
	.qr-code {
		display: flex;
		justify-content: centrer;
		width: 150px;
		height: 150px;
		margin: 50rpx auto 0;
		position: relative;
		image {
			width: 100%;
			height: 100%;
			position: absolute;
			top: 0;
			left: 0;
		}
		.none-address {
			image {
				opacity: .2;
			}
			.mask {
				display: flex;
				justify-content: center;
				align-items: center;
				width: 100%;
				height: 100%;
				position: absolute;
				top: 0;
				left: 0;
				.get {
					@include styles('background', 'primary');
					display: flex;
					justify-content: center;
					align-items: center;
					width: 260rpx;
					height: 88rpx;
					font-size: 30rpx;
					color: #fff;
					border-radius: 10rpx;
				}
			}
		}
	}
	.address-box {
		@include styles('background', 'assistColor');
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 25rpx;
		border-radius: 10rpx;
		.text {
			@include styles('color', 'color');
			text-align: center;
			line-height: 32rpx;
			word-break: break-all;
			font-size: 26rpx;
		}
		.copy {
			@include styles('color', 'primary');
			margin-top: 16rpx;
			font-size: 28rpx;
			font-weight: bold;
			background: none;
		}
	}
}
.min {
    @include styles('color', 'primary');
    margin: 30rpx 0;
    font-size: 26rpx;
    text-align: center;
}
.warn-box {
	@include styles('border-color', 'warn');
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1.4;
    margin: 30rpx;
    padding: 32rpx 25rpx;
    background: rgba(246, 0, 0, 0.05);
    border-style: solid;
	border-width: 1rpx;
    border-radius: 10rpx;
    .title {
		@include styles('color', 'warn');
        font-size: 40rpx;
        margin-bottom: 24rpx;
    }
    .des {
		@include styles('color', 'color');
        font-size: 24rpx;
    }
}
</style>
