<template>
    <view>
        <tui-drawer :mode='mode' :visible='visible' @close='close'>
            <view class='drawer-module'>
                <!-- 导航栏 -->
                <nav-bar :back-show='false' :show-title-bar='false' />
                <view class='title'>
                    {{ $t('deposit.appendFiled') }}
                </view>
                <view v-if='isDeposit' class='append'>
                    {{ $t('deposit.appendVisDesc') }}
                </view>
                <view class='list'>
                    <view v-for='(item, key) in extend' :key='key' class='box'>
                        <em>*</em>
                        <label>{{ item[currentLang] }}</label>
                        <input
                            v-model='item.value'
                            :placeholder="$t('common.input') + item[currentLang]"
                            placeholderClass='placeholderClass'
                            type='text'
                        />
                    </view>
                </view>
                <button class='confirm-btn' @click='onConfirm'>
                    {{ $t('common.sure') }}
                </button>
            </view>
        </tui-drawer>
        <tui-toast ref='toast' />
    </view>
</template>

<script>
// utils
import { isEmpty } from '@/utils/util'
export default {
    props: {
        // 是否显示弹窗
        visible: {
            type: Boolean,
            default: false
        },
        // 需要补充的资料
        extend: {
            type: Object,
            default: () => {}
        },
        // 是否为入金补充资料
        isDeposit: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            // 弹出方向
            mode: 'right',
            // 添加的map数据
            appendMap: {}
        }
    },
    methods: {
        // 关闭弹窗
        close () {
            this.$emit('update:visible', false)
        },

        // 确定补充资料
        onConfirm () {
            const data = {}
            for (const key in this.extend) {
                const obj = this.extend[key]
                if (isEmpty(obj.value)) {
                    return this.$toast(this.$t('deposit.allInputRequire'))
                }
                if (!isEmpty(obj.regex)) {
                    const valueReg = new RegExp(obj.regex)
                    if (!valueReg.test(obj.value)) {
                        return this.$toast(`${obj[this.currentLang]}` + this.$t('register.incorrectlyFormed'))
                    }
                }
                data[key] = obj.value
            }
            this.$emit('update:visible', false)
            this.$emit('complete', data)
        }
    }
}
</script>

<style lang="scss" scoped>
::v-deep .tui-toast-text {
	font-size: 27rpx !important;
}
.drawer-module {
	@include flexColumn;
	@include styles('background-color', 'contentColor');
	width: 600rpx;
	height: 100%;
	padding: 0 50rpx;
	.title {
		@include flexAll;
		@include styles('color', 'color');
		height: 100rpx;
		font-size: 32rpx;
	}
    .append{
        @include styles('color', 'normalColor');
    }
	.list {
		flex: 1;
		overflow-y: auto;
		.box {
			@include flexAlign;
			height: 100rpx;
			font-size: 26rpx;
			position: relative;
			&::after {
				@include styles('background-color', 'lineColor');
				content: '';
				width: 100%;
				height: 1px;
				transform: translateY(.5);
				position: absolute;
				bottom: 0;
			}
			em {
				margin-right: 5rpx;
				color: red;
			}
			label {
				@include styles('color', 'normalColor');
				width: 140rpx;
				margin-right: 50rpx;
			}
			input {
				@include styles('color', 'color');
				flex: 1;
				height: 100%;
				font-size: 28rpx;
			}
		}
	}
	.confirm-btn {
		@include flexAll;
		@include styles('background-color', 'primary');
		height: 90rpx;
		margin: 50rpx 0 30rpx;
		font-size: 32rpx;
		color: #fff;
		border-radius: 10rpx;
	}
}
</style>
