import Vue from 'vue'
import store from '@/store/index.js'
import CreateSocket from './createSocket'
import QuoteSocketEvent from './quoteSocketEvent'
import MsgSocketEvent from './msgSocketEvent'
import { ungzip } from './socketUtil'
import { getToken } from '@/utils/util.js'                     
 
const firstTime = 3000 // 第一次检测webocket是否连接的间隔时间  

// 行情服务变量
let quoteFirst = true 	// 是否第一次连接行情服务
let quoteFirstTimer = null 	// 第一次连接行情服务定时器

// 消息服务变量
let msgFirst = true		// 是否第一次连接消息服务
let msgFirstTimer = null // 第一次连接消息服务定时器

// 行情websocket
export const QuoteSocket = new QuoteSocketEvent()  
// 消息websocket
export const MsgSocket = new MsgSocketEvent()  

/** 
 * 获取 - 行情服务websocket地址
 * 游客用户使用 /quote_guest
 * 登录用户使用 /quote
 */
export const getQuoteService = () => {
    let { quoteService } = store.state._base.wpCompanyInfo
    // const token = getToken()
    // if (token) {
    //     quoteService = quoteService.replace('/quote', '/quote_guest')
    // } else {
    //     quoteService = quoteService.replace('/quote', '/quote_guest')
    // }
    quoteService = quoteService.replace('/quote', '/quote_guest')
    return quoteService
}

// 设置 - 行情服务websocket地址
export const setQuoteService = () => {
    const url = getQuoteService()
    QuoteSocket.ws.url = url
    QuoteSocket.ws.close()
}

// 行情服务初始化
export const QuoteWsInit = ({ $store }) => {
    const quoteService = getQuoteService()
    const quoteWS = CreateSocket(quoteService)
    QuoteSocket.init(quoteWS, $store)
    Vue.prototype.$QuoteSocket = QuoteSocket
    
    quoteWS.onOpen(() => {
	    console.log('WebSocket连接已打开quote')
        quoteFirst = false
	    QuoteSocket.initPing() // 心跳
	    QuoteSocket.onOpen() // 连接成功
    })
	
    quoteWS.onClose(res => {
        quoteFirst = true
	    console.log('WebSocket连接已关闭quote')
    })
	
    quoteWS.onMessage(evt => {
	    if (typeof evt.data === 'string' && evt.data.startsWith('p(')) {
	        return QuoteSocket.tick(evt.data)
        } else if (typeof evt.data === 'string' && evt.data.startsWith('pr(')) {
            return QuoteSocket.tick24H(evt.data)
	    } else if (typeof evt.data === 'string' && evt.data.startsWith('pt(')) {
	        return QuoteSocket.deal_tick(evt.data)
	    } else if (typeof evt.data === 'string' && evt.data.startsWith('pd(')) {
	        return QuoteSocket.handicap_tick(evt.data)
	    } else if (typeof evt.data === 'string' && evt.data.indexOf('{') !== 0) return
	
	    try {
	        if (typeof evt.data === 'object') {
	            ungzip(evt.data).then(res => {
	                QuoteSocket.onMessage(res)
	            })
	        } else {
	            const data = JSON.parse(evt.data)
	            QuoteSocket.onMessage(data)
	        }
	    } catch (error) {}
    })
	
    // 检验WebSocket是否连接成功
    if (quoteFirst) {
	    clearInterval(quoteFirstTimer)
	    quoteFirstTimer = setInterval(() => {
	        if (quoteWS.readyState === 1) {
	            clearInterval(quoteFirstTimer)
	        }
	        if (quoteWS.readyState === 3) {
	            clearInterval(quoteFirstTimer)
	            quoteFirst = false
	            QuoteWsInit({ $store })
	        }
	    }, firstTime)
    }
}

// 消息服务初始化 
export const MsgWsInit = ({ $store }) => {
    if (!getToken()) return
    const { msgService } = store.state._base.wpCompanyInfo 
    const msgWS = CreateSocket(msgService)
    MsgSocket.init(msgWS, $store)
    Vue.prototype.$MsgSocket = MsgSocket   
	
    msgWS.onOpen(() => {
	    console.log('WebSocket连接已打开msg')
        msgFirst = false 
	    MsgSocket.initPing() // 心跳
	    MsgSocket.onOpen() // 连接成功 
    })
	
    msgWS.onClose(res => {
        msgFirst = true
	    console.log('WebSocket连接已关闭msg')
    })
	
    msgWS.onMessage(evt => {
	    if (typeof evt.data === 'string' && evt.data.startsWith('f(')) return MsgSocket.positionsTick(evt.data, 1)
	    else if (typeof evt.data === 'string' && evt.data.startsWith('g(')) return MsgSocket.positionsTick(evt.data, 2)
	    if (typeof evt.data === 'object' || evt.data.indexOf('{') !== 0) return
	    try {
	        const data = JSON.parse(evt.data)
	        MsgSocket.onMessage(data)
	    } catch (error) {}
    })
	
    // 检验WebSocket是否连接成功
    if (msgFirst) {
	    clearInterval(msgFirstTimer)
	    msgFirstTimer = setInterval(() => {
	        if (msgWS.readyState === 1) {
	            clearInterval(msgFirstTimer)
	        }
	        if (msgWS.readyState === 3) {
	            clearInterval(msgFirstTimer)
	            msgFirst = false
	            MsgWsInit({ $store })
	        }
	    }, firstTime)
    }
}

// 断开websocket
export const disconnectWebsocket = () => {
    if (QuoteSocket.ws) QuoteSocket.ws.close()
    if (MsgSocket.ws) MsgSocket.ws.close()
}

// 重连websocket
export const reconnectWebsocket = () => {
    if (QuoteSocket.ws && QuoteSocket.ws.readyState !== 1) {
	    QuoteSocket.ws.close()
	    QuoteWsInit({ $store: store })
    }
    if (MsgSocket.ws && MsgSocket.ws.readyState !== 1) {
	    MsgSocket.ws.close()
	    MsgWsInit({ $store: store })
    }
}
