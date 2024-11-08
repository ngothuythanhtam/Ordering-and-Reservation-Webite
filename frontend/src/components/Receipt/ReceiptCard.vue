<script setup>
import { defineProps } from 'vue';

const props = defineProps({
    receipt: { type: Object, required: true }
});

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

</script>

<template>
    <div class="card">
        <div class="card-body">
            <h5 class="card-title">{{ receipt.order_id }}</h5>
            <p class="card-text">ID khách hàng: {{ receipt.userid }}</p>
            <p class="card-text">ID nhân viên xác nhận hóa đơn: {{ receipt.staff_id }}</p>
            <p class="card-text">ID đơn đặt bàn: {{ receipt.reservation_id }}</p>
            <p class="card-text">Thời gian xác nhận: {{ formatDate(receipt.order_date) }}</p>
            <p class="card-text">Tổng tiền: {{ receipt.total_price }}</p>
            <p class="card-text">Trạng thái: {{ receipt.status }}</p>
        </div>
    </div>
</template>
