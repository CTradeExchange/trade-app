<template>
    <tui-top-dropdown height='auto' :show='show' :translatey="'calc('+ systemInfo.navbarHeight +'px + 100rpx)'" @close='close'>
        <view class='module-content'>
            <view class='filter-module'>
                <view class='title'>
                    {{$t('common.item')}}
                </view>
                <view class='list'>
                    <block v-for='(item, value) in proBtns' :key='value'>
                        <view :class="{'name': true, 'active': operateType === Number(value)}" @click='selectOperate(item, Number(value))'>
                            {{item}}
                        </view>
                    </block>
                </view>
            </view>
            <view class='filter-module'>
                <view class='title'>
                    {{$t('fund.flow')}}
                </view>
                <view class='list'>
                    <block v-for='(item, index) in directionBtns' :key='index'>
                        <view :class="{'name': true, 'active': businessType === item.value}" @click='selectBusiness(item.value)'>
                            {{item.name}}
                        </view>
                    </block>
                </view>
            </view>
            <view class='handle'>
                <button class='reset' @click='onReset'>
                    {{$t('fund.reset')}}
                </button>
                <button class='complete' @click='onComplete'>
                    {{$t('common.complete')}}
                </button>
            </view>
        </view> 
    </tui-top-dropdown>
</template>

<script>
export default {
    props: {
        // 是否显示弹窗
        show: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            // 项目名称
            itemName: '',
            // 日期名称
            dateName: '',
            // 项目
            proBtns: this.$t('fund.proBtns'),
            // 当前选项的项目类型
            operateType: 0,
            // 流向
            directionBtns: this.$t('fund.directionBtns'),
            // 当前选择的流向类型
            businessType: 0
        }
    },
    methods: {
        // 设置默认值
        setDefault(operateType, businessType) {
            this.operateType = operateType
            this.businessType = businessType
        },
		
        // 选择项目类型
        selectOperate(item, value) {
            this.itemName = item
            this.operateType = value
        },
		
        // 选择流向类型
        selectBusiness(value) {
            this.businessType = value
        },
		
        // 关闭弹窗
        close() {
            this.$emit('close')
        },
		
        // 重置
        onReset() {
            this.itemName = ''
            this.operateType = 0
            this.businessType = 0
        },
		
        // 完成
        onComplete() {
            this.$emit('complete', {
                itemName: this.itemName,
                operateType: this.operateType,
                businessType: this.businessType
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.module-content {
	@include styles('color', 'color');
	@include styles('background-color', 'contentColor');
	padding: 20rpx 30rpx;
	.filter-module {
		margin-bottom: 40rpx;
		.title {
			margin-bottom: 15rpx;
		}
		.list {
			display: flex;
			flex-wrap: wrap;
			.name {
				@include styles('border-color', 'lineColor');
				padding: 10rpx 15rpx;
				margin-right: 18rpx;
				margin-bottom: 18rpx;
				font-size: 25rpx;
				border-style: solid;
				border-width: 1px;
			}
			.active {
				@include styles('color', 'primary');
				@include styles('border-color', 'primary');
			}
		}
	}
	.handle {
		display: flex;
		justify-content: space-between;
		button {
			display: flex;
			justify-content: center;
			align-items: center;
			height: 75rpx;
			flex: 1;
			font-size: 26rpx;
			&.reset {
				@include styles('color', 'color');
				@include styles('background-color', 'primaryAssistColor');
				margin-right: 30rpx;
			}
			&.complete {
				@include styles('background-color', 'primary');
				color: #fff;
			}
		}
	}
}
</style>
