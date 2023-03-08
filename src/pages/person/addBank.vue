<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container'>
            <!-- 头部导航栏 -->
            <nav-bar :title="$t('cRoute.addBank')" />   
            <!-- 内容区域 -->
            <view class='layout-content'>
                <view class='module'>
                    <view class='options' @click='countryVisible = true'>
                        <label>
                            <em>*</em>
                            <span>{{ $t('bank.bankCountry') }}</span>
                        </label>
                        <input v-model='countryName' disabled type='text' />
                        <tui-icon class='arrow' :color='$style.minorColor' name='arrowdown' :size='45' unit='rpx' />
                    </view>
                    <view class='options'>
                        <label>
                            <em>*</em>
                            <span>{{ $t('bank.bankPersonFirstName') }}</span>
                        </label>
                        <input v-model='firstName' :placeholder="$t('common.input') + $t('bank.bankPersonFirstName')" placeholderClass='placeholderClass' type='text' />
                    </view>
                    <view class='options'>
                        <label>
                            <em>*</em>
                            <span>{{ $t('bank.bankPersonLastName') }}</span>
                        </label>
                        <input v-model='lastName' :placeholder="$t('common.input') + $t('bank.bankPersonLastName')" placeholderClass='placeholderClass' type='text' />
                    </view>
                    <view class='options'>
                        <label>
                            <em>*</em>
                            <span>{{ $t('bank.bankAccount') }}</span>
                        </label>
                        <input v-model='bankAccount' :placeholder="$t('bank.inputBankAccount')" placeholderClass='placeholderClass' />
                    </view>
                    <!-- <view class='options'>
                        <span>{{ $t('bank.bankNo') }}</span>
                        <input v-model='bankNo' :placeholder="$t('bank.inputBankNo')" placeholderClass='placeholderClass' type='number' />
                    </view> -->
                    <view class='options' @click='showBankDialog'>
                        <label>
                            <em>*</em>
                            <span>{{ $t('bank.bankName') }}</span>
                        </label>
                        <view v-if='bankName' class='value'>
                            {{ bankName }}
                        </view>
                        <input
                            v-else
                            v-model='bankName'
                            disabled='true'
                            :placeholder="$t('bank.inputBankName')"
                            placeholderClass='placeholderClass'
                            type='text'
                        />
                        <tui-icon class='arrow' :color='$style.minorColor' name='arrowdown' :size='45' unit='rpx' />
                    </view>
                    <view class='options' @click='showCurrencyDialog'>
                        <label>
                            <em>*</em>
                            <span>{{ $t('bank.bankCurrency') }}</span>
                        </label>
                        <input 
                            v-model='currency' 
                            class='currencyInput' 
                            disabled 
                            :placeholder="$t('bank.inputBankCurrency')" 
                            placeholderClass='placeholderClass'
                            type='text'
                        />
                        <tui-icon class='arrow' :color='$style.minorColor' name='arrowdown' :size='45' unit='rpx' />
                    </view>
                    <!-- <view class='options' @click='areaVisible = true'>
                        <span>{{ $t('bank.openAddress') }}</span>
                        <input
                            disabled='true'
                            :placeholder="$t('bank.inputOpenAddressText')"
                            placeholderClass='placeholderClass'
                            type='text'
                            :value='provinceName + cityName'
                        />
                        <tui-icon class='arrow' :color='$style.minorColor' name='arrowdown' :size='45' unit='rpx' />
                    </view>
                    <view class='options'>
                        <span>{{ $t('bank.branchAddress') }}</span>
                        <input v-model='bankArea' :placeholder="$t('bank.inputBranchAddress')" placeholderClass='placeholderClass' type='text' />
                    </view> -->
                    <view class='options'>
                        <label>
                            <span>Swift Code</span>
                        </label>
                        <input v-model='swiftCode' :placeholder="$t('bank.swiftCode')" placeholderClass='placeholderClass' type='text' />
                    </view>
                    <view class='options'>
                        <label>
                            <span>Other Code</span>
                        </label>
                        <input v-model='otherCode' :placeholder="$t('bank.otherCode')" placeholderClass='placeholderClass' type='text' />
                    </view>
                </view>
            </view>
			
            <!-- 底部按钮 -->
            <button class='footer-btn' @click='handleAddBank'>
                {{ $t('common.sure') }}
            </button>
        </view>
		
        <!-- 国家列表弹窗 -->
        <picker-dialog :model-value.sync='countryVisible' @change='changeCountry'>
            <picker-view-column>
                <view v-for='(item, index) in countryList' :key='index' class='item'>
                    {{ item.displayName }}
                </view>
            </picker-view-column>
        </picker-dialog>
        <!-- 银行卡弹窗 -->
        <tui-drawer :visible='visible' @close='closeBankDialog'>
            <scroll-view class='bank-layout' scroll-y='true' style='height: 100%;'>
                <template v-if='bankList.length > 0'>
                    <view v-for='item in bankList' :key='item.id' class='bankItem' @click='chooseBank(item)'>
                        <tui-icon :color='$style.minorColor' name='bankcard-fill' :size='48' unit='rpx' />
                        <span>{{ item.name }}</span>
                    </view>
                </template>
                <none-data v-else :text='$t("bank.bankCountryTip")' />
            </scroll-view>
        </tui-drawer>
        <!-- 银行卡币种弹窗 -->
        <picker-dialog :model-value.sync='currencyVisible' @change='changeCurrency'>
            <picker-view-column>
                <view v-for='(item, index) in currencyList' :key='index' class='item'>
                    {{ item.code }}
                </view>
            </picker-view-column>
        </picker-dialog>
        <!-- 地区弹窗 -->
        <picker-dialog :column='2' :default-value='defaultValue' :model-value.sync='areaVisible' @change='changeArea' @switch='switchArea'>
            <picker-view-column>
                <view v-for='(item, index) in provinceList' :key='index' class='item'>
                    {{ item.displayName }}
                </view>
            </picker-view-column>
            <picker-view-column>
                <view v-for='(item, index) in cityList' :key='index' class='item'>
                    {{ item.displayName }}
                </view>
            </picker-view-column>
        </picker-dialog>
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>	
import store from '@/store'
import { 
    getListByParentCode, 
    getCountryListByParentCode,
    getListByParentId
} from '@/api/base.js'
import { addInternationalBank } from '@/api/user.js'
	
export default {
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,	
            // 是否显示国家列表弹窗
            countryVisible: false,
            // 当前选择的国家code
            countryCode: '', 
            // 国家银行列表数据
            countryBanks: [],
            // 持卡人名
            firstName: '',
            // 持卡人姓
            lastName: '',
            // 银行账号
            bankAccount: '',
            // 银行卡号
            bankNo: '',
            // 银行名称
            bankName: '',
            // 银行卡币种
            currency: '',
            // 支行地址
            bankArea: '',
            // 所有国家银行卡币种列表
            allCurrencyList: [],
            // 是否显示银行卡币种弹窗
            currencyVisible: false,
            // 当前选择国家的银行卡币种列表
            currencyList: [], 
            // 是否显示银行卡弹窗
            visible: false,
            // 银行卡列表
            bankList: [],
            // 选择的银行卡 
            selectedBank: null,
            // 是否显示地区弹窗
            areaVisible: false,
            // 默认地区索引
            defaultValue: [0, 0],
            // 省列表
            provinceList: [],
            // 当前选择的省
            provinceName: '',
            // 当前市列表
            cityList: [],
            // 当前选择的城市
            cityName: '',
            // swiftCode
            swiftCode: '',
            // otherCode
            otherCode: '',
            // 是否从提现页面进入
            isWithdraw: false
        }
    },
    computed: {
        // 国家列表
        countryList () {
            return store.state.countryList
        },
        // 当前选择的国家名称
        countryName () {
            const item = this.countryList.find(el => el.code === this.countryCode)
            return item?.displayName || ''
        }
    },
    onLoad (options) {
        this.isWithdraw = options.isWithdraw || false
		
        this.$init().then(() => {
            this.skeletonShow = false
            this.countryCode = this.customerInfo.country
            // 获取国家银行列表数据
            this.getCountryBanks()
            // 获取所有国家银行卡币种数据
            this.getCountryCurrencys()
            // 获取地区数据
            // this.getProvinceList(this.customerInfo.country)
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('bank_add_view')
    },
    methods: {	
        // 获取所有国家银行卡币种数据
        getCountryCurrencys () {
            getListByParentCode({ parentCode: 'common_currency' }).then(res => {
                const { data } = res
                if (data && data.length > 0) {
                    this.allCurrencyList = data
                    // 获取当前选择的国家银行卡币种数据
                    this.getCurrencyList()
                }
            })
        },
		
        // 获取当前选择的国家银行卡币种数据
        getCurrencyList () {
            const item = this.allCurrencyList.find(el => el.code === (this.countryCode + '_currency'))
            if (item) {
                getListByParentId({
                    parentId: item.id
                }).then(res => {
                    this.currencyList = res.data || []
                    if (res.data.length === 1) {
                        this.currency = res.data[0].code
                    }
                })
            } else {
                this.currencyList = []
                this.currency = ''
            }
        },
		
        // 获取所有国家银行卡列表数据
        getCountryBanks () {
            getListByParentCode({ parentCode: 'common_bank_list' }).then(res => {
                const { data } = res
                if (data && data.length > 0) {
                    this.countryBanks = res.data
                    // 获取当前选择的国家银行列表数据
                    this.getBankList()
                }
            })
        },
		
        // 获取当前选择的国家银行列表数据
        getBankList () {
            const item = this.countryBanks.find(el => el.code === (this.countryCode + '_bank'))
            if (item) {
                getListByParentId({
                    parentId: item.id
                }).then(res => {
                    this.bankName = ''
                    this.selectedBank = null
                    this.bankList = res.data || []
                })
            } else {
                this.bankName = ''
                this.selectedBank = null
                this.bankList = []
            }
        },
		
        // 获取省数据
        getProvinceList (parentCode) {
            getCountryListByParentCode({ parentCode }).then(res => {
                if (res.data.length > 0) {
                    this.provinceList = res.data
                    // 获取城市数据
                    this.getCityList(res.data[0].code)
                }
            })
        },
		
        // 获取城市数据
        getCityList (parentCode) {
            getCountryListByParentCode({ parentCode }).then(res => {
                this.cityList = res.data
            })
        },
		
        // 切换国家
        changeCountry (value) {
            this.countryCode = this.countryList[value].code
            this.getBankList()
            this.getCurrencyList()
        },
		
        // 显示银行卡弹窗
        showBankDialog () {
            if (this.bankList.length === 0) {
                return this.$toast(this.$t('bank.bankCountryTip'))
            }
            this.visible = true
        },
		
        // 关闭银行卡弹窗
        closeBankDialog () {
            this.visible = false
        },
		
        // 选择银行卡
        chooseBank (bank) {
            this.selectedBank = bank
            this.bankName = bank.name
            this.visible = false
        },
		
        // 显示银行卡币种弹窗
        showCurrencyDialog () {
            if (this.currencyList.length === 0) {
                return this.$toast(this.$t('bank.bankCountryTip'))
            }
            this.currencyVisible = true
        },
		
        // 改变账户币种
        changeCurrency (value) {
            this.currency = this.currencyList[value].code
        },
		
        // 切换地区
        switchArea (values) {
            // 切换省份重新获取城市数据并设置索引为0
            if (values[0] !== this.defaultValue[0]) {
                const code = this.provinceList[values[0]].code
                this.defaultValue = [values[0], 0]
                this.getCityList(code)
            }
        },
		
        // 改变地区 
        changeArea (values) {
            this.provinceName = this.provinceList[values[0]].displayName
            this.cityName = this.cityList[values[1]].displayName
        },
		
        // 确定添加银行卡
        handleAddBank () {
            // 提交验证
            if (!this.firstName) {
                return uni.showToast({
                    title: this.$t('common.input') + this.$t('bank.bankPersonFirstName'),
                    icon: 'none'
                })
            }
            if (!this.lastName) {
                return uni.showToast({
                    title: this.$t('common.input') + this.$t('bank.bankPersonLastName'),
                    icon: 'none'
                })
            }
            if (!this.bankAccount) {
                return uni.showToast({
                    title: this.$t('bank.inputBankAccount'),
                    icon: 'none'
                })
            }
            if (!this.bankName) {
                return uni.showToast({
                    title: this.$t('bank.inputBankName'),
                    icon: 'none'
                })
            }
            if (!this.currency) {
                return uni.showToast({
                    title: this.$t('bank.inputBankCurrency'),
                    icon: 'none'
                })
            }
            
            // 发起api请求
            uni.showLoading({
                title: this.$t('common.submiting'),
                mask: true
            })
            addInternationalBank({
                firstName: this.firstName,
                lastName: this.lastName,
                bankCurrency: this.currency,
                bankName: this.bankName,
                bankCode: this.selectedBank.code,
                bankAccount: this.bankAccount,
                swiftCode: this.swiftCode,
                otherCode: this.otherCode
            }).then(res => {
                uni.hideLoading()
                // 更新提现页面银行卡列表数据
                if (this.isWithdraw) {
                    const pages = getCurrentPages()
                    const vm = pages[pages.length - 2]['$vm']
                    vm.queryBankList()
                }
                this.$refs['modalDialog'].show({
                    content: this.$t('bank.submitSuccessTips')
                }).then(() => {
                    // 返回上一页
                    uni.navigateBack({
                        delta: 1
                    })
                })
            }).catch(res => {
                uni.hideLoading()
                this.$refs['modalDialog'].show({
                    content: res.msg
                })
            })
        }
    }
}
</script>

<style lang="scss" scoped>
::v-deep {
	.tui-drawer-mask {
		z-index: 9998 !important;
	}
}
::v-deep {
	.tui-drawer-container {
		z-index: 9999 !important;
	}
}
.layout-content {
	@include styles('background-color', 'bgColor');
}
.module {
	@include styles('background-color', 'contentColor');
	@include styles('border-top-color', 'lineColor');
	padding: 0 32rpx;
	border-top-style: solid;
	border-top-width: 1rpx;
}
.options {
	@include styles('border-bottom-color', 'lineColor');
	display: flex;
	align-items: center;
	height: 90rpx;
	border-bottom-width: 1rpx;
	border-bottom-style: solid;
	label {
		display: inline-flex;
		align-items: center;
		width: 240rpx;
		em {
			margin-right: 10rpx;
			color: red;
		}
		span {
			@include styles('color','normalColor');
		}
	}
	input, .value {
		@include styles('color', 'color');
		flex: 1;
	}
	.arrow {
		margin-left: 10rpx !important;
	}
}
.bank-layout {
	width: 600rpx;
	padding: 60rpx 0 32rpx;
	.bankItem {
		@include styles('border-bottom-color', 'lineColor');
		@include styles('color', 'color');
		display: flex;
		align-items: center;
		height: 90rpx;
		padding: 0 30rpx;
		border-bottom-width: 1px;
		border-bottom-style: solid;
		.icon {
			width: 40rpx;
			height: 40rpx;
		}
		span {
			margin-left: 20rpx;
		}
	}
}
.footer-btn {
	@include styles('background-color', 'contentColor');
}
</style>
