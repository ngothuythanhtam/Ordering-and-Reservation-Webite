<script setup>
import { ref } from 'vue';
import TableForm from '@/components/Table/TableForm.vue';
import tablesService from '@/services/tables.service';


const newTable = ref({
    table_number: '',
    seating_capacity: 1,
    table_satus: 'available',
});

async function onAddTable(table) {
    try {
        await tablesService.createTable(table);
        console.log('Bàn mới được thêm thành công.');
    } catch (error) {
        console.log(error);
    }
}

</script>

<template>
    <div class="page">
        <h4>Thêm bàn mới</h4>
        <TableForm :table="newTable" @submit:table="onAddTable" />
    </div>
</template>