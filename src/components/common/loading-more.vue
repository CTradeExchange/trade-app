<template>
    <view v-if='show' class='loadmore-case' :data-theme='currentTheme'>
        <!-- 上拉加载 -->
        <view v-if="status === 'more'" class='tui-more'>
            {{ $t('common.more') }}
        </view>
        <!-- 加载中 -->
        <view v-if="status === 'loading'" class='tui-loadmore'>
            <view :class="['tui-loading-' + index, index == 3 && type ? 'tui-loading-' + type : '']" />
            <view class='tui-loadmore-tips'>
                {{ $t('common.loading') }}
            </view>
        </view>
        <!-- 加载完成 -->
        <view v-if="status === 'noMore'" class='tui-noMore'>
            <view class='tui-noMore-line' />
            <view class='tui-noMore-tips'>
                {{ $t('common.noMore') }}
            </view>
            <view class='tui-noMore-line' />
        </view>
    </view>
</template>

<script>
export default {
    props: {
        // 加载状态
        status: {
            type: String,
            default: 'more' // more:加载更多 loading:加载中 noMore:加载完成
        },
        // loading 样式 ：1,2,3
        index: {
            type: Number,
            default: 3
        },
        // 颜色设置，只有index=3时生效：primary，red，orange，green
        type: {
            type: String,
            default: 'green'
        }
    },
    data () {
        return {
            // 是否显示
            show: false
        }
    },
    mounted () {
        setTimeout(() => {
            this.show = true
        }, 100)
    }
}
</script>

<style lang="scss" scoped>
.loadmore-case {
	@include flexAll;
	@include styles('color', 'normalColor');
	height: 90rpx;
	font-size: 26rpx;
}
.tui-noMore {
	@include flexAll;
	height: 100%;
}
.tui-noMore-line {
	@include styles('background-color', 'lineColor');
	width: 80rpx;
	height: 1px;
}
.tui-noMore-tips {
	margin: 0 15rpx;
}
/* 加载中 */
.tui-loadmore {
	@include flexAll;

	height: 100%;
}
.tui-loading-1 {
	display: inline-block;
	width: 20px;
	height: 20px;
	margin: 0 5px;
	vertical-align: middle;
	background:
		transparent url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHBhdGggZmlsbD0ibm9uZSIgZD0iTTAgMGgxMDB2MTAwSDB6Ii8+PHJlY3Qgd2lkdGg9IjciIGhlaWdodD0iMjAiIHg9IjQ2LjUiIHk9IjQwIiBmaWxsPSIjRTlFOUU5IiByeD0iNSIgcnk9IjUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAgLTMwKSIvPjxyZWN0IHdpZHRoPSI3IiBoZWlnaHQ9IjIwIiB4PSI0Ni41IiB5PSI0MCIgZmlsbD0iIzk4OTY5NyIgcng9IjUiIHJ5PSI1IiB0cmFuc2Zvcm09InJvdGF0ZSgzMCAxMDUuOTggNjUpIi8+PHJlY3Qgd2lkdGg9IjciIGhlaWdodD0iMjAiIHg9IjQ2LjUiIHk9IjQwIiBmaWxsPSIjOUI5OTlBIiByeD0iNSIgcnk9IjUiIHRyYW5zZm9ybT0icm90YXRlKDYwIDc1Ljk4IDY1KSIvPjxyZWN0IHdpZHRoPSI3IiBoZWlnaHQ9IjIwIiB4PSI0Ni41IiB5PSI0MCIgZmlsbD0iI0EzQTFBMiIgcng9IjUiIHJ5PSI1IiB0cmFuc2Zvcm09InJvdGF0ZSg5MCA2NSA2NSkiLz48cmVjdCB3aWR0aD0iNyIgaGVpZ2h0PSIyMCIgeD0iNDYuNSIgeT0iNDAiIGZpbGw9IiNBQkE5QUEiIHJ4PSI1IiByeT0iNSIgdHJhbnNmb3JtPSJyb3RhdGUoMTIwIDU4LjY2IDY1KSIvPjxyZWN0IHdpZHRoPSI3IiBoZWlnaHQ9IjIwIiB4PSI0Ni41IiB5PSI0MCIgZmlsbD0iI0IyQjJCMiIgcng9IjUiIHJ5PSI1IiB0cmFuc2Zvcm09InJvdGF0ZSgxNTAgNTQuMDIgNjUpIi8+PHJlY3Qgd2lkdGg9IjciIGhlaWdodD0iMjAiIHg9IjQ2LjUiIHk9IjQwIiBmaWxsPSIjQkFCOEI5IiByeD0iNSIgcnk9IjUiIHRyYW5zZm9ybT0icm90YXRlKDE4MCA1MCA2NSkiLz48cmVjdCB3aWR0aD0iNyIgaGVpZ2h0PSIyMCIgeD0iNDYuNSIgeT0iNDAiIGZpbGw9IiNDMkMwQzEiIHJ4PSI1IiByeT0iNSIgdHJhbnNmb3JtPSJyb3RhdGUoLTE1MCA0NS45OCA2NSkiLz48cmVjdCB3aWR0aD0iNyIgaGVpZ2h0PSIyMCIgeD0iNDYuNSIgeT0iNDAiIGZpbGw9IiNDQkNCQ0IiIHJ4PSI1IiByeT0iNSIgdHJhbnNmb3JtPSJyb3RhdGUoLTEyMCA0MS4zNCA2NSkiLz48cmVjdCB3aWR0aD0iNyIgaGVpZ2h0PSIyMCIgeD0iNDYuNSIgeT0iNDAiIGZpbGw9IiNEMkQyRDIiIHJ4PSI1IiByeT0iNSIgdHJhbnNmb3JtPSJyb3RhdGUoLTkwIDM1IDY1KSIvPjxyZWN0IHdpZHRoPSI3IiBoZWlnaHQ9IjIwIiB4PSI0Ni41IiB5PSI0MCIgZmlsbD0iI0RBREFEQSIgcng9IjUiIHJ5PSI1IiB0cmFuc2Zvcm09InJvdGF0ZSgtNjAgMjQuMDIgNjUpIi8+PHJlY3Qgd2lkdGg9IjciIGhlaWdodD0iMjAiIHg9IjQ2LjUiIHk9IjQwIiBmaWxsPSIjRTJFMkUyIiByeD0iNSIgcnk9IjUiIHRyYW5zZm9ybT0icm90YXRlKC0zMCAtNS45OCA2NSkiLz48L3N2Zz4=) no-repeat;
	background-size: 100%;
	-webkit-animation: a 1s steps(12) infinite;
	animation: a 1s steps(12) infinite;
}
@-webkit-keyframes a {
	0% {
		-webkit-transform: rotate(0deg);
		transform: rotate(0deg);
	}
	to {
		-webkit-transform: rotate(1turn);
		transform: rotate(1turn);
	}
}
@keyframes a {
	0% {
		-webkit-transform: rotate(0deg);
		transform: rotate(0deg);
	}
	to {
		-webkit-transform: rotate(1turn);
		transform: rotate(1turn);
	}
}
.tui-loadmore-tips {
	display: inline-block;
	vertical-align: middle;
}
.tui-loading-2 {
	display: inline-block;
	width: 28rpx;
	height: 28rpx;
	margin: 0 6px;
	vertical-align: middle;
	border: 1px solid #8f8d8e;
	border-radius: 50%;
	animation: rotate 1s linear infinite;
	clip-path: polygon(0% 0%, 100% 0%, 100% 30%, 0% 30%);
}
@-webkit-keyframes rotate {
	from {
		transform: rotateZ(0deg);
	}

	to {
		transform: rotateZ(360deg);
	}
}
@keyframes rotate {
	from {
		transform: rotateZ(0deg);
	}

	to {
		transform: rotateZ(360deg);
	}
}
.tui-loading-3 {
	display: inline-block;
	width: 28rpx;
	height: 28rpx;
	margin: 0 6px;
	vertical-align: middle;
	background: 0 0;
	border: 2px solid;
	border-color: #e5e5e5 #e5e5e5 #e5e5e5 #8f8d8e;
	border-radius: 50%;
	animation: tui-rotate 0.7s linear infinite;
}
.tui-loading-3.tui-loading-primary {
	border-color: #e5e5e5 #e5e5e5 #e5e5e5 #5677fc;
}
.tui-loading-3.tui-loading-green {
	border-color: #e5e5e5 #e5e5e5 #e5e5e5 #19be6b;
}
.tui-loading-3.tui-loading-orange {
	border-color: #e5e5e5 #e5e5e5 #e5e5e5 #ff7900;
}
.tui-loading-3.tui-loading-red {
	border-color: #ededed #ededed #ededed #ed3f14;
}
@-webkit-keyframes tui-rotate {
	0% {
		transform: rotate(0);
	}
	100% {
		transform: rotate(360deg);
	}
}
@keyframes tui-rotate {
	0% {
		transform: rotate(0);
	}
	100% {
		transform: rotate(360deg);
	}
}
</style>
