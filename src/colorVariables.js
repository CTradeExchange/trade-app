import { localGet, localSet } from '@/utils/util.js'
import store from '@/store/index.js'

const colors = {
    common: {
        primary: '#0062ff',
        primaryBg: '#EA5A261A',
        riseColor: '#03A66D',
        fallColor: '#ef5353',
        warn: '#ef5353',
        success: '#03A66D',
        focusColor: '#f2a11b',
        quoteRiseBg: '#f8e8e8',
        quoteFallBg: '#e9f0f7',
        mainColor: '#000000',
        checkColor: '#ff9900',
        successColor: '#00cc66',
        rejectColor: '#ff0000'
    },
    night: {
        primaryAssistColor: '#2c2e3b',
        color: '#eaebee',
        normalColor: '#9294a3',
        minorColor: '#9294a3',
        placeholdColor: '#515366',
        contentColor: '#191a1e',
        bgColor: '#0d0e12',
        assistColor: '#2c2e3b',
        lineColor: '#2c2e3b'
    },
    light: {
        primaryAssistColor: '#f4f7fc',
        color: '#333333',
        normalColor: '#656667',
        minorColor: '#999999',
        placeholdColor: '#c2c2c2',
        contentColor: '#ffffff',
        bgColor: '#F1F2F6',
        assistColor: '#f8f8f8',
        lineColor: '#eeeeee'
    }
}

// 更新body类
function updateBodyClass (themeColor) {
    // #ifdef H5
    const classList = document.documentElement.classList
    if (!themeColor || classList.contains(themeColor)) return false
    classList.remove('light', 'night')
    classList.add(themeColor)
    // #endif
}

// 设置root变量
export function setRootVariable (themeColor, primaryColor) {
    const invertColor = themeColor || localGet('invertColor')
    const chartColorType = localGet('chartConfig') ? JSON.parse(localGet('chartConfig'))?.chartColorType : 1
    if (primaryColor) {
        colors.common.primary = primaryColor
    }
    const colorsArr = Object.assign(colors[invertColor], colors.common)
    updateBodyClass(invertColor)
    const { riseColor, fallColor } = colorsArr

    if (Number(chartColorType) === 1) {
        colorsArr.riseColor = fallColor
        colorsArr.fallColor = riseColor
    } else {
        colorsArr.riseColor = riseColor
        colorsArr.fallColor = fallColor
    }

    // #ifndef H5
    store.commit('Update_style', colorsArr)
    // #endif

    // #ifdef H5
    const style = document.body.style
    for (const key in colorsArr) {
        if (Object.hasOwnProperty.call(colorsArr, key)) {
            const el = colorsArr[key]
            style.setProperty(`--${key}`, el)
        }
    }
    store.commit('Update_style', colorsArr)
    localSet('themeColors', JSON.stringify(colors))
    // #endif
	
    return colorsArr
}

export default colors
