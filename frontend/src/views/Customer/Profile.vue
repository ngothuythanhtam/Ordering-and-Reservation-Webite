<script setup>
import { ref, onMounted } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import UserCard from '@/components/Customer/UserCard.vue';
import getUser from '@/services/Customer/users.service.js';

const user = ref(null);
const error = ref('');
const { data, isLoading, isError, error: queryError } = useQuery({
  queryKey: ['user'],
  queryFn: getUser.getUser,
  onSuccess: (data) => {
    user.value = data;
    console.log('Người dùng data từ useQuery:', data);
  },
  onError: (error) => {
    console.error('Error fetching user data:', error);
    error.value = 'Vui lòng kiểm tra lại tài khoản hoặc mật khẩu!';
  }
});

</script>

<template>
  <div>
    <div v-if="isLoading">Loading user data...</div>
    <div v-else-if="isError">{{ error }}</div>
    <UserCard v-if="data && !isLoading" :user="data" @submit:user="handleUpdateProfile" />
  </div>
</template>