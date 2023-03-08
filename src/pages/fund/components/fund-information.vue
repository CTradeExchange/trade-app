<template>
    <view class='fund-information'>
        <view class='tabs'>
            <view :class="{ 'li': true, 'active': current === 0 }" @click='switchTab(0)'>
                {{ $t("fundInfo.baseInfo") }}
            </view>
            <view :class="{ 'li': true, 'active': current === 1 }" @click='switchTab(1)'>
                {{ $t("fundInfo.fundPerformance") }}
            </view>
            <view :class="{ 'li': true, 'active': current === 2 }" @click='switchTab(2)'>
                {{ $t("fundInfo.investCompose") }}
            </view>
        </view>
        <view v-if='inited'>
            <!-- 基本信息 -->
            <fund-base 
                v-if='current === 0' 
                :fund-info='fund'
            />
            <!-- 市场表现 -->
            <fund-performance 
                v-if='current === 1' 
                :fund-id='fundId'
            />
            <!-- 投资组合 -->
            <fund-invest-compose
                v-if='current === 2'
                :fund-id='fundId'
            />
            <!-- 底部提示 -->
            <bootom-tip />
        </view>
    </view>
</template>

<script>
import fundBase from './fund-base.vue'
import fundPerformance from './fund-performance.vue'
import fundInvestCompose from './fund-invest-compose.vue'
import bootomTip from './bottom-tip.vue'
import store from '@/store'
import { isEmpty, localGet, localSet } from '@/utils/util'
export default {
    components: {
        fundBase,
        fundPerformance,
        fundInvestCompose,
        bootomTip
    },
    props: {
        // 基金id
        fundId: {
            type: [Number, String],
            default: ''
        },
        // 基金数据
        fund: {
            type: Object,
            default: () => {}
        }
    },
    data () {
        return {
            // 当前选项
            current: !isEmpty(localGet('fundInfoTabIndex')) ? localGet('fundInfoTabIndex') : 1
        }
    },
    // 数据加载完成
    computed: {
        inited () {
            return store.state._base.inited
        }
    },
    watch: {
        // 监听current
        current: {
            handler () {
                localSet('fundInfoTabIndex', this.current)
            },
            immediate: true
        }
    },
    methods: {
        // 切换选项卡
        switchTab (index) {
            if (this.current !== index) {
                this.current = index
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.fund-information {
	@include styles('background', 'contentColor');
	padding: 40rpx 0;
}
.tabs {
	display: flex;
	justify-content: center;
	.li {
		@include styles('color', 'minorColor');
		display: inline-flex;
		justify-content: center;
		align-items: center;
		width: 200rpx;
		height: 60rpx;
		line-height: 1;
		font-size: 28rpx;
		&.active {
			@include styles('background', 'assistColor');
			@include styles('color', 'primary');
		}
	}
}
</style>
