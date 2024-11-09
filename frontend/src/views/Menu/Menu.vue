 <script setup>
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import InputSearch from '@/components/InputSearch.vue';
import ItemList from '@/components/Menu/ItemList.vue';
import MainPagination from '@/components/MainPagination.vue';
import itemsService from '@/services/items.service';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import Swal from 'sweetalert2';

const router = useRouter();
const route = useRoute();
const totalPages = ref(1);
const queryClient = useQueryClient();
const items = ref([]);
const selectedIndex = ref(-1);
const searchText = ref('');
const selectedStatus = ref(''); //Lọc theo trạng thái
const selectedType = ref(''); //Lọc theo loại món

// current page is from the query string (?page=1)
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


const selectedItem = computed(() => {
    if (selectedIndex.value < 0) return null;
    return filteredItems.value[selectedIndex.value];
});

// Function to display success notification
function showSuccessMessage() {
    Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Cập nhật món ăn thành công!',
        timer: 2000,
        showConfirmButton: false
    });
}

// Function to display error notification
function showErrorMessage(error) {
    Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: `Có lỗi xảy ra: ${error.message || 'Không rõ lỗi'}`,
        timer: 3000,
        showConfirmButton: false
    });
}

// Use mutationFn for fetchContactsMutation
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

// Get items for a specific pages and order them by name
async function retrieveItems(page) {
    try {
        const chunk = await itemsService.getItems(page);
        totalPages.value = chunk.metadata.lastPage ?? 1;
        items.value = chunk.items.sort(
            (current, next) => current.item_name.localeCompare(next.item_name)
        );
    } catch (error) {
        console.error('Error retrieving items:', error);
    }
}

// Use mutationFn for deleteAllItemsMutation
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
        title: 'Bạn có chắc muốn xóa tất cả?',
        text: 'Hành động này không thể hoàn tác!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
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
        <div class="page">
            <h4>Menu <i class="fas fa-book-open"></i></h4>
            <div class="d-flex align-items-center mb-3 filter-bar">
                <InputSearch v-model="searchText" class="search-bar" />
                <div class="filter-group">
                    <select id="statusFilter" class="form-control" v-model="selectedStatus">
                        <option value="">Lọc theo trạng thái</option>
                        <option value="1">Còn sẵn</option>
                        <option value="0">Hết</option>
                    </select>
                </div>

                <div class="filter-group">
                    <select id="typeFilter" class="form-control" v-model="selectedType">
                        <option value="">Lọc theo loại món</option>
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
                    <button class="btn btn-sm btn-primary me-2" @click="retrieveItems(currentPage)">
                        <i class="fas fa-redo"></i> Làm mới
                    </button>
                    <button class="btn btn-sm btn-success me-2" @click="goToAddItem">
                        <i class="fas fa-plus"></i> Thêm mới
                    </button>
                    <button class="btn btn-sm btn-danger" @click="onDeleteItems">
                        <i class="fas fa-trash"></i> Xóa tất cả
                    </button>
                </div>
            </div>

            <ItemList v-if="filteredItems.length > 0" :items="filteredItems" v-model:selectedIndex="selectedIndex" />
                
            <p v-else>
                Không có món nào.
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
    min-height: 90vh;
    min-width: 90vw;
    margin: 0;
    margin-top: 60px;
    padding: 0;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-y: auto;
}

.page {
    margin-top: 10px;
    width: 95%;
    height: 90%;
    padding: 20px;
}

.filter-bar {
    display: flex;
    align-items: center;
    gap: 40px;
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
</style>
