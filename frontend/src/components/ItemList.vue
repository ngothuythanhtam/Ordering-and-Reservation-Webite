<script setup>
import ItemCard from '@/components/ItemCard.vue';
import { ref } from 'vue';
import AddtoCart from '@/components/AddtoCart.vue';
import receiptService from '@/services/receipt.service';
defineProps({
  items: { type: Array, default: () => [] },
  selectedIndex: { type: Number, default: -1 },
});
const $emit = defineEmits(['update:selectedIndex']);
// ------------------ ADD TO CART ------------------ //
const showAddItemForm = ref(false);
const quantity = ref(1);
const selectedIndex = ref(-1);// Chỉ số của sản phẩm đã chọn

const openAddItemForm = (item) => {
  selectedIndex.value = item; // Lưu sản phẩm đã chọn
  showAddItemForm.value = true; // Hiển thị form
};
const closeAddItemForm = () => {
  showAddItemForm.value = false;
  selectedIndex.value = null; // Reset sản phẩm đã chọn
};

const addToCart = async ({ item, quantity }) => {
  if (item) {
    try {
      await receiptService.addItemToReceipt({ item_id: item.item_id, quantity: quantity });
      alert('Sản phẩm đã được thêm vào giỏ hàng!');
      closeAddItemForm();
    } catch (error) {
      console.error('Không thể thêm sản phẩm vào giỏ hàng:', error);
    }
  }
};
</script>

<template>
  <div class="item-row" v-if="items.length > 0">
    <div class="card" 
      v-for="(item, index) in items" 
      :key="item.item_id" 
      :class="{ active: index === selectedIndex }"
      @click="openAddItemForm(item)">

      <div class="card-body" style="padding-left:5px;margin-bottom: -25px;">
        <h5 class="card-title">{{ item.item_name }}</h5>
      </div>
      <ItemCard
        :key="item.item_id"
        :item="item"
      />
    </div>
  </div>

  <!-- Form Thêm vào giỏ hàng chỉ hiển thị một lần -->
  <div v-if="showAddItemForm">
    <AddtoCart 
      :selectedIndex="selectedIndex" 
      :showForm="showAddItemForm" 
      @close="closeAddItemForm" 
      @add="addToCart" 
    />
  </div>
</template>

<style>
.item-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-around;
}
.item-row > * {
  flex: 1 1 250px;
  max-width: 300px;
  height: 320px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
  transition: transform 0.2s ease-in-out;
}
.item-row > *:hover {
  transform: scale(1.05); 
}
.selected {
  border: 2px solid #ffb700; 
}
button {
  margin-top: 10px;
}
</style>