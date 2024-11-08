<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import ReservationCard from '@/components/Reservation/ReservationCard.vue';
import ReservationList from '@/components/Reservation/ReservationList.vue';
import MainPagination from '@/components/MainPagination.vue';
import ReservationsService from '@/services/reservation.service';
import InputSearch from '@/components/InputSearch.vue';

const router = useRouter();
const route = useRoute();

const totalPages = ref(1);
const reservations = ref([]);
const selectedIndex = ref(-1);
const searchText = ref('');

const selectedStatus = ref(''); // Bộ lọc trạng thái
const UserFilter = ref(''); // Bộ lọc người dùng


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
</script>

<template>
    <div class="page row mb-5">
        <div class="mt-3 col-md-6">
            <h4>Reservation <i class="fas fa-calendar-check"></i></h4>

            <div class="my-3">
                <InputSearch v-model="searchText"/>
            </div>

            <div class="mb-3">
                <label for="statusFilter" class="form-label">Trạng thái</label>
                <select id="statusFilter" class="form-control" v-model="selectedStatus">
                    <option value="">Tất cả</option>
                    <option value="booked">booked</option>
                    <option value="completed">completed</option>
                    <option value="canceled">canceled</option>
                </select>
            </div>

            <div class="mb-3">
                <label for="userFilter" class="form-label">ID khách hàng</label>
                <input id="userFilter" type="number" class="form-control" v-model="UserFilter" min="1"
                    placeholder="Nhập ID khách hàng" />
            </div>

            <ReservationList v-if="filteredReservations.length > 0" :reservations="filteredReservations"
                v-model:selectedIndex="selectedIndex" />

            <p v-else>Không có đơn đặt bàn nào.</p>

            <div class="mt-3 d-flex flex-wrap justify-content-round align-items-center">
                <MainPagination :total-pages="totalPages" :current-page="currentPage"
                    @update:current-page="changeCurrentPage" />
                <div class="w-100"></div>
                <button class="btn btn-sm btn-primary" @click="retrieveReservations(currentPage)">
                    <i class="fas fa-redo"></i> Làm mới
                </button>
            </div>
        </div>

        <div class="mt-3 col-md-6" v-if="selectedReservation">
            <h4>Chi tiết đơn đặt bàn <i class="fas fa-calendar-check"></i> </h4>
            <ReservationCard :reservation="selectedReservation" />
        </div>
    </div>
</template>

<style scoped>
.page {
    text-align: left;
    max-width: 750px;
}
</style>