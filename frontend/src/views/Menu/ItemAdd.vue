<script setup>
import { ref } from 'vue';
import ItemForm from '@/components/Menu/ItemForm.vue';
import itemsService from '@/services/items.service';
import Swal from 'sweetalert2';

const message = ref('');

const newItem = ref({
    item_name: '',
    item_type: '',
    item_description: '',
    item_price: 0,
    item_status: 1,
    img_url: '/public/images/logo.png', 
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

async function onAddItem(item) {
    try {
        await itemsService.createItem(item);
        showSuccessMessage();
    } catch (error) {
        console.log(error);
        showErrorMessage(error);
    }
}
</script>

<template>
  <div class="page">
    <ItemForm
      :item="newItem"
      @submit:item="onAddItem" 
    />
    <p>{{ message }}</p>
  </div>
</template>