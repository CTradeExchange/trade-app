<template>
    <view class='sort-icon'>
        <tui-icon :class="{ active: sortType === 'asc' && sortField === name }" name='turningup' />
        <tui-icon :class="{ active:sortType === 'desc' && sortField === name }" name='turningdown' />
    </view>
</template>

<script>
export default {
    props: {
        // 名称
        name: {
            type: String,
            default: ''
        },
        // 排序字段
        sortField: {
            type: String,
            default: ''
        },
        // 排序方式
        sortType: {
            type: String,
            default: ''
        }
    }
}
</script>

<style lang="scss" scoped>
.sort-icon {
	display: inline-flex;
	flex-direction: column;
	&::v-deep .tui-icon {
		@include styles('color', 'minorColor');
		line-height: 1;
		font-size: 34rpx !important;
		&:nth-child(2) {
			margin-top: -22rpx !important;
		}
	}
	.active {
		@include styles('color', 'primary');
	}
}
</style>
