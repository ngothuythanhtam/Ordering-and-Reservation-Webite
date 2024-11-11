<script setup>
import { ref } from 'vue';
import TableForm from '@/components/Table/TableForm.vue';
import tablesService from '@/services/tables.service';
import { useMutation } from '@tanstack/vue-query';
import Swal from 'sweetalert2';
import errorMap from 'zod/lib/locales/en';

const newTable = ref({
    table_number: '',
    seating_capacity: 1,
    table_satus: 'available',
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

const mutation =  useMutation({
    mutationFn: (newTable) => tablesService.createTable(newTable),
    onSuccess: () => {
        showSuccessMessage()
    },
    onError: (error) => {
        console.log(error);
        showErrorMessage(error);
    }
})

function onAddTable(newTable){
    mutation.mutate(newTable)
}

</script>

<template>
    <div class="page">
        <h4>Thêm bàn mới</h4>
        <TableForm :table="newTable" @submit:table="onAddTable" />
        <p v-if="message">{{ message }}</p>
        <p v-if="mutation.isLoading">Đang thêm bàn mới...</p>
    </div>
</template>