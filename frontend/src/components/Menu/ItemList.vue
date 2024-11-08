<script setup>
  defineProps({
    items: { type: Array, default: () => [] },
    selectedIndex: { type: Number, default: -1 },
  });
  const emit = defineEmits(['update:selectedIndex']);
  const onSelectItem = (item, index) => {
    emit('update:selectedIndex', index);
  };
</script>

<template>
  <div class="item-grid mt-4">
    <div
      v-for="(item, index) in items"
      :key="item.item_id"
      class="item-card"
      :class="{ active: index === selectedIndex }"
      @click="onSelectItem(item, index)"
    >
      <img :src="item.img_url" alt="Image" class="item-image" />
      <div class="item-name">{{ item.item_name }}</div>
    </div>
  </div>
</template>

<style scoped>
.item-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(150px, 1fr));
  gap: 1.5rem;
}

.item-card {
  cursor: pointer;
  text-align: center;
  border: 1px solid #ddd;
  padding: 8px;
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
  background-color: #fff;
}

.item-card.active,
.item-card:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background-color: #e9bdbd
}

.item-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 4px;
}

.item-name {
  margin-top: 8px;
  font-weight: bold;
  color: #333;
}
</style>

