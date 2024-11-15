<script setup>
import receiptService from '@/services/Customer/receipt.service';
import { useQuery, useMutation } from '@tanstack/vue-query';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  receiptData: {
    type: Object,
    required: true,
  },
});

const router = useRouter();
const receipt = computed(() => props.receiptData.receipt);
const table = computed(() => props.receiptData.table);
const items = computed(() => props.receiptData.items);
const reservation = computed(() => props.receiptData.reservation);
const totalPrice = computed(() => {
  return items.value.reduce((total, item) => total + (item.item_price * item.quantity), 0);
});

// Hàm cập nhật số lượng món ăn
const updateItemQuantity = async (item, newQuantity) => {
  const quantityChange = newQuantity - item.quantity;
  if (quantityChange !== 0) {
    const payload = {
      item_id: item.item_id,
      quantity: Math.abs(quantityChange), // Gửi số lượng thay đổi
    };
    try {
      if (newQuantity === 0) {
        // Xóa món khi số lượng bằng 0
        await receiptService.deleteItemdfromReceipt(payload);
      } else if (quantityChange > 0) {
        await receiptService.addItemToReceipt(payload);  // Gọi API thêm món
      } else {
        await receiptService.deleteItemdfromReceipt(payload); // Gọi API xóa món
      }
      item.quantity = newQuantity;
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  }
};

// Hàm tăng số lượng
const increaseQuantity = (item) => {
  const newQuantity = item.quantity + 1;
  updateItemQuantity(item, newQuantity); // Cập nhật số lượng tăng
};

// Hàm giảm số lượng
const decreaseQuantity = (item) => {
  if (item.quantity > 0) {
    const newQuantity = item.quantity - 1;
    updateItemQuantity(item, newQuantity);
  }
};
const Order = async () => {
  try {
    await receiptService.verify('Ordered');
    alert('Order placed successfully!');
    router.push({ name: 'Home' });
  } catch (error) {
    console.error('Error:', error);
    alert(error.response?.data?.message || 'Someone has booked this table before you. Please delete and choose another table!');
  }
};
// Định dạng ngày tháng
const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
};
</script>

<template>
  <div class="cart-card">
    <h2>Order #{{ receipt?.order_id || 'N/A' }}</h2>
    <p><strong>Order Date:</strong> {{ formatDate(receipt?.order_date) || 'N/A' }}</p>
    <p><strong>Status:</strong> {{ receipt?.status || 'N/A' }}</p><hr>
    
    <h3>Reservation</h3>
    <p><strong>Reservation Date:</strong> {{ formatDate(reservation?.reservation_date) || 'N/A' }}</p>
    <p><strong>Table Number:</strong> {{ table?.table_number || 'Not assigned' }}</p>
    <p><strong>Seating Capacity:</strong> {{ table?.seating_capacity || 'N/A' }}</p>
    <p><strong>Special Request</strong>
      <p v-if="reservation?.special_request" style="color: black;">{{ reservation.special_request }}</p>
      <p v-else>No special request</p>
    </p><hr>
    
    <!-- Check if items are available -->
    <h3 v-if="items?.length > 0">Items Ordered</h3>
    <p v-else>No items added to the order yet.</p>
    
    <div v-for="item in items" :key="item.order_item_id" class="order-item" v-if="items?.length > 0">
      <!-- Handle null or undefined item image -->
      <img :src="item.img_url || '/path/to/default-image.jpg'" alt="Item Image" class="item-img" />
      
      <div class="item-info">
        <!-- Handle null or undefined item name -->
        <p><strong>{{ item.item_name || 'Unnamed Item' }}</strong></p>
        
        <!-- Handle null or undefined item description -->
        <p>{{ item.item_description || 'No description available' }}</p>

        <div class="quantity-control">
          <div><p><strong>Quantity:</strong> {{ item.quantity || 0 }}</p></div>
          <div>
            <!-- Ensure quantity is greater than 0 for decreasing -->
            <button @click="decreaseQuantity(item)" :disabled="item.quantity <= 0">-</button>
            <span class="current-quantity">{{ item.quantity || 0 }}</span>
            <button @click="increaseQuantity(item)">+</button>
          </div>
        </div>

        <!-- Handle null or undefined item price -->
        <p><strong>Price:</strong>${{ (item.item_price || 0) * (item.quantity || 0).toFixed(2) }}</p>
      </div>
    </div>
    
    <!-- Display total price if items exist -->
    <p id="totalprice" v-if="items?.length > 0"><strong>Total Price:</strong> ${{ totalPrice.toFixed(2) }}</p>
    
    <!-- Show order button if items are available -->
    <div class="order-button-container" v-if="items?.length > 0 || table?.table_number">
      <button class="order-button" @click="Order">Order Now</button>
    </div>
  </div>
</template>
<style>
.quantity-control {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

#totalprice {
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 30px;
}

#totalprice strong {
  font-size: 30px;
}

#totalprice:last-child {
  padding-right: 40px;
  font-size: 40px;
  color: #000000;
}

.cart-card {
  background-color: #f7f7f7;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.189);
  max-width: 800px;
  margin: 20px auto;
}

h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 5px;
}

p {
  font-size: 16px;
  color: #555;
  margin-bottom: 10px;
}

strong {
  font-weight: bold;
  color: #333;
}

h3 {
  font-size: 20px;
  color: #333;
  margin-top: 20px;
  margin-bottom: 10px;
}

.order-item {
  display: flex;
  margin-bottom: 15px;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.item-img {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 15px;
  border: 2px solid #ddd;
}

.item-info {
  flex: 1;
}

.item-info p {
  margin: 5px 0;
}

.item-info p strong {
  color: #333;
}

.cart-card h3 + p {
  color: #888;
}

.cart-card p:last-child {
  color: #f44336;
}

.cart-card .order-item:nth-child(even) {
  background-color: #f7f7f7;
}

.cart-card .order-item:nth-child(odd) {
  background-color: #ffffff;
}

.cart-card .order-item p {
  color: #333;
  font-weight: normal;
}

.cart-card .order-item .item-info p:last-child {
  color: #ff5722;
  font-weight: bold;
}

.total-price {
  font-size: 20px;
  font-weight: bold;
  color: #ff5722; 
  margin-top: 20px;
  text-align: center;
  background-color: #fff3e0;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(255, 87, 34, 0.2);
}

.total-price strong {
  font-size: 24px;
}

.order-button-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.order-button {
  background-color: #5dce60;
  color: white;
  padding: 15px 40px;
  font-size: 18px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.order-button:hover {
  background-color: #45a049;
}

.quantity-control button {
  background-color: #ece3c2;
  height: 33px;
  width: 33px;
  border-radius: 10px;
  margin: 10px;
  border: none;
}
</style>