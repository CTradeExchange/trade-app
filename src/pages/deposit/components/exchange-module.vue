<template>
    <view class='module-content'>
        <!-- 不在存款时间内 -->
        <view v-if='timeTip' class='none-times'>
            <tui-icon class='icon' name='clock-fill' />
            <view class='text'>
                {{ timeTip }}
            </view>
        </view>
        <!-- 充值操作 -->
        <view v-else class='module-case'>
            <!-- 待购买 -->
            <div v-if='pageModule === 1' class='module-handle'>
                <div class='block'>
                    <p class='block-label'>
                        <span>{{ $t('deposit.youReceive') }}</span>
                        <tui-icon
                            class='info'
                            :color='$style.minorColor'
                            name='about-fill'
                            :size='36'
                            unit='rpx'
                            @click="showInfo($t('deposit.youReceiveTip'))"
                        /> 
                    </p>
                    <div class='block-box'>
                        <div class='import'>
                            <input v-model='amount' :placeholder='buyPlaceholder' placeholder-class='placeholderClass' type='digit' @input='inputAmount' />
                            <tui-icon v-if='amount' class='clear-close' name='close-fill' @click='clearInput' />
                        </div>
                        <div :class="['select', currencyShowMenu ? 'show' : 'hide']" @click.stop='toggleBuyMenu'>
                            <currency-icon v-if='currency' :currency='currency' :size='48' />
                            <span>{{ currency }}</span>
                            <tui-icon class='arrow' :color='$style.minorColor' name='arrowdown' :size='48' unit='rpx' />
                        </div>
                    </div>
                    <p v-if='showBuyTip && paymentInfo' class='block-tip red'>
                        <tui-icon class='about' color='red' name='about-fill' :size='28' unit='rpx' />
                        <span>{{ $t('deposit.amountTip', { singleLowAmount: accountInfo.singleLowAmount, singleHighAmount: accountInfo.singleHighAmount }) }}</span>
                    </p>
                </div>
                <div class='block'>
                    <p class='block-label'>
                        <span>{{ $t('deposit.youPay') }}</span>
                        <tui-icon
                            class='info'
                            :color='$style.minorColor'
                            name='about-fill'
                            :size='36'
                            unit='rpx'
                            @click="showInfo($t('deposit.youPayTip'))"
                        /> 
                    </p>
                    <div class='block-box'>
                        <div class='import'>
                            <input v-model='expectedAmount' :placeholder="$t('deposit.inputAmount')" placeholder-class='placeholderClass' type='digit' @input='inputExpectedAmount' />
                            <tui-icon v-if='expectedAmount' class='clear-close' name='close-fill' @click='clearInput' />
                        </div>
                        <div :class="['select', paymentShowMenu ? 'show' : 'hide']" @click.stop='togglePaymentMenu'>
                            <currency-icon v-if='paymentCurrency' :currency='paymentCurrency' :size='48' />
                            <span>{{ paymentCurrency }}</span>
                            <tui-icon class='arrow' :color='$style.minorColor' name='arrowdown' :size='48' unit='rpx' />
                        </div>
                    </div>
                    <p v-if='paymentCurrency' class='block-tip'>
                        <span>{{ $t('deposit.includeFee') }}: {{ payCurrencyFee || '0.00' }} {{ paymentCurrency }}</span>
                    </p>
                </div>
                <div v-if='chainList.length > 0' class='block'>
                    <p class='block-label'>
                        <span>{{ $t('deposit.depositNework') }}</span>
                        <tui-icon
                            class='info'
                            :color='$style.minorColor'
                            name='about-fill'
                            :size='36'
                            unit='rpx'
                            @click="showInfo($t('deposit.depositNeworkTip1'))"
                        /> 
                    </p>
                    <div class='block-box'>
                        <div :class="['select select-flex', chainShowMenu ? 'show' : 'hide']" @click.stop='toggleChainMenu'>
                            <span>{{ chainName }}</span>
                            <tui-icon class='arrow' :color='$style.minorColor' name='arrowdown' :size='48' unit='rpx' />
                        </div>
                    </div>
                    <p class='block-tip red'>
                        <tui-icon class='about' color='red' name='about-fill' :size='28' unit='rpx' />
                        <span>{{ $t('deposit.depositNeworkTip2') }}</span>
                    </p>
                </div>
                <div class='handle'>
                    <p v-if='paymentCurrency' class='handle-conversion'>
                        {{ $t('deposit.estimatedPrice') }}: 1 {{ currency }} = {{ rateNum }} {{ paymentCurrency }}
                    </p>
                    <button v-if='isNext' class='handle-next default' @click='onNext'>
                        <span>
                            {{ $t('common.continue') }}
                        </span>
                    </button>
                    <view v-else class='handle-relative'>
                        <button class='handle-next disable' @click='openPopoverTip'>
                            <span>
                                {{ $t('common.continue') }}
                            </span>
                        </button>
                        <popover-tips v-model='showPopoverTip' auto-close :text="$t('deposit.inputAmount')" />
                    </view>
                    <!-- <view class='handle-tip'>
                        {{ $t('deposit.channelTip') }}
                    </view> -->
                </div>
            </div>
            <!-- 支付结果 -->
            <template v-else>
                <!-- 待支付、待处理 -->
                <div v-if='pageModule === 2 || pageModule === 3' class='module-result module-result-unpaid'>
                    <div v-if='isRefresh' class='block'>
                        <tui-loadmore :index='3' text='' type='primary' />
                        <p class='loading'>
                            <span>
                                {{ $t('common.loading') }}
                            </span>
                        </p>
                    </div>
                    <div v-else class='block'>
                        <tui-icon class='icon' :color='$style.color' name='order' />
                        <p class='state'>
                            <span>
                                {{ pageModule === 2 ? $t('deposit.tobePay') : $t('deposit.tobeProcessed') }}
                            </span>
                        </p>
                        <p class='tip-1'>
                            {{ $t('deposit.payTip1') }}
                            <span @click='onRefresh'>
                                {{ $t('common.refresh') }}
                            </span>
                        </p>
                    </div>
                    <div class='tip-2'>
                        {{ $t('deposit.payTip2') }}
                        <span @click='toService'>
                            {{ $t('common.serivce') }}
                        </span>
                    </div>
                </div>
                <!-- 购买成功 -->
                <div v-if='pageModule === 4' class='module-result module-result-success'>
                    <tui-icon class='icon' color='rgb(0, 204, 0)' name='circle-fill' />
                    <p class='state'>
                        {{ $t('deposit.depositSuccess') }}
                    </p>
                    <p class='tip-1'>
                        {{ $t('deposit.payTip3', { finalAmount: orderResult.finalAmount, depositCurrency: orderResult.depositCurrency }) }}
                    </p>
                    <div class='btn-group'>
                        <button class='btn-1' @click='toTrade'>
                            {{ $t('deposit.toTrade') }}
                        </button>
                        <button class='btn-2' @click='goAssets'>
                            {{ $t('deposit.checkAccount') }}
                        </button>
                    </div>
                </div>
                <!-- 购买失败 -->
                <div v-if='pageModule === 5' class='module-result module-result-fail'>
                    <tui-icon class='icon' color='rgb(255, 0, 0)' name='close-fill' />
                    <p class='state'>
                        {{ $t('deposit.rechargeFailed') }}
                    </p>
                    <p v-if='orderResult.remark' class='tip-1'>
                        {{ $t('deposit.failureReason') }}：{{ orderResult.remark }}
                    </p>
                    <div class='btn-group'>
                        <button class='btn-1' @click='toService'>
                            {{ $t('common.serivce') }}
                        </button>
                        <button class='btn-2' @click='pageModule = 1'>
                            {{ $t('deposit.againRecharge') }}
                        </button>
                    </div>
                </div>
            </template>
        </view>
		
        <!-- 选择购买币种弹窗 -->
        <assets-dialog 
            v-if='accountList.length > 0'
            :account-id.sync='accountId' 
            :account-list='accountList'
            :currency.sync='currency'
            :model-value.sync='currencyShowMenu' 
            :title="$t('deposit.youReceive')" 
            :trade-type='tradeType'
        />
        <!-- 选择支付币种弹窗 -->
        <assets-dialog
            v-if='paymentCurrencyList.length > 0'
            :account-list='paymentCurrencyList'
            :currency.sync='paymentCurrency'
            :model-value.sync='paymentShowMenu'
            :title="$t('deposit.youPay')"
            :trade-type='tradeType'
        />
        <!-- 选择充值网络弹窗 -->
        <assets-dialog
            v-if='chainList.length > 0'
            :account-list='chainList'
            :currency.sync='chainName'
            :flex='1'
            :model-value.sync='chainShowMenu'
            :title="$t('deposit.depositNework')"
            :trade-type='tradeType'
        />
        <!-- 补充资料弹窗 -->
        <further-information 
            :extend='extend' 
            is-deposit 
            :visible.sync='appendVis' 
            @complete='completeExtend' 
        />
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
    </view>
</template>

<script>
import assetsDialog from '@/components/modules/assets-dialog'
import furtherInformation from '@/components/modules/further-information.vue'
import popoverTips from '@/components/common/popover-tips.vue'
import { queryDepositExchangeRate, handleDesposit, queryDepositProposal } from '@/api/user'
import { getListByParentCode } from '@/api/base'
import { isEmpty, localGet, localSet, localRemove } from '@/utils/util'
import { mul, divide, minus, plus, toFixed } from '@/utils/calculation'
import { toService } from '@/utils/method'
	
export default {
    components: {
        assetsDialog,
        furtherInformation,
        popoverTips
    },
    data () {
        return {
            // 页面参数
            options: {},
            // 跳转到客服页面
            toService,
            // 玩法类型
            tradeType: '',
            // 当前选择的购买货币
            currency: '',
            // 当前账户id
            accountId: '',
            // 页面显示模块 1.待购买 2.待支付 3.待处理 4.购买成功 5.购买失败
            pageModule: -1,
            // 是否在刷新中
            isRefresh: false,
            // 存款货币列表
            accountList: [],
            // 是否显示账户下拉菜单
            currencyShowMenu: false,
            // 当前汇兑支付通道
            paymentInfo: '',
            // 支付货币列表
            paymentCurrencyList: [],
            // 当前选择的支付货币
            paymentCurrency: '',
            // 是否显示支付货币下拉菜单
            paymentShowMenu: false,
            // 链名称列表
            chainList: [],
            // 当前选择的链名称
            chainName: '',
            // 是否显示链名称列表下拉菜单
            chainShowMenu: false,
            // 购买数量
            amount: '',
            // 购买币种手续费
            buyCurrencyFee: '',
            // 预计支付数量
            expectedAmount: '',
            // 支付币种手续费
            payCurrencyFee: '',
            // 存款汇率配置数据
            rateConfig: {},
            // 购买/支付汇率
            rateNum: '',
            // 存款提案创建成功返回的数据
            despositResult: {
                data: '{}'
            },
            // 订单结果
            orderResult: {},
            // 是否显示补充资料弹窗
            appendVis: false, 
            // 需要补充资料的数据
            extend: {}, 
            // 补充完整的资料数据
            appendMap: '',
            // 最后一次输入项 buy:购买 payment:支付
            lastInputType: '',
            // 定时器对象
            timer: null,
            // 是否回调跳转页面
            isCallback: false,
            // 存款时间提示
            timeTip: '',
            // 是否显示气泡提示
            showPopoverTip: false
        }
    },
    computed: {
        // 账户信息
        accountInfo () {
            return this.accountList.find(el => el.currency === this.currency) || {}
        },
        // 购买输入框提示
        buyPlaceholder () {
            return isEmpty(this.accountInfo) ? '' : (this.accountInfo.singleLowAmount + '～' + this.accountInfo.singleHighAmount)
        },
        // 是否显示购买提示文案
        showBuyTip () {
            if (isEmpty(this.amount)) return false
            if (parseFloat(this.amount) < parseFloat(this.accountInfo.singleLowAmount) || parseFloat(this.amount) > parseFloat(this.accountInfo.singleHighAmount)) {
                return true
            } else {
                return false
            }
        },
        // 是否可进行下一步
        isNext () {
            return !this.showBuyTip && !isEmpty(this.amount) && this.rateNum
        },
        // 购买币种小数位
        buyCurrencyDigits () {
            const result = this.customerInfo.accountList.find(el => el.currency === this.currency)
            return result?.digits || 2
        },
        // 支付币种小数位
        paymentCurrencyDigits () {
            const result = this.customerInfo.accountList.find(el => el.currency === this.paymentCurrency)
            return result?.digits || 2
        },
        // 输入的购买数量小数位长度
        amountDigitsLength () {
            const arr = this.amount.toString().split('.')
            return arr ? arr[1]?.length : 0
        }
    },
    watch: {
        // 监听页面模块
        pageModule () {
            if (this.pageModule === 4 || this.pageModule === 5) {
                clearInterval(this.timer)
                localRemove('proposalNo')
            }
        },
        // 监听购买币种
        currency () {
            if (this.currency) {
                this.paymentCurrency = ''
                this.resetInput()
                this.setPaymentList()
            }
        },
        // 监听支付币种
        paymentCurrency () {
            // 支付币种为USDT获取链名称列表
            if (this.paymentCurrency === 'USDT') {
                // 获取币种链名称列表数据
                this.getChainList()
            } else {
                this.chainList = []
                this.chainName = ''
            }
            if (this.paymentCurrency) {
                this.resetInput()
                this.getDepositExchangeRate()
            }
        }
    },
    beforeDestroy () {
        // 清除定时器
        clearInterval(this.timer)
    },
    methods: {
        // 初始化数据
        init (data) {
            this.options = data
            this.tradeType = data.tradeType
            this.isCallback = data.isCallback
            this.paymentInfo = data.paymentInfo
            this.reset()
            this.$nextTick(() => {
                // 清除定时器
                clearInterval(this.timer)
                // 通道存款时间验证
                this.checkDepositTime()
                // 设置账户币种列表
                this.setAccountList()
                // 设置补充资料数据
                this.extend = data.paymentInfo.extend
            })
        },
		
        // 重置页面数据
        reset () {
            clearInterval(this.timer)
            this.pageModule = 1
            this.currency = ''
            this.accountList = []
            this.paymentCurrencyList = []
            this.paymentCurrency = ''
            this.rateConfig = {}
            this.rateNum = ''
            this.extend = {}
            this.appendMap = ''
            this.lastInputType = ''
            this.timeTip = ''
            this.resetInput()
        },
		
        // 重置输入内容
        resetInput () {
            this.amount = ''
            this.expectedAmount = ''
            this.buyCurrencyFee = ''
            this.payCurrencyFee = ''
        },
		
        // 弹出提示
        showInfo (content) {
            this.$refs['modalDialog'].show({
                content
            })
        },
		
        // 弹窗气泡提示
        openPopoverTip () {
            if (isEmpty(this.amount)) {
                this.showPopoverTip = true
            }
        },
		
        // 跳转到交易页面
        toTrade () {
            uni.switchTab({
                url: '/pages/order/index'
            })
        },
		
        // 跳转到资产页面
        goAssets () {
            uni.switchTab({
                url: '/pages/assets/index'
            })
        },
		
        // 设置账户币种列表
        setAccountList () {
            const accountList = this.customerInfo.accountList.filter(el => Number(el.tradeType) === Number(this.tradeType))
            const data = this.paymentInfo.limitConfigList
            const result = []
            accountList.map(account => {
                data.map(item => {
                    const el = Object.assign({}, item)
                    if (account.currency === el.accountCurrency) {
                        // 设置购买数量限制
                        if (Number(el.feeType === 1)) {
                            el.singleLowAmount = minus(el.singleLowAmount, el.fee)
                            el.singleHighAmount = minus(el.singleHighAmount, el.fee)
                        } else {
                            el.singleLowAmount = mul(el.singleLowAmount, (1 - el.fee))
                            el.singleHighAmount = mul(el.singleHighAmount, (1 - el.fee))
                        }
                        result.push({
                            ...account,
                            ...el
                        })
                    }
                })
            })
            // 设置默认选择币种
            let accountInfo = result.find(el => el.currency === this.options.currency) || {}
            if (result.length > 0) {
                if (isEmpty(accountInfo)) accountInfo = result[0]
                this.currency = accountInfo.currency
                this.accountId = accountInfo.accountId
                // 定时查询订单结果
                if (this.isCallback) {
                    this.timingQueryDepositResult()
                } else {
                    this.pageModule = 1
                }
            } else {
                uni.hideLoading()
                this.pageModule = 1
            }
            this.accountList = result
        },
		
        // 设置支付货币列表
        setPaymentList () {
            const paymentInfo = this.paymentInfo
            // 设置支付币种列表数据
            const arr = paymentInfo.paymentCurrency.split(',')
            const result = []
            arr.map(el => {
                result.push({ currency: el })
            })
            if (result.length > 0) {
                this.paymentCurrencyList = result
                this.paymentCurrency = result[0].currency
            } else {
                this.paymentCurrencyList = []
                this.paymentCurrency = ''
            }
        },
	
        // 获取币种链名称列表数据
        getChainList () {
            const result = []
            getListByParentCode({ parentCode: 'USDT' }).then(res => {
                if (res.data.length > 0) {
                    res.data.forEach(item => {
                        result.push({ currency: item.code, ...item })
                    })
                    this.chainList = result
                    this.chainName = result[0].code
                } else {
                    this.chainList = []
                    this.chainName = ''
                }
            })
        },
		
        // 获取购买/支付货币对汇率
        getDepositExchangeRate () {
            uni.showLoading({
                title: this.$t('common.loading'),
                mask: true
            })
            const param = {
                tradeType: this.tradeType,
                accountId: this.accountId,
                accountCurrency: this.currency,
                paymentCurrency: this.paymentCurrency 
            }
            if (this.paymentInfo.paymentCode === 'opspay') {
                param.channelCode = this.paymentInfo.paymentCode
            }
            queryDepositExchangeRate(param).then(res => {
                uni.hideLoading()
                if (res.check()) {
                    const rateConfig = res.data
                    let value = rateConfig.formulaSymbol === 'multiply' ? mul(1, rateConfig.exchangeRate) : divide(1, rateConfig.exchangeRate)
                    value = toFixed(value, this.buyCurrencyDigits)
                    this.rateConfig = rateConfig
                    this.rateNum = value
                } else {
                    this.rateConfig = {}
                    this.rateNum = ''
                }
            }).catch(res => {
                uni.hideLoading()
                this.$refs['modalDialog'].show({
                    content: res.msg
                })
            })
        },
		
        // 通道存款时间验证
        checkDepositTime () {
            const openTime = this.paymentInfo.openTime
            let isDialog = false
            const timeList = []
            if (!isEmpty(openTime)) {
                const todayStr = this.$dayjs().format('YYYY-MM-DD')
                const tomorrowStr = this.$dayjs().add(1, 'day')
                const [start, end] = openTime.split('-')
                const startLocal = this.$dayjs.utc(`${todayStr} ${start}`).local()
                const endLocal = this.$dayjs.utc(`${todayStr} ${end}`).local()
                	
                if ((startLocal.isAfter(todayStr, 'day') && endLocal.isAfter(todayStr, 'day')) || (startLocal.isBefore(tomorrowStr, 'day') && endLocal.isBefore(tomorrowStr, 'day'))) {
                    timeList.push(startLocal.format('HH:mm') + '-' + endLocal.format('HH:mm'))
                } else if (endLocal.format('HH:mm') === '00:00') {
                    timeList.push(startLocal.format('HH:mm') + '-24:00')
                } else {
                    timeList.push(startLocal.format('HH:mm') + '-23:59')
                    timeList.push('00:00-' + endLocal.format('HH:mm'))
                }
                
                // 判断当前时间是否在设置的存款时间内
                const nowDate = this.$dayjs.utc()
                const nowMinutes = nowDate.hour() * 60 + nowDate.minute() // 获取当前天的分钟数
                const startMinutes = parseFloat(start.split(':')[0]) * 60 + parseFloat(start.split(':')[1]) // 计算开始时间的分钟数
                const endMinutes = parseFloat(end.split(':')[0]) * 60 + parseFloat(end.split(':')[1]) // 计算结束时间的分钟数
                isDialog = !(nowMinutes >= startMinutes && nowMinutes <= endMinutes)
            } else {
                isDialog = true
            }
			
            // 不在存款时间弹窗
            let timeTip = ''
            let timeStr = ''
            if (isDialog) {
                timeList.map((el, index) => {
                    timeStr += timeList.length - 1 === index ? el : el + ','
                })
                timeTip = timeStr ? this.$t('deposit.timeTip1') + timeStr : this.$t('deposit.timeTip2')
                this.$refs['modalDialog'].show({
                    content: timeTip,
                    confirmText: this.$t('common.know')
                })
            } 
            this.timeTip = timeTip
        },
	
        // 控制购买货币下拉菜单
        toggleBuyMenu () {
            this.currencyShowMenu = !this.currencyShowMenu
            this.paymentShowMenu = false
            this.chainShowMenu = false
        },
	
        // 控制支付货币下拉菜单
        togglePaymentMenu () {
            this.paymentShowMenu = !this.paymentShowMenu
            this.currencyShowMenu = false
            this.chainShowMenu = false
        },
		
        // 控制充值网络下拉菜单
        toggleChainMenu () {
            this.chainShowMenu = !this.chainShowMenu
            this.currencyShowMenu = false
            this.paymentShowMenu = false
        },
	
        // 计算手续费 (手续费需要用购买数量来计算)
        calculateFee (value) {
            // feeType  1：固定金额手续费 2：百分比手续费
            let buyCurrencyFee = ''
            if (Number(this.accountInfo.feeType === 1)) {
                buyCurrencyFee = this.accountInfo.fee
            } else if (Number(this.accountInfo.feeType === 2)) {
                buyCurrencyFee = divide(mul(value, (this.accountInfo.fee)), minus(1 - this.accountInfo.fee))
            } else {
                buyCurrencyFee = 0
            }
	
            this.buyCurrencyFee = toFixed(buyCurrencyFee, this.buyCurrencyDigits)
            this.payCurrencyFee = toFixed(mul(buyCurrencyFee, this.rateNum), this.paymentCurrencyDigits)
        },
	
        // 计算购买数量
        calculateAmount () {
            if (isEmpty(this.expectedAmount)) {
                this.amount = ''
                this.resetInput()
            } else {
                // 预计支付数量转换成购买数量
                let amount = divide(this.expectedAmount, this.rateNum)
                amount = toFixed(amount, this.buyCurrencyDigits)
                // 计算手续费
                this.calculateFee(amount)
                // 计算购买数量
                this.amount = toFixed(parseFloat(amount) - parseFloat(this.buyCurrencyFee), this.buyCurrencyDigits)
            }
        },
	
        // 计算预计支付数量 (预计支付数量 = (购买数量 + 购买数量的手续费) * 汇率)
        calculateExpectedAmount () {
            if (isEmpty(this.amount)) {
                this.expectedAmount = ''
                this.resetInput()
            } else {
                // 计算手续费
                this.calculateFee(this.amount)
                // 计算预计支付数量
                const amount = parseFloat(this.amount) + parseFloat(this.buyCurrencyFee)
                let value = mul(amount, this.rateNum)
                value = toFixed(value, this.paymentCurrencyDigits)
                this.expectedAmount = value
            }
        },
	
        // 输入购买数量
        inputAmount (event) {
            this.lastInputType = 'buy'
            this.calculateExpectedAmount()
            if (this.amountDigitsLength > this.buyCurrencyDigits) {
                uni.showToast({
                    title: this.$t('deposit.decimalTip'),
                    icon: 'none'
                })
            }
        },
	
        // 输入支付数量
        inputExpectedAmount (event) {
            this.lastInputType = 'payment'
            this.calculateAmount()
        },
	
        // 清空输入框的值
        clearInput () {
            this.resetInput()
        },
	
        // 点击刷新
        onRefresh () {
            if (this.isRefresh) return
            this.isRefresh = true
            this.queryDepositResult()
        },
		
        // 定时查询订单结果
        timingQueryDepositResult () {
            const proposalNo = localGet('proposalNo')
            if (proposalNo) {
                this.queryDepositResult()
                clearInterval(this.timer)
                const timeNum = 5000
                let num = 0
                this.timer = setInterval(() => {
                    num += timeNum
                    // 10分钟后关闭定时器
                    if (10 * 60 * 1000 < num) {
                        clearInterval(this.timer)
                    } else {
                        this.queryDepositResult()
                    }
                }, timeNum)
            } else {
                this.pageModule = 1
            }
        },
	
        // 查询订单结果
        queryDepositResult () {
            return new Promise((resolve, reject) => {
                const proposalNo = localGet('proposalNo')
                if (proposalNo) {
                    const params = {
                        proposalNo,
                        tradeType: this.tradeType,
                        accountId: this.accountId
                    }
                    queryDepositProposal(params).then(res => {
                        const checkStatus = res.data.checkStatus
                        const paymentStatus = res.data.paymentStatus
                        this.orderResult = res.data
                        // 优先判断提案状态再判断支付状态
                        if (checkStatus === 2) {
                            // 购买成功
                            this.pageModule = 4
                        } else if (checkStatus === 3) {
                            // 购买失败
                            this.pageModule = 5
                        } else {
                            // 待支付
                            if (paymentStatus === 1) {
                                this.pageModule = 2
                            } else if (paymentStatus === 2) {
                                // 支付成功待处理
                                this.pageModule = 3
                            } else {
                                // 购买失败
                                this.pageModule = 5
                            }
                        }
                        setTimeout(() => {
                            this.isRefresh = false
                        }, 1000)
                        resolve()
                    }).catch(() => {
                        setTimeout(() => {
                            this.isRefresh = false
                        }, 1000)
                        reject()
                    })
                } else {
                    setTimeout(() => {
                        this.isRefresh = false
                    }, 1000)
                    resolve()
                }
            })
        },
		
        // 补充资料是否全部填写完成
        checkAllComplete () {
            let flag = true
            const extend = this.paymentInfo.extend
            for (const key in extend) {
                if (Object.hasOwnProperty.call(extend, key)) {
                    const element = extend[key]
                    if (isEmpty(element.value)) {
                        flag = false
                    }
                }
            }
            return flag
        },
		
        // 完成补充资料
        completeExtend (data) {
            this.appendMap = data
            // 创建存款提案
            this.handleDeposit()
        },
		
        // 获取存款来源
        getDespositSource () {
            const systemInfo = this.systemInfo
            const platform = systemInfo.platform.toUpperCase()
            let source = ''
            // #ifdef H5
            source = 'H5_' + platform
            // #endif
            // #ifdef APP-PLUS 
            source = 'APP_' + platform
            // #endif
            return source
        },
		
        // 点击下一步
        onNext () {
            // 添加应用内事件
            this.$addAppsEvent('deposit_buyboin_next_click')
            // 判断按钮是否可点击
            if (!this.isNext) return
            if (this.amountDigitsLength > this.buyCurrencyDigits) {
                uni.showToast({
                    title: this.$t('deposit.decimalTip'),
                    icon: 'none'
                })
                return
            }
            // 判断是否需要填写补充资料
            if (!this.checkAllComplete()) {
                this.appendVis = true
                return
            }
		    
            // 创建存款提案
            this.handleDeposit()
        },
		
        // 获取存款参数
        getDepositParams () {
            const paymentInfo = this.paymentInfo
            const params = {
                tradeType: this.tradeType,
                channelCode: this.customerInfo.utmSource,
                accountId: this.accountId,
                depositRateSerialNo: this.rateConfig.depositRateSerialNo,
                paymentCurrency: this.paymentCurrency,
                accountCurrency: this.currency,
                blockchainName: this.chainName,
                exchangeRate: this.rateConfig.exchangeRate,
                paymentChannelCode: paymentInfo.paymentCode,
                paymentChannelType: paymentInfo.paymentType,
                paymentMerchantNo: paymentInfo.merchantNo,
                paymentChannelClientType: 'mobile',
                depositFrom: this.getDespositSource(),
                callbackUrl: 'deposit'
            }
            // 设置购买或者支付数量
            if (this.lastInputType === 'buy') {
                params.depositAmount = plus(this.amount, this.buyCurrencyFee)
            } else {
                params.thirdAmount = this.expectedAmount
            }
            // 补充资料数据
            if (!isEmpty(this.appendMap)) {
                params.extend = JSON.stringify(this.appendMap)
            }

            return params
        },
		
        // 创建存款提案
        handleDeposit () {
            const params = this.getDepositParams()
            uni.showLoading({
                title: this.$t('common.submiting'),
                mask: true
            })
            handleDesposit(params).then(res => {
                uni.hideLoading()
                if (res.data) {
                    this.despositResult = res.data
                    // 存款提案创建成功
                    this.despositSuccess()
                    // 添加应用内事件
                    this.$addAppsEvent('complete_deposit_exchange')
                }
            }).catch(res => {
                uni.hideLoading()
                this.$refs['modalDialog'].show({
                    content: res.msg
                })
            })
        },
		
        // 存款提案创建成功
        despositSuccess () {
            const despositResult = this.despositResult
            if (despositResult.submitType === 'post_data') {
                localSet('formUrl', despositResult.url)
                localSet('formData', despositResult.data)
            } else {
                localSet('browserOpenUrl', despositResult.browserOpenUrl)
            }
            localSet('proposalNo', despositResult.proposalNo)
            localSet('paymentId', this.paymentInfo.id)
            // 设置页面模块显示成待支付
            this.pageModule = 2
            // 定时查询订单结果
            this.timingQueryDepositResult()
            // 跳转到支付页面
            uni.redirectTo({
                url: `/pages/webview/payment?tradeType=${this.tradeType}&type=2`
            })
        }
    }
}
</script>

<style lang="scss" scoped>	
.module-content {
	@include styles('background-color', 'contentColor');
	@include styles('border-color', 'lineColor');
	width: 690rpx;
	margin: 0 auto 30rpx;
	border-radius: 16rpx;
	border-style: solid;
	border-width: 1px;
}
.none-times {
	@include flexColumnCenter;
	flex: 1;
	padding: 80rpx 0;
	&::v-deep {
		.icon {
			@include styles('color', 'minorColor');
			font-size: 100rpx !important;
		}
	}
	.text {
		@include styles('color', 'minorColor');
		margin-top: 30rpx;
		padding: 0 30rpx;
		font-size: 27rpx;
		letter-spacing: 1rpx;
	}
}

.module-case {
    padding: 50rpx 30rpx;
}
/* 待购买 */
.module-handle {
    .block {
        margin-bottom: 70rpx;
		position: relative;
        &:last-of-type {
            margin-bottom: 0;
        }
    }
    .block-label {
		display: flex;
		align-items: center;
        margin-bottom: 16rpx;
        span {
			font-size: 32rpx;
			@include styles('color', 'color');
        }
        &::v-deep {
			.info {
				margin-left: 10rpx !important;
			}
		}
    }
    .block-box {
		@include styles('background-color', 'contentColor');
		@include styles('border-color', 'lineColor');
        display: flex;
        align-items: center;
        height: 90rpx;
		border-width: 1px;
		border-style: solid;
        border-radius: 10rpx;
        position: relative;
        &:hover {
			@include styles('border-color', 'primary');
			border-width: 1px;
			border-style: solid;
        }
        .import {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex: 1;
            height: 100%;
            padding-left: 20rpx;
            input {
                width: calc(100% - 60rpx);
                height: 100%;
                font-size: 36rpx;
            }
			.placeholderClass {
				font-size: 32rpx;
			}
            &::v-deep {
				.clear-close {
					margin-right: 10rpx !important;
				}
			}
        }
        .select {
			@include styles('border-left-color', 'lineColor');
            display: flex;
            align-items: center;
            width: 200rpx;
            height: 100%;
            padding: 0 20rpx;
			border-left-width: 1px;
			border-left-style: solid;
            cursor: pointer;
			&::v-deep {
				.currency-img {
					@include styles('border-color', 'lineColor');
					margin-right: 12rpx;
					border-width: 1px;
					border-style: solid;
					border-radius: 50%;
				}
			}
            span {
				@include text-clamp-one;
                flex: 1;
				font-size: 28rpx;
            }
            .arrow {
                transition: .15s;
                margin-top: -4rpx;
            }
            &.show {
                .arrow {
                    margin-top: 4rpx;
                    transform: rotate(180deg);
                }
            }
        }
		.select-flex {
			width: 100%;
		}
    }
    .block-tip {
        display: flex;
		align-items: flex-start;
        width: 100%;
        position: absolute;
        top: 160rpx;
        font-size: 25rpx;
        &.red {
            color: red;
        }
		::v-deep {
		    .about {
				margin-top: 4rpx !important;
		        margin-right: 6rpx !important;
		    }
		}
    }
    .handle {
    	@include styles('background-color', 'contentColor');
    	padding: 30rpx 0;
    }
	.handle-relative {
		position: relative;
	}
    .handle-conversion {
        margin-bottom: 12rpx;
        text-align: center;
        font-size: 28rpx;
    }
	.handle-next {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 96rpx;
        font-size: 32rpx;
        border-radius: 10rpx;
        transition: ease-in-out .15s; 
        &.disable {
    		@include styles('background-color', 'primary');
			color: #fff;
			opacity: .3;
        }
        &.default {
			@include styles('background-color', 'primary');
            color: #fff;
            cursor: pointer;
        }
    }
    .handle-tip {
    	display: flex;
    	justify-content: center;
    	margin-top: 30rpx;
        text-align: center;
    }
}

/* 支付结果 */
.module-result {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 30rpx 0;
	.state {
	    margin-top: 8rpx;
	    font-size: 42rpx;
	}
	.loading {
		margin-top: 12rpx;
		font-size: 32rpx;
	}
	.tip-1 {
	    text-align: center;
	    line-height: 40rpx;
		margin-top: 6rpx;
	    span {
			@include styles('color', 'primary');
			margin-left: 8rpx;
	        cursor: pointer;
	    }
	}
	.tip-2 {
		@include styles('background-color', 'bgColor');
		@include styles('border-color', 'lineColor');
	    margin-top: 30rpx;
	    padding: 30rpx;
		border-style: solid;
		border-width: 1px;
	    border-radius: 12rpx;
	    span {
			@include styles('color', 'primary');
			margin-left: 8rpx;
	        cursor: pointer;
	    }
	}
	.btn-group {
	    display: flex;
	    margin-top: 60rpx;
	    button {
	        display: flex;
	        justify-content: center;
	        align-items: center;
	        width: 280rpx;
	        height: 90rpx;
	        font-size: 30rpx;
	        cursor: pointer;
	        border-radius: 12rpx;
	        &.btn-1 {
				@include styles('background-color', 'bgColor');
				@include styles('border-color', 'lineColor');
				@include styles('color', 'color');
	            margin-right: 40rpx;
				border-width: 1px;
				border-style: solid;
	        }
	        &.btn-2 {
				@include styles('background-color', 'primary');
	            color: #fff;
	        }
	    }
	}
	&::v-deep {
		.icon {
			font-size: 120rpx !important;
		}
		.tui-loadmore {
			margin: 0 !important;
			line-height: 1 !important;
		}
		.tui-loading-primary {
			width: 80rpx;
			height: 80rpx;
			margin: 0 !important;
			margin-left: -16rpx !important;
		}
	}
}
/* 待支付 */
.module-result-unpaid {
    .state {
		@include styles('color', 'color');
    }
	.block {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		min-height: 240rpx;
	}
}
/* 购买成功 */
.module-result-success {
    .state {
        color: rgb(0, 204, 0);
    }
}
/* 购买失败 */
.module-result-fail {
    .state {
        color: rgb(255, 0, 0);
    }
}
</style>
