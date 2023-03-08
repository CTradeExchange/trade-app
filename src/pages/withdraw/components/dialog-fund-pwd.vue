<template>
    <tui-bottom-popup
        background-color='transparent'
        :mask-z-index='9'
        :radius='false'
        :show='show'
        z-index='9'
        @close='close'
    >
        <view class='fund-select'>
            <view class='fund-content'>
                <view class='fund-header'>
                    <view class='title'>
                        {{ $t('common.fundPwd') }}
                    </view>
                    <tui-icon class='close' name='shut' :size='40' unit='rpx' @click='close' />
                </view>
                <view class='box'>
                    <input
                        v-if='pwdVis'
                        v-model='pwd'
                        class='fund-input'
                        maxlength='6'
                        :placeholder="$t('common.inputFundPwd')"
                        placeholder-class='placeholderClass'
                        type='password'
                        @blur='((e,name)=>{handleInput(e,"pwd")})'
                    />
                    <input
                        v-else
                        v-model='pwd'
                        class='fund-input'
                        :placeholder="$t('common.inputFundPwd')"
                        placeholder-class='placeholderClass'
                        type='text'
                        @blur='((e,name)=>{handleInput(e,"pwd")})'
                    />
                    <tui-icon :name='!pwdVis ? "seen" : "unseen"' :size='20' @click='changeState("pwdVis")' />
                </view>
                <view class='pwd-oper'>
                    <view v-if='Number(customerInfo.assertPassStatus) === 1' class='href' @click="$method.goView('/pages/mine/setFundPwd?isBack=true')">
                        {{ $t('login.goSet') }}
                    </view>
                    <view v-else class='href' @click="$method.goView('/pages/mine/forgetFundPwd?type=fund')">
                        {{ $t('login.forgotFundPwd') }}
                    </view>
                </view>
                <view v-if='googleCodeVis' class='google-code'>
                    <google-code ref='googleVerifyCodeComp' @clear='clear' @getGooleVerifyCode='getGooleVerifyCode' />
                </view>
            </view>
            <view class='add-fund' @click='confirmFundPwd'>
                <span>{{ $t('common.sure') }}</span>
            </view>
        </view>
    </tui-bottom-popup>
</template>

<script>
import store from '@/store/index.js'
export default {
    props: {
        // 是否显示弹窗
        show: {
            type: Boolean,
            default: false
        },
        // 列表数据
        list: {
            type: Array,
            default: () => []
        },
        // 选择的银行卡id
        bankId: {
            type: [Number, String],
            default: 0
        },
        // 到账币种
        currency: {
            type: String,
            default: ''
        }
    },
    data () {
        return {
            pwdVis: true,
            pwd: '',
            googleCode: ''
        }
    },
    watch: {
        show (val) {
            if (!val) {
                this.pwd = ''
                if (this.$refs.googleVerifyCodeComp) this.$refs.googleVerifyCodeComp.clear()
            }
        }
    },
    methods: {
        // 关闭弹窗
        close () {
            if (this.$refs.googleVerifyCodeComp) this.$refs.googleVerifyCodeComp.clear()
            this.pwd = ''
            this.googleCode = ''

            this.$emit('close')
        },
        handleInput (e, type) {
            this[type] = e.target.value.replace(/[^\d]/g, '')
        },

        confirmFundPwd () {
            if (!this.pwd) {
                return uni.showToast({
                    title: this.$t('common.inputFundPwd'),
                    icon: 'none'
                })
            }

            if (this.googleCodeVis && !this.googleCode) {
                return uni.showToast({
                    title: this.$t('common.inputGoogleCode'),
                    icon: 'none' 
                }) 
            }

            this.$emit('confirmWithdraw', { pwd: this.pwd, googleCode: this.googleCode })
        },
        changeState (type) {
            this[type] = !this[type]
        },
        getGooleVerifyCode (val) {
            this.googleCode = val
        }
    }
}
</script>

<style lang="scss" scoped>
.fund-select {
    @include styles('background-color', 'contentColor');
	display: flex;
	flex-direction: column;
	min-height: 600rpx;
	border-radius: 20rpx 20rpx 0 0;
    .box {
        @include styles('border-color', 'lineColor');
        display: flex;
        justify-content: space-between;
        margin: 50rpx 20rpx 0;
        padding-bottom: 20rpx;
        border-bottom: solid 1px #DDD;
        .fund-input {
			@include styles('color', 'color');
            width: 80%;
			font-size: 32rpx;
        }
    }
    .pwd-oper {
        @include styles('color', 'primary');
        margin-top: 20rpx;
        margin-bottom: 40rpx;
        padding-right: 30rpx;
        text-align: right;
        .href {
            display: inline;
            font-size: 26rpx;
        }
    }
    .google-code {
        margin: 20rpx 0 60rpx;
        padding: 0 30rpx;
    }
}
.fund-content {
	flex: 1;
}
.fund-header {
    @include flexAll;
    position: relative;
    .title {
        @include flexAll;
        @include styles('color', 'color');
        height: 90rpx;
        font-size: 34rpx;
    }
    .close {
        @include styles('color', 'color');
        position: absolute;
        right: 30rpx;
    }
}
.fund-list {
    padding: 0 30rpx;
    .item {
        @include styles('border-bottom-color', 'lineColor');
        display: flex;
        align-items: center;
        padding: 30rpx 0;
        border-bottom-width: 1px;
        border-bottom-style: solid;
        &:nth-of-type(1) {
            @include styles('border-top-color', 'lineColor');
            border-top-width: 1px;
            border-top-style: solid;
        }
        .icon {
            width: 45rpx;
            height: 45rpx;
            margin-right: 15rpx;
        }
        .text {
            flex: 1;
            .row {
                display: flex;
                align-items: center;
                font-size: 26rpx;
                line-height: 1;
                .name {
                    margin-right: 12rpx;
                }
            }
            .tip {
                margin-top: 5rpx;
                font-size: 24rpx;
            }
        }
        .check {
            @include styles('color', 'success');
            margin-right: 10rpx;
        }
    }
    .disable-item {
        @include styles('color', 'minorColor');
    }
}
.add-fund {
    @include styles('background-color', 'primary');
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100rpx;
    padding: 0 30rpx;
    color: #FFF;
}
</style>
