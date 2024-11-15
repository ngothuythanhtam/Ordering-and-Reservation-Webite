<script setup>
import { ref, computed, watch } from 'vue';
import { useMutation } from '@tanstack/vue-query';
import { useRouter, useRoute } from 'vue-router';
import menuService from '@/services/Customer/menu.service';
import InputSearch from '@/components/Customer/InputSearch.vue';
import MainPagination from '@/components/Customer/MainPagination.vue';
import ItemList from '@/components/Customer/ItemList.vue';
import tableService from '@/services/Customer/table.service';
import TableList from '@/components/Customer/TableList.vue';
import TableSearch from '@/components/Customer/TableSearch.vue';
// ------------------ ITEM ------------------ //
const route = useRoute();
const router = useRouter();
const totalNumberOfPages = ref(1);
const searchText = ref('');
const selectedIndex = ref(-1);
const currentPage = computed(() => {
  const page = Number(route.query?.page);
  return Number.isNaN(page) || page < 1 ? 1 : page;
});
const items = ref([]);
const fetchItemsMutation = useMutation({
  mutationFn: (page) => menuService.fetchItems(page),
  onSuccess: (data) => {
    totalNumberOfPages.value = data.metadata.lastPage ?? 1;
    items.value = data.items.sort((a, b) => a.item_name.localeCompare(b.item_name));
     selectedIndexTable.value = -1;
  },
  onError: (error) => {
    console.error('Failed to fetch items:', error);
  },
});
function fetchItems() {
  fetchItemsMutation.mutate(currentPage.value);
}
// ------------------ CONTROL - ITEM------------------ //
function navigateToPage(page) {
  router.push({ name: 'Home', query: { page } });
}

watch(currentPage, () => {
  fetchItems();
}, { immediate: true });
// ------------------ SEARCH - ITEM ------------------ //
const searchableItems = computed(() =>
  items.value.map((item) => {
    const { item_name, item_status, item_price } = item;
    return [item_name, item_status, item_price ].join('');
  })
);
const filteredItems = computed(() => {
  if (!searchText.value) return items.value;
  const searchValue = searchText.value;
  if (!isNaN(searchValue)) {
    const price = Number(searchValue);
    return items.value.filter((item) => item.item_price <= price);
  }
  return items.value.filter((item, index) =>
    searchableItems.value[index].includes(searchText.value)
  );
});
const activeItem = computed(() => {
  return selectedIndex.value < 0 ? null : filteredItems.value[selectedIndex.value];
});
watch(searchText, () => (selectedIndex.value = -1));
// ------------------ TABLES ------------------ //
const totalNumberOfPagesTable = ref(1);
const searchTextTable = ref('');
const selectedIndexTable = ref(-1);
const currentPageTable = computed(() => {
  const pageTable = Number(route.query?.pageTable);
  return Number.isNaN(pageTable) || pageTable < 1 ? 1 : pageTable;
});
const tables = ref([]);
const fetchTablesMutation = useMutation({
  mutationFn: (pageTable) => tableService.fetchTables(pageTable),
  onSuccess: (data) => {
    totalNumberOfPagesTable.value = data.metadata?.lastPage ?? 1;
    tables.value = data.items.sort((a, b) => a.table_number.localeCompare(b.table_number));
    selectedIndexTable.value = -1;
  },
  onError: (error) => {
    console.error('Failed to fetch tables:', error);
  },
});
const fetchTables = () => {
  fetchTablesMutation.mutate(currentPageTable.value);
};
// ------------------ SEARCH - Table ------------------ //
const searchableTables = computed(() =>
  tables.value.map((table) => {
    const { table_number, seating_capacity } = table;
    return [table_number, seating_capacity ].join(' ');
  })
);
const filteredTables = computed(() => {
  if (!searchTextTable.value) return tables.value;
   // Kiểm tra nếu người dùng nhập số thì hiển thị bàn phù hợp với yêu cầu người dùng
  const searchValue = searchTextTable.value;
  if (!isNaN(searchValue)) {
    const capacity = Number(searchValue);
    return tables.value.filter((table) => table.seating_capacity >= capacity);
  }
  return tables.value.filter((table, index) =>
    searchableTables.value[index].includes(searchTextTable.value)
  );
});

const activeTable = computed(() => {
  return selectedIndexTable.value < 0 ? null : filteredTables.value[selectedIndexTable.value];
});
watch(searchTextTable, () => (selectedIndexTable.value = -1));
// ------------------ CONTROL - Table------------------ //
function navigateToPageTable(pageTable) {
  router.push({ name: 'Home', query: { pageTable } });
}
watch(currentPageTable, () => {
  fetchTables();
}, { immediate: true });
</script>

<template>
  <div class="page row mb-5">
    <div class="mt-3 col-md-12" id="box">
      <h4 style="font-family: 'Playfair Display', serif; 
        color: #ff6347; 
        font-weight: 700;
        font-size: 40px;
        "><i class="fas fa-hamburger" style="margin-right: 20px;font-size: 30px;"></i>Menu
        <i class="fas fa-hamburger" style="margin-left: 10px;font-size: 30px;"></i> </h4>
      <div class="my-3"> <InputSearch v-model="searchText" /> </div>
      <ItemList v-if="filteredItems.length > 0" :items="filteredItems" v-model:selected-index="selectedIndex"/>
      <p v-else>Finding menu item ...</p>
      <div class="mt-3 d-flex ">
        <MainPagination :total-pages="totalNumberOfPages" :current-page="currentPage" @update:current-page="navigateToPage"/>
        <div class="w-100">
          <button class="btn btn-sm btn-primary"  id = "reset" @click="fetchItems">
            <i class="fas fa-redo"></i> Refresh
          </button>
        </div>
      </div>
    </div>
    <!-- Reservation Section for Tables -->
    <div class="mt-3 col-md-12" id="box">
      <h4 style="font-family: 'Playfair Display', serif; 
        color: #ff6347; 
        font-weight: 700;
        font-size: 40px;
        "><i class="fas fa-glass-cheers" style="margin-right: 20px;
        font-size: 30px;
        margin-top: 50px;"></i>Reservation
        <i class="fas fa-glass-cheers" style="margin-left: 10px;font-size: 30px;"></i> </h4>
      <div class="my-3"> <TableSearch v-model="searchTextTable" /> </div>
      <TableList v-if="filteredTables.length > 0" :tables="filteredTables" v-model:selected-index="selectedIndexTable"/>
      <p v-else>There are no available table.</p>
      <div class="mt-3 d-flex">
        <MainPagination :total-pages="totalNumberOfPagesTable" :current-page="currentPageTable" @update:current-page="navigateToPageTable"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 1200px;
  width: 100%;
  margin: auto;
}
.page > #card {
  display: flex;
  align-items: center; 
}
#box {
  width: 100%;
}
h4 {
  font-size: 24px;
  width: 100%;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}
.error-message {
  color: red;
  margin-top: 10px;
}
#reset{
  border: none;
  background-color: #ff6347;
  height: 42px;
  margin-top:0;
  margin-left: 10px;

}
</style>