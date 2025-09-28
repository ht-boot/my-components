<script setup lang="ts">
import { ref } from 'vue';
import Calendar from './components/Calendar.vue';

const date = ref(new Date().toLocaleDateString());
</script>

<template>
  <div class="container">
    <div>日历组件</div>
    <Calendar v-model="date" />
  </div>

</template>

<style scoped></style>
