<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import UpdateForm from '@/components/Customer/UpdateForm.vue';
import UserService from '@/services/Customer/users.service.js';
import { useMutation, useQueryClient } from '@tanstack/vue-query';

const props = defineProps({
  userid: { type: String, required: true }
});

const router = useRouter();
const route = useRoute();
const message = ref('');
const user = ref(null);
const isLoading = ref(false);
const isError = ref(false);
const queryClient = useQueryClient();

const fetchUserMutation = useMutation({
  mutationFn: () => UserService.getUser(),
  onSuccess: (data) => {
    user.value = data;
    isLoading.value = false;
  },
  onError: (error) => {
    console.error('Failed to load user:', error);
    isError.value = true;
    router.push({
      name: 'notfound',
      params: { pathMatch: route.path.split('/').slice(1) },
      query: route.query,
      hash: route.hash
    });
  }
});

const updateUserMutation = useMutation({
  mutationFn: (updatedUser) => UserService.updateUser(updatedUser),
  onSuccess: () => {
    queryClient.invalidateQueries(['user', props.userid]);
    message.value = 'Your information updated successfully!';  
  },
  onError: () => {
    message.value = 'Can not update your information!';
  }
});

const deleteUserMutation = useMutation({
  mutationFn: () => UserService.deleteUser(),
  onSuccess: () => {
    queryClient.invalidateQueries(['users']);
    localStorage.clear();
    router.push({ name: 'Login' });
  },
  onError: (error) => {
    console.error('Error', error);
  }
});

async function onUpdateUser(user) {
  console.log("Updating user: ", user);
  updateUserMutation.mutate(user);
}

async function onDeleteUser() {
  if (confirm('Are you sure that you want to delete this account? This action cannot be undone.')) {
    deleteUserMutation.mutate();
  }
}

onMounted(() => {
  isLoading.value = true;
  fetchUserMutation.mutate();
});
</script>

<template>
  <div v-if="isLoading" class="page">
    <p>Loading...</p>
  </div>
  <div v-else-if="isError" class="page">
    <p>Failed to load user...</p>
  </div>
  <div v-else class="page">
    <UpdateForm
      :user="user"
      @submit:user="onUpdateUser"
      @delete:user="onDeleteUser"
    />
    <div v-if="message" class="alert alert-success mt-3" 
    style="display: flex; 
    align-items: center; 
    justify-content: center;
    max-width: 560px;
    margin-left: 370px;">
      {{ message }}
    </div>
  </div>
</template>
