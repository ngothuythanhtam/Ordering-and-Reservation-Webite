<script setup>
defineProps({
    receipts: { type: Array, default: () => [] },
    selectedIndex: { type: Number, default: -1 },
});
const $emit = defineEmits(['update:selectedIndex']);
</script>

<template>
    <ul class="list-group">
        <li class="list-group-item px-3" v-for="(receipt, index) in receipts"
            :class="{ active: index === selectedIndex }" :key="receipt.order_id"
            @click="$emit('update:selectedIndex', index)">
            {{ receipt.order_id }}
        </li>
    </ul>
</template>