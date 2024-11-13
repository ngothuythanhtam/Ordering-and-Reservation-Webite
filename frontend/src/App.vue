<script setup>
import { computed } from 'vue';
import Navbar from '@/components/Staff/Navbar.vue';
import AppHeader from './components/Customer/AppHeader.vue';
const userrole = localStorage.getItem('userrole');
const isStaffRole = computed(() => userrole === '2');
</script>

<template>
  <div>
    <Navbar v-if="isStaffRole" />
    <AppHeader v-else />
    
    <div class="container mt-3">
      <router-view />
    </div>
  </div>
</template>

<style>
.page {
  max-width: 100%;
  margin: auto;
}
</style>