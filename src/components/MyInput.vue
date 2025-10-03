<template>
    <component :is="h(ElInput, { ...$attrs, ref: funcRef }, $slots)" />
    <button @click="onClick">click</button>
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

const demo = () => console.log('我是子组件的方式')

const emit = defineEmits<{
    (e: 'selfFun', data: string): void,
    (e: 'update:abs', data: string): void
}>()

const onClick = () => {
    emit('selfFun', '我是子组件,我点击了父组件方法')
}

// 暴露给父组件方法 element-plus input 身上的方法
const funcRef = (exposed: Record<string, any> | null) => {
    if (!vm) return;
    vm.exposed = {
        ...exposed,
        demo
    };
}

defineExpose({} as ComponentInstance<typeof ElInput> & { demo: () => void })
</script>