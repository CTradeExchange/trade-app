<template>
    <view>
        <tui-modal custom mask-closabl padding='0' :show='show'>
            <view class='modal-case'>
                <view class='modal-content'>
                    <view class='remark-label'>
                        {{ $t('setting.destroyRemark') }}
                    </view>
                    <input 
                        v-model='remark' 
                        class='remark-input' 
                        :placeholder="$t('setting.inputDestroyRemark')" 
                        placeholder-class='placeholderClass'
                        type='text'
                    />
                </view>
                <view class='modal-handle'>
                    <button class='cancel' @click='onCancel'>
                        {{ $t('common.cancel') }}
                    </button>
                    <button class='confirm' @click='onConfirm'>
                        {{ $t('common.sure') }}
                    </button>
                </view>
            </view>
        </tui-modal>

        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
    </view>
</template>

<script>  
import { destroyAccount } from '@/api/user'
import { isEmpty } from '@/utils/util'

export default {
    props: {
        // 是否显示弹窗
        show: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            // 销户备注
            remark: ''
        }
    },
    methods: {
        // 关闭弹窗
        close () {
            this.$emit('update:show', false)
            this.remark = ''
        },

        // 点击取消
        onCancel () {
            this.close()
        },

        // 点击确定
        onConfirm () {
            if (isEmpty(this.remark)) {
                return this.$toast(this.$t('setting.inputDestroyRemark'))
            }
            destroyAccount({
                remark: this.remark
            }).then(res => {
                this.close()
                this.$refs['modalDialog'].show({
                    content: this.$t('setting.destroySuccessTip'),
                    confirmText: this.$t('setting.destroySuccessConfirm')
                })
            }).catch(err => {
                this.$refs['modalDialog'].show({
                    content: err.msg
                })
            })
        }
    }
}
</script>

<style lang='scss' scoped>
.modal-content {
    padding: 50rpx 40rpx;
    .remark-label {
        margin-bottom: 12rpx;
    }
    .remark-input {
        @include styles('background', 'lineColor');
        width: 100%;
        height: 100rpx;
        padding: 0 30rpx;
        border-radius: 10rpx;
    }
}
.modal-handle {
	display: flex;
	position: relative;
	&:before {
	    @include styles('background', 'lineColor');
	    content: '';
	    width: 100%;
	    height: 1rpx;
	    position: absolute;
	    left: 0;
	    top: 0;
	}
	button {
        flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100rpx;
        &.cancel {
            @include styles('color', 'minorColor');
			@include styles('border-right-color', 'lineColor');
            border-right-width: 1rpx;
            border-right-style: solid;
        }
        &.confirm {
            @include styles('color', 'color');
        }
	}
}
</style>
