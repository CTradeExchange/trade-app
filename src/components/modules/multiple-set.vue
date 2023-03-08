<template>
    <view>
        <tui-bottom-popup :background-color='$style.contentColor' class='custom-popup' :radius='false' :show='show' @close='close'>
            <view class='multipleSet'>
                <view v-show='warn' class='warnRangeTip'>
                    {{ $t('trade.unRangeMultilpe') }}
                </view>
                <view class='header'>
                    <view class='header-title'>
                        {{ $t('trade.multilpSetting') }}
                    </view>
                    <tui-icon name='shut' :size='26' @click='close' />
                </view>
                <view class='body'>
                    <template v-if="marginInfo.type === '2'">
                        <number-box
                            class='stepper'
                            :digits='0'
                            :max='Number(multipleRange[1])'
                            :min='Number(multipleRange[0])'
                            :model-value.sync='multipleValue'
                            :step='1'
                        />
                        <view class='multipleRange'>
                            {{ $t('trade.multilpRange') }}{{ multipleRange[0] }}x - {{ multipleRange[1] }}x
                        </view>
                    </template>
                    <template v-else>
                        <view class='multipleVal'>
                            {{ multipleValue }}x
                        </view>
                        <ul class='multipleList'>
                            <li v-for='item in multipleList' :key='item' class='item' :class='{ active:multipleValue===item }' @click='multipleValue = item'>
                                {{ item }}x
                            </li>
                        </ul>
                    </template>

                    <div class='warnTip'>
                        <p class='t1'>
                            {{ $t('riskLevel.warn') }}
                        </p>
                        <p class='t2'>
                            {{ $t('trade.multilpSettingTip1') }}
                        </p>
                    </div>
                </view>

                <tui-button
                    block
                    class='save-btn' 
                    type='primary' 
                    @click='saveClick'
                >
                    {{ $t('trade.saveSetting') }}
                </tui-button>
            </view>
        </tui-bottom-popup>
		
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
    </view>
</template>

<script>
import store from '@/store'
import { updateCrossLevelNum } from '@/api/trade'
export default {
    props: {
        // 是否显示弹窗
        show: {
            type: Boolean,
            default: false
        },
        // 默认杠杆倍数
        multipleVal: {
            type: [String, Number],
            default: ''
        },
        // 产品
        product: {
            type: Object,
            default: () => ({})
        },
        // 是否为当前持仓
        position: {
            type: [String, Object],
            default: ''
        }
    },
    data () {
        return {
            // 输入框杠杆倍数
            multipleValue: ''
        }
    },
    computed: {
        marginInfo () {
            return this.product.marginInfo
        },
        accountInfo () {
            return store.state._user.customerInfo?.accountList?.find(el => el.tradeType === this.product.tradeType)
        },
        multipleRange () {
            if (this.position) {
                return this.position.adjustCrossLevel.split('-')
            } else {
                return this.marginInfo?.type === '2' ? this.marginInfo.values.split('-') : []
            }
        },
        // 杠杆倍数固定列表
        multipleList () {
            return this.marginInfo?.type === '3' ? this.marginInfo.values.split(',') : []
        },
        // 杠杆倍数范围
        warn () {
            if (this.marginInfo.type !== '2') return false
            if (Number(this.multipleValue) < this.multipleRange[0]) {
                return true
            } else if (Number(this.multipleValue) > this.multipleRange[1]) {
                return true
            } else {
                return false
            }
        }
    },
    watch: {
        // 监听multipleVal
        multipleVal: {
            handler () {
                if (this.multipleVal) {
                    this.multipleValue = this.multipleVal
                } else {
                    this.setMultipleVal()
                } 
            },
            immediate: true
        }
    },
    methods: {
        // 关闭杠杆弹窗
        close () {
            this.multipleValue = this.multipleVal
            this.$emit('update:show', false)
        },
		
        // 设置杠杆倍数
        setMultipleVal () {
            if (this.marginInfo?.type === '2') {
                this.$emit('update:multipleVal', this.multipleRange[0])
            } 
            if (this.marginInfo?.type === '3') {
                const val = this.multipleList[0]
                this.$emit('update:multipleVal', val)
            }
        },
		
        // 保存设置 
        saveClick () {
            if (this.warn) {
                return false
            }
            Promise.resolve().then(() => {
                if (this.position) {
                    return this.savePosition(this.multipleValue)
                }
                return true
            }).then((result) => {
                if (result) {
                    this.$emit('update:multipleVal', this.multipleValue)
                    this.$emit('update:show', false)
                }
            })
        },
		
        // 修改仓位杠杆倍数
        savePosition (val) {
            uni.showLoading({
                title: this.$t('common.submiting'),
                mask: true
            })
            updateCrossLevelNum({
                positionId: this.position.positionId,
                symbolId: this.product.symbolId,
                orderId: this.position.orderId,
                tradeType: this.position.tradeType,
                accountDigits: this.accountInfo.digits,
                accountId: this.accountInfo.accountId,
                crossLevelNum: parseInt(val),
            }).then(res => {
                uni.hideLoading()
                this.$emit('update:show', false)
                this.$toast(this.$t('trade.modifySuccess'))
                this.$store.dispatch('_trade/queryPositionPage', { tradeType: this.position.tradeType })
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
::v-deep .custom-popup .tui-bottom-popup{
    border-top-left-radius: 20rpx;
    border-top-right-radius: 20rpx;
}
.stepper{
    ::v-deep .num-input{
        flex: 1;
    }
}
.multipleSet{
    position: relative;
    padding: 0 30rpx;
	height: calc(100vh - 400rpx);
    .warnRangeTip{
		@include flexAll;
		@include styles('color', 'warn');
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 60rpx;
		background-color: #FFF0E2;
		transform: translateY(-100%);
    }
    .body{
        padding: 10rpx 0 30rpx;
    }
    .stepper{
        @include styles('background', 'bgColor');
        display: flex;
        :deep(.input){
            flex: 1;
        }
    }
    .multipleRange{
        margin-top: 20rpx;
        @include styles('color', 'minorColor');
    }
    .multipleVal{
        text-align: center;
        height: 80rpx;
        line-height: 80rpx;
        font-size: 28rpx;
        @include styles('background', 'bgColor');
        @include styles('color', 'color');
    }
    .multipleList{
        margin-top: 20rpx;
        display: flex;
        justify-content: flex-start;
        text-align: center;
        font-size: 24rpx;
        @include styles('color', 'color');
        .item{
            margin-right: 10px;
            width: 96rpx;
            height: 40rpx;
            line-height: 40rpx;
            @include styles('background', 'bgColor');
            &.active{
                @include styles('color', 'primary');
                @include styles('background', 'primaryAssistColor');
            }
        }
    }
	.save-btn {
		@include styles('background', 'primary');
	}
    .warnTip{
        margin-top: 90rpx;
        padding: 15rpx 0;
        font-size: 24rpx;
        background: #FEF6F7;
        background: rgba(183, 33, 34, 0.05);
        border: 2rpx solid #000;
        border-radius: 6px;
        padding:40rpx;
        text-align: center;
        @include styles('color', 'warn');
        @include styles('border-color', 'warn');
        .t1{
            margin-bottom: 20rpx;
            font-size: 40rpx;
            font-weight: bold;
            @include styles('color', 'warn');
        }
        .t2{
            @include styles('color', 'color');
        }
    }
}
</style>
