<script setup>
import Navbar from '@/components/Navbar.vue';
</script>

<template>
  <Navbar />
  <div class="container mt-3">
    <router-view />
  </div>
</template>

<style>
.page {
  max-width: 100%;
  margin: auto;
}
</style>
