<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';
import Calendar from './components/Calendar.vue';
import DynamicForm from './components/DynamicForm.vue';
import MyInput from './components/MyInput.vue';

const date = ref(new Date().toLocaleDateString());

const input = useTemplateRef('inputRef');

const modelValue = ref('nihao');
setTimeout(() => {
  modelValue.value = 'hello'
  input.value?.focus()
}, 3000)
</script>

<template>
  <div class="container">
    <div class="container_item">
      <div>日历组件</div>
      <Calendar v-model="date" />
    </div>
    <div class="container_item">
      <div>动态表单组件</div>
      <DynamicForm :url="'http://localhost:3000/api/form'" />
    </div>
    <div class="container_item">
      <div>组件二次封装</div>
      <MyInput ref="inputRef" v-model="modelValue" placeholder="请输入内容" clearable>
        <template #append>@mail.com</template>
      </MyInput>
    </div>
  </div>

</template>

<style scoped>
.container {
  display: flex;
  flex-wrap: wrap;
  justify-content: start;
  height: 100vh
}

.container_item {
  text-align: center;
  font-weight: bold;
  margin: 10px;
  border: 1px solid #ccc;
  height: 500px;
  box-sizing: border-box;
  padding: 20px;
  border-radius: 5px;
  overflow: hidden;
  overflow-y: scroll;
}
</style>
