<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import TableCard from '@/components/Table/TableCard.vue';
import InputSearch from '@/components/InputSearch.vue';
import TableList from '@/components/Table/TableList.vue';
import MainPagination from '@/components/MainPagination.vue';
import tablesService from '@/services/tables.service';

const router = useRouter();
const route = useRoute();

const totalPages = ref(1);
const tables = ref([]);
const selectedIndex = ref(-1);
const searchText = ref('');

const selectedStatus = ref(''); // Trạng thái được chọn
const seatingCapacityFilter = ref(''); // Bộ lọc chỗ ngồi


// Define computed properties
const currentPage = computed(() => {
    const page = Number(route.query?.page);
    if (Number.isNaN(page) || page < 1) return 1;
    return page;
});

// Filtered and searchable tables
const searchableTables = computed(() =>
    tables.value.map((table) => {
        const { table_number, seating_capacity, status } = table;
        return [table_number, seating_capacity, status]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
    })
);

// Tables filtered by searchText, status, and seating capacity
const filteredTables = computed(() => {
    return tables.value.filter((table, index) => {
        const matchesSearchText = searchableTables.value[index].includes(searchText.value.toLowerCase());
        const matchesStatus = !selectedStatus.value || table.status === selectedStatus.value;
        const matchesSeatingCapacity = !seatingCapacityFilter.value || table.seating_capacity == seatingCapacityFilter.value;
        return matchesSearchText && matchesStatus && matchesSeatingCapacity;
    });
});

// Selected table details
const selectedTable = computed(() => {
    if (selectedIndex.value < 0) return null;
    return filteredTables.value[selectedIndex.value];
});

// Retrieve tables for pagination
async function retrieveTables(page) {
    try {
        const chunk = await tablesService.getTables(page);
        totalPages.value = chunk.metadata.lastPage ?? 1;
        tables.value = chunk.tables.sort(
            (current, next) => current.table_number.localeCompare(next.table_number)
        );
    } catch (error) {
        console.error('Error retrieving tables:', error);
    }
}

function goToAddTable() {
    router.push({ name: 'table.add' });
}

function changeCurrentPage(page) {
    router.push({ name: 'table', query: { page } });
}

// Delete table function
async function deleteTable(tableId) {
    const confirmed = window.confirm('Bạn có chắc chắn muốn xóa bàn này?');
    if (confirmed) {
        try {
            await tablesService.deleteTable(tableId);
            // Refresh tables after deletion
            retrieveTables(currentPage.value);
            selectedIndex.value = -1;
        } catch (error) {
            console.error('Error deleting table:', error);
        }
    }
    
}

// Watchers
watch(searchText, () => {
    selectedIndex.value = -1;
});

watch(currentPage, () => retrieveTables(currentPage.value), {
    immediate: true
});
</script>

<template>
    <div class="page row mb-5">
        <div class="mt-3 col-md-6">
            <h4>Table <i class="fa-solid fa-utensils"></i></h4>

            <div class="my-3">
                <InputSearch v-model="searchText" />
            </div>

            <div class="mb-3">
                <label for="statusFilter" class="form-label">Trạng thái</label>
                <select id="statusFilter" class="form-control" v-model="selectedStatus">
                    <option value="">Tất cả</option>
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="occupied">Occupied</option>
                </select>
            </div>

            <div class="mb-3">
                <label for="seatingFilter" class="form-label">Chỗ ngồi</label>
                <input id="seatingFilter" type="number" class="form-control" v-model="seatingCapacityFilter" min="1"
                    placeholder="Nhập số chỗ ngồi" />
            </div>

            <TableList v-if="filteredTables.length > 0" :tables="filteredTables"
                v-model:selectedIndex="selectedIndex" />

            <p v-else>Không có bàn nào.</p>

            <div class="mt-3 d-flex flex-wrap justify-content-round align-items-center">
                <MainPagination :total-pages="totalPages" :current-page="currentPage"
                    @update:current-page="changeCurrentPage" />
                <div class="w-100"></div>
                <button class="btn btn-sm btn-primary" @click="retrieveTables(currentPage)">
                    <i class="fas fa-redo"></i> Làm mới
                </button>
                <button class="btn btn-sm btn-success" @click="goToAddTable">
                    <i class="fas fa-plus"></i> Thêm mới
                </button>
            </div>
        </div>

        <div class="mt-3 col-md-6" v-if="selectedTable">
            <h4>Chi tiết bàn <i class="fa-solid fa-utensils"></i></h4>
            <TableCard :table="selectedTable" @delete="deleteTable" />
        </div>
    </div>
</template>

<style scoped>
.page {
    text-align: left;
    max-width: 750px;
}
</style>