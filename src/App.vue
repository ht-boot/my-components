<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';
import Calendar from './components/Calendar.vue';
import DynamicForm from './components/DynamicForm.vue';
import MyInput from './components/MyInput.vue';
import Leaflet from './components/Map.vue';
import MySelect from './components/MySelect.vue';

const date = ref(new Date().toLocaleDateString());

const input = useTemplateRef('inputRef');

const selfFun = (e: string) => {
  console.log(e, 'selfFun')
}

const modelValue = ref('nihao');
// setTimeout(() => {
//   modelValue.value = 'hello'
//   input.value?.focus()
//   input.value?.demo()
// }, 3000)


const cities = [
  { label: '上海', value: 'sh', disabled: true, },
  { label: '北京', value: 'bj' },
  { label: '深圳', value: 'sz' },
]

const selected = ref('')
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
      <MyInput ref="inputRef" v-model="modelValue" placeholder="请输入内容" clearable @selfFun="selfFun">
        <template #append>@mail.com</template>
        <template #prepend>http://</template>
      </MyInput>
      <MySelect v-model="selected" :options="cities" clearable placeholder="请选择城市" multiple
        @change="console.log($event, 'change')">
        <template #prefix>09090</template>
      </MySelect>
    </div>
    <div class="container_item">
      <div>Leaflet</div>
      <Leaflet></Leaflet>
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
  width: calc(100% / 3 - 20px);
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

@media screen and (max-width: 1240px) {
  .container_item {
    width: calc(100% / 2 - 20px);
  }
}

@media screen and (max-width: 768px) {
  .container_item {
    width: calc(100% - 20px);
  }
}
</style>
