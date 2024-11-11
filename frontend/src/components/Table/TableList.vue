<script setup>
import { defineProps, defineEmits, ref } from 'vue';
import tablesService from '@/services/tables.service';
import Swal from 'sweetalert2';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
const isLoading = ref(false);
const isError = ref(false);
const queryClient = useQueryClient();

const props = defineProps({
    table: { type: Object, required: true },
    tables: { type: Array, default: () => [] },
    selectedIndex: { type: Number, default: -1 },
});
const emit = defineEmits(['update:selectedIndex', 'delete', 'submit:table']);

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

const updateTableMutation = useMutation({
    mutationFn: (updatedStatus) => tablesService.updateTable(props.table.table_id, { status: updatedStatus }),
    onSuccess: () => {
        queryClient.invalidateQueries(['table', props.table_id]);
        showSuccessMessage();
    },
    onError: (error) => {
        console.error('Failed to update status table:', error);
        showErrorMessage(error);
    }
});

async function onUpdateTable(status) {
    try {
        const result = await Swal.fire({
            title: `Cập nhật bàn thành "${status === 'available' ? 'Available' : 'Occupied'}"?`,
            text: `Bàn ${status === 'available' ? 'trống, sẵn sàng phục vụ!' : 'đang được khách sử dụng!'}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Thoát'
        });
        
        if (result.isConfirmed) {
            updateTableMutation.mutate(status);
            emit('submit:item');
            showSuccessMessage();
            console.log(`Updated status to ${status}`);
        }
    } catch (error) {
        console.log(error);
        showErrorMessage(error);
    }
}

function handleDelete() {
    emit('delete', props.table.table_id);
}
</script>

<template>
    <div v-if="isLoading" class="page">
        <p>Loading...</p>
    </div>
    <div v-else-if="isError" class="page">
        <p>Error loading table.</p>
    </div>
    <table class="table mt-4" style="border-radius: 10px; overflow: hidden;">
        <thead>
            <tr>
                <th scope="col">Mã Bàn</th>
                <th scope="col">Tên Bàn</th>
                <th scope="col">Chỗ Ngồi</th>
                <th scope="col">Trạng Thái</th>
                <th scope="col">Cập nhật</th>
                <th scope="col"></th>
            </tr>
        </thead>
        <tbody style="font-size: 18px;">
            <tr v-for="(table, index) in tables" 
                :key="table.table_id" 
                :class="{ 'table-active': index === selectedIndex }" 
                @click="$emit('update:selectedIndex', index)" 
                style="cursor: pointer;">

                <td>{{ table.table_id }}</td>
                <td>{{ table.table_number }}</td>
                <td>{{ table.seating_capacity }}</td>
                <td :style="{ color: table.status === 'available' ? '#20ab6a' : '#e0453a' }" style="font-weight: 500;">
                {{ table.status }}
                <i v-if="table.status === 'available'" class="fas fa-check-circle"></i>
                <i v-else class="fas fa-ban"></i>
                </td>

                <td>
                    <button 
                        v-if="table.status === 'available'" 
                        class="btn btn-sm" style="background-color: #f7b4b0; color: #3e3d39; font-weight: 500; font-size: 16px;"
                        @click="onUpdateTable('occupied')"
                    >
                        Có khách <i class="fas fa-user-group" style="color: #c72302;"></i>  
                    </button>
                    <button 
                        v-if="table.status === 'occupied'" 
                        class="btn btn-sm" style="background-color: #8acfa1; color: #3e3d39; font-weight: 500; font-size: 16px;"
                        @click="onUpdateTable('available')"
                    >
                        Có sẵn <i class="fas fa-user-check" style="color: #168250;"></i>  
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

button.btn-danger {
    background-color: #e0453a;
    border-color: #e0453a;
    color: #EAE7DC;
    font-size: 16px;
    font-weight: 500;
}

button.btn-danger:hover {
    background-color: #cd3025; 
}
</style>
