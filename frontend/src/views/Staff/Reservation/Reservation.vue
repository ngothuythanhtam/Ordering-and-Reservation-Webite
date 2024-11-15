<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import ReservationCard from '@/components/Staff/Reservation/ReservationCard.vue';
import ReservationList from '@/components/Staff/Reservation/ReservationList.vue';
import MainPagination from '@/components/Staff/MainPagination.vue';
import ReservationsService from '@/services/Staff/reservation.service';
import InputSearch from '@/components/Staff/InputSearch.vue';
import ReservationForm from '@/components/Staff/Reservation/ReservationForm.vue';
import Swal from 'sweetalert2';
import { useMutation, useQueryClient } from '@tanstack/vue-query';

const queryClient = useQueryClient();
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
        title: 'Success!',
        text: 'Updated successfully!',
        timer: 2000,
        showConfirmButton: false
    });
}

// Function to display error notification
function showErrorMessage(error) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Error: ${error.message}`,
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

const fetchReservsMutation = useMutation({
  mutationFn: (page) => ReservationsService.getReservations(page),
  onSuccess: (data) => {
    totalPages.value = data.metadata.lastPage ?? 1;
    reservations.value = data.reservations.sort((a, b) => a.reservation_date.localeCompare(b.reservation_date));
    selectedIndex.value = -1;
  },
  onError: (error) => {
    console.error('Failed to fetch reservations:', error);
  },
});

function fetchReservs() {
  fetchReservsMutation.mutate(currentPage.value);
}

function changeCurrentPage(page) {
    router.push({ name: 'reservation', query: { page } });
}

const newReserv = ref({
    useremail: '',
    table_number: '',
    reservation_date: new Date().toISOString().slice(0, 16),
    special_request: '',
});

const mutation = useMutation({
    mutationFn: (formData) => {
        console.log('Sending reservation data:', formData);
        const response = ReservationsService.createReserv(formData);
        console.log('Reservation added successfully');
        return response;
  },
  onSuccess: () => {
    fetchReservs();
    showSuccessMessage();
    isOpen.value = false;
  },
  onError: (error) => {
    console.error('Error adding reservation:', error);
    showErrorMessage(error);
  }
});

function onAddReserv(formData) {
  mutation.mutate(formData);
}

// Watchers
watch(searchText, () => {
    selectedIndex.value = -1;
});

watch(currentPage, () => {
    fetchReservs();
}, { immediate: true });

</script>

<template>
    <div class="app-container">
        <div class="page mb-5">
                <div class="top-controls">
                    <h4>
                        Reservation Information <i class="fas fa-calendar-check"></i>
                    </h4>
                    <InputSearch v-model="searchText" placeholder="Type here to search"/>
                    
                    <input id="userFilter" type="number" v-model="UserFilter" min="1" placeholder="Customer ID" class="form-control" style="width: 180px;"/>

                    <select id="statusFilter" v-model="selectedStatus" class="form-control" >
                        <option value="">All</option>
                        <option value="booked">Booked</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="canceled">Canceled</option>
                    </select>

                    <button class="refresh-button btn btn-primary" @click="fetchReservs(currentPage)">
                        <i class="fas fa-redo"></i> Refresh
                    </button>
                    <button @click="openModal" class="add-button btn btn-success">
                        <i class="fa-solid fa-plus"></i> &nbsp; New Reservation
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

                <div class="main-content mt-4">
                    <div class="reserv-list">
                        <h5>Reservation List</h5>
                        <ReservationList @click="closeModal" v-if="filteredReservations.length > 0" :reservations="filteredReservations" v-model:selectedIndex="selectedIndex" />
                        <p v-else>No reservation found.</p>
                    </div>

                    <div class="reserv-card">
                        <h5>Reservation Details <i class="fas fa-calendar-check"></i></h5>
                        <p v-if="!selectedReservation">Select a specific reservation.</p>
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

.app-container {
    min-height: 95vh;
    min-width: 90vw;
    margin: 0;
    margin-top: 55px;
    padding: 0;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-y: auto;
    background-color: #EAE7DC; 
    color: #565551;
}

.page{
    margin-top: 35px;
    width: 100%;
    height: 85%;
    padding: 20px 60px 20px 60px;
}

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

.main-content {
    display: flex;
    gap: 8px; 
}

.reserv-list {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: #f9f9f9;
}

.reserv-card {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: #f9f9f9;
}

.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}

button.btn-primary {
    background-color: #4f82d4; 
    border-color: #4f82d4;
    color: #EAE7DC;
    font-size: 16px;
    font-weight: 500;
    height: 40px;
    width: 100px;
}

button.btn-primary:hover {
    background-color: #3667b5; 
}

button.btn-success {
    background-color: #20ab6a; 
    border-color: #20ab6a;
    color: #EAE7DC;
    font-size: 16px;
    font-weight: 500;
    height: 40px;
    width: 180px;
}

button.btn-success:hover {
    background-color: #168250; 
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

/* Modal content with zoom-in effect */
.modal-content {
    background-color: #d8c3a5;
    color: #565551;  
    padding: 40px;
    border-radius: 10px;
    width: 80%;
    max-width: 600px;
    height: auto;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    position: relative;
    transform: scale(0.9);
    animation: zoom-in 0.3s forwards;
    font-weight: 700;
    font-size: 18px;
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
    background-color: #d8c3a5;
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
    background-color: #d8c3a5;
    color: #565551;
}
</style>
