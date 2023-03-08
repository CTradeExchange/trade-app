<template>
    <view class='page-component'>
        <block v-for='(item, index) in moduleList' :key='index'>
            <swipe-box v-if="item.tag === 'swipe'" :data='item.data' />
            <layout-box v-if="item.tag === 'layout'" :data='item.data' />
            <img-box v-if="item.tag === 'img'" :data='item.data' />
        </block>
    </view>
</template>

<script>	
// components
import swipeBox from '@/components/model/swipe-box'
import layoutBox from '@/components/model/layout-box'
import imgBox from '@/components/model/img-box'

export default {
    components: {
        swipeBox,
        layoutBox,
        imgBox
    },
    props: {
        // 页面配置数据
        data: {
            type: Array,
            default: () => []
        }
    },
    watch: {
        // 监听页面配置数据
        data() {
            const list = []
            this.data.map(item => {
                const itemEl = JSON.parse(JSON.stringify(item))
                const { style, linkComp, linkCompPosition } = itemEl.data
                const styleObj = {}
                for (const key in style) {
                    if (style.hasOwnProperty(key)) {
                        styleObj[key] = Number(style[key]) + 'px'
                    }
                }
                if (linkComp && linkCompPosition) {
                    Object.assign(styleObj, {
                        position: 'absolute',
                        left: 0
                    })
                    switch (linkCompPosition) {
                        case 'top':
                            styleObj.top = 0
                            styleObj.left = 0
                            styleObj.right = 0
                            break
                        case 'bottom':
                            styleObj.bottom = 0
                            styleObj.left = 0
                            styleObj.right = 0
                            break
                        case 'bottom-left':
                            styleObj.bottom = 0
                            styleObj.left = 0
                            break
                        case 'bottom-right':
                            styleObj.bottom = 0
                            styleObj.right = 0
                            break
                        case 'top-right':
                            styleObj.top = 0
                            styleObj.right = 0
                            break
                        case 'top-left':
                            styleObj.top = 0
                            styleObj.left = 0
                            break
                    }
                }
                itemEl.data.styleObj = styleObj
                list.push(itemEl)
            })
            this.moduleList = list
        }
    },
    data() {
        return {
            // 模块列表数据
            moduleList: []
        }
    }
}
</script>

<style lang="scss" scoped>
</style>
