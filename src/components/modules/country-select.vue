<template>
    <!-- 国家列表弹窗 -->
    <tui-drawer mode='right' :visible='stateAreaVisible' @close='closeDrawer'>
        <view class='d-container' style='top:50rpx; width:100vw'>
            <view class='header' @click='closeDrawer'>
                <tui-icon bold class='icon-back' name='back' size='20' />
                <text class='header-text'>
                    {{ $t('register.area') }}
                </text>
            </view>
            <view class='search-warp'>
                <view class='search'>
                    <view class='search-box'>
                        <tui-icon class='search-icon' name='search' :size='32' unit='rpx' />
                        <input 
                            v-model='searchVal'
                            :placeholder="$t('search.placeholder')"
                            placeholderClass='placeholderClass'
                            @focus='onFocus'
                            @input='onSearch'
                        />
                        <tui-icon 
                            v-if='searchVal'
                            class='close-icon' 
                            name='close-fill' 
                            :size='34' 
                            unit='rpx'
                            @click='onClear'
                        />
                    </view>
                </view>
                <none-data v-if='searchList.length === 0' class='none-data' :text="$t('search.nodata')" />
            </view>
            <scroll-view v-if='showList' class='scroll-view' scroll-top='0' scroll-y='true'>
                <view class='list-wrap'>
                    <view
                        v-for='(item, index) in searchList'
                        :key='index'
                        :class="{ 'item': true, 'active': item.code === countryCode }"
                        @click='changeStateArea(index)'
                    >
                        <view class='left'>
                            <image
                                class='icon-country' 
                                lazy-load='true'
                                :src="cdnUrl + '/images/countries_flags/' + item.code +'.png'"
                            />
                            <text class='text-country'>
                                {{ item.displayName }} 
                            </text>
                            <tui-icon bold class='check' :color='$style.primary' name='check' :size='36' unit='rpx' />
                        </view>
                    
                        <view class='right'>
                            {{ item.countryCode }}
                        </view>
                    </view>
                </view>
            </scroll-view>
        </view>
    </tui-drawer>
</template>

<script>
import store from '@/store/index.js'
const { cdnUrl } = require('@/apiConfig.js')
export default {
    props: {
        // 当前选择的国家
        countryCode: {
            type: String,
            default: ''
        }
    },
    data () {
        return {
            // 图片地址
            cdnUrl,
            // 是否显示国家地区弹窗
            stateAreaVisible: false,
            // 是否显示列表数据
            showList: false,
            // 搜索内容
            searchVal: '', 
            // 键盘的高度
            keyboradHeight: 0
        }
    },
    computed: {
        searchList () {
            const value = this.searchVal.toUpperCase()
            const countryList = store.state.countryList
            // 获取国家区号
            const list = (!value) ? countryList : countryList.filter(el => {
                if ((el.code && el.code.toUpperCase().indexOf(value) !== -1) || (el.countryCode && el.countryCode.toUpperCase().indexOf(value) !== -1) || (el.displayName && el.displayName.toUpperCase().indexOf(value) !== -1)) {
                    return true
                } else {
                    return false
                }
            })
            return list 
        }
    },
    mounted () {
        uni.onKeyboardHeightChange(this.watchKeyboardHeight)
        setTimeout(() => {
            this.showList = true
        }, 500)
    },
    destroyed () {
        uni.offKeyboardHeightChange(this.watchKeyboardHeight)
    },
    methods: {
        closeDrawer () {
            this.stateAreaVisible = false
        },
        watchKeyboardHeight (res) {
            // 监听键盘高度
            if (this.systemInfo.platform === 'android') {
                this.keyboradHeight = (res.height > 80) ? (res.height - 80) : 0
            }
        },
        // 设置默认值
        changeStateArea (value) {
            // 仅搜索列表有数据的时候才执行回调
            if (this.searchList.length > 0) {
                const item = this.searchList[value]
                this.$emit('change', {
                    name: item.formatName, // 格式化名称 china +86
                    code: item.countryCode, // 区号  +86
                    countryCode: item.code, // 国家代号 cn
                    countryName: item.displayName // china
                })
            }
            this.searchVal = ''
            this.handleVisible(false) 
        },	
        // 开关弹窗
        handleVisible (isVisible) {
            this.stateAreaVisible = isVisible
        },
        onSearch (e) {
            this.searchVal = e.target.value
        },
        onClear () {
            this.searchVal = ''
        },
        onFocus (e) {
            setTimeout(() => {
                e?.target?.scrollIntoView && e.target.scrollIntoView({
                    block: 'nearest',
                    inline: 'nearest'
                })
                e?.target?.scrollIntoViewIfNeeded && e.target.scrollIntoViewIfNeeded()
            }, 200)
        }
    }
}
</script>

<style lang="scss" scoped>
::v-deep .tui-drawer-container {
	z-index: 9999 !important;
}
.dialog {
    position: absolute;
}
.d-container{
    padding: 50rpx 20rpx 20rpx 20rpx;
}
.header{
    margin: 40rpx 0 30rpx 0;
    .header-text{
        font-weight: bold;
        font-size: 32rpx;
        margin-left: 10rpx;
        vertical-align: middle;
        @include styles('color', 'color');
    }
    .icon-back{
        vertical-align: middle
    }
}
.search-warp{
    margin-bottom: 40rpx;
    .search{
        .search-box {
            @include flexAlign;
            border: 1px solid;
            @include styles('background-color', 'bgColor');
            @include styles('border-color', 'lineColor');
            border-width: 1rpx;
            border-style: solid;
            border-radius: 40rpx;    
            flex: 1;
            height: 80rpx;
            padding: 0 20rpx;
            .search-icon {
                @include styles('color', 'minorColor');
            }
            input {
				@include styles('color', 'color');
                margin-left: 15rpx;
                flex: 1;
                height: 100%;
            }
            .close-icon {
                @include styles('color', 'minorColor');
                margin-left: 15rpx;
            }
        }
    }
    .none-data{
        height: 500rpx;
    }
}
.scroll-view {
    height: calc(100vh - 290rpx);
}
.list-wrap{
    .item{
        display: flex;
        justify-content: space-between;
		align-items: center;
		height: 80rpx;
		.left {
			display: inline-flex;
			align-items: center;
		}
        .right{
            @include styles('color', 'normalColor');
        }
        .icon-country{
            width: 50rpx;
            height: 37rpx;
            vertical-align:middle;
            margin-right: 15rpx;
            border:solid 1rpx #dadada;
        }
        .text-country{
			margin-right: 12rpx;
            font-size: 30rpx;
            vertical-align:middle;
            @include styles('color', 'color');
        }
		.check {
			display: none;
		}
    }
    .active {
		@include styles('color', 'primary');
		.text-country {
			font-weight: bold;
		}
		.check {
			display: inline-flex;
		}
	}
}

.tui-drawer-container{
    width: 100%;
}
.d-container{
    width: 80%;
}

</style>
