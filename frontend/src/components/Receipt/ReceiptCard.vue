<script setup>
import { defineProps, defineEmits, ref, onMounted, watch } from 'vue';
import ReceiptsService from '@/services/receipt.service';

const props = defineProps({
    receipt: { type: Object, required: true }
});

const emit = defineEmits(['submit:item']);
const receiptDetails = ref({});

async function fetchReceiptDetails() {
    try {
        const details = await ReceiptsService.fetchReceipt(props.receipt.order_id);
        receiptDetails.value = details;
        console.log("Receipt Details:", details);
    } catch (error) {
        console.error("Error fetching receipt details:", error);
    }
}

onMounted(fetchReceiptDetails);
watch(() => props.receipt.order_id, fetchReceiptDetails);

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

async function onUpdateReceipt(status) {
    if (props.receipt.status !== 'Ordered') {
        alert('Chỉ có thể cập nhật trạng thái khi trạng thái hiện tại là "Ordered".');
        return;
    }

    try {
        const updatedReceipt = { ...props.receipt, status };
        await ReceiptsService.updateReceipt(props.receipt.order_id, updatedReceipt);
        emit('submit:item');
        alert('Hóa đơn được cập nhật thành công. Hãy load lại trang');
        console.log("Updated status:", status);
    } catch (error) {
        console.log(error);
        alert('Có lỗi xảy ra khi cập nhật hóa đơn. Vui lòng thử lại.');
    }
}
</script>

<template>
    <div class="card">
        <div class="card-body">
            <h5 class="card-title">Mã hóa đơn: {{ receipt.order_id }}</h5>
            <p class="card-text">Mã khách hàng: {{ receipt.userid }}</p>
            <p class="card-text">Tên khách hàng: {{ receiptDetails.user_name }}</p>
            <p class="card-text">Mã nhân viên xử lý đơn hàng: {{ receipt.staff_id }}</p>
            <p class="card-text">Tên nhân viên: {{ receiptDetails.staff_name }}</p>
            <p class="card-text">Bàn đặt: {{ receiptDetails.table_number }}</p>
            <p class="card-text">Thời gian tạo hóa đơn: {{ formatDate(receipt.order_date) }}</p>
            <p class="card-text">Tổng số tiền của đơn hàng: {{ receipt.total_price }}</p>
            <p class="card-text">Trạng thái của đơn hàng: {{ receipt.status }}</p>

            <h5 class="mt-4">Chi tiết món ăn:</h5>
            <ul v-if="receiptDetails.order_items && receiptDetails.order_items.length">
                <li v-for="item in receiptDetails.order_items" :key="item.order_item_id">
                    <p>Mã món: {{ item.order_item_id }}</p>
                    <p>Tên món: {{ item.item_name }}</p>
                    <p>Số lượng: {{ item.quantity }}</p>
                    <p>Đơn giá: {{ item.item_price }}</p>
                    <p>Thành tiền: {{ item.price }}</p>
                </li>
            </ul>
            <p v-else>Không có món ăn nào trong hóa đơn này.</p>

            <button class="btn btn-danger" @click="onUpdateReceipt('Canceled')">
                <i class="fas fa-times"></i> Hủy
            </button>
            <button class="btn btn-success" @click="onUpdateReceipt('Completed')">
                <i class="fas fa-check"></i> Hoàn thành
            </button>
        </div>
    </div>
</template>

<style scoped>
.card-title {
    font-size: 1.5em;
    margin-bottom: 15px;
}

.card-text {
    margin-bottom: 10px;
}

button {
    margin-right: 10px;
}
</style>
