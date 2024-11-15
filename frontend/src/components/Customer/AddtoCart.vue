
<script setup>
import { ref, defineProps, defineEmits } from 'vue';
const props = defineProps({
  selectedIndex: {type: Object,required: true,},
  showForm: {type: Boolean,required: true,},
});
const emit = defineEmits(['close', 'add']);
const quantity = ref(1);
const closeForm = () => {
    emit('close');
};
const addToCart = () => {
  if (props.selectedIndex) {
    emit('add', { item: props.selectedIndex, quantity: quantity.value });
    closeForm();
  }
};
</script>
<template>
    <div v-if="showForm" class="add-item-form">
        <div v-if="selectedIndex">
            <h4 style="color: black;">{{ selectedIndex.item_name }}</h4>
            <p>Description: {{ selectedIndex.item_description}}</p>
            <label for="quantity">Quantity:</label>
            <input style="margin-left: 30px;
            width: 100px;
            border-radius: 5px;
            height: 35px;"
            type="number" v-model="quantity" min="1"/>
        </div>
        <button @click="addToCart" id="add">Add to Cart</button>
        <button @click="closeForm" id="close">Close</button>
    </div>
</template>
<style scoped>
.add-item-form {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 12px;
  width: 300px;
  max-width: 100%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 0 auto;
}

.item-title {
  font-size: 20px;
  color: #333;
  text-align: center;
  margin-bottom: 15px;
  font-family: 'Playfair Display', serif;
}

label {
  font-size: 14px;
  color: #555;
}

.quantity-input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  margin-bottom: 15px;
}

.quantity-input:focus {
  outline: none;
  border-color: #007bff;
}

button {
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  width: 100%;
}

#add {
  background-color: #37d95d;
  margin-bottom: -20px;
}

#close {
  background-color: #ed6161;
  margin-top: 10px;
}

button:hover {
  opacity: 0.9;
  transform: scale(1.05);
}

#add:disabled, #close:disabled {
  background-color: #dcdcdc;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .add-item-form {
    width: 90%;
    padding: 15px;
  }

  .quantity-input {
    font-size: 16px;
  }

  button {
    padding: 12px 18px;
    font-size: 16px;
  }
}
</style>