<script setup>
import { ref } from 'vue'
import StateUpdater from './StateUpdater.vue'
const props = defineProps(['index', 'count', 'levels', 'first'])

const data = ref(new Array(props.count).fill(0).map((_, index) => index))
</script>

<template>
  <StateUpdater v-if="props.first && props.index == 0 && props.levels == 1" />

  <div v-if="props.levels > 0" v-for="(_, index) in data" :key="index" class="dot">
    <RecursiveDivs
      :index="index"
      :count="props.count"
      :levels="props.levels - 1"
      :first="props.first && props.index == 0"
    />
  </div>
</template>

<style scoped>
.dot {
  width: 1px;
  height: 1px;
  background-color: red;
}
</style>
