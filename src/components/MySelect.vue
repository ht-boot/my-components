<template>
    <div class="my-select">
        <!-- 
      ✅ ElSelect 是 Element Plus 的下拉选择组件 
      ✅ v-bind="{ ...$attrs, ...props }" 表示：
         - 把父组件传来的所有属性（v-model、placeholder 等）透传进去
         - 把自定义 props（如果有扩展属性）也一并传入
      ⚠️ 注意：v-bind 的合并顺序会影响优先级，
         这里 props 在后面可以覆盖 $attrs 同名属性
    -->
        <ElSelect ref="innerRef" v-bind="{ ...$attrs, ...props }">
            <!-- 
        ✅ 动态透传插槽
        - 通过 v-for 遍历所有传入的插槽 ($slots)
        - 自动生成 #default、#prefix、#suffix 等插槽
        - scopedData 是作用域插槽参数对象
      -->
            <template v-for="(_, name) in $slots" #[name]="scopedData">
                <!-- 
          ✅ 将每个插槽透传到 ElSelect 内部
          - :name="(name as keyof __VLS_Slots)" 用于类型约束
          - v-bind="scopedData" 透传作用域参数（如果存在）
        -->
                <slot :name="(name as keyof __VLS_Slots)" v-bind="scopedData" />
            </template>
        </ElSelect>
    </div>
</template>

<script setup lang="ts">
/**
 * ✅ 引入 Element Plus 的 Select 组件
 * 方便我们通过 InstanceType<typeof ElSelect> 暴露类型
 */
import { ElSelect } from "element-plus";

/**
 * ✅ 引入 Vue 核心函数
 * - useSlots: 获取当前组件接收到的插槽集合
 */
import { useSlots } from "vue";

/**
 * ✅ 定义组件 Props 类型
 * 这里只定义了 modelValue（即支持 v-model）
 * 你也可以扩展其他属性，如 placeholder、multiple 等
 */
const props = defineProps<{
    modelValue?: string | number | (string | number)[];
}>();

/**
 * ✅ 获取所有传入的插槽
 * 在这里可以用来判断哪些插槽存在、用于动态透传
 */
const slots = useSlots();
console.log(slots, "useSlots");

/**
 * ✅ 显式定义插槽类型（用于 IDE 智能提示）
 * 这样父组件在写 <template #prefix> / #suffix / #default 时
 * 都会自动出现代码提示。
 */
defineSlots<{
    default?: () => any;
    prefix?: () => any;
    suffix?: () => any;
}>();

/**
 * ✅ 暴露内部 ElSelect 的实例方法给父组件
 * 这样父组件可以通过 ref 访问：
 *    const selectRef = ref<InstanceType<typeof MySelect>>()
 *    selectRef.value?.focus()
 */
defineExpose({} as InstanceType<typeof ElSelect>);
</script>

<style scoped>
/* ✅ 样式规范化：包裹容器 */
.my-select {
    display: inline-block;
    width: 100%;
}

/* ✅ 统一内部宽度 */
:deep(.el-select) {
    width: 100%;
}
</style>
