<template>
    <view class='numberbox'>
        <view class='numbox-icon' @click='onReduce'>
            <tui-icon :class="{ 'icon-reduce': true, 'disabled-icon': disabled || parseFloat(inputValue) <= parseFloat(min) }" name='reduce' />
        </view>
        <input
            v-model='inputValue'
            class='num-input'
            :disabled='disabled'
            :placeholder="placeholder || $t('common.noSet')"
            placeholder-class='placeholderClass'
            type='digit'
            @blur='onBlur'
            @input='onInput'
        />
        <view class='numbox-icon' @click='onPlus'>
            <tui-icon :class="{ 'icon-plus': true, 'disabled-icon': disabled || parseFloat(inputValue) >= parseFloat(max) }" name='plus' />
        </view>
    </view>
</template>

<script>
// utils
import { isEmpty } from '@/utils/util.js'
import { plus, minus, toFixed, div } from '@/utils/calculation.js'
	
export default {
    props: {
        // 默认值
        modelValue: {
            type: [Number, String],
            default: ''
        },
        // 最小值
        min: {
            type: [Number, String],
            default: 0
        },
        // 最大值
        max: {
            type: [Number, String],
            default: 9999999
        },
        // 迈步大小 1 1.1 10...
        step: {
            type: [Number, String],
            default: 1
        },
        // 保留的小数位
        digits: {
            type: [Number, String],
            default: ''
        },
        // 输入框提示文字 
        placeholder: {
            type: String,
            default: ''
        },
        // 是否禁用操作
        disabled: {
            type: Boolean,
            default: false
        },
        // 索引值，列表中使用
        index: {
            type: [Number, String],
            default: 0
        },
        // 是否第一次改变数据
        first: {
            type: Boolean,
            default: true
        }
    },
    data () {
        return {
            // 输入的值
            inputValue: ''
        }
    },
    watch: {
        // 监听modelValue
        modelValue: {
            handler () {
                if (this.inputValue !== this.modelValue) {
                    this.inputValue = this.modelValue
                }
            },
            immediate: true
        }
    },
    methods: {
        // 点击减号
        onReduce () {
            if (this.first && isEmpty(this.inputValue)) {
                this.firstChange()
                return
            }
            if (this.disabled || parseFloat(this.inputValue) <= parseFloat(this.min) || this.inputValue === '') return
            this.inputValue = minus(this.inputValue, this.step)
            this.onBlur()
        },
		
        // 点击加号
        onPlus () {
            if (this.first && isEmpty(this.inputValue)) {
                this.firstChange()
                return
            }
            if (this.disabled || parseFloat(this.inputValue) >= parseFloat(this.max)) return
            this.inputValue = plus(this.inputValue, this.step)
            this.onBlur()
        },
		
        // 输入数字
        onInput () {
            this.$emit('update:modelValue', this.inputValue)
        },
		
        // 输入框失去焦点
        onBlur () {
            let value = this.inputValue
            if (this.digits !== '' && value !== '') value = toFixed(value, this.digits) 
            this.inputValue = value
            this.$emit('update:modelValue', value)
        },
		
        // 第一次改变数据
        firstChange () {
            const sumVal = plus(this.max, this.min)
            const val = div(sumVal, 2) 
            const digits = this.digits
            const valFixed = toFixed(val, digits)
            this.inputValue = valFixed
            this.$emit('update:modelValue', valFixed)
        }
    }
}
</script>

<style lang="scss" scoped>
.numberbox {
	@include styles('background', 'assistColor');
	display: flex;
	align-items: center;
	height: 80rpx;
}
.numbox-icon {
	display: inline-flex;
	justify-content: center;
	align-items: center;
	width: 80rpx;
	height: 80rpx;
}
.icon-reduce, .icon-plus {
	@include styles('color', 'color');
	font-size: 32rpx !important;
	font-weight: bold !important;
}
.disabled-icon {
	opacity: .3;
}
.num-input {
	@include styles('color', 'color');
	width: 240rpx;
	height: 100%;
	text-align: center;
	font-size: 28rpx;
}
</style>
