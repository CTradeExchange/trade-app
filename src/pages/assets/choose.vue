<template>
    <view class='layout' :change-color='changeColor' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container'>
            <!-- 头部导航栏 -->
            <nav-bar :title="$t('cRoute.chooseCurrency')" />
            <!-- 内容区域 -->
            <view class='layout-content'>
                <tui-list-view class='account-list' :size='28' :title='title'>
                    <block v-for='(item, index) in accountList' :key='index'>
                        <tui-list-cell arrow :hover='false' :index='index' @click='goPage'>
                            <view class='item'>
                                {{ item.currency }}
                            </view>
                        </tui-list-cell>
                    </block>
                </tui-list-view>
            </view>
        </view>
		
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>
export default {
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 玩法类型
            tradeType: '',
            // 类型
            type: '',
            // 页面标题
            title: ''
        }
    },
    computed: {
        // 账户列表
        accountList () {
            return this.customerInfo?.accountList?.filter(el => el.tradeType === Number(this.tradeType)) || []
        }
    },
    onLoad (options) {
        this.tradeType = Number(options.tradeType)		
        this.type = options.type
        // 设置页面标题
        this.setTitle()
		
        // 初始化
        this.$init().then(() => {
            this.skeletonShow = false
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('assets_choose_view')
    },
    methods: {
        // 设置页面标题
        setTitle () {
            switch (this.type) {
                case 'repayment':
                    this.title = this.$t('trade.repaymentCurrency')
                    break
            }
        },
		
        // 跳转页面
        goPage (e) {
            const item = this.accountList[e.index]
            switch (this.type) {
                // 跳转到还款页面
                case 'repayment':
                    this.$method.goRepayment(item)
                    break
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.account-list {
	&::v-deep .tui-cell-arrow::before {
		@include styles('border-color', 'minorColor');
	} 
	.item {
		display: flex;
		align-items: center;
		height: 50rpx;
	}
}
</style>
