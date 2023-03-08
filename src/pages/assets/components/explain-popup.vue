<template>
    <tui-bottom-popup :radius='false' :show='show' @close='close'>
        <scroll-view class='popup-content' scroll-y>
            <view class='module'>
                <!-- 净值 -->
                <template v-if='explainType === 1'>
                    <view class='name'>
                        {{ $t('trade.jingzhi') }}
                    </view>
                    <view class='des'>
                        {{ $t('assetsExplain.text1') }}
                    </view>
                </template>
                <!-- 可用保证金 -->
                <template v-if='explainType === 2'>
                    <view class='name'>
                        {{ $t('trade.freeMargin') }}
                    </view>
                    <view class='des'>
                        {{ $t('assetsExplain.text2') }}
                    </view>
                </template>
                <!-- 占用保证金 -->
                <template v-if='explainType === 3'>
                    <view class='name'>
                        {{ $t('trade.originalMargin') }}
                    </view>
                    <view class='des'>
                        {{ $t('assetsExplain.text3') }}
                    </view>
                </template>
                <!-- 全仓保证金水平 -->
                <template v-if='explainType === 4'>
                    <view class='name'>
                        {{ $t('trade.marginLevel') }}
                    </view>
                    <view class='des'>
                        {{ $t('assetsExplain.text4') }}
                    </view>
                    <view class='warning-ul'>
                        <view class='item danger'>
                            {{ $t('assetsExplain.text5', { lessThanVal }) }}
                        </view>
                        <view class='item warn'>
                            {{ $t('assetsExplain.text6', { lessThanVal, moreThanVal }) }}
                        </view>
                        <view class='item safety'>
                            {{ $t('assetsExplain.text7', { moreThanVal }) }}
                        </view>
                    </view>
                    <view class='explain-case'>
                        <view class='title'>
                            {{ $t('assetsExplain.text8') }}
                        </view>
                        <view class='ul'>
                            <view class='item'>
                                {{ $t('assetsExplain.text9', { lessThanVal }) }}
                            </view>
                        </view>
                    </view>
                    <view class='explain-case'>
                        <view class='title'>
                            {{ $t('assetsExplain.text10') }}
                        </view>
                        <view class='ul'>
                            <view class='item'>
                                {{ $t('assetsExplain.text11') }}
                            </view>
                            <view class='item'>
                                {{ $t('assetsExplain.text12') }}
                            </view>
                        </view>
                    </view>
                    <view class='explain-case'>
                        <view class='title'>
                            {{ $t('assetsExplain.text13') }}
                        </view>
                        <view class='ul'>
                            <view class='item'>
                                {{ $t('assetsExplain.text14') }}
                            </view>
                            <view class='item'>
                                {{ $t('assetsExplain.text15') }}
                            </view>
                            <view class='item'>
                                {{ $t('assetsExplain.text16') }}
                            </view>
                        </view>
                    </view>
                </template>
                <!-- 逐仓可用保证金 -->
                <template v-if='explainType === 5'>
                    <view class='name'>
                        {{ $t('trade.freeMargin') }}
                    </view>
                    <view class='des'>
                        {{ $t('assetsExplain.text2') }}
                    </view>
                </template>
                <!-- 逐仓总占用保证金 -->
                <template v-if='explainType === 6'>
                    <view class='name'>
                        {{ $t('trade.allOriginalMargin') }}
                    </view>
                    <view class='des'>
                        {{ $t('assetsExplain.text3') }}
                    </view>
                </template>
                <!-- 逐仓预估强平价 -->
                <template v-if='explainType === 7'>
                    <view class='name'>
                        {{ $t('trade.previewStopPrice') }}
                    </view>
                    <view class='des'>
                        {{ $t('assetsExplain.text17') }}
                    </view>
                </template>
                <!-- 逐仓占用保证金 -->
                <template v-if='explainType === 8'>
                    <view class='name'>
                        {{ $t('trade.originalMargin') }}
                    </view>
                    <view class='des'>
                        {{ $t('assetsExplain.text18') }}
                    </view>
                </template>
                <!-- 逐仓维持保证金 -->
                <template v-if='explainType === 9'>
                    <view class='name'>
                        {{ $t('trade.holdMargin') }}
                    </view>
                    <view class='des'>
                        {{ $t('assetsExplain.text19') }}
                    </view>
                </template>
                <!-- 逐仓风险状态 -->
                <template v-if='explainType === 10'>
                    <view class='name'>
                        {{ $t('assetsExplain.text20') }}
                    </view>
                    <view class='warning-ul'>
                        <view class='item danger'>
                            {{ $t('assetsExplain.text21') }}
                        </view>
                        <view class='item warn'>
                            {{ $t('assetsExplain.text22') }}
                        </view>
                        <view class='item safety'>
                            {{ $t('assetsExplain.text23') }}
                        </view>
                    </view>
                    <view class='explain-case'>
                        <view class='title'>
                            {{ $t('assetsExplain.text8') }}
                        </view>
                        <view class='ul'>
                            <view class='item'>
                                {{ $t('assetsExplain.text24') }}
                            </view>
                        </view>
                    </view>
                    <view class='explain-case'>
                        <view class='title'>
                            {{ $t('assetsExplain.text13') }}
                        </view>
                        <view class='ul'>
                            <view class='item'>
                                {{ $t('assetsExplain.text25') }}
                            </view>
                            <view class='item'>
                                {{ $t('assetsExplain.text26') }}
                            </view>
                            <view class='item'>
                                {{ $t('assetsExplain.text27') }}
                            </view>
                        </view>
                    </view>
                </template>

                <!-- 重置账户说明 -->
                <template v-if='explainType === 11'>
                    <view class='name'>
                        {{ $t('mockAccount.resetAccount') }}
                    </view>
                    <view class='des'>
                        {{ $t('assetsExplain.text28') }}
                    </view>
                </template>
                <!-- 可取金额说明 -->
                <template v-if='explainType === 12'>
                    <view class='name'>
                        {{ $t('fund.acceptAmount') }}
                    </view>
                    <view class='explain-case'>
                        <view class='title'>
                            {{ $t('assetsExplain.text30') }}
                        </view>
                    </view>
                    <view class='explain-case'>
                        <view class='title'>
                            {{ $t('assetsExplain.text31') }}
                        </view>
                        <view class='ul'>
                            <view class='item'>
                                {{ $t('assetsExplain.text32') }}
                            </view>
                        </view>
                    </view>
                    <view class='explain-case'>
                        <view class='title'>
                            {{ $t('assetsExplain.text33') }}
                        </view>
                        <view class='ul'>
                            <view class='item'>
                                {{ $t('assetsExplain.text34') }}
                            </view>
                        </view>
                    </view>
                </template>

                <button class='know' @click='close'>
                    {{ $t('common.know') }}
                </button>
            </view>
        </scroll-view>
    </tui-bottom-popup>
</template>

<script>
export default {
    props: {
        // 是否显示弹窗
        show: {
            type: Boolean,
            default: false
        },
        /*
			说明类型
			1:全仓净值
			2:全仓可用保证金
			3:全仓占用保证金
			4:全仓保证金水平
			5:逐仓可用保证金
			6:逐仓总占用保证金
			7:逐仓预估强平价
			8:逐仓占用保证金
			9:逐仓维持保证金
			10:逐仓风险状态
		*/
        explainType: {
            type: Number,
            default: 0
        },
        // 当前账户信息
        userAccount: {
            type: Object,
            default: () => {}
        }
    },
    computed: {
        // 小于
        lessThanVal () {
            return this.userAccount.closePositionProportion
        },
        // 大于
        moreThanVal () {
            return this.userAccount.earlyWarningProportion
        }
    },
    methods: {
        // 关闭弹窗
        close () {
            this.$emit('update:show', false)
        }
    }
}
</script>

<style lang='scss' scoped>
::v-deep .tui-popup-class {
	border-radius: 16rpx 16rpx 0 0;
	overflow: hidden;
}
.popup-content {
	@include styles('background', 'contentColor');
	max-height: 85vh;
	.name {
		font-size: 36rpx;
	}
	.des {
		margin-top: 20rpx;
		font-size: 30rpx;
	}
}
.module {
	padding: 50rpx 60rpx 100rpx;
}
.know {
	@include styles('background', 'primary'); 
	display: flex;
	justify-content: center;
	align-items: center;
	width: 240rpx;
	height: 80rpx;
	margin: 80rpx auto 0;
	color: #fff;
	border-radius: 10rpx;
}
.warning-ul {
	display: flex;
	flex-direction: column;
	.item {
		@include styles('border-color', 'lineColor');
		margin-top: 12rpx;
		padding: 10rpx 20rpx;
		font-size: 26rpx;
		border-width: 1px;
		border-style: solid;
		border-radius: 8rpx;
		&.danger {
			@include styles('color', 'warn');
			background: rgba(239,83,83,.1);
		}
		&.warn {
			@include styles('color', 'focusColor');
			background: rgba(241,161,27,.1);
		}
		&.safety {
			@include styles('color', 'success');
			background: rgba(38,166,154,.1);
		}
	}
}
.explain-case {
	margin-top: 48rpx;
	.title {
		margin-bottom: 8rpx;
		font-size: 30rpx;
	}
	.ul {
		font-size: 26rpx;
	}
	.item {
		@include styles('color', 'normalColor');
		line-height: 36rpx;
	}
}
</style>
