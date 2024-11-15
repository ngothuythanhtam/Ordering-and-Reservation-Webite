<script setup>
import { ref } from 'vue';
import ItemForm from '@/components/Staff/Menu/ItemForm.vue';
import itemsService from '@/services/Staff/items.service';
import { useMutation } from '@tanstack/vue-query';
import Swal from 'sweetalert2';

const message = ref('');

const newItem = ref({
    item_name: '',
    item_type: '',
    item_description: '',
    item_price: 0,
    item_status: 1,
    img_url: '/public/images/logo.png', 
});

// Function to display success notification
function showSuccessMessage() {
  Swal.fire({
    icon: 'success',
    title: 'Success!',
    text: 'New item has been added!',
    timer: 2000,
    showConfirmButton: false
  });
}

// Function to display error notification
function showErrorMessage(error) {
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: `Error: ${error.message || 'Unknown Error'}`,
    timer: 3000,
    showConfirmButton: false
  });
}

// Mutation to add a new item
const mutation = useMutation({
  mutationFn: (newItem) => itemsService.createItem(newItem),
  onSuccess: () => {
    showSuccessMessage()
  },
  onError: (error) => {
    console.log(error);
    showErrorMessage(error);
  }
});

function onAddItem(newItem) {
  mutation.mutate(newItem)
}
</script>

<template>
  <div class="app-container">
    <div class="page">
      <ItemForm
        :item="newItem"
        @submit:item="onAddItem" 
      />
      <p v-if="message">{{ message }}</p>
      <p v-if="mutation.isLoading">Adding new item...</p>
    </div>
  </div>
</template>

<style scoped>
.app-container {
    min-height: 95vh;
    min-width: 90vw;
    margin: 0;
    margin-top: 55px;
    padding: 0;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-y: auto;
    background-color: #EAE7DC; 
    color: #565551;
}
</style>