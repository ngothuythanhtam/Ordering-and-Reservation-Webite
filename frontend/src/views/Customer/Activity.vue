<script setup>
import { ref, computed, watch } from 'vue';
import { useMutation } from '@tanstack/vue-query';
import { useRouter, useRoute } from 'vue-router';
import receiptService from '@/services/Customer/receipt.service';
import MainPagination from '@/components/Customer/MainPagination.vue';
import InputSearch from '@/components/Customer/InputSearch.vue';
import ReceiptList from '@/components/Customer/ReceiptList.vue';
import ReceiptDetails from '@/components/Customer/ReceiptDetails.vue';

const route = useRoute();
const router = useRouter();
const totalNumberOfPages = ref(1);
const searchText = ref('');
const selectedStatusReceipt = ref('');
const receipts = ref([]);
const selectedReceipt = ref(null);
const currentPage = computed(() => {
  const page = Number(route.query?.page);
  return Number.isNaN(page) || page < 1 ? 1 : page;
});

const statusOptions = [
  { value: '', label: 'All' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Ordered', label: 'Ordered' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Canceled', label: 'Canceled' }
];
const searchableReceipts = computed(() =>
    receipts.value.map((receipt) => {
        const { order_id, reservation_id, order_date, total_price, status } = receipt;
        return [order_id, reservation_id, order_date, total_price, status].join(' ')
    })
);
const fetchReceiptsMutation = useMutation({
  mutationFn: ({ page, status }) => receiptService.filterReceipts(page, status),
  onSuccess: (data) => {
    console.error(data.receipts);
    totalNumberOfPages.value = data.metadata.lastPage ?? 1;
    receipts.value = data.receipts;
  },
  onError: (error) => {
    console.error('Failed to fetch receipts:', error);
  },
});

function fetchReceipts() {
  fetchReceiptsMutation.mutate({ page: currentPage.value, status: selectedStatusReceipt.value });
}

function navigateToPage(page) {
  router.push({ name: 'History', query: { page } });
}

function onReceiptSelected(receipt) {
  selectedReceipt.value = receipt;
}

const filteredReceipts = computed(() => {
    return receipts.value.filter((receipt, index) => {
        const rsSearchText = searchableReceipts.value[index].includes(searchText.value.toLowerCase());
        const rsStatus = !selectedStatusReceipt.value || receipt.status === selectedStatusReceipt.value;
        return rsSearchText && rsStatus;
    });
});
watch([currentPage, selectedStatusReceipt], () => {
  fetchReceipts();
}, { immediate: true });
</script>

<template>
  <div class="page">
    <div class="container">
      <div class="header">
        <div class="search-filters">
          <h4>Transaction History</h4>
          <button class="refresh-btn" @click="fetchReceipts">
            <i class="fas fa-redo"></i> Refresh
          </button>
          <select v-model="selectedStatusReceipt" class="status-filter">
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <InputSearch v-model="searchText" placeholder="Search transactions..." class="search"/>
        </div>
      </div>
      
      <div class="content-wrapper">
        <ReceiptList 
          :receipts="filteredReceipts"
          :selected-receipt="selectedReceipt"
          @select-receipt="onReceiptSelected"
        />
        <ReceiptDetails
          v-if="selectedReceipt"
          :receipt="selectedReceipt"
          @close="selectedReceipt = null"
        />
      </div>

      <div class="pagination-wrapper">
        <MainPagination 
          :total-pages="totalNumberOfPages"
          :current-page="currentPage"
          @update:current-page="navigateToPage"
        />
      </div>
    </div>
  </div>
</template>
<style scoped>
/* Main layout */
.page {
  padding: 1.5rem;
  background-color: #f8f9fa;
  min-width: 1200px;
}

.container {
  margin: 0 auto;
  padding: 1rem;
}

.input-group {
  padding: 0 !important;
  display: flex;
  max-width: 1000px;
}

.header {
  background-color: #ffffff;
  gap: 3rem;
  padding: 1.25rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.header h4 {
  margin: 0;
  color: #1a202c;
  font-size: 28px;
  font-weight: 600;
  white-space: nowrap;
  margin-right: 100px;
}

.search-filters {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 1rem;
  margin-top: 1rem;
  width: 100%;
}

.status-filter,
.refresh-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 16px;
}

.status-filter {
  border: 1px solid #e2e8f0;
  background-color: white;
  color: #4a5568;
  min-width: 200px;
  height: 50px;
  font-size: 18px;
}

.refresh-btn {
  background-color: #585858;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.refresh-btn:hover {
  background-color: #ff5353;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .content-wrapper {
    grid-template-columns: 2fr 1fr;
  }
}

@media (min-width: 768px) {
  .header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .search-filters {
    margin-top: 0;
    width: auto;
  }
}

@media (max-width: 640px) {
  .page {
    padding: 1rem;
  }
  
  .container {
    padding: 0.5rem;
  }
  
  .header {
    padding: 1rem;
  }
}
</style>