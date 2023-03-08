export default function (wsURL) {
    const protocol = 'ws:'
    const url = wsURL.startsWith('ws') ? wsURL : protocol + wsURL
    const ws = uni.connectSocket({
        url: url,
        success: res => {
            console.log('WebSocket创建成功', url)
        },
        fail: err => {
            console.log('WebSocket创建失败', url, err)
        }  
    })
    return ws
}
