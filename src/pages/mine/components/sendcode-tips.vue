<template>
    <tui-modal custom :show='show'>
        <view class='dialog-content'>
            <view class='close' @click='onTip'>
                <tui-icon name='shut' size='45' unit='rpx' />
            </view>
            <view class='content'>
                <view class='icon'>
                    <tui-icon color='var(--primary)' :name="type == 1 ? 'mail': 'voipphone'" size='100' unit='rpx' />
                </view>
                <view class='title'>
                    {{ type == 1 ? $t('thirdRegister.noReceiveEmail') : $t('thirdRegister.noReceivePhone') }}
                </view>
                <view class='tips'>
                    <view class='tips-head'>
                        {{ type == 1 ? $t('thirdRegister.tryEmail') : $t('thirdRegister.tryPhone') }}
                    </view>
                    <view v-for='(item, index) in list' :key='index'>
                        <template v-if='index === list.length - 1'>
                            {{ item }}
                            <view class='goService' @click='goService'>
                                {{ $t('thirdRegister.cs') }}
                            </view>
                            <view class='solve'>
                                {{ $t('thirdRegister.solve') }}
                            </view>
                        </template>
                        <template v-else>
                            {{ item }}
                        </template>
                    </view>
                </view>
            </view>
        </view>
    </tui-modal>
</template>

<script>
import { toService } from '@/utils/method'
export default {
    props: {
        // 是否显示弹窗
        show: {
            type: Boolean,
            default: false
        },
        // 当前tab 0:手机号 1:邮箱
        type: {
            type: Number,
            default: 1
        },
        value: String,
    },
    data () {
        return {
            newVal: this.value,
            email: [],
            phone: []
        }
    },
    computed: {
        list () {
            return this.type == 1 ? this.email : this.phone
        }
    },
    watch: {
        value: {
            handler (newVal) {
                newVal = newVal || '--'
                this.email = [
                    this.$t('thirdRegister.emailTip1'),
                    this.$t('thirdRegister.emailTip2', [newVal]),
                    this.$t('thirdRegister.emailTip3'),
                    this.$t('thirdRegister.emailTip4')
                ]
                this.phone = [
                    this.$t('thirdRegister.phoneTip1'),
                    this.$t('thirdRegister.phoneTip2'),
                    this.$t('thirdRegister.phoneTip3', [newVal]),
                    this.$t('thirdRegister.phoneTip4'),
                    this.$t('thirdRegister.phoneTip5')
                ]
            },
            immediate: true
        },
    },
    methods: {
        // 点击关闭
        onTip () {
            this.$emit('update:show', false)
        },
        goService () {
            return toService()
        }
    }
}
</script>

<style lang="scss" scoped>
::v-deep .tui-modal-box {
	border-radius: 10rpx !important;
	padding: 0rpx !important;
}
.dialog-content {
	@include flexColumnCenter;
	padding-top: 60rpx;
    padding-bottom: 40rpx;
	position: relative;
  
  	.close {
		@include styles('color', 'minorColor');
		font-size: 26rpx;
		position: absolute;
		top: 20rpx;
		right: 25rpx;
	}

    .content{
        padding: 30rpx;
        padding-top: 0;

        .icon{
            text-align: center;
            padding-bottom: 20rpx;
        }

        .title{
            font-size: 36rpx;
            text-align: center;
            padding-bottom: 20rpx;
        }
        .tips{
            line-height: 44rpx;
            @include styles('color', 'normalColor');
        }
        .tips-head{
            margin-bottom: 20rpx;
            @include styles('color', 'color');
        }
        .goService{
            display: inline;
            margin: 0 10rpx;
            @include styles('color', 'primary');
        }
        .solve{
            display: inline;
        }
    }
	
}
</style>
