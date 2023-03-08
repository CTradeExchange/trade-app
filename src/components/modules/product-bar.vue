<template>
    <view class='titleBarCell'>
        <view class='item'>
            <label @click='sortHandler("symbolName")'>
                <span class='name'>
                    {{ $t('trade.nameCode') }}
                </span>
                <sort-icon name='symbolName' :sort-field='sortField' :sort-type='sortType' />
            </label>
        </view>
        <view class='item'>
            <label @click='sortHandler("rolling_last_price")'>
                <span class='name'>
                    {{ $t('trade.newPrice') }}
                </span>
                <sort-icon name='rolling_last_price' :sort-field='sortField' :sort-type='sortType' />
            </label>
        </view>
        <view class='item'>
            <label @click='sortHandler("rolling_upDownWidth")'>
                <span class='name'>
                    {{ $t('trade.changePercent') }}
                </span>
                <sort-icon name='rolling_upDownWidth' :sort-field='sortField' :sort-type='sortType' />
            </label>
        </view>
    </view>
</template>

<script>
import { localSet } from '@/utils/util.js'
import sortIcon from '@/components/modules/sort-icon'

export default {
    components: {
        sortIcon
    },
    props: {
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
    },
    methods: {
        // 点击排序
        sortHandler (field) {
            let sortType = ''
            if (this.sortField === field) {
                switch (this.sortType) {
                    case 'asc':
                        sortType = 'desc'
                        break
                    case 'desc':
                        sortType = ''
                        break
                    default:
                        sortType = 'asc'
                }
            } else {
                sortType = 'asc'
            }
            this.$emit('update:sortType', sortType)
            localSet('productListSortType', sortType)
            this.$emit('update:sortField', sortType ? field : '')
            localSet('productListSortField', sortType ? field : '')
        }
    }
}
</script>

<style lang="scss" scoped>
.titleBarCell {
	display: flex;
	height: 60rpx;
	padding: 0 30rpx;
	font-size: 24rpx;
	@include styles('color', 'minorColor');
	@include styles('background-color', 'contentColor');
	.item {
		display: flex;
		height: 100%;
		label {
			display: inline-flex;
			align-items: center;
			height: 100%;
		}
		&:nth-of-type(1) {
			flex: 1;
		}
		&:nth-of-type(2) {
			width: 200rpx;
		}
		&:nth-of-type(3) {
			width: 200rpx;
			justify-content: flex-end;
		}
	}
}
</style>
