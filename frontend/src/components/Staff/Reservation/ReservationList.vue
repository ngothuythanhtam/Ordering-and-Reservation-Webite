<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
    reservations: { type: Array, default: () => [] },
    selectedIndex: { type: Number, default: -1 },
});
const emit = defineEmits(['update:selectedIndex']);

async function handleItemClick(reservation_id, index) {
    emit('update:selectedIndex', index);
}
</script>

<template>
    <div class="reserv-list">
    <ul class="list-group" style="font-size: 18px;">
        <li class="list-group-item px-3" v-for="(reservation, index) in reservations"
            :class="{ active: index === selectedIndex }" :key="reservation.reservation_id"
            @click="handleItemClick(reservation.reservation_id, index)">
            ID #{{ reservation.reservation_id }}
        </li>
    </ul>
    </div>
</template>

<style scoped>
.active {
    background-color: #e8e6e3 !important; 
    color: rgb(22, 38, 63);  
    font-weight: 600;
    border-color: #e8e6e3;
}
</style>
