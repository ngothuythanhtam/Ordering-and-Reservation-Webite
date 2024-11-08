<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
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
async function onUpdateItem(item) {
    try {
        await itemsService.updateItem(props.item_id, item);
        message.value = 'Món được cập nhật thành công.';
    } catch (error) {
        console.log(error);
        message.value = 'Có lỗi xảy ra khi cập nhật món. Vui lòng thử lại.';
    }
    console.log("Updating item with data:", item);
}

async function onDeleteItem(item_id) {
    if (confirm('Bạn muốn xóa món này?')) {
        try {
            await itemsService.deleteItem(item_id);
            router.push({ name: 'menu' });
        } catch (error) {
            console.log(error);
        }
    }
}
getItem(props.item_id);
</script>

<template>
    <div v-if="item" class="page">
        <h4>Hiệu chỉnh món</h4>
        <ItemForm :item="item" @submit:item="onUpdateItem" @delete:item="onDeleteItem" />
        <p>{{ message }}</p>
    </div>
</template>