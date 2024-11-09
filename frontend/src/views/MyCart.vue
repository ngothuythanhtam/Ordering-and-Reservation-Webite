<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router'; // Ensure you're using useRoute to access route params
import UserCard from '@/components/UserCard.vue';
import getUser from '@/services/users.service.js'; // Assuming this is a function that fetches the user

const route = useRoute();
const user = ref(null);
const error = ref(null);

const fetchUserData = async () => {
  try {
    const fetchedUser = await getUser.getUser();
    user.value = fetchedUser;
    error.value = null; // Reset error if the fetch is successful
  } catch (err) {
    console.error("Unable to fetch user data:", err);
    error.value = true;
  }
};
onMounted(fetchUserData);
watch(route, fetchUserData);
</script>
<template>
  <div>
    <h1 style="display: flex; align-items: center; justify-content: center; margin-top: 80px;">My Cart</h1>
    <div v-if="!user">Loading user data...</div>
    <div v-else-if="error">Failed to load user data.</div>
    <UserCard v-if="user" :user="user" @submit:user="handleUpdateProfile" />
  </div>
</template>