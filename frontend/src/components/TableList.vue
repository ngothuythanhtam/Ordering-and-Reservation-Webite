<script setup>
import { ref } from 'vue';
import ReceiptService from '@/services/receipt.service';

const props = defineProps({
  tables: { type: Array, default: () => [] },
  selectedIndexTable: { type: Number, default: -1 }
});

const emit = defineEmits(['update:selectedIndexTable']);

const showForm = ref(false); // To control the visibility of the form
const selectedTable = ref(null); // To store the selected table
const date = ref('');
const description = ref('');

async function handleAddTableToReceipt(table) {
  showForm.value = true;
  selectedTable.value = table; // Store the table data

  // Reset form values
  date.value = '';
  description.value = '';
}

async function bookTable() {
  try {
    if (!date.value || !description.value) {
      alert('Vui lòng nhập ngày và mô tả!');
      return;
    }
    // Call the backend API to book the table
    await ReceiptService.addTableToReceipt({
      table_number: selectedTable.value.table_number,
      reservation_date: date.value,
      special_request: description.value
    });
    alert('Đã thêm bàn thành công!');
    showForm.value = false;
  } catch (error) {
    console.error('Failed to add table to receipt:', error);
    alert('Bạn đã đặt bàn rồi. Vui lòng xác nhận hóa đơn hoặc hủy đặt bàn đã đặt.');
  }
}
</script>

<template>
  <div class="item-row" v-if="tables.length > 0">
    <div class="card" 
      v-for="(table, index) in tables" 
      :key="table.table_id" 
      :class="{ active: index === selectedIndexTable }">
      <div class="card-body">
        <h5 class="card-title">{{ table.table_number }}</h5>
        <p class="card-text seating-highlight">Seating Capacity: {{ table.seating_capacity }}</p>
        <p class="card-text">Status: {{ table.status }}</p>
        <button v-if="table.status === 'available'" 
          @click.stop="handleAddTableToReceipt(table)" 
          class="btn btn-primary" id="addtable">+
        </button>
      </div>
    </div>
  </div>
  <!-- Form to input date and description for booking -->
  <div v-if="showForm" class="card" id = "cardbookTable">
    <div class="form-container">
      <h4>Reservation Information</h4>
      <p><strong>Table:</strong> {{ selectedTable?.table_number }}</p>
      <p><strong>Seating Capacity:</strong> {{ selectedTable?.seating_capacity }}</p>
      
      <div class="form-group">
        <label for="date">Booking Date</label>
        <input type="date" id="date" v-model="date" class="form-control" required />
      </div>
      <p style="margin-top: 10px;margin-bottom: 0px;"><strong>Note: You are only booked 1 table on 1 receipt </strong> </p>
      <div class="form-group">
        <label for="description">Description</label>
        <textarea id="description" v-model="description" class="form-control"></textarea>
      </div>
      <button @click="bookTable" class="btn btn-success" style="margin-right: 20px;">Đặt bàn</button>
      <button @click="showForm = false" class="btn btn-secondary">Hủy</button>
    </div>
  </div>
</template>

<style scoped>
#addtable{
  background-color: #4bdb6d;
  border: none;
  margin-top: -10px;
  height: 45px;
  width: 45px;
}
#cardbookTable{
  padding: 20px;
  width: 500px;
  height: 400px;
}
.item-row {
  display: flex;
  flex-wrap: wrap;
}

.card {
  height: 180px;
  margin: 10px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card.active {
  border-color: #007bff;
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.5);
}

.card:hover {
  transform: scale(1.05);
}

.card-body {
  padding-left: 5px;
  text-align: center;
}

.card-title {
  font-size: 1rem;
  font-weight: bold;
}

.card-text {
  font-size: 0.9rem;
}

.seating-highlight {
  font-size: 1.2rem;
  font-weight: bold;
  color: #28a745; /* Highlight seating capacity */
}

</style>
