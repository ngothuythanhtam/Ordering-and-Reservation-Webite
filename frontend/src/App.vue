<script setup>
  import Header from '@/components/Header.vue';
  import AppHeader from '@/components/AppHeader.vue';
</script>

<template>
  <AppHeader />
  <div class="container mt-3">
    <router-view />
  </div>
</template>

<style>
.page {
  max-width: 400px;
  margin: auto;
}
</style>
