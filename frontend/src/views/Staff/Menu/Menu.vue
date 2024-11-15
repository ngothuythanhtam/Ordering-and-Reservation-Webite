<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import InputSearch from '@/components/Staff/InputSearch.vue';
import ItemList from '@/components/Staff/Menu/ItemList.vue';
import MainPagination from '@/components/Staff/MainPagination.vue';
import itemsService from '@/services/Staff/items.service';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import Swal from 'sweetalert2';

const router = useRouter();
const route = useRoute();
const totalPages = ref(1);
const queryClient = useQueryClient();
const items = ref([]);
const selectedIndex = ref(-1);
const searchText = ref('');
const selectedStatus = ref(''); 
const selectedType = ref(''); 
const isLoading = ref('');

const currentPage = computed(() => {
    const page = Number(route.query?.page);
    if (Number.isNaN(page) || page < 1) return 1;
    return page;
});

// Map each item to a string for searching
const searchableItems = computed(() =>
    items.value.map((item) => {
        const { item_name, item_type, item_description, item_price, item_status } = item;
        return [item_name, item_type, item_description, item_price, item_status]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
    })
);

const filteredItems = computed(() => {
    return items.value.filter((item, index) => {
        const matchesSearchText = searchableItems.value[index].includes(searchText.value.toLowerCase());
        const matchesStatus = selectedStatus.value === '' || item.item_status === parseInt(selectedStatus.value, 10);
        const matchesType = selectedType.value === '' || item.item_type === selectedType.value;
        return matchesSearchText && matchesStatus && matchesType;
    });
});

function showSuccessMessage() {
    Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Updated successfully!',
        timer: 2000,
        showConfirmButton: false
    });
}

function showErrorMessage(error) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Error: ${error.message || 'Unknown Error'}`,
        timer: 3000,
        showConfirmButton: false
    });
}

const fetchItemsMutation = useMutation({
  mutationFn: (page) => itemsService.getItems(page),
  onSuccess: (data) => {
    totalPages.value = data.metadata.lastPage ?? 1;
    items.value = data.items.sort((a, b) => a.item_name.localeCompare(b.item_name));
    selectedIndex.value = -1;
  },
  onError: (error) => {
    console.error('Failed to fetch items:', error);
  },
});

function fetchItems() {
  fetchItemsMutation.mutate(currentPage.value);
}

const deleteAllItemsMutation = useMutation({
  mutationFn: () => itemsService.deleteAllItems(),
  onSuccess: () => {
    queryClient.invalidateQueries(['items']);
    totalPages.value = 1;
    items.value = [];
    selectedIndex.value = -1;
    changeCurrentPage(1);
  },
  onError: (error) => {
    console.error('Failed to delete items:', error);
  },
});

async function onDeleteItems() {
    const result = await Swal.fire({
        title: 'Are you sure that you want to delete all?',
        text: 'This action can not be undone!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Exit'
    });
    if (result.isConfirmed) {
        try{
            deleteAllItemsMutation.mutate();
            showSuccessMessage();
        }catch (error) {
            console.log(error);
            showErrorMessage(error);
        }
    }

}

function goToAddItem() {
    router.push({ name: 'item.add' });
}

function changeCurrentPage(page) {
    router.push({ name: 'menu', query: { page } });
}

watch(searchText, () => {
    selectedIndex.value = -1;
});

watch(currentPage, () => {
    fetchItems();
}, { immediate: true });
</script>

<template>
    <div class="app-container">
        <div class="page mt-3">
            <div class="d-flex my-3 align-items-center mb-3 filter-bar">
                <h4 class="mb-0">Menu Information &nbsp;<i class="fas fa-book-open"></i></h4>
                <InputSearch v-model="searchText" class="search-bar" style="height: 40px;"/>
                <div class="filter-group">
                    <select id="statusFilter" class="form-control" v-model="selectedStatus" style="height: 40px; width: 150px;">
                        <option value="">All Status</option>
                        <option value="1">Available</option>
                        <option value="0">Sold Out</option>
                    </select>
                </div>

                <div class="filter-group">
                    <select id="typeFilter" class="form-control" v-model="selectedType" style="height: 40px; width: 150px;">
                        <option value="">All Type</option>
                        <option value="Course">Course</option>
                        <option value="Salad">Salad</option>
                        <option value="Soup">Soup</option>
                        <option value="Side Dish">Side Dish</option>
                        <option value="Dessert">Dessert</option>
                        <option value="Beverage">Beverage</option>
                        <option value="Snack">Snack</option>
                        <option value="Breakfast">Breakfast</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Dinner">Dinner</option>
                    </select>
                </div>

                <div class="action-buttons ms-3">
                    <button class="btn btn-sm btn-primary me-2" @click="fetchItems">
                        <i class="fas fa-redo"></i> Refresh
                    </button>
                    <button class="btn btn-sm btn-success me-2" @click="goToAddItem">
                        <i class="fas fa-plus"></i> New Item
                    </button>
                    <button class="btn btn-sm btn-danger" @click="onDeleteItems">
                        <i class="fas fa-trash"></i> Delete All
                    </button>
                </div>
            </div>

            <ItemList v-if="filteredItems.length > 0" :items="filteredItems" v-model:selectedIndex="selectedIndex" />
            <p v-else>
                Finding menu item ...
            </p>

            <div class="mt-4 d-flex justify-content-center align-items-center">
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

.page {
    margin-top: 10px;
    width: 100%;
    height: 95%;
    padding: 20px 30px 20px 60px;
}

.filter-bar {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
    margin-top: 5px;
}

.search-bar {
    flex: 1;
}

.filter-group {
    display: flex;
    flex-direction: column;
}

.action-buttons {
    display: flex;
    gap: 10px;
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

button.btn-danger {
    background-color: #e0453a;
    border-color: #e0453a;
    color: #EAE7DC;
    font-size: 16px;
    font-weight: 500;
    height: 40px;
    width: 120px;
}

button.btn-danger:hover {
    background-color: #cd3025; 
}
</style>
