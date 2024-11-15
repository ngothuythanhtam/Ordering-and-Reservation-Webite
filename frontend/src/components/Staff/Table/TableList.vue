<script setup>
import { defineProps, defineEmits, ref } from 'vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
const isLoading = ref(false);
const isError = ref(false);
const queryClient = useQueryClient();

const props = defineProps({
    table: { type: Object, required: true },
    tables: { type: Array, default: () => [] },
    selectedIndex: { type: Number, default: -1 },
});
const emit = defineEmits(['update:selectedIndex', 'delete', 'submit:table']);

function handleDelete() {
    emit('delete', props.table.table_id);
}
</script>

<template>
    <div v-if="isLoading" class="page">
        <p>Loading...</p>
    </div>
    <div v-else-if="isError" class="page">
        <p>Error loading table.</p>
    </div>
    <table class="table mt-4" style="border-radius: 10px; overflow: hidden;">
        <thead>
            <tr>
                <th scope="col">ID</th>
                <th scope="col">Table Name</th>
                <th scope="col">Seating Capacity</th>
                <th scope="col"></th>
            </tr>
        </thead>
        <tbody style="font-size: 18px;">
            <tr v-for="(table, index) in tables" 
                :key="table.table_id" 
                :class="{ 'table-active': index === selectedIndex }" 
                @click="$emit('update:selectedIndex', index)" 
                style="cursor: pointer;">

                <td>#{{ table.table_id }}</td>
                <td>{{ table.table_number }}</td>
                <td>{{ table.seating_capacity }}</td>

                <td>
                    <button class="btn btn-sm btn-danger" @click="handleDelete">
                        Delete <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<style scoped>
.table-active {
    background-color: #f8f9fa !important;
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
</style>
