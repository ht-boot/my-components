<template>
    <component :is="h(ElInput, { ...$attrs, ref: funcRef }, $slots)" />
</template>

<script setup lang="ts">
import { h, getCurrentInstance, type ComponentInstance } from 'vue'
import { ElInput } from 'element-plus'

const vm = getCurrentInstance()

// 定义props
const props = defineProps({
    abs: {
        type: String,
        default: ''
    }
})

// 暴露给父组件方法 element-plus input 身上的方法
const funcRef = (exposed: Record<string, any> | null) => {
    if (!vm) return;
    vm.exposed = exposed;
}

// 推导ElInput的实例类型
defineExpose({} as ComponentInstance<typeof ElInput>)
</script>