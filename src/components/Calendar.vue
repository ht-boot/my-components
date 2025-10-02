<template>
    <div class="calendar">
        <!-- 顶部导航区 -->
        <header class="calendar__header">
            <!-- 左侧按钮：上一个月、回到今天 -->
            <div class="calendar__nav">
                <button class="btn" @click="goToPrevMonth" aria-label="Previous month">‹</button>
                <button class="btn btn--muted" @click="goToToday">Today</button>
            </div>

            <!-- 当前显示的月份和年份 -->
            <div class="calendar__title">{{ monthYearLabel }}</div>

            <!-- 右侧按钮：下一个月 -->
            <div class="calendar__nav">
                <button class="btn" @click="goToNextMonth" aria-label="Next month">›</button>
            </div>
        </header>

        <!-- 星期标题行 -->
        <div class="calendar__weekdays">
            <div v-for="(d, idx) in weekDays" :key="idx" class="calendar__weekday">{{ d }}</div>
        </div>

        <!-- 日期网格 -->
        <div class="calendar__grid">
            <div v-for="cell in calendarCells" :key="cell.key" class="calendar__cell">
                <button :class="[
                    'calendar__day',
                    {
                        'calendar__day--muted': !cell.isCurrentMonth,        // 不在当前月
                        'calendar__day--selected': isSameDate(cell.date, selectedDate),
                    }
                ]" @click="select(cell.date)" @keydown.enter.prevent="select(cell.date)">
                    <!-- 日期数字 + 是否有事件 -->
                    <div class="calendar__day-top">
                        <span class="calendar__date">{{ cell.date.getDate() }}</span>
                        <span v-if="hasEvents(cell.date)" class="calendar__event-dot">●</span>
                    </div>

                    <!-- 日期下方备注（事件标题） -->
                    <div class="calendar__day-note">
                        <template v-if="eventsFor(cell.date).length">
                            {{ eventsFor(cell.date)[0]?.title }}
                        </template>
                        <template v-else>
                            &nbsp;
                        </template>
                    </div>
                </button>
            </div>
        </div>

        <!-- 底部显示选中日期 -->
        <footer class="calendar__footer">
            <div>Selected: <strong>{{ selectedDateLabel }}</strong></div>
        </footer>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from "vue"

// 定义事件数据结构
interface CalendarEvent {
    id?: string | number
    date: string // ISO 格式 YYYY-MM-DD
    title: string
}

// Props 参数
const props = defineProps<{
    modelValue?: string | null
    events?: CalendarEvent[]
    startWeekOn?: number // 0=周日开始, 1=周一开始
}>()

// Emits 事件
const emit = defineEmits<{
    (e: "update:modelValue", value: string | null): void
    (e: "select", value: string): void
}>()

// 基础变量
const startWeekOn = props.startWeekOn ?? 0
const today = new Date()

// 当前焦点月份（显示的月）
const focusMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1))

// 默认选中今天（如果父组件没有传入 modelValue）
const selectedDate = ref<Date | null>(
    props.modelValue ? new Date(props.modelValue) : new Date(today)
)

// 监听外部 v-model 变化
watch(
    () => props.modelValue,
    (v) => {
        selectedDate.value = v ? new Date(v) : null
    }
)

// 选中日期变动时，自动调整 focusMonth
watch(selectedDate, (d) => {
    if (!d) return
    focusMonth.value = new Date(d.getFullYear(), d.getMonth(), 1)
})

// 顶部显示 "2025年9月" 这样的标签
const monthYearLabel = computed(() => {
    return focusMonth.value.toLocaleString(undefined, {
        month: "long",
        year: "numeric",
    })
})

// 星期标题数组
const weekDays = computed(() => {
    const base = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    if (startWeekOn === 1) return [...base.slice(1), base[0]]
    return base
})

// 工具函数
function startOfMonth(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), 1)
}
function endOfMonth(d: Date) {
    return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}
function addMonths(d: Date, n: number) {
    return new Date(d.getFullYear(), d.getMonth() + n, 1)
}
function isSameDate(a?: Date | null, b?: Date | null) {
    if (!a || !b) return false
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    )
}
// function isToday(d: Date) {
//     return isSameDate(d, today)
// }
function formatISO(d: Date) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
}

// 事件处理
const events = computed(() => props.events ?? [])
function eventsFor(date: Date) {
    const key = formatISO(date)
    return events.value.filter((e) => e.date === key)
}
function hasEvents(date: Date) {
    return eventsFor(date).length > 0
}

// 生成日历格子（上月补齐 + 本月 + 下月补齐）
const calendarCells = computed(() => {
    const cells: { key: string; date: Date; isCurrentMonth: boolean }[] = []
    const start = startOfMonth(focusMonth.value)
    const end = endOfMonth(focusMonth.value)

    let startDow = start.getDay()
    startDow = (startDow - startWeekOn + 7) % 7


    // 前置补齐上月的天数
    for (let i = 0; i < startDow; i++) {
        const d = new Date(start)
        d.setDate(d.getDate() - (startDow - i))
        cells.push({ key: formatISO(d), date: d, isCurrentMonth: false })
    }

    // 本月的天数
    for (let day = 1; day <= end.getDate(); day++) {
        const d = new Date(focusMonth.value.getFullYear(), focusMonth.value.getMonth(), day)
        cells.push({ key: formatISO(d), date: d, isCurrentMonth: true })
    }

    // 末尾补齐下月的天数
    while (cells.length !== 42) {
        const last = cells[cells.length - 1]?.date
        if (!last) break // 安全检查
        const d = new Date(last)
        d.setDate(d.getDate() + 1)
        cells.push({ key: formatISO(d), date: d, isCurrentMonth: false })
    }

    return cells
})

// 切换月份
function goToPrevMonth() {
    focusMonth.value = addMonths(focusMonth.value, -1)
}
function goToNextMonth() {
    focusMonth.value = addMonths(focusMonth.value, 1)
}
function goToToday() {
    focusMonth.value = new Date(today.getFullYear(), today.getMonth(), 1)
    selectedDate.value = new Date(today)
    emit("update:modelValue", formatISO(selectedDate.value))
    emit("select", formatISO(selectedDate.value))
}

// 选择日期
function select(date: Date) {
    selectedDate.value = new Date(date)
    emit("update:modelValue", formatISO(selectedDate.value))
    emit("select", formatISO(selectedDate.value))
}

// 底部显示的文字
const selectedDateLabel = computed(() =>
    selectedDate.value ? selectedDate.value.toLocaleDateString() : "None"
)
</script>

<style scoped>
.calendar {
    --cal-bg: #ffffff;
    --cal-border: #e6e6e6;
    --muted-text: #999;
    --text: #222;
    --accent: #4f46e5;
    /* 主题色 */
    --selected-bg: #eef2ff;
}

.calendar {
    color: var(--text);
    max-width: 420px;
    margin: 10px;
    height: 350px;
    text-align: center;
    background: var(--cal-bg);
    border-radius: 12px;
    box-shadow: 0 6px 18px rgba(16, 24, 40, 0.06);
    padding: 14px;
    border: 1px solid var(--cal-border);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}

.calendar__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
}

.calendar__nav {
    display: flex;
    gap: 8px;
    align-items: center;
}

.btn {
    color: var(--text);
    background: transparent;
    border: 1px solid var(--cal-border);
    padding: 2px 6px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
}

.btn:hover {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.btn--muted {
    background: #f7f7fb;
}

.calendar__title {
    font-weight: 600;
    color: var(--text);
}

.calendar__weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    color: var(--muted-text);
    font-size: 12px;
    margin-bottom: 8px;
}

.calendar__weekday {

    padding: 6px 0;
}

.calendar__grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;
}

.calendar__day {
    color: var(--text);
    width: 100%;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 8px;
    padding: 8px;
    text-align: left;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
}

.calendar__day--muted {
    color: var(--muted-text);
}



.calendar__day--selected {
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
}

.calendar__day-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.calendar__date {
    font-weight: 600;
}

.calendar__event-dot {
    font-size: 12px;
    color: #dc2626;
}

.calendar__day-note {
    font-size: 12px;
    color: #555;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.calendar__footer {
    margin-top: 12px;
    color: var(--muted-text);
    font-size: 13px;
}

/* 响应式 */
@media (max-width: 480px) {
    .calendar {
        padding: 10px;
    }

    .calendar__cell {
        height: 72px;
    }

    .calendar__title {
        font-size: 15px;
    }
}
</style>
