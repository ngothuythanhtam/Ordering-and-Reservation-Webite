<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
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

async function getItem(item_id) {
    try {
        item.value = await itemsService.fetchItem(item_id);
    } catch (error) {
        console.log(error);
        router.push({
            name: 'notfound',
            params: { pathMatch: route.path.split('/').slice(1) },
            query: route.query,
            hash: route.hash,
        });
    }
}
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

async function onUpdateItem(item) {
    try {
        await itemsService.updateItem(props.item_id, item);
        showSuccessMessage();
    } catch (error) {
        console.log(error);
        showErrorMessage(error);
    }
    console.log("Updating item with data:", item);
}

async function onDeleteItem(item_id) {
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
            showSuccessMessage();
            await itemsService.deleteItem(item_id);
            router.push({ name: 'menu' });
        } catch (error) {
            console.log(error);
            showErrorMessage(error);
        }
    }
}

getItem(props.item_id);
</script>

<template>
    <div v-if="item" class="page">
        <ItemForm :item="item" @submit:item="onUpdateItem" @delete:item="onDeleteItem" />
        <p>{{ message }}</p>
    </div>
</template>