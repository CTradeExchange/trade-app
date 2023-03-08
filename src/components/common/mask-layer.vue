<template>
    <view
        :class="['mask-layer', show ? 'mask-layer-show' : 'mask-layer-hide']"
        @click='closeMask'
        @touchmove.stop.prevent
    />
</template>

<script>
export default {
    props: {
        // 是否显示遮罩层
        show: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        // 关闭遮罩层
        closeMask () {
            this.$emit('close')
        }
    }
}
</script>

<style lang="scss" scoped>
.mask-layer {
	position: fixed;
	height: 100%;
	left: 0;
	right: 0;
	z-index: 1000;
	background-color: rgba(0, 0, 0, .4);
	overflow: hidden;
}

.mask-layer-show {
	visibility: visible;
	opacity: 1;
	transition: all .3s ease-in-out;
}

.mask-layer-hide {
	visibility: hidden;
	opacity: 0;
}
</style>
