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
    <div class="page row mb-5">
        <div class="mt-3 col-md-6">
            <h4>Menu <i class="fas fa-book-open"></i></h4>

            <div class="my-3">
                <InputSearch v-model="searchText" />
            </div>

            <ItemList v-if="filteredItems.length > 0" :items="filteredItems" v-model:selectedIndex="selectedIndex" />

            <p v-else>
                Không có món nào.
            </p>

            <div class="mt-3 d-flex flex-wrap justify-content-round align-items-center">
                <MainPagination :total-pages="totalPages" :current-page="currentPage"
                    @update:current-page="changeCurrentPage" />
                <div class="w-100"></div>
                <button class="btn btn-sm btn-primary" @click="retrieveItems(currentPage)">
                    <i class="fas fa-redo"></i> Làm mới
                </button>
                <button class="btn btn-sm btn-success" @click="goToAddItem">
                    <i class="fas fa-plus"></i> Thêm mới
                </button>
                <button class="btn btn-sm btn-danger" @click="onDeleteItems">
                    <i class="fas fa-trash"></i> Xóa tất cả
                </button>
            </div>
        </div>

        <div class="mt-3 col-md-6" v-if="selectedItem">
            <h4>Chi tiết món ăn <i class="fa-solid fa-utensils"></i></h4>
            <ItemCard :item="selectedItem" />
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
    text-align: left;
    max-width: 750px;
}
</style>