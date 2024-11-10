<script setup>
import { defineProps, defineEmits, ref, onMounted, watch, computed } from 'vue';
import ReceiptsService from '@/services/receipt.service';
import Swal from 'sweetalert2';
import MainPagination from '@/components/MainPagination.vue';

const isOpen = ref(false);
const closeModal = () => {
  isOpen.value = false;
};
const openModal = () => {
  isOpen.value = true;
};

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

function showSuccessMessage() {
    Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Thành công!',
        timer: 2000,
        showConfirmButton: false
    });
}

function showErrorMessage(error) {
    Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: `Có lỗi xảy ra: ${error.message}`,
        timer: 3000,
        showConfirmButton: false
    });
}

async function onUpdateReceipt(status) {
    if (props.receipt.status !== 'Ordered') {
        showErrorMessage("Chỉ có thể cập nhật trạng thái khi trạng thái hiện tại là 'Ordered'.");
        return;
    }
    try {
        if (status === 'Canceled') {
            const resultCancel = await Swal.fire({
                title: 'Hủy hóa đơn này?',
                text: 'Hành động này không thể hoàn tác!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Hủy hóa đơn',
                cancelButtonText: 'Thoát'
            });
            if (resultCancel.isConfirmed) {
                const updatedReceipt = { ...props.receipt, status: 'Canceled' };
                await ReceiptsService.updateReceipt(props.receipt.order_id, updatedReceipt);
                emit('submit:item');
                showSuccessMessage("Hóa đơn đã được hủy thành công.");
                return;
            }
        } else if (status === 'Completed') {
            const resultComplete = await Swal.fire({
                title: 'Hoàn thành hóa đơn này?',
                text: 'Nếu bạn đồng ý hóa đơn này sẽ được hoàn thành!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#2b9957',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Đồng ý',
                cancelButtonText: 'Thoát'
            });
            if (resultComplete.isConfirmed) {
                const updatedReceipt = { ...props.receipt, status: 'Completed' };
                await ReceiptsService.updateReceipt(props.receipt.order_id, updatedReceipt);
                emit('submit:item');
                showSuccessMessage("Hóa đơn đã hoàn thành.");
                console.log("Updated status:", status);
            }
        }
    } catch (error) {
        console.log(error);
        showErrorMessage(error);
    }
}
const currentPage = ref(1); // Initialize current page to 1
const itemsPerPage = 5; // Define how many items per page
// This computed property calculates the total pages
const totalPages = computed(() => {
  return Math.ceil((receiptDetails.value.order_items?.length || 0) / itemsPerPage);
});

// This computed property slices the items based on the current page
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return receiptDetails.value.order_items?.slice(start, end) || [];
});

// Update page when pagination component emits the change
function changeCurrentPage(page) {
  currentPage.value = page; // Update the currentPage ref directly
}

</script>

<template>
    <div class="card">
        <div class="card-body">
            <h5 class="card-title">
                Mã hóa đơn: {{ receipt.order_id }} &nbsp;
                <button @click="openModal" class="btn btn-info"><i class="fa-solid fa-eye"></i> &nbsp;
                    Xem chi tiết 
                </button>
                <div v-if="isOpen" class="modal-overlay" >
                    <div class="modal-content">
                        <button class="close-button" @click="closeModal"><i class="fa-solid fa-xmark"></i></button>
                        <div class="content-inner">
                            <h5 class="card-title">
                                Mã hóa đơn: {{ receipt.order_id }} &nbsp;
                            </h5>
                            <h3 class="mt-4">Tổng tiền: {{ receipt.total_price }}</h3>
                            <table v-if="receiptDetails.order_items && receiptDetails.order_items.length" class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Mã món</th>
                                        <th>Tên món</th>
                                        <th>Đơn giá</th>
                                        <th>Số lượng</th>
                                        <th>Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in paginatedItems" :key="item.order_item_id">
                                        <td>{{ item.item_id }}</td>
                                        <td>{{ item.item_name }}</td>
                                        <td>{{ item.item_price }}</td>
                                        <td>{{ item.quantity }}</td>
                                        <td>{{ item.price }}</td>
                                    </tr>
                                </tbody>
                            </table>
                            
                            <p v-else>Không có món ăn nào trong hóa đơn này.</p>
                            <MainPagination :total-pages="totalPages" :current-page="currentPage"
                            @update:current-page="changeCurrentPage" />
                        </div>
                    </div>
                </div>

            </h5>
            <p class="card-text">Mã khách hàng: {{ receipt.userid }}</p>
            <p class="card-text">Tên khách hàng: {{ receiptDetails.user_name }}</p>
            <p class="card-text">Mã nhân viên xử lý đơn hàng: {{ receipt.staff_id }}</p>
            <p class="card-text">Tên nhân viên: {{ receiptDetails.staff_name }}</p>
            <p class="card-text">Bàn đặt: {{ receiptDetails.table_number }}</p>
            <p class="card-text">Thời gian tạo hóa đơn: {{ formatDate(receipt.order_date) }}</p>
            <p class="card-text">Tổng số tiền của đơn hàng: {{ receipt.total_price }}</p>
            <p class="card-text">Trạng thái của đơn hàng: {{ receipt.status }}</p>

            <div class="buttons mt-3" v-if="receipt.status==='Ordered'">
                <button v-if="!receiptDetails.table_number && receipt.total_price > 0" class="btn btn-success" @click="onUpdateReceipt('Completed')">
                    <i class="fas fa-check"></i> Hoàn thành
                </button>

                <div v-if="receiptDetails.table_number && receipt.total_price === 0">
                    <button class="btn btn-danger" @click="onUpdateReceipt('Canceled')">
                        <i class="fas fa-times"></i> Hủy
                    </button>
                    <button class="btn btn-success" @click="onUpdateReceipt('Completed')">
                        <i class="fas fa-check"></i> Hoàn thành
                    </button>
                </div>

                <button v-if="receiptDetails.table_number && receipt.total_price > 0" class="btn btn-success" @click="onUpdateReceipt('Completed')">
                    <i class="fas fa-check"></i> Hoàn thành
                </button>
            </div>
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

.table {
    width: 100%;
    margin-bottom: 20px;
    border-collapse: collapse;
}

.table th, .table td {
    padding: 10px;
    text-align: left;
}

.buttons button {
    margin-right: 10px;
}


.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    opacity: 0;
    animation: fade-in 0.3s forwards;
}

@keyframes fade-in {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.modal-content {
    background-color: #d1d4d9;
    padding: 20px; 
    border-radius: 10px;
    width: 100%;
    max-width: 800px;
    height: auto;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    position: relative;
    transform: scale(0.9);
    animation: zoom-in 0.3s forwards;
}

@keyframes zoom-in {
    from {
        transform: scale(0.9);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
}

.close-button {
    position: absolute;
    top: 0px;
    right: 0px;
    background-color: #d1d4d9;
    color: rgb(183, 18, 18);
    border: none;
    border-radius: 50%;
    width: 40px; 
    height: 40px;
    font-size: 20px; 
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.content-inner {
    text-align: left;
    line-height: 1.5; 
}

.modal-content .card-title,
.modal-content h5 {
    font-size: 1.2em; 
    margin-bottom: 10px;
}

.modal-content p,
.modal-content td,
.modal-content th {
    font-size: 0.9em; 
}

.modal-content .table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9em; 
}

.modal-content .table th,
.modal-content .table td {
    padding: 8px; 
    text-align: left;
}
.modal-content h3{
    font-size: 20px;
}
</style>
