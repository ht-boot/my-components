<script setup lang="ts">
import { h, ref, type VNode } from "vue"
import { ElInput, ElButton, ElSelect, ElOption, ElForm, ElFormItem } from "element-plus"

// ---- 类型定义 ----
interface BaseNode {
    type: string
    modelKey?: string
    props?: Record<string, any>
    rules?: Record<string, any>[]
}

interface InputNode extends BaseNode {
    type: "input"
    placeholder?: string
}

interface ButtonNode extends BaseNode {
    type: "button"
    text: string
    onClick?: () => void
}

interface SelectNode extends BaseNode {
    type: "select"
    options: { label: string; value: string }[]
}

interface GroupNode extends BaseNode {
    type: "group"
    title?: string
    children: SchemaNode[]
}

type SchemaNode = InputNode | ButtonNode | SelectNode | GroupNode

// ---- 响应式表单数据 ----
const formData = ref<Record<string, any>>({
    username: "",
    password: "",
    role: "",
    profile: {
        email: "",
        phone: ""
    }
})

// 接受父组件参数
const props = defineProps({
    url: {
        type: String,
        default: ""
    }
})

console.log(props.url, '------');

// ---- 表单引用 ----
const formRef = ref<any>()

// ---- 工具函数：支持深层字段 ----
const getValue = (obj: any, path: string) => path.split(".").reduce((acc, key) => acc?.[key], obj)

const setValue = (obj: any, path: string, value: any) => {
    const keys = path.split(".")
    keys.reduce((acc, key, idx) => {
        if (idx === keys.length - 1) {
            acc[key] = value
        } else {
            if (!acc[key]) acc[key] = {}
        }
        return acc[key]
    }, obj)
}

// ---- schema 配置 ----
const schema: SchemaNode[] = [
    {
        type: "input",
        placeholder: "用户名",
        modelKey: "username",
        props: { type: "text", clearable: true },
        rules: [{ required: true, message: "用户名不能为空", trigger: "blur" }]
    },
    {
        type: "input",
        placeholder: "密码",
        props: { type: "password", clearable: true },
        modelKey: "password",
        rules: [
            { required: true, message: "密码不能为空", trigger: "blur" },
            { min: 6, message: "密码至少 6 个字符", trigger: "blur" }
        ]
    },
    {
        type: "select",
        modelKey: "role",
        options: [
            { label: "管理员", value: "admin" },
            { label: "普通用户", value: "user" }
        ],
        rules: [{ required: true, message: "请选择角色", trigger: "change" }]
    },
    {
        type: "group",
        title: "联系方式",
        children: [
            {
                type: "input",
                placeholder: "请输入邮箱",
                modelKey: "profile.email",
                rules: [{ required: true, message: "邮箱不能为空", trigger: "blur" }]
            },
            {
                type: "input",
                placeholder: "请输入手机号",
                modelKey: "profile.phone",
                rules: [{ required: true, message: "手机号不能为空", trigger: "blur" }]
            }
        ]
    },
    {
        type: "button",
        text: "提交",
        onClick: async () => {
            const isValid = await formRef.value?.validate()
            if (isValid) {
                alert("表单提交成功！\n" + JSON.stringify(formData.value, null, 2))
            } else {
                alert("表单验证失败，请检查填写的内容！")
            }
        }
    }
]

// ---- 渲染函数 ----
const renderNode = (node: SchemaNode): VNode => {
    const componentMap: Record<string, (node: any) => VNode> = {
        input: (n: InputNode) =>
            h(
                ElFormItem,
                { label: n.placeholder, prop: n.modelKey, rules: n.rules },
                {
                    default: () =>
                        h(ElInput, {
                            placeholder: n.placeholder,
                            modelValue: getValue(formData.value, n.modelKey!),
                            "onUpdate:modelValue": (val: string) => setValue(formData.value, n.modelKey!, val),
                            ...n.props
                        })
                }
            ),
        select: (n: SelectNode) =>
            h(
                ElFormItem,
                { label: "角色", prop: n.modelKey, rules: n.rules },
                {
                    default: () =>
                        h(
                            ElSelect,
                            {
                                modelValue: getValue(formData.value, n.modelKey!),
                                "onUpdate:modelValue": (val: string) => setValue(formData.value, n.modelKey!, val)
                            },
                            {
                                default: () => n.options.map(opt => h(ElOption, { label: opt.label, value: opt.value }))
                            }
                        )
                }
            ),
        button: (n: ButtonNode) => h(ElButton, { type: "primary", onClick: n.onClick }, () => n.text),
        group: (n: GroupNode) =>
            h("fieldset", { class: "form-group" }, [
                n.title && h("legend", null, n.title),
                ...n.children.map(child => renderNode(child))
            ])
    }
    return componentMap[node.type]!(node as any)
}
</script>

<template>
    <ElForm ref="formRef" :model="formData" label-position="top" class="form-container">
        <template v-for="node in schema" :key="node.modelKey || node.type">
            <component :is="{ render: () => renderNode(node) }" />
        </template>
    </ElForm>
</template>

<style scoped>
.form-container {
    width: 320px;
    margin: 0 auto;
}

.form-group {
    border: 1px solid #ccc;
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 12px;
}

legend {
    font-weight: bold;
    padding: 0 4px;
}
</style>