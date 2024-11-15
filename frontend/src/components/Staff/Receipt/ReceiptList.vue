<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    receipts: { type: Array, default: () => [] },
    selectedIndex: { type: Number, default: -1 },
});

const emit = defineEmits(['update:selectedIndex']);

async function handleItemClick(order_id, index) {
    emit('update:selectedIndex', index);
}
</script>

<template>
    <ul class="list-group" style="font-size: 18px;">
        <li
            class="list-group-item px-3"
            v-for="(receipt, index) in receipts"
            :class="{ active: index === selectedIndex }"
            :key="receipt.order_id"
            @click="handleItemClick(receipt.order_id, index)"
        >
            <p>ID #{{ receipt.order_id }}</p>
        </li>
    </ul>
</template>

<style scoped>
.active {
    background-color: #e8e6e3 !important; 
    color: rgb(22, 38, 63);  
    font-weight: 600;
    border-color: #e8e6e3;
}
</style>
