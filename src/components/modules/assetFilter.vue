<template>
    <div class='filter-block'>
        <checkbox-group @change='changeState'>
            <label for=''>
                <checkbox :checked='checked' style='transform:scale(0.8)' value='true' />
                <text> {{ $t('assets.hideAsset') }}</text>
            </label>
        </checkbox-group>
        <div class='input-wrap'>
            <icon size='14' type='search' />
            <input
                v-model='searchVal'
                confirm-type='search'
                :placeholder='$t("assets.searchAsset")'
                type='text'
                @input='search'
            />
            <icon v-if='showClearIcon' class='uni-icon' size='14' type='clear' @click='clearIcon' />
        </div>
    </div>
</template>

<script>
import { localSet, isEmpty, localGet } from '@/utils/util.js'
export default {
    components: {
        
    },
    props: {
        hideAsset: {
            type: Boolean
        },
        searchText: {
            type: String,
          
        }
    },
    data () {
        return {
            checked: localGet('hideAsset') ? JSON.parse(localGet('hideAsset')) : false,
            showClearIcon: false,
            searchVal: this.searchText
        }
    },
    created () {
        if (isEmpty(localGet('hideAsset'))) {
            localSet('hideAsset', false)
        }
    },
    methods: {
        // // 点击隐藏0资产
        changeState (val) {
            const flag = Boolean(val.detail.value[0])
            localSet('hideAsset', flag)
            this.$emit('changeState', flag)
        },
        // 搜索资产
        search (event) {
            const inputVal = event.detail.value
            this.showClearIcon = inputVal.length > 0  
            this.$emit('searchAsset', inputVal)
        },
        clearIcon: function () {
            this.searchVal = ''
            this.showClearIcon = false
            this.$emit('searchAsset', '')
        },
    }
}
</script>

<style lang="scss" scoped>
.filter-block {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100rpx;
    padding: 0 20rpx;
    @include styles('background-color', 'contentColor');
    border: 1px solid;
	@include styles('border-color', 'lineColor');
    uni-checkbox-group{
        flex: 1;
        .uni-label-pointer{
            line-height: 100rpx;
            display: block;
            uni-text{
                vertical-align: middle;
            }
                
        }
    }
    
    .input-wrap{
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: 1px solid;
	    @include styles('border-color', 'lineColor');
        border-radius: rem(10px); 
        height: 60rpx;
        uni-icon{
            margin: 0 30rpx;
        }
    }

    :deep(.van-checkbox) {
        //flex: 1;
        width: 60%;
        .van-checkbox__label {
            margin-top: 3px;
        }
    }
    :deep(.van-search) {
        flex: 1;
        margin: rem(20px) 0;
        padding: rem(10px) 0;
        //border: solid 1px var(--lineColor);
        .van-cell {
            padding-right: rem(20px);
            border: solid 1px var(--lineColor);
            border-radius: rem(10px);
        }
    }
    :deep(.van-search__content) {
        background-color: var(--contentColor);
    }
}
</style>
