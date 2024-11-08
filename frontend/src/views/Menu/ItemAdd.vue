<script setup>
import { ref } from 'vue';
import ItemForm from '@/components/Menu/ItemForm.vue';
import itemsService from '@/services/items.service';

const message = ref('');

const newItem = ref({
    item_name: '',
    item_type: '',
    item_description: '',
    item_price: 0,
    item_status: 1,
    img_url: '/public/images/logo.png', // Default image URL for preview
});

async function onAddItem(item) {
    try {
        await itemsService.createItem(item);
        message.value = 'Món mới được thêm thành công.';
    } catch (error) {
        console.log(error);
        message.value = 'Có lỗi xảy ra khi thêm món.';
    }
}
</script>

<template>
  <div class="page">
    <h4>Thêm món mới</h4>
    <ItemForm
      :item="newItem"
      @submit:item="onAddItem" 
    />
    <p>{{ message }}</p>
  </div>
</template>