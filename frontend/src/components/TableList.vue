<script setup>
import { ref } from 'vue';
const props = defineProps({
    tables: { type: Array, default: () => [] },
    selectedIndexTable: { type: Number, default: -1 }
});
const emit = defineEmits(['update:selectedIndexTable']);

function openAddItemForm(table) {
    emit('update:selectedIndexTable', table.table_id);
}
</script>

<template>
  <div class="item-row" v-if="tables.length > 0">
    <div class="card" 
      v-for="(table, index) in tables" 
      :key="table.table_id" 
      :class="{ active: index === selectedIndexTable }"
      @click="openAddItemForm(table)">
      
      <div class="card-body" style="padding-left:5px;">
        <h5 class="card-title">{{ table.table_number }}</h5>
        <p class="card-text">Seating Capacity: {{ table.seating_capacity }}</p>
        <p class="card-text">Status: {{ table.status }}</p>
      </div>
    </div>
  </div>
</template>
