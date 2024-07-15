<script setup>
import RecursiveDivs from './RecursiveDivs.vue'
import { ref } from 'vue'

const COUNT = 5
const LEVELS = 6

const visible = ref(false)
const count = ref(0)
</script>

<template>
  <div>
    <button @click="visible = !visible">{{ visible ? 'Clear' : 'Start' }}</button>
    <button @click="count++">Root-level counter: {{ count }}</button>
  </div>
  <div v-if="visible">
    <RecursiveDivs :index="0" :count="COUNT" :levels="LEVELS" :first="true" />
  </div>
</template>
