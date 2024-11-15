<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import InputSearch from '@/components/Staff/InputSearch.vue';
import TableList from '@/components/Staff/Table/TableList.vue';
import TableForm from '@/components/Staff/Table/TableForm.vue';
import MainPagination from '@/components/Staff/MainPagination.vue';
import tablesService from '@/services/Staff/tables.service';
import Swal from 'sweetalert2';
import { useMutation, useQueryClient } from '@tanstack/vue-query';

const queryClient = useQueryClient();
const isLoading = ref('');
const router = useRouter();
const route = useRoute();
const totalPages = ref(1);
const tables = ref([]);
const selectedIndex = ref(-1);
const searchText = ref('');
const seatingCapacityFilter = ref(''); // Bộ lọc chỗ ngồi
const isOpen = ref(false);
const closeModal = () => {
  isOpen.value = false;
};
const openModal = () => {
  isOpen.value = true;
};

// Function to display success notification
function showSuccessMessage() {
    Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Upated successfully!',
        timer: 2000,
        showConfirmButton: false
    });
}

// Function to display error notification
function showErrorMessage(error) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Error: ${error.message}`,
        timer: 3000,
        showConfirmButton: false
    });
}

const currentPage = computed(() => {
    const page = Number(route.query?.page);
    if (Number.isNaN(page) || page < 1) return 1;
    return page;
});

// Filtered and searchable tables
const searchableTables = computed(() =>
    tables.value.map((table) => {
        const { table_number, seating_capacity} = table;
        return [table_number, seating_capacity]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
    })
);

// Tables filtered by searchText, status, and seating capacity
const filteredTables = computed(() => {
    return tables.value.filter((table, index) => {
        const matchesSearchText = searchableTables.value[index].includes(searchText.value.toLowerCase());
        const matchesSeatingCapacity = !seatingCapacityFilter.value || table.seating_capacity == seatingCapacityFilter.value;
        return matchesSearchText && matchesSeatingCapacity;
    });
});

// Selected table details
const selectedTable = computed(() => {
    if (selectedIndex.value < 0) return null;
    return filteredTables.value[selectedIndex.value];
});

const fetchTablesMutaion = useMutation({
    mutationFn: (page) => tablesService.getTables(page),
    onSuccess: (data) => {
        totalPages.value = data.metadata.lastPage ?? 1;
        tables.value = data.tables.sort((a,b) => a.table_number.localeCompare(b.table_number));
        selectedIndex.value=-1;
    },
    onError: (error) => {
        console.error('Failed to fetch tables:', error);
    },
});

function fetchTables(){
    fetchTablesMutaion.mutate(currentPage.value);
}

function changeCurrentPage(page) {
    router.push({ name: 'table', query: { page } });
}

// Delete table function
const deleteTableMutation = useMutation({
    mutationFn: (table_id) => tablesService.deleteTable(table_id),
    onSuccess: () => {
        queryClient.invalidateQueries(['tables']);
        showSuccessMessage(); 
        fetchTables();
        selectedIndex.value = -1;
    },
    onError: (error) => {
        console.log(error);
        showErrorMessage(error); 
    }
});

async function deleteTable(table_id) {
    const result = await Swal.fire({
        title: 'Do you want to delete this table?',
        text: 'This action can not be undone!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Exit'
    });
    if (result.isConfirmed) {
        try {
            deleteTableMutation.mutate(table_id);
        } catch (error) {
            console.log(error);
            showErrorMessage(error);
        }
    }
}

const newTable = ref({
    table_number: '',
    seating_capacity: 1,
});

const mutation = useMutation({
    mutationFn: (newTable) => tablesService.createTable(newTable),
    onSuccess: () => {
        showSuccessMessage();
        fetchTables();
    },
    onError: (error) => {
        console.log(error);
        showErrorMessage(error);
    }
})

function onAddTable(newTable){
    mutation.mutate(newTable);
    isOpen.value=false;
}

watch(searchText, () => {
    selectedIndex.value = -1;
});

watch(currentPage, () => {
    fetchTables();
}, { immediate: true });

onMounted(() => {
  isLoading.value = true;
  fetchTablesMutaion.mutate();
});
</script>

<template>
    <div class="app-container">
    <div class="page mb-5">
        <div class="mt-4">
            <div class="d-flex my-3 gap-4 align-items-center ">
                <h4 class="mb-0">
                    Table Information <i class="fa-solid fa-utensils"></i>
                </h4>
                <InputSearch v-model="searchText" placeholder="Type to search table..." />
                <input id="seatingFilter" type="number" class="form-control" v-model="seatingCapacityFilter" min="1"
                    placeholder="Type number" style="width: 180px; height: 40px" />

                <button class="btn btn-sm btn-primary" @click="fetchTables">
                    <i class="fas fa-redo"></i> Refresh
                </button>
                <button @click="openModal" class="btn btn-sm btn-success" >
                    <i class="fas fa-plus"></i> New Table
                </button>
                <div v-if="isOpen" class="modal-overlay" >
                    <div class="modal-content">
                        <button class="close-button" @click="closeModal"><i class="fa-solid fa-xmark"></i></button>
                        <div class="content-inner">
                        <TableForm :table="newTable" @submit:table="onAddTable" />
                        <p v-if="mutation.isLoading">Adding new table...</p>
                        </div>
                    </div>
                </div>
            </div>

            <TableList v-if="filteredTables.length > 0" :tables="filteredTables"
                v-model:selectedIndex="selectedIndex" :table="selectedTable" @delete="deleteTable" />
            <p v-else>No table found.</p>

            <div class="mt-3 d-flex flex-wrap justify-content-round align-items-center">
                <MainPagination :total-pages="totalPages" :current-page="currentPage"
                    @update:current-page="changeCurrentPage" />
                <div class="w-100"></div>
            </div>
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
    margin-top: 10px;
    width: 100%;
    height: 90%;
    padding: 20px 60px 20px 60px;
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

button.btn-success {
    background-color: #20ab6a; 
    border-color: #20ab6a;
    color: #EAE7DC;
    font-size: 16px;
    font-weight: 500;
    height: 40px;
    width: 120px;
}

button.btn-success:hover {
    background-color: #168250; 
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
    background-color: #d8c3a5;
    color: #565551;  
    padding: 40px;
    border-radius: 10px;
    width: 80%;
    max-width: 600px;
    height: auto;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    position: relative;
    transform: scale(0.9);
    animation: zoom-in 0.3s forwards;
    font-weight: bold;
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
    background-color: #d8c3a5;
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
    background-color: #d8c3a5;
    color: #565551;
}

</style>
