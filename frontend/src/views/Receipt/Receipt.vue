<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import ReceiptCard from '@/components/Receipt/ReceiptCard.vue';
import ReceiptList from '@/components/Receipt/ReceiptList.vue';
import MainPagination from '@/components/MainPagination.vue';
import ReceiptsService from '@/services/receipt.service';

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

async function retrieveReceipts(page) {
    try {
        const chunk = await ReceiptsService.getReceipts(page);
        console.log(chunk); // Kiểm tra dữ liệu trả về
        totalPages.value = chunk.metadata.lastPage ?? 1;
        receipts.value = chunk.receipts.sort(
            (current, next) => current.order_date.localeCompare(next.order_date)
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

watch(currentPage, () => retrieveReceipts(currentPage.value), {
    immediate: true
});
</script>

<template>
    <div class="page row mb-5">
        <div class="mt-3 col-md-6">
            <h4>Receipt <i class="fas fa-receipt"></i></h4>

            <div class="mb-3">
                <label for="statusFilter" class="form-label">Trạng thái</label>
                <select id="statusFilter" class="form-control" v-model="selectedStatus">
                    <option value="">Tất cả</option>
                    <option value="Pending">Pending</option>
                    <option value="Ordered">Ordered</option>
                    <option value="Completed">Completed</option>
                    <option value="Canceled">Canceled</option>
                </select>
            </div>

            <div class="mb-3">
                <label for="userFilter" class="form-label">ID khách hàng</label>
                <input id="userFilter" type="number" class="form-control" v-model="UserFilter" min="1"
                    placeholder="Nhập ID khách hàng" />
            </div>

            <div class="mb-3">
                <label for="ReceiptFilter" class="form-label">ID hóa đơn</label>
                <input id="ReceiptFilter" type="number" class="form-control" v-model="ReceiptFilter" min="1"
                    placeholder="Nhập ID hóa đơn" />
            </div>

            <ReceiptList v-if="filteredReceipts.length > 0" :receipts="filteredReceipts"
                v-model:selectedIndex="selectedIndex" />

            <p v-else>Không có hóa đơn nào.</p>

            <div class="mt-3 d-flex flex-wrap justify-content-round align-items-center">
                <MainPagination :total-pages="totalPages" :current-page="currentPage"
                    @update:current-page="changeCurrentPage" />
                <div class="w-100"></div>
                <button class="btn btn-sm btn-primary" @click="retrieveReceipts(currentPage)">
                    <i class="fas fa-redo"></i> Làm mới
                </button>
            </div>
        </div>

        <div class="mt-3 col-md-6" v-if="selectedReceipt">
            <h4>Chi tiết hóa đơn <i class="fas fa-receipt"></i> </h4>
            <ReceiptCard :receipt="selectedReceipt" />
        </div>
    </div>
</template>

<style scoped>
.page {
    text-align: left;
    max-width: 750px;
}
</style>