<script setup>
  defineProps({
    items: { type: Array, default: () => [] },
    selectedIndex: { type: Number, default: -1 },
  });
  const $emit = defineEmits(['update:selectedIndex']);
</script>

<template>
  <ul class="list-group">
    <li class="list-group-item px-3" v-for="(item, index) in items" :class="{ active: index === selectedIndex }"
      :key="item.item_id" @click="$emit('update:selectedIndex', index)">
      {{ item.item_name }}
    </li>
  </ul>
</template>