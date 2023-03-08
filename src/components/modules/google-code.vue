<template>
    <view class='box-cell'>
        <input
            v-model='googleCode'
            maxlength='6'
            :placeholder='$t("common.inputGoogleCode")'
            placeholder-class='placeholderClass'
            type='number'
            @input='handleInput'
        />
        <view class='copyBtn' @click='pasteHanlder'>
            {{ $t('common.paste') }}
        </view>
    </view>
</template>

<script>
export default {
    data () {
        return {
            googleCode: ''
        }
    },
    methods: {
        pasteHanlder () {
            const that = this
            uni.getClipboardData({
                success: function (res) {
                    that.googleCode = res.data
                    that.$emit('getGooleVerifyCode', res.data)
                    console.log(res.data)
                },
                fail: function (err) {
                    uni.showToast({
                        title: that.$t('trade.noFeature'),
                        icon: 'none'
                    })
                }
            })
        },
        handleInput () {
            this.$emit('getGooleVerifyCode', this.googleCode)
        },
        clear () {
            this.googleCode = ''
        }
    }
}
</script>

<style lang="scss" scoped>

.box-cell {
    @include styles('background-color', 'contentColor');
    @include styles('border-bottom-color', 'lineColor');
    display: flex;
    justify-content: space-between;
	align-items: center;
    height: 90rpx;
    border-bottom-width: 1rpx;
    border-bottom-style: solid;
    input {
		@include styles('color', 'color');
        flex: 1;
        height: 90rpx;
    }
    .copyBtn {
		@include styles('color', 'primary');
		display: inline-flex;
		align-items: center;
    }
}

</style>
