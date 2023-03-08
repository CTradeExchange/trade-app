<template>
    <view class='dropdown-module'>
        <!-- 当前菜单 -->
        <view
            v-if='showItem'
            id='dropdown-item'
            :class="{ 'dropdown-item': true, 'active': showMenu || dropIndex === index }"
            :style="{ 'height': height + 'rpx' }"
            @click='toggleDrop'
        >
            <span class='title'>
                {{ fixedText || text }}
            </span>
            <tui-icon class='arrow' name='turningdown' :size='36' unit='rpx' />
        </view>
        <!-- 下拉菜单 -->
        <view :class="['dropdown-list', showMenu ? 'show' : 'hide']" :style="{ 'top': top }" @touchmove.stop>
            <block v-for='(item, num) in list' :key='num'>
                <view :class="{ 'item': true, 'active': item.value === modelValue }" @click='selectItem(item)'>
                    <span class='text'>
                        {{ item.text }}
                    </span>
                    <tui-icon class='check' name='check' :size='32' unit='rpx' />
                </view>
            </block>
            <slot name='list'></slot>
        </view>
        <!-- 遮罩层 -->
        <mask-layer :show='showMenu' @close='toggleDrop' />
    </view>
</template>

<script>
export default {
    props: {
        // 当前选中
        modelValue: {
            type: [Number, String],
            default: -1
        },
        // 当前组件索引
        index: {
            type: Number,
            default: 0
        },
        // 当前弹窗组件索引
        dropIndex: {
            type: Number,
            default: -1
        },
        // 下拉列表数据
        list: {
            type: Array,
            default: () => []
        },
        // 高度
        height: {
            type: Number,
            default: 88
        },
        // 固定文字
        fixedText: {
            type: String,
            default: ''
        },
        // 是否自定义内容
        showItem: {
            type: Boolean,
            default: true
        }
    },
    data () {
        return {
            // 是否显示下拉菜单
            showMenu: false,
            // 显示的文字
            text: '',
            // 下拉菜单距离顶部的距离
            top: 50
        }
    },
    watch: {
        dropIndex () {
            if (this.dropIndex !== this.index) {
                this.showMenu = false
            }
        },
        list () {
            this.setText()
        },
        modelValue () {
            this.setText()
        }
    },
    mounted () {
        // this.setStyle()
        this.setText()
    },
    methods: {
        // 设置样式
        setStyle () {
            this.$nextTick(() => {
                const query = uni.createSelectorQuery().in(this)
                query.select('.nav-title-bar').boundingClientRect(data => {
                    if (data) {
                        // this.top = (data.top + data.height) + 'px'
                    }
                    console.log('top======', this.top)
                }).exec()
            })
        },

        // 设置当前选中的名称
        setText () {
            if (this.list.length > 0) {
                const item = this.list.find(v => v.value === this.modelValue)
                this.text = item ? item.text : ''
            }
        },

        // 打开、关闭下拉菜单
        toggleDrop () {
            this.showMenu = !this.showMenu
            // 关闭其它下拉弹窗
            this.$emit('update:dropIndex', this.showMenu ? this.index : -1)
        },

        // 选择菜单
        selectItem (item) {
            this.text = item.text
            this.showMenu = false
            this.$emit('update:modelValue', item.value)
            this.$emit('update:dropIndex', -1)
        }
    }
}
</script>

<style lang="scss" scoped>
.dropdown-module {
	width: 100%;
	min-width: 25%;
}
.dropdown-item {
	@include flexAll;
	@include styles('background-color', 'contentColor');
	flex: 1;
	height: 100%;
	z-index: 1002;
	span {
		@include styles('color', 'color');
		@include text-clamp-one;
		max-width: 90%;
		font-size: 26rpx;
	}
	.arrow {
		@include styles('color', 'minorColor');
	}
	&.active {
		span {
			@include styles('color', 'primary');
		}
		.arrow {
			@include styles('color', 'primary');
			transform: rotate(180deg);
			transition: all .2s;
		}
	}
}
.dropdown-list {
	@include styles('background-color', 'contentColor');
	width: 750rpx;
	max-height: 880rpx;
	padding: 0 30rpx;
	box-shadow: inset 0 5rpx 10rpx -5rpx rgba(0,0,0,.1);
	position: fixed;
	left: 0;
	z-index: 1001;
	overflow-y: auto;
	&.show {
		transition: all .2s ease-in;
		max-height: 880rpx;
		visibility: visible;
	}
	&.hide {
		max-height: 0;
		visibility: hidden;
	}
	.item {
		@include flexBetweenAlign;
		height: 80rpx;
		position: relative;
		&::after {
			@include styles('background-color', 'lineColor');
			content: '';
			width: 100%;
			height: 1px;
			position: absolute;
			bottom: 0;
			left: 50%;
			transform: translateX(-50%) scaleY(.5);
		}
		.text {
			font-size: 26rpx;
		}
		.check {
			display: none;
		}
		&.active {
			.text {
				@include styles('color', 'primary');
			}
			.check {
				@include styles('color', 'primary');
				display: inline-block;
			}
		}
	}
}
</style>
