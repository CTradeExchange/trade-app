'use strict'
const db = uniCloud.database()
exports.main = async(event, context) => {
    const collection = db.collection('error-log')
    const res = await collection.add(event)
	
    // 返回数据给客户端
    return res
}
