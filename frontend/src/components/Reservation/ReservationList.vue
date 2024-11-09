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
    <ul class="list-group">
        <li class="list-group-item px-3" v-for="(reservation, index) in reservations"
            :class="{ active: index === selectedIndex }" :key="reservation.reservation_id"
            @click="handleItemClick(reservation.reservation_id, index)">
            {{ reservation.reservation_id }}
        </li>
    </ul>
</template>