<template>
    <view class='cell-type'>
        <view class='title'>
            {{ title }}
        </view>
        <view class='handle'>
            <block v-for='(item, index) in list' :key='index'>
                <view :class="{ 'btn': true, 'active': item.val === modelValue }" @click='changeType(item)'>
                    {{ item.title }}
                </view>
            </block>
        </view>
    </view>
</template>

<script>
export default {
    props: {
        // 类型
        modelValue: {
            type: Number,
            default: 0
        },
        // 标题
        title: {
            type: String,
            default: ''
        },
        // 列表
        list: {
            type: Array,
            default: () => []
        }
    },
    methods: {
        // 改变类型
        changeType (item) {
            if (item.val !== this.type) {
                this.$emit('update:modelValue', item.val)
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.cell-type {
	@include flexBetweenAlign;
	.title {
		font-size: 26rpx;
	}
	.handle {
		@include flex;
		.btn {
			@include flexAll;
			@include styles('background-color', 'assistColor');
			width: 80rpx;
			height: 50rpx;
			margin-left: 20rpx;
			font-size: 24rpx;
			border-radius: 6rpx;
		}
		.active {
			@include styles('background-color', 'primary');
			color: #fff !important;
		}
	}
}
</style>
