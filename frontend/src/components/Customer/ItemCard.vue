<script setup>
  import { computed } from 'vue';
  const props = defineProps({
    item: { type: Object, required: true },
  });
  const itemStatus = computed(() => {
    return props.item.item_status === 1 ? 'Available' : 'Unavailable';
  });
</script>

<template>
  <div>
    <div class="p-1 w-75 h-75" >
      <img class="img-fluid img-thumbnail" :src="item.img_url" alt=""/>
    </div>
    <div class="p-1">
      <strong>Price:</strong>
      {{ item.item_price }}
    </div>

    <div class="p-1">
        <strong>Status:</strong>
        {{ itemStatus }}
    </div>
  </div>
</template>
