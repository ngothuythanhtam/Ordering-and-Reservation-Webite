<script setup>
import { defineProps, defineEmits } from 'vue';
import tablesService from '@/services/tables.service';
import Swal from 'sweetalert2';

const props = defineProps({
    table: { type: Object, required: true },
    tables: { type: Array, default: () => [] },
    selectedIndex: { type: Number, default: -1 },
});
const emit = defineEmits(['update:selectedIndex', 'delete', 'submit:table']);

function handleDelete() {
    emit('delete', props.table.table_id);
}

// Function to display success notification
function showSuccessMessage() {
    Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Bàn được cập nhật thành công. Hãy làm mới lại trang!',
        timer: 2000,
        showConfirmButton: false
    });
}

// Function to display error notification
function showErrorMessage(error) {
    Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: `Có lỗi xảy ra: ${error.message}`,
        timer: 3000,
        showConfirmButton: false
    });
}

async function onUpdateTable() {
    if (props.table.status !== 'reserved') {
        console.log(error);
        showErrorMessage(error);
        return;
    }

    try {
        const updatedTable = { ...props.table };
        await tablesService.updateTable(props.table.table_id, updatedTable);
        emit('submit:item');
        showSuccessMessage();
        console.log("Updated status");
    } catch (error) {
        console.log(error);
        showErrorMessage(error);
    }
}
</script>

<template>
    <table class="table table-striped mt-4">
        <thead>
            <tr>
                <th scope="col">ID Bàn</th>
                <th scope="col">Tên Bàn</th>
                <th scope="col">Chỗ Ngồi</th>
                <th scope="col">Trạng Thái</th>
                <th scope="col"></th>
            </tr>
        </thead>
        <tbody>
            <tr 
                v-for="(table, index) in tables" 
                :key="table.table_id" 
                :class="{ 'table-active': index === selectedIndex }" 
                @click="$emit('update:selectedIndex', index)"
                style="cursor: pointer;"
            >
                
                <td>{{ table.table_id }}</td>
                <td>{{ table.table_number }}</td>
                <td>{{ table.seating_capacity }}</td>
                <td>{{ table.status }}</td>
                <td>
                    <button 
                        v-if="table.status === 'reserved'" 
                        class="btn btn-sm btn-info" 
                        @click="onUpdateTable"
                    >
                        Occupied <i class="fas fa-user-check"></i>  
                    </button>
                </td>
                <td>
                    <button v-if="table.status === 'available'" class="btn btn-sm btn-danger" @click="handleDelete">
                        Xóa <i class="fas fa-trash"></i>
                    </button>
                </td>
                
            </tr>
        </tbody>
    </table>
</template>

<style scoped>
.table-active {
    background-color: #f8f9fa !important;
}
</style>
