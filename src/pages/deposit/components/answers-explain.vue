<template>
    <view class='list-content'>
        <block v-for='(item,index) in dataList' :key='index'>
            <tui-collapse :current='current' :index='index' @click='change'>
                <template #title>
                    <tui-list-cell :hover='false'>
                        {{ item.title }}
                    </tui-list-cell>
                </template>
                <template #content>
                    <view class='item-content'>
                        <mp-html :content='item.text' />
                    </view>
                </template>
            </tui-collapse>
        </block>
    </view>
</template>

<script>
export default {
    data () {
        return {
            current: -1,
            dataList: this.$t('deposit.answers')
        }
    },
    methods: {
        change (e) {
            this.current = this.current === e.index ? -1 : e.index
        }
    }
}
</script>

<style lang='scss' scoped>
.list-content {
	@include styles('background-color', 'contentColor');
	margin-top: 20rpx;
	&::v-deep {
		.tui-list-cell {
			padding-right: 50rpx !important;
			font-weight: bold;
		}
	}
}
.item-content {
	padding: 30rpx;
}
</style>
