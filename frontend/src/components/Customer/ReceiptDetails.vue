<script setup>
defineProps({
  receipt: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close']);
const formatDate = (date) => {
  if (!date) return 'N/A';
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(date).toLocaleDateString('en-US', options);
};

</script>

<template>
  <div class="receipt-details">
    <div class="receipt-header">
      <h5>Receipt Details</h5>
      <button class="close-btn" @click="emit('close')">×</button>
    </div>
    
    <div class="receipt-info">
      <div class="info-group">
        <label>Order ID:</label>
        <span>#{{ receipt.order_id || 'N/A' }}</span>
      </div>
      <div class="info-group">
        <label>Date:</label>
        <span>{{ formatDate(receipt.order_date) }}</span>
      </div>
      <div class="info-group">
        <label>Status:</label>
        <span class="status-badge" :class="receipt.status">
          {{ receipt.status }}
        </span>
      </div>
    </div>

    <div class="items-list">
      <h6>Order Items</h6>
      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in receipt.items" :key="item.item_id">
            <td>{{ item.item_name || 'N/A' }}</td>
            <td>{{ item.quantity || 0 }}</td>
            <td>${{ item.item_price?.toFixed(2) || '0.00' }}</td>
            <td>${{ ((item.quantity || 0) * (item.item_price || 0)).toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="receipt-footer">
      <div class="table-info">
        <i class="fas fa-chair"></i>
        Table {{ receipt.table?.table_number || 'N/A' }}
        ({{ receipt.table?.seating_capacity || 'N/A' }} seats)
      </div>
    </div>
    <hr>
    <div class="total-amount">
      <label>Total Amount:</label>
      <span>${{ receipt.total_price?.toFixed(2) || '0.00' }}</span>
    </div>
  </div>
</template>
<style scoped>
/* Receipt details panel */
.receipt-details {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 1.5rem;
}

.receipt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.receipt-header h5 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #a0aec0;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #f7fafc;
  color: #718096;
}

.info-group {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 16px;
}

.info-group label {
  color: #718096;
}

.items-list {
  margin-top: 1.5rem;
}

.items-list h6 {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 1rem 0;
}

.items-table {
  width: 100%;
  font-size: 16px;
}

.items-table th {
  font-size: 16px;
  background-color: #f7fafc;
  color: #4a5568;
  font-weight: 500;
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.items-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.receipt-footer {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-info {
  color: #718096;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.total-amount {
  font-size: 1.5rem;
}

.total-amount label {
  color: #718096;
  margin-right: 0.5rem;
}

.total-amount span {
  font-weight: 600;
  color: #2d3748;
}

/* Status badges - needed for receipt details too */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 16px;
  font-weight: 500;
  display: inline-block;
}

.status-badge.pending {
  background-color: #feebc8;
  color: #c05621;
}

.status-badge.ordered {
  background-color: #e2e8f0;
  color: #2d3748;
}

.status-badge.completed {
  background-color: #c6f6d5;
  color: #2f855a;
}

.status-badge.canceled {
  background-color: #fed7d7;
  color: #c53030;
}
</style>