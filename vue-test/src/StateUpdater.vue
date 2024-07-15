<script setup>
import { ref } from 'vue'

const count = ref(0)

const incrementCount = () => {
  count.value += 1
}
</script>

<template>
  <div>
    <button @click="incrementCount">Increment {{ count }}</button>
  </div>
</template>
