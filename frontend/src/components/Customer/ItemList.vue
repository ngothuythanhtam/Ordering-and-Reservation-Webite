<script setup>
import ItemCard from '@/components/Customer/ItemCard.vue';
import AddtoCart from '@/components/Customer/AddtoCart.vue';
import { ref } from 'vue';
import receiptService from '@/services/Customer/receipt.service';
import { useMutation, useQueryClient } from '@tanstack/vue-query';

const props = defineProps({
  items: { type: Array, default: () => [] },
  selectedIndex: { type: Number, default: -1 },
});

const emit = defineEmits(['update:selectedIndex']);
const queryClient = useQueryClient();

const showAddItemForm = ref(false);
const quantity = ref(1);
const selectedItem = ref(null);

const { mutate: addToCartMutation, isLoading, isError, error } = useMutation({
  mutationFn: async ({ item, quantity }) => {
    if (!localStorage.getItem('userid')) {
      throw new Error("You must log in before adding items to your cart. If you don't have an account, please register!");
    }
    return receiptService.addItemToReceipt({
      item_id: item.item_id,
      quantity: quantity
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['cart']);
    alert('Product has been added to cart!');
    closeAddItemForm();
  },
  onError: (err) => {
    console.log(err.message);
  }
});

const openAddItemForm = (item) => {
  selectedItem.value = item;
  showAddItemForm.value = true;
};

const closeAddItemForm = () => {
  showAddItemForm.value = false;
  selectedItem.value = null;
};

const handleAddToCart = ({ item, quantity }) => {
  if (item) {
    addToCartMutation({ item, quantity });
  }
};
</script>

<template>
  <div class="item-row" v-if="items.length > 0">
    <div class="card" 
      v-for="(item, index) in items" 
      :key="item.item_id" 
      :class="{ 
        active: index === selectedIndex,
        'cursor-not-allowed opacity-50': isLoading 
      }"
      @click="openAddItemForm(item)">

      <div class="card-body" style="padding-left:5px;">
        <h5 class="card-title"
        style="font-weight: 500;
        font-size: 21px;
        ">{{ item.item_name }}</h5>
      </div>
      <ItemCard
        :key="item.item_id"
        :item="item"
      />
    </div>
  </div>
  <div v-if="isError" class="error-message">
    {{ error.message }}
  </div>
  <!-- Add to Cart Form -->
  <div v-if="showAddItemForm">
    <AddtoCart 
      :selectedIndex="selectedItem" 
      :showForm="showAddItemForm"
      :isLoading="isLoading"
      @close="closeAddItemForm" 
      @add="handleAddToCart" 
    />
  </div>
</template>

<style scoped>
.item-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.item-row > * {
  flex: 1 1 250px;
  max-width: 300px;
  height: auto;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  box-sizing: border-box;
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-row > *:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card-body {
  flex-grow: 1;
  padding: 10px 5px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

.card-body p {
  font-size: 0.9rem;
  color: #777;
}

.error-message {
  display: flex;
  justify-content: center;
  align-items: center;
  color: red;
  margin-top: 1rem;
  padding: 0.5rem;
  border: 1px solid red;
  border-radius: 4px;
  background-color: rgba(255, 0, 0, 0.1);
}

button {
  margin-top: 10px;
  padding: 8px 12px;
  font-size: 1rem;
  background-color: #ff6347;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.cursor-not-allowed {
  cursor: not-allowed;
}
</style>