<script lang="ts">
import { defineComponent, h, type VNode, ref } from "vue"
import { ElInput, ElButton, ElSelect, ElOption, ElForm, ElFormItem } from "element-plus"

// ---- 类型定义 ----
interface BaseNode {
    type: string
    modelKey?: string
    props?: Record<string, any>
    rules?: Record<string, any>[] // 校验规则
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

type SchemaNode = InputNode | ButtonNode | SelectNode

export default defineComponent({
    name: "DynamicFormWithValidation",

    setup() {
        // 响应式表单数据
        const formData = ref<Record<string, any>>({
            username: "",
            password: "",
            role: ""
        })

        // schema 配置
        const schema: SchemaNode[] = [
            {
                type: "input",
                placeholder: "用户名",
                modelKey: "username",
                rules: [
                    { required: true, message: "用户名不能为空", trigger: "blur" }
                ]
            },
            {
                type: "input",
                placeholder: "密码",
                props: { type: "password" },
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
                rules: [
                    { required: true, message: "请选择角色", trigger: "change" }
                ]
            },
            {
                type: "button",
                text: "提交",
                onClick: async () => {
                    const isValid = await formRef.value?.validate()
                    if (isValid) {
                        alert("表单提交成功！" + JSON.stringify(formData.value, null, 2))
                    } else {
                        alert("表单验证失败，请检查填写的内容！")
                    }
                }
            }
        ]

        // 表单引用
        const formRef = ref<any>()

        // 渲染器映射表
        const componentMap: {
            input: (node: InputNode) => VNode,
            select: (node: SelectNode) => VNode,
            button: (node: ButtonNode) => VNode
        } = {
            input: (node: InputNode) =>
                h(ElFormItem, { label: node.placeholder, prop: node.modelKey, rules: node.rules }, {
                    default: () =>
                        h(ElInput, {
                            placeholder: node.placeholder,
                            modelValue: formData.value[node.modelKey!],
                            "onUpdate:modelValue": (val: string) => (formData.value[node.modelKey!] = val),
                            ...node.props
                        })
                }),

            select: (node: SelectNode) =>
                h(ElFormItem, { label: "角色", prop: node.modelKey, rules: node.rules }, {
                    default: () =>
                        h(
                            ElSelect,
                            {
                                modelValue: formData.value[node.modelKey!],
                                "onUpdate:modelValue": (val: string) => (formData.value[node.modelKey!] = val)
                            },
                            {
                                default: () =>
                                    node.options.map(opt => h(ElOption, { label: opt.label, value: opt.value }))
                            }
                        )
                }),

            button: (node: ButtonNode) =>
                h(ElButton, { type: "primary", onClick: node.onClick }, () => node.text)
        }

        // 渲染函数
        const renderNode = (node: SchemaNode): VNode => componentMap[node.type]!(node as any)

        return () =>
            h(ElForm, { ref: formRef, model: formData.value, labelPosition: "top", rules: {} }, () =>
                schema.map(renderNode)
            )
    }
})
</script>

<style scoped>
.form-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 300px;
}
</style>
