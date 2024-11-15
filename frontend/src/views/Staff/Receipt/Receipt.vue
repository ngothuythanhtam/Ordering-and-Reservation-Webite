<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import ReceiptCard from '@/components/Staff/Receipt/ReceiptCard.vue';
import ReceiptList from '@/components/Staff/Receipt/ReceiptList.vue';
import MainPagination from '@/components/Staff/MainPagination.vue';
import ReceiptsService from '@/services/Staff/receipt.service';
import { useMutation } from '@tanstack/vue-query';

const router = useRouter();
const route = useRoute();
const totalPages = ref(1);
const receipts = ref([]);
const selectedIndex = ref(-1);
const searchText = ref('');
const selectedStatus = ref(''); // Bộ lọc trạng thái
const UserFilter = ref(''); // Bộ lọc người dùng
const ReceiptFilter = ref(''); // Bộ lọc mã hóa đơn

// Define computed properties
const currentPage = computed(() => {
    const page = Number(route.query?.page);
    if (Number.isNaN(page) || page < 1) return 1;
    return page;
});

// Filtered and searchable receipts
const searchableReceipts = computed(() =>
    receipts.value.map((receipt) => {
        const { order_id, userid, staff_id, reservation_id, order_date, total_price, status } = receipt;
        return [order_id, userid, staff_id, reservation_id, order_date, total_price, status]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
    })
);

// Receipts filtered 
const filteredReceipts = computed(() => {
    return receipts.value.filter((receipt, index) => {
        const matchesSearchText = searchableReceipts.value[index].includes(searchText.value.toLowerCase());
        const matchesStatus = !selectedStatus.value || receipt.status === selectedStatus.value;
        const matchesUser = !UserFilter.value || receipt.userid == UserFilter.value;
        const matchesReceipt = !ReceiptFilter.value || receipt.order_id == ReceiptFilter.value;
        return matchesSearchText && matchesStatus && matchesUser && matchesReceipt;
    });
});

const selectedReceipt = computed(() => {
    if (selectedIndex.value < 0) return null;
    return filteredReceipts.value[selectedIndex.value];
});

const fetchReceiptsMutaion = useMutation({
    mutationFn: (page) => ReceiptsService.getReceipts(page),
    onSuccess: (data) => {
        totalPages.value = data.metadata.lastPage ?? 1;
        receipts.value = data.receipts.sort((a,b) => a.status.localeCompare(b.status));
        selectedIndex.value=-1;
    },
    onError: (error) => {
        console.error('Failed to fetch receipts:', error);
    },
});

function fetchReceipts(){
    fetchReceiptsMutaion.mutate(currentPage.value);
}

async function retrieveReceipts(page) {
    try {
        const chunk = await ReceiptsService.getReceipts(page);
        console.log(chunk); // Kiểm tra dữ liệu trả về
        totalPages.value = chunk.metadata.lastPage ?? 1;
        receipts.value = chunk.receipts.sort(
            (current, next) => current.status.localeCompare(next.status)
        );
    } catch (error) {
        console.error('Error retrieving receipts:', error);
    }
}


function changeCurrentPage(page) {
    router.push({ name: 'receipt', query: { page } });
}

// Watchers
watch(searchText, () => {
    selectedIndex.value = -1;
});

watch(currentPage, () => {
    fetchReceipts();
}, {
    immediate: true
});
onMounted(() => {
    fetchReceipts();
});

</script>

<template>
    <div class="app-container">
        <div class="page mb-5">
                <div class="top-controls">
                <h4>Receipt Information &nbsp;<i class="fas fa-receipt"></i></h4>
                <input id="ReceiptFilter" type="number" class="form-control" v-model="ReceiptFilter" min="1" placeholder="Search By Receipt ID" style="width: 200px;"/>
                <input id="userFilter" type="number" class="form-control" v-model="UserFilter" min="1" placeholder="Search By Customer ID" style="width: 200px;"/>

                <select id="statusFilter" class="form-control" v-model="selectedStatus" style="width: 120px;">
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Ordered">Ordered</option>
                    <option value="Completed">Completed</option>
                    <option value="Canceled">Canceled</option>
                </select>

                <button class="btn btn-sm btn-primary" @click="retrieveReceipts(currentPage)"><i class="fas fa-redo"></i>&nbsp;Refresh </button>
                </div>


                <div class="main-content">
                    <div class="reserv-list">
                        <h5>Receipt List</h5>
                        <ReceiptList v-if="filteredReceipts.length > 0" :receipts="filteredReceipts" v-model:selectedIndex="selectedIndex" />
                        <p v-else>No receipt found.</p>
                    </div>

                    <div class="reserv-card">
                        <h5>Receipt Information <i class="fas fa-receipt"></i></h5>
                        <p v-if="!selectedReceipt">Click here for more details</p>
                        <ReceiptCard v-if="selectedReceipt" :receipt="selectedReceipt" />
                    </div>
                </div>

                

                <div class="pagination">
                    <MainPagination :total-pages="totalPages" :current-page="currentPage"
                    @update:current-page="changeCurrentPage" />                
                </div>
        </div>
    </div>

</template>

<style scoped>
.app-container {
    min-height: 95vh;
    min-width: 90vw;
    margin: 0;
    margin-top: 55px;
    padding: 0;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-y: auto;
    background-color: #EAE7DC; 
    color: #565551;
}

.page{
    margin-top: 35px;
    width: 100%;
    height: 85%;
    padding: 20px 60px 20px 60px;
}

.top-controls {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-bottom: 20px;
}

.top-controls h4 {
    margin: 0;
}

.top-controls input,
.top-controls select {
    width: 180px;
    padding: 8px;
}

.refresh-button,
.add-button {
    padding: 6px 12px;
    font-size: 14px;
}

.main-content {
    display: flex;
    gap: 8px; 
}

.reserv-list {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: #f9f9f9;
}

.reserv-card {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: #f9f9f9;
}

.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: 0;
  animation: fade-in 0.3s forwards;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background-color: #d1d4d9;
  padding: 40px;
  border-radius: 10px;
  width: 80%;
  max-width: 600px;
  height: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  transform: scale(0.9);
  animation: zoom-in 0.3s forwards;
}

@keyframes zoom-in {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.close-button {
  position: absolute;
  top: 0px;
  right: 0px;
  background-color: #d1d4d9;
  color: rgb(183, 18, 18);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 25px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-inner {
  text-align: left;
}

button.btn-primary {
    background-color: #4f82d4; 
    border-color: #4f82d4;
    color: #EAE7DC;
    font-size: 16px;
    font-weight: 500;
    height: 40px;
    width: 100px;
}

button.btn-primary:hover {
    background-color: #3667b5; 
}

</style>
