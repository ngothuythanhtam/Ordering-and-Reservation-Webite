<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import ItemCard from '@/components/Menu/ItemCard.vue';
import InputSearch from '@/components/InputSearch.vue';
import ItemList from '@/components/Menu/ItemList.vue';
import MainPagination from '@/components/MainPagination.vue';
import itemsService from '@/services/items.service';

const router = useRouter();
const route = useRoute();

const totalPages = ref(1);
const items = ref([]);
const selectedIndex = ref(-1);
const searchText = ref('');

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

// Items filtered by searchText
const filteredItems = computed(() => {
    if (!searchText.value) return items.value;
    const searchLower = searchText.value.toLowerCase();
    return items.value.filter((item, index) =>
        searchableItems.value[index].includes(searchLower)
    );
});

const selectedItem = computed(() => {
    if (selectedIndex.value < 0) return null;
    return filteredItems.value[selectedIndex.value];
});

// Get items for a specific pages and order them by name
async function retrieveItems(page) {
    try {
        const chunk = await itemsService.getItems(page);
        totalPages.value = chunk.metadata.lastPage ?? 1;
        items.value = chunk.items.sort(
            (current, next) => current.item_name.localeCompare(next.item_name)
        );
        // Don't reset selectedIndex here unless necessary
    } catch (error) {
        console.error('Error retrieving items:', error);
    }
}

async function onDeleteItems() {
    if (confirm('Bạn muốn xóa tất cả các món?')) {
        try {   
            await itemsService.deleteAllItems();
            totalPages.value = 1;
            items.value = [];
            selectedIndex.value = -1;
            changeCurrentPage(1);
        } catch (error) {
            console.error('Error deleting items:', error);
        }
    }
}

function goToAddItem() {
    router.push({ name: 'item.add' });
}

function changeCurrentPage(page) {
    router.push({ name: 'menu', query: { page } });
}

// Only reset selectedIndex when search text changes
watch(searchText, () => {
    selectedIndex.value = -1;
});

// When currentPage changes, fetch items for currentPage
watch(currentPage, () => retrieveItems(currentPage.value), { 
    immediate: true 
});
</script>

<template>
    <div class="page">
        <div class="mt-3 menu-section">
            <h4>Menu <i class="fas fa-book-open"></i></h4>

            <div class="d-flex align-items-center mb-3 my-3">
                <InputSearch v-model="searchText" />
                <div class="ms-3 action-buttons">
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
            

            <ItemList v-if="filteredItems.length > 0" 
                :items="filteredItems" v-model:selectedIndex="selectedIndex"/>

            <p v-else>
                Không có món nào.
            </p>

            <div class="mt-3 d-flex flex-wrap justify-content-round align-items-center">
                <MainPagination :total-pages="totalPages" :current-page="currentPage" class="mt-2"
                    @update:current-page="changeCurrentPage" />

            </div>
        </div>

        <div class="mt-3 details-section" v-if="selectedItem">
            <h4 class="mt-5" >Chi tiết món ăn <i class="fa-solid fa-utensils"></i></h4>
            <ItemCard class="card" :item="selectedItem" />
            <router-link :to="{
                name: 'item.edit',
                params: { item_id: selectedItem.item_id },
            }">
                <span class="mt-2 badge text-bg-warning">
                    <i class="fas fa-edit"></i> Hiệu chỉnh</span>
            </router-link>
        </div>
    </div>
</template>

<style scoped>
.page {
    display: flex;
    width: 90vw; 
    height: 90vh; 
    max-width: 1600px;
    box-sizing: border-box;
    margin-left: -50px;
}

.menu-section {
    width: 65%;
    padding-left: 20px;
    padding-right: 10px;
    overflow-y: auto; 
}

.details-section {
    width: 30%;
    padding-left: 0px;
    margin-left: 75px;
    overflow-y: auto; 
}

.card{
    margin-top: 20px;
    border-style: none;
}

</style>

