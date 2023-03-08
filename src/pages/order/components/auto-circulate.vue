<template>
    <radio-group>
        <view class='auto-circulate'>
            <view class='item'>
                <label @click='radioClick(2)'>
                    <radio :checked='modelValue === 2' :color='$style.primary' />
                    <span>{{ $t('trade.autoLoan') }}</span>
                </label>
                <tui-icon class='explain' name='explain' :size='34' unit='rpx' @click="showExplain($t('trade.availableLoanContent3', [dailyInterest]))" />
            </view>
            <!-- <view class='item'>
                <label @click='radioClick(3)'>
                    <radio :checked='modelValue === 3' :color='$style.primary' modelValue='3' />
                    <span>{{$t('trade.autoRepayment')}}</span>
                </label>
                <tui-icon class='explain' name='explain' :size='34' unit='rpx' @click="showExplain($t('trade.availableLoanContent6'))" />
            </view> -->
        </view>
		
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialg' />
    </radio-group>
</template>

<script>
// utils
import { mul } from '@/utils/calculation.js'
	
export default {
    props: {
        // 类型
        modelValue: {
            type: Number,
            default: 2
        },
        // 产品信息
        product: {
            type: Object,
            default: () => {}
        },
        // 账户信息
        account: {
            type: [Object, String],
            default: () => {}
        }
    },
    computed: {
        // 日利率
        dailyInterest () {
            const assetsId = this.account?.assetsId
            const interest = this.product?.borrowInterestList?.find(item => Number(item.assetsId) === Number(assetsId))?.value
            return interest ? mul(interest, 100) + '%' : '--'
        }
    },
    methods: {
        // 点击单选
        radioClick (value) {
            if (this.modelValue === Number(value)) {
                this.$emit('update:modelValue', 1)
            } else {
                this.$emit('update:modelValue', Number(value))
            }
        },
		
        // 显示说明内容
        showExplain (content) {
            this.$refs['modalDialg'].show({
                content
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.auto-circulate {
	@include flexAlign;
	.item {
		@include flexAlign;
		flex: 1;
		font-size: 26rpx;
		span {
			@include styles('color', 'minorColor');
			margin-right: 10rpx;
		}
		.explain {
			@include styles('color', 'minorColor');
		}
	}
}
</style>
