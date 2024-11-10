<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import ReservationCard from '@/components/Reservation/ReservationCard.vue';
import ReservationList from '@/components/Reservation/ReservationList.vue';
import MainPagination from '@/components/MainPagination.vue';
import ReservationsService from '@/services/reservation.service';
import InputSearch from '@/components/InputSearch.vue';
import ReservationForm from '@/components/Reservation/ReservationForm.vue';
import Swal from 'sweetalert2';

const router = useRouter();
const route = useRoute();
const totalPages = ref(1);
const reservations = ref([]);
const selectedIndex = ref(-1);
const searchText = ref('');
const selectedStatus = ref(''); // Bộ lọc trạng thái
const UserFilter = ref(''); // Bộ lọc người dùng
const isOpen = ref(false);
const closeModal = () => {
  isOpen.value = false;
};
const openModal = () => {
  isOpen.value = true;
};

// Function to display success notification
function showSuccessMessage() {
    Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Thành công!',
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

// Define computed properties
const currentPage = computed(() => {
    const page = Number(route.query?.page);
    if (Number.isNaN(page) || page < 1) return 1;
    return page;
});

// Filtered and searchable reservations
const searchableReservations = computed(() =>
    reservations.value.map((reservation) => {
        const { reservation_id, userid, table_id, reservation_date, special_request, create_at, status } = reservation;
        return [reservation_id, userid, table_id, reservation_date, special_request, create_at, status]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
    })
);

// Reservations filtered 
const filteredReservations = computed(() => {
    return reservations.value.filter((reservation, index) => {
        const matchesSearchText = searchableReservations.value[index].includes(searchText.value.toLowerCase());
        const matchesStatus = !selectedStatus.value || reservation.status === selectedStatus.value;
        const matchesUser = !UserFilter.value || reservation.userid == UserFilter.value;
        return matchesSearchText && matchesStatus && matchesUser;
    });
});

const selectedReservation = computed(() => {
    if (selectedIndex.value < 0) return null;
    return filteredReservations.value[selectedIndex.value];
});

async function retrieveReservations(page) {
    try {
        const chunk = await ReservationsService.getReservations(page);
        console.log(chunk); // Kiểm tra dữ liệu trả về
        totalPages.value = chunk.metadata.lastPage ?? 1;
        reservations.value = chunk.reservations.sort(
            (current, next) => current.reservation_date.localeCompare(next.reservation_date)
        );
    } catch (error) {
        console.error('Error retrieving reservations:', error);
    }
}


function changeCurrentPage(page) {
    router.push({ name: 'reservation', query: { page } });
}

// Watchers
watch(searchText, () => {
    selectedIndex.value = -1;
});

watch(currentPage, () => retrieveReservations(currentPage.value), {
    immediate: true
});

// In your reservation.vue setup script
const newReserv = ref({
    useremail: '',
    table_number: '',
    reservation_date: new Date().toISOString().slice(0, 16), // Set default to current date/time
    special_request: '',
});

async function onAddReserv(formData) {
    try {
        // Log the data being sent
        console.log('Sending reservation data:', formData);
        
        // Call the service to create a reservation with FormData
        await ReservationsService.createReserv(formData);
        
        console.log('Reservation added successfully');
        await retrieveReservations(currentPage.value);
        showSuccessMessage();
        isOpen.value = false;
    } catch (error) {
        console.error('Error adding reservation:', error);
        showErrorMessage(error);
    }
}

</script>

<template>
    <div class="page mb-5">
        <div class="mt-5">
            <div class="top-controls">
                <h4>
                    Reservation Information <i class="fas fa-calendar-check"></i>
                </h4>
                <InputSearch v-model="searchText" placeholder="Nhập thông tin cần tìm" />
                
                <input id="userFilter" type="number" v-model="UserFilter" min="1" placeholder="Nhập ID khách hàng" class="form-control" style="width: 180px;"/>

                <select id="statusFilter" v-model="selectedStatus" class="form-control" >
                    <option value="">Tất cả trạng thái</option>
                    <option value="booked">booked</option>
                    <option value="completed">completed</option>
                    <option value="canceled">canceled</option>
                </select>

                <button class="refresh-button btn btn-primary" @click="retrieveReservations(currentPage)">
                    <i class="fas fa-redo"></i> Làm mới
                </button>
                <button @click="openModal" class="add-button btn btn-success">
                    <i class="fa-solid fa-plus"></i> &nbsp; Đặt bàn cho khách
                </button>
               
            </div>

            <div class="modal-overlay" v-if="isOpen">
                <div class="modal-content">
                    <button class="close-button" @click="closeModal">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                     <div class="content-inner">
                        <ReservationForm :reservation="newReserv" @submit:reservation="onAddReserv" />
                    </div>
                </div>
            </div>

            <div class="main-content">
                <div class="reserv-list">
                    <h5>Danh sách đặt bàn</h5>
                    <ReservationList @click="closeModal" v-if="filteredReservations.length > 0" :reservations="filteredReservations" v-model:selectedIndex="selectedIndex" />
                    <p v-else>Không có đơn đặt bàn nào.</p>
                </div>

                <div class="reserv-card">
                    <h5>Chi tiết đơn đặt bàn <i class="fas fa-calendar-check"></i></h5>
                    <p v-if="!selectedReservation">Chưa chọn đơn đặt bàn</p>
                    <ReservationCard v-if="selectedReservation" :reservation="selectedReservation" />
                </div>
            </div>

            <div class="pagination">
                <MainPagination :total-pages="totalPages" :current-page="currentPage" @update:current-page="changeCurrentPage" />
            </div>
        </div>
    </div>
</template>


<style scoped>
/* Top controls styling */
.top-controls {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-bottom: 20px;
}

.top-controls h4 {
    margin: 0;
}

.top-controls input,
.top-controls select {
    width: 180px;
    padding: 8px;
}

.refresh-button,
.add-button {
    padding: 6px 12px;
    font-size: 14px;
}

/* Main content layout styling */
.main-content {
    display: flex;
    gap: 8px; 
}

/* Reservation list styling */
.reserv-list {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: #f9f9f9;
}

/* Reservation card styling */
.reserv-card {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: #f9f9f9;
}

/* Pagination styling */
.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}
/* Modal overlay with fade-in effect */
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

/* Modal content with zoom-in effect */
.modal-content {
  background-color: #d1d4d9;
  padding: 40px;
  border-radius: 10px;
  width: 80%;
  max-width: 600px;
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
  width: 50px;
  height: 50px;
  font-size: 25px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-inner {
  text-align: left;
}
</style>
