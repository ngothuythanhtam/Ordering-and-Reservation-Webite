<script setup>
import { ref, computed, watch } from 'vue';
import ItemCard from '@/components/Staff/Menu/ItemCard.vue';

const props = defineProps({
  items: { type: Array, default: () => [] },
  selectedIndex: { type: Number, default: -1 },
});
const emit = defineEmits(['update:selectedIndex']);

const isOpen = ref(false);
const selectedIndex = ref(-1);

// Watch for selectedIndex changes to open the modal
watch(selectedIndex, (newIndex) => {
  if (newIndex >= 0) isOpen.value = true;
});

// Method to handle item selection
const onSelectItem = (item, index) => {
  selectedIndex.value = index;
  emit('update:selectedIndex', index);
};

const selectedItem = computed(() => {
  return props.items[selectedIndex.value] || null;
});

const closeModal = () => {
  isOpen.value = false;
  selectedIndex.value = -1; 
};
</script>

<template>
  <div class="item-grid mt-5">
    <div v-for="(item, index) in items" :key="item.item_id" class="item-card"
      :class="{ active: index === selectedIndex }" @click="onSelectItem(item, index)">
      <img :src="item.img_url" alt="Image" class="item-image" />
      <div class="item-name">{{ item.item_name }}</div>
    </div>
    <div class="modal-overlay" v-if="isOpen">
      <div class="modal-content">
        <button class="close-button" @click="closeModal"><i class="fa-solid fa-xmark"></i></button>
        <div class="content-inner">
          <ItemCard v-if="selectedItem" class="card" :item="selectedItem" />
        </div>

        <router-link v-if="selectedItem" :to="{ name: 'item.edit', params: { item_id: selectedItem.item_id } }">
          <button class="edit-button btn"> <i class="fas fa-edit"></i> Update</button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.item-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(150px, 1fr));
  gap: 0px;
  row-gap: 50px;
}

.item-card {
  cursor: pointer;
  text-align: center;
  border: 1px solid #ddd;
  padding: 8px;
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
  background-color: #d8c3a5;
  width: 250px;
}

.item-card.active,
.item-card:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background-color: #dcaf75;
}

.item-image {
  width: 100%;
  height: 80%;
  object-fit: cover;
  border-radius: 4px;
}

.item-name {
  margin-top: 8px;
  font-weight: bold;
  color: #47302f;
}

/* Modal overlay with fade-in effect */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: 0;
  animation: fade-in 0.3s forwards;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Modal content with zoom-in effect */
.modal-content {
  background-color: #d8c3a5;
  padding: 40px;
  border-radius: 10px;
  width: 80%;
  max-width: 600px;
  height: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  transform: scale(0.9);
  animation: zoom-in 0.3s forwards;
}

@keyframes zoom-in {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.close-button {
  position: absolute;
  top: 0px;
  right: 0px;
  background-color: #d8c3a5;
  color: rgb(183, 18, 18);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 25px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-inner {
  text-align: left;
}

.edit-button {
  margin-left: 180px;
  margin-top: 15px;
  width: 150px;
  height: 40px;
  background-color: #d09c54;
  font-size: 18px;
}
.edit-button:hover {
  background-color: #ce923f;
  color: #47302f;
}
</style>

