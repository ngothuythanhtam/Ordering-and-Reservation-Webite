<script setup>
import { defineProps, defineEmits, ref, onMounted, watch } from 'vue';
import ReservationsService from '@/services/Staff/reservation.service';

const props = defineProps({
    reservation: { type: Object, required: true }
});

const emit = defineEmits(['submit:reservation']);
const reservationDetails = ref({});

async function fetchReservationDetails() {
    try {
        const details = await ReservationsService.fetchReservation(props.reservation.reservation_id);
        reservationDetails.value = details;
        console.log("reservationDetails:", details);
    } catch (error) {
        console.error("Error fetching reservation details:", error);
    }
}
// Fetch details when component mounts or receipt changes
onMounted(fetchReservationDetails);
watch(() => props.reservation.reservation_id, fetchReservationDetails);

// Hàm định dạng thời gian
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // tháng trong JavaScript bắt đầu từ 0
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0'); // lấy giây và đảm bảo có 2 chữ số

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function formatDateUse(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // tháng trong JavaScript bắt đầu từ 0
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

</script>

<template>
    <div class="card">
        <div class="card-body">
            <h5 class="card-title">Mã đơn: {{ reservation.reservation_id }}</h5>
            <p class="card-text">ID khách hàng: {{ reservation.userid }}</p>
            <p class="card-text">Tên khách hàng: {{ reservationDetails.username }}</p>
            <p class="card-text">Email khách hàng: {{ reservationDetails.useremail }}</p>
            <p class="card-text">Số điện thoại khách hàng: {{ reservationDetails.userphone }}</p>
            <p class="card-text">Số bàn: {{ reservationDetails.table_number }}</p>
            <p class="card-text">Thời gian sử dụng: {{ formatDateUse(reservation.reservation_date) }}</p>
            <p class="card-text">Yêu cầu: {{ reservation.special_request }}</p>
            <p class="card-text">Thời gian đặt: {{ formatDate(reservation.create_at) }}</p>
            <p class="card-text">Trạng thái: {{ reservation.status }}</p>
        </div>
    </div>
</template>
