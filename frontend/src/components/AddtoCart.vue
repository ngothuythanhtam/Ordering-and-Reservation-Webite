
<script setup>
import { ref, defineProps, defineEmits } from 'vue';
const props = defineProps({
    selectedIndex: {type: Object,required: true,},
    showForm: {type: Boolean,required: true,},
});
const emit = defineEmits(['close', 'add']);
const quantity = ref(1);
// Hàm đóng form
const closeForm = () => {
    emit('close');
};
// Hàm thêm sản phẩm vào giỏ hàng
const addToCart = () => {
    if (props.selectedIndex) {  // Accessing selectedIndex from props
        emit('add', { item: props.selectedIndex, quantity: quantity.value });
        closeForm();
    }
};
</script>

<template>
    <div v-if="showForm" class="add-item-form">
        <h5>Add to Cart</h5>
        <div v-if="selectedIndex">
            <p>{{ selectedIndex.item_name }}</p>
            <p>Description: {{ selectedIndex.item_description}}</p>
            <label for="quantity">Số lượng:</label>
            <input type="number" v-model="quantity" min="1" />
        </div>
        <button @click="addToCart" id="add">Add to Cart</button>
        <button @click="closeForm" id="close">Close</button>
    </div>
</template>
<style scoped>
.add-item-form {
  background-color: #f0f8ff;
  padding: 15px;
  border-radius: 12px;
  width: 280px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
.form-title {
  font-size: 16px;
  margin-bottom: 10px;
  text-align: center;
  color: #2c3e50;
}
.item-details p {
  margin: 8px 0;
  color: #34495e;
}
.quantity-input {
  width: 100%;
  padding: 6px;
  margin: 8px 0;
  border: 1px solid #ccd1d9;
  border-radius: 8px;
}
button {
  border: none;
  border-radius: 5px; /* Similar rounded corners */
  padding: 10px 20px;
  font-size: 14px;
  font-weight: bold;
  color: rgb(46, 46, 46);
  transition: background-color 0.3s ease;
}
#add {
  background-color: #98e6b7;
  margin-right: 15px;
}
#close {
  background-color: #ed6161;
}
#add:hover, #close:hover {
  opacity: 0.9;
}
</style>
