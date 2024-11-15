<script setup>
import { defineProps, defineEmits, ref, onMounted, watch, computed } from 'vue';
import ReceiptsService from '@/services/Staff/receipt.service';
import Swal from 'sweetalert2';
import MainPagination from '@/components/Staff/MainPagination.vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';

const props = defineProps({
    receipt: { type: Object, required: true }
});

const queryClient = useQueryClient();
const isOpen = ref(false);
const closeModal = () => {
  isOpen.value = false;
};
const openModal = () => {
  isOpen.value = true;
};

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
        title: 'Success!',
        text: 'Please refresh page!',
        timer: 2000,
        showConfirmButton: false
    });
}

function showErrorMessage(error) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Error: ${error.message}`,
        timer: 3000,
        showConfirmButton: false
    });
}

const updateReceiptMutation = useMutation({
    mutationFn: (updatedStatus) => ReceiptsService.updateReceipt(props.receipt.order_id, { status: updatedStatus }),
    onSuccess: () => {
        queryClient.invalidateQueries(['receipt', props.receipt.order_id]); 
        showSuccessMessage();
        fetchReceiptDetails();
        emit('submit:item');
    },
    onError: (error) => {
        console.error('Failed to update:', error);
        showErrorMessage(error);
    }
});

async function onUpdateReceipt(status) {
    if (props.receipt.status !== 'Ordered') {
        showErrorMessage("Status can only be updated when the current status is 'Ordered'.");
        return;
    }
    try {
        const result = await Swal.fire({
            title: `Verify "${status === 'Canceled' ? 'Cancel' : 'Complete'}"?`,
            text: `${status === 'Canceled' ? 'Cancellation receipts cannot be undone!' : 'Complete this receipt!'}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'OK',
            cancelButtonText: 'Exit'
        });
        
        if (result.isConfirmed) {
            updateReceiptMutation.mutate(status);
        }
    } catch (error) {
        console.log(error);
        showErrorMessage(error);
    }
}

const currentPage = ref(1); 
const itemsPerPage = 5; 
const totalPages = computed(() => {
  return Math.ceil((receiptDetails.value.order_items?.length || 0) / itemsPerPage);
});

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return receiptDetails.value.order_items?.slice(start, end) || [];
});

function changeCurrentPage(page) {
  currentPage.value = page; 
}

</script>

<template>
    <div class="card">
        <div class="card-body">
            <h5 class="card-title">
                ID #{{ receipt.order_id }} &nbsp;
                <button @click="openModal" class="btn btn-info"><i class="fa-solid fa-eye"></i> &nbsp;
                    View details
                </button>
                <div v-if="isOpen" class="modal-overlay" >
                    <div class="modal-content">
                        <button class="close-button" @click="closeModal"><i class="fa-solid fa-xmark"></i></button>
                        <div class="content-inner">
                            <h5 class="card-title">
                                ID #{{ receipt.order_id }} &nbsp;
                            </h5>
                            <h3 class="mt-4">Total Amount: {{ receipt.total_price }}</h3>
                            <table v-if="receiptDetails.order_items && receiptDetails.order_items.length" class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Item ID</th>
                                        <th>Item Name</th>
                                        <th>Price</th>
                                        <th>Quantity</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in paginatedItems" :key="item.order_item_id">
                                        <td>{{ item.item_id }}</td>
                                        <td>{{ item.item_name }}</td>
                                        <td>{{ item.item_price }}$</td>
                                        <td>{{ item.quantity }}</td>
                                        <td>{{ item.price }}$</td>
                                    </tr>
                                </tbody>
                            </table>
                            
                            <p v-else>No item found in this receipt.</p>
                            <MainPagination :total-pages="totalPages" :current-page="currentPage"
                            @update:current-page="changeCurrentPage" />
                        </div>
                    </div>
                </div>

            </h5>
            <p class="card-text">Customer ID: {{ receipt.userid }}</p>
            <p class="card-text">Customer Name: {{ receiptDetails.user_name }}</p>
            <p class="card-text">Staff ID:  {{ receipt.staff_id }}</p>
            <p class="card-text">Staff Name: {{ receiptDetails.staff_name }}</p>
            <p class="card-text">Table: {{ receiptDetails.table_number }}</p>
            <p class="card-text">Create At: {{ formatDate(receipt.order_date) }}</p>
            <p class="card-text">Total Amount: {{ receipt.total_price }}$</p>
            <p class="card-text">Receipt Status: {{ receipt.status }}</p>

            <div class="buttons mt-3" v-if="receipt.status==='Ordered'">
                <div>
                    <button class="btn btn-danger" @click="onUpdateReceipt('Canceled')">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                    <button class="btn btn-success" @click="onUpdateReceipt('Completed')">
                        <i class="fas fa-check"></i> Complete
                    </button>
                </div>

                <!-- <button v-if="receiptDetails.table_number && receipt.total_price > 0" class="btn btn-success" @click="onUpdateReceipt('Completed')">
                    <i class="fas fa-check"></i> Hoàn thành
                </button> -->
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

button.btn-success {
    background-color: #20ab6a; 
    border-color: #20ab6a;
    color: #EAE7DC;
    font-size: 16px;
    font-weight: 500;
}

button.btn-success:hover {
    background-color: #168250; 
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

button.btn-info{
    background-color: #61bbd4;
    border-color: #61bbd4;
    color: #33312c;
    font-size: 16px;
    font-weight: 500;
}
button.btn-info:hover{
    background-color: #38adce;
}
</style>
