<script setup>
import { ref, onMounted  } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import Swal from 'sweetalert2';
import ItemForm from '@/components/Menu/ItemForm.vue';
import itemsService from '@/services/items.service';

const props = defineProps({
    item_id: { type: String, required: true },
});

const router = useRouter();
const route = useRoute();
const item = ref(null);
const message = ref('');
const isLoading = ref(false);
const isError = ref(false);
const queryClient = useQueryClient();

// Fetch item mutation using mutationFn
const fetchItemMutation = useMutation({
  mutationFn: () => itemsService.fetchItem(props.item_id),
  onSuccess: (data) => {
    item.value = data;
    isLoading.value = false;
  },
  onError: (error) => {
    console.error('Failed to fetch item:', error);
    isError.value = true;
    router.push({
      name: 'notfound',
      params: { pathMatch: route.path.split('/').slice(1) },
      query: route.query,
      hash: route.hash
    });
  }
});

function showSuccessMessage() {
    Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Cập nhật món ăn thành công!',
        timer: 2000,
        showConfirmButton: false
    });
}

function showErrorMessage(error) {
    Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: `Có lỗi xảy ra: ${error.message || 'Không rõ lỗi'}`,
        timer: 3000,
        showConfirmButton: false
    });
}

// Update item using mutationFn
const updateItemMutation = useMutation({
  mutationFn: (updatedItem) => itemsService.updateItem(props.item_id, updatedItem),
  onSuccess: () => {
    queryClient.invalidateQueries(['item', props.item_id]);
    showSuccessMessage();
  },
  onError: (error) => {
    console.error('Failed to update item:', error);
    showErrorMessage(error)
  }
});

async function onUpdateItem(item) {
    updateItemMutation.mutate(item);
    console.log("Updating item with data:", item);
}

// Delete item using mutationFn
const deleteItemMutation = useMutation({
  mutationFn: () => itemsService.deleteItem(props.item_id),
  onSuccess: () => {
    queryClient.invalidateQueries(['items']);
    router.push({ name: 'menu' });
  },
  onError: (error) => {
    console.error('Failed to delete contact:', error);
  }
});

async function onDeleteItem() {
    const result = await Swal.fire({
        title: 'Bạn có chắc muốn xóa?',
        text: 'Hành động này không thể hoàn tác!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
    });
    if (result.isConfirmed) {
        try {
            deleteItemMutation.mutate();
            showSuccessMessage();
        } catch (error) {
            console.log(error);
            showErrorMessage(error);
        }
    }
}

onMounted(() => {
  isLoading.value = true;
  fetchItemMutation.mutate();
});
// getItem(props.item_id);
</script>

<template>
  <div class="app-container">
    <div v-if="isLoading" class="page">
        <p>Loading...</p>
    </div>
    <div v-else-if="isError" class="page">
        <p>Error loading contact.</p>
    </div>
    <div v-else="item" class="page mt-5" >
        <ItemForm :item="item" @submit:item="onUpdateItem" @delete:item="onDeleteItem" />
        <p>{{ message }}</p>
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
</style>