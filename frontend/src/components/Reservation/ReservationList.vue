<script setup>
defineProps({
    reservations: { type: Array, default: () => [] },
    selectedIndex: { type: Number, default: -1 },
});
const $emit = defineEmits(['update:selectedIndex']);
</script>

<template>
    <ul class="list-group">
        <li class="list-group-item px-3" v-for="(reservation, index) in reservations"
            :class="{ active: index === selectedIndex }" :key="reservation.reservation_id"
            @click="$emit('update:selectedIndex', index)">
            {{ reservation.reservation_id }}
        </li>
    </ul>
</template>