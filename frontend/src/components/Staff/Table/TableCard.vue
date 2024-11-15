<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    table: { type: Object, required: true }
});

const emit = defineEmits(['delete']);

function handleDelete() {
    emit('delete', props.table.table_id);
}
</script>

<template>
    <div class="card">
        <div class="card-body">
            <h5 class="card-title">{{ table.table_number }}</h5>
            <p class="card-text">Seating Capacity: {{ table.seating_capacity }}</p>
            <button class="btn btn-danger" @click="handleDelete">
                <i class="fas fa-trash"></i> Xóa
            </button>
        </div>
    </div>
</template>
