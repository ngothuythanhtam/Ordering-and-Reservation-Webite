<script setup>
defineProps({
    tables: { type: Array, default: () => [] },
    selectedIndex: { type: Number, default: -1 },
});
const $emit = defineEmits(['update:selectedIndex']);
</script>

<template>
    <ul class="list-group">
        <li class="list-group-item px-3" v-for="(table, index) in tables" :class="{ active: index === selectedIndex }"
            :key="table.table_id" @click="$emit('update:selectedIndex', index)">
            {{ table.table_number }}
        </li>
    </ul>
</template>