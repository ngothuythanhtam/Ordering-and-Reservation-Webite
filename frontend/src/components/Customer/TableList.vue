<script setup>
import { ref } from 'vue';
import ReceiptService from '@/services/Customer/receipt.service';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
const props = defineProps({
  tables: { type: Array, default: () => [] },
  selectedIndexTable: { type: Number, default: -1 }
});

const emit = defineEmits(['update:selectedIndexTable']);
const queryClient = useQueryClient();
const showForm = ref(false); 
const selectedTable = ref(null);
const date = ref('');
const description = ref('');

const { mutate: bookTable, isLoading, isError, error } = useMutation({
  mutationFn: async () => {
    if (!localStorage.getItem('userid')) {
      throw new Error("You must log in before making reservation. If you don't have an account, please register!");
    }
    if (!date.value || !description.value) {
      throw new Error('Please select date and type your requirement!');
    }
    return ReceiptService.addTableToReceipt({
      table_number: selectedTable.value.table_number,
      reservation_date: date.value,
      special_request: description.value
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['tables']);
    alert('Book a table successfully!');
    showForm.value = false;
  },
  onError: (err) => {
    console.log(err.message);
  }
});

function handleAddTableToReceipt(table) {
  showForm.value = true;
  selectedTable.value = table; 
  date.value = '';
  description.value = '';
}
</script>

<template>
  <div class="item-row" v-if="tables.length > 0">
    <div class="card" id="cardtb" 
      v-for="(table, index) in tables" 
      :key="table.table_id" 
      :class="{ active: index === selectedIndexTable }">
      <div class="card-body">
        <h5 class="card-title">{{ table.table_number }}</h5>
        <p class="card-text">Capacity: {{ table.seating_capacity }}</p>
        <button @click.stop="handleAddTableToReceipt(table)" 
          class="btn btn-primary" id="addtable">+</button>
      </div>
    </div>
  </div>

  <!-- Form Đặt bàn -->
  <div v-if="showForm" class="card" id="cardbookTable">
    <div class="form-container">
      <h4>Your Reservation</h4>
      <p><strong>Table:</strong> {{ selectedTable?.table_number }}</p>
      <p><strong>Seating Capacity:</strong> {{ selectedTable?.seating_capacity }}</p>

      <div class="form-group">
        <label for="date">Date to use</label>
        <input type="date" id="date" v-model="date" class="form-control" required />
      </div>
      <p style="margin-top: 10px;margin-bottom: 0px; margin-bottom: 10px; font-weight: 300; color: red;"><strong>Note: You can only book 1 table per bill</strong></p>
      <div class="form-group">
        <label for="description">Requirement</label>
        <textarea id="description" v-model="description" class="form-control"></textarea>
      </div>
      <button @click="bookTable" class="btn btn-success" :disabled="isLoading" style="margin-right: 20px;">
        {{ isLoading ? 'Placing...' : 'Đặt bàn' }}
      </button>
      <button @click="showForm = false" class="btn btn-secondary">Hủy</button>
      <div v-if="isError" class="error-message">
        {{ error.message }}
      </div>
    </div>
  </div>
</template>

<style scoped>
body {
  background-color: #f7f7f7;
  font-family: Arial, sans-serif;
  color: #333;
}

.item-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.card {
  max-width: 300px;
  flex: 1 1 250px;
  height: 180px;
  margin: 10px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}

#cardtb:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.card.active {
  border-color: #007bff;
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.5);
}

.card-body {
  text-align: center;
  height: 100%;
}

.card-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 8px;
}

.card-text {
  font-size: 19px;
  margin-bottom: 10px;
}

.seating-highlight {
  font-size: 1rem;
  font-weight: bold;
  color: #28a745;
}

#addtable {
  background-color: #ff6347;
  border: none;
  height: 50px;
  width: 50px;
  margin-top: 20px;
  font-size: 2rem;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
}
#addtable:hover{
  background-color: #d4634f;
}
#cardbookTable {
  padding: 20px;
  max-width: 400px;
  height: auto;
  margin: 20px auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
}

.form-container {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  font-weight: bold;
  font-size: 1rem;
}

input[type="date"], textarea {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
  margin-top: 5px;
}

textarea {
  resize: vertical;
  min-height: 100px;
}

button {
  padding: 10px 15px;
  font-size: 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

button.btn-success {
  background-color: #37d95d;
  color: white;
  margin-right: 20px;
}

button.btn-secondary {
  background-color: #ed6161;
  color: white;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
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
</style>