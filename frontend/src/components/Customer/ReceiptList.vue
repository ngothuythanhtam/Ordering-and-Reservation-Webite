<script setup>
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import ReceiptService from '@/services/Customer/receipt.service'; // Import service cancelOrder

defineProps({
  receipts: {
    type: Array,
    required: true
  },
  selectedReceipt: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['selectReceipt']);

// Helper function để xử lý hiển thị table number an toàn
const getTableDisplay = (receipt) => {
  if (!receipt) return 'N/A';
  if (!receipt.table) return 'No table';
  return receipt.table.table_number || 'N/A';
};

const queryClient = useQueryClient();

const cancelOrderMutation = useMutation({
  mutationFn: ({ order_id, status }) => {
    return ReceiptService.cancel(order_id, status);
  },
  onSuccess: (data) => {
    queryClient.invalidateQueries(['receipts']);
    alert('Order canceled successfully!');
  },
  onError: (error) => {
    console.error('Cancel error:', error);
  }
});

const confirmCancel = (order_id) => {
  if (confirm('Are you sure that you want to cancel this order?')) {
    cancelOrderMutation.mutate({ order_id, status: 'Canceled' });
  }
};
</script>

<template>
  <div class="transactions-list">
    <table v-if="receipts && receipts.length > 0" class="table">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Date</th>
          <th>Total</th>
          <th>Status</th>
          <th>Table</th>
          <th>Action</th> <!-- Thêm cột để hiển thị nút hành động -->
        </tr>
      </thead>
      <tbody>
        <tr v-for="receipt in receipts" 
            :key="receipt.order_id"
            @click="emit('selectReceipt', receipt)"
            :class="{ 
              'selected': selectedReceipt?.order_id === receipt.order_id,
              'clickable': true 
            }">
          <td>#{{ receipt.order_id || 'N/A' }}</td>
          <td>{{ receipt.order_date ? new Date(receipt.order_date).toLocaleDateString() : 'N/A' }}</td>
          <td>${{ receipt.total_price ? receipt.total_price.toFixed(2) : '0.00' }}</td>
          <td>
            <span class="status-badge" :class="receipt.status?.toLowerCase() || 'pending'">
              {{ receipt.status || 'Pending' }}
            </span>
          </td>
          <td>{{ getTableDisplay(receipt) }}</td>
          <td>
            <!-- Hiển thị nút hủy nếu trạng thái là "Ordered" -->
            <button v-if="receipt.status === 'Ordered'" @click.stop="confirmCancel(receipt.order_id)">
              Cancel
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else class="no-results">No transactions found.</p>
  </div>
</template>

<style scoped>
.transactions-list {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
}

.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.table th {
  background-color: #f8fafc;
  color: #4a5568;
  font-weight: 600;
  font-size: 18px;
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.table td {
  padding: 1rem;
  font-size: 0.875rem;
  color: #2d3748;
  border-bottom: 1px solid #e2e8f0;
}

.table tbody tr {
  cursor: pointer;
  transition: background-color 0.2s;
}

.table tbody tr:hover {
  background-color: #f7fafc;
}

.table tr.selected {
  background-color: #ebf8ff;
}

/* Status badges */
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

.no-results {
  text-align: center;
  color: #718096;
  padding: 3rem 1.5rem;
  font-size: 0.875rem;
}

@media (max-width: 640px) {
  .table th,
  .table td {
    padding: 0.75rem;
  }
}
button {
  background-color: #ff4d4d; 
  color: white; 
  border: none; 
  border-radius: 5px; 
  padding: 7px 15px; 
  font-size: 14px; 
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s; 
}

button:hover {
  background-color: #ff1a1a; 
  transform: scale(1.05); 
}

button:active {
  transform: scale(0.98);
}
</style>