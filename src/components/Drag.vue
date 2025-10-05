<template>
    <div class="drag">
        <div class="drag__container" ref="containerRef">
            <div class="drag__item" v-for="(item, index) in options" :key="item.value">
                <div class="drag__item__content">
                    <p>{{ item }}</p>
                </div>
            </div>
        </div>
        <div>{{ options }}</div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Sortable from 'sortablejs';

const options = ref([{
    name: 'A',
    value: 'a'
}, {
    name: 'B',
    value: 'b'
}, {
    name: 'C',
    value: 'c'
}])

const containerRef = ref<HTMLElement | null>(null);

onMounted(() => {
    if (containerRef.value) {
        Sortable.create(containerRef.value, {
            animation: 150,
            onEnd: (evt) => {
                const { newIndex = 0, oldIndex = 0 } = evt;
                // 如果拖动位置没有变化，则不做任何操作
                if (oldIndex === newIndex) return;
                const movedItem = options.value[oldIndex];
                options.value.splice(oldIndex, 1);
                if (!movedItem) return;
                options.value.splice(newIndex, 0, movedItem);
            }
        });
    }
});
</script>

<style scoped>
.drag__item__content {
    width: 100%;
    background-color: #909090;
    margin: 1px;
    border-radius: 5px;
    cursor: grab;
}

.drag__item__content p {
    margin: 0;
    padding: 0;
}
</style>
