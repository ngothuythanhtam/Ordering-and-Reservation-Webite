<script setup>
import { ref , onMounted, watch } from 'vue';
import MyCart from '@/components/Customer/MyCart.vue';
import ReceiptService from '@/services/Customer/receipt.service'; // Assuming this is a function that fetches the user
const cartData = ref(null);

onMounted(async () => {
  try {
    const response = await ReceiptService.myCart();
    cartData.value = response;
    console.log('Hóa đơn:', response);
  } catch (error) {
    console.error('Failed to load cart data:', error);
  }
});
</script>
<template>
  <div>
    <h1 style="display: flex; align-items: center; justify-content: center; margin-top: 80px;">My Cart</h1>
    <MyCart v-if="cartData" :receiptData="cartData" />
    <p v-else>Loading cart data...</p>
  </div>
</template>