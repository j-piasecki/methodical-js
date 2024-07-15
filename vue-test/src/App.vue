<script setup>
import StressTest from './StressTest.vue'
import { ref } from 'vue'

const example = ref()

function setExample(name) {
  example.value = name
}
</script>

<template>
  <div><button @click="setExample('stress')">Stress Test</button></div>
  <div><StressTest v-if="example === 'stress'" /></div>
</template>
