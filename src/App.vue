<script setup lang="ts">
import { ref } from 'vue';
import Calendar from './components/Calendar.vue';
import DynamicForm from './components/DynamicForm.vue';

const date = ref(new Date().toLocaleDateString());
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
  margin: 10px 20px;
}
</style>
