<script setup>
import { computed, ref, watchEffect,provide } from 'vue';
import { useRouter } from 'vue-router';
import { useQuery, useMutation } from '@tanstack/vue-query';
import makeUserService from '@/services/users.service';

const router = useRouter();
const isLoggedIn = ref(localStorage.getItem('isLoggedIn') === 'true');
const useravatar = ref(localStorage.getItem('useravatar') || '/public/images/blank-profile-picture.png');

const login = () => {
  router.push({ name: 'Login' }); 
};
const register = () => {
  router.push('/registration/');
};
const logout = async () => {
  await makeUserService.logout();
  localStorage.clear();
  isLoggedIn.value = false;
  useravatar.value = '/public/images/blank-profile-picture.png';
  router.push({ name: 'Login'});
}
watchEffect(() => {
  isLoggedIn.value = localStorage.getItem('isLoggedIn') === 'true';
  useravatar.value = localStorage.getItem('useravatar') || '/public/images/blank-profile-picture.png';
});
</script>

<template>
  <header class="app-header">
    <div class="container">
      <div class="logo">
        <!-- Logo (you can replace the "#" with your actual logo path) -->
        <img src="#" alt="App Logo" />
      </div>

      <nav class="navigation">
        <ul>
          <li><router-link to="/">Home</router-link></li>
          <li><router-link to="/about">Activity</router-link></li>
          <li><router-link to="/services">Order Now</router-link></li>
          <li><router-link to="/contact">Reservation</router-link></li>
        </ul>
      </nav>
      <div class="user-options">
        <!-- Show Login and Register buttons if not logged in -->
        <button v-if="!isLoggedIn" @click="login">Login</button>
        <button v-if="!isLoggedIn" @click="register">Register</button>

        <!-- Show avatar and Logout button if logged in -->
        <div v-if="isLoggedIn" class="logged-in-options">
          <!-- <img :src="useravatar" alt="User Avatar" class="avatar" /> -->
          <router-link to="/info/" class="profile-link">Profile</router-link>
          <router-link to="/mycart/" class="profile-link">
            <div class="search-cart">
              <a href="/cart" class="cart ms-3">
                <i class="fas fa-shopping-cart"></i>
                <span class="number badge bg-danger">!</span>
              </a>
          </div>
          My Cart</router-link>
          <button @click="logout" class="logout-btn">Logout</button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background-color: #a99b7d;
  color: #fff;
  padding: 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.logo img {
  height: 50px;
}

.navigation ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
}

.navigation ul li {
  margin-right: 20px;
}

.navigation ul li a {
  color: #fff;
  text-decoration: none;
  font-weight: bold;
}

.navigation ul li a:hover {
  text-decoration: underline;
}

.user-options {
  margin-left: -20px;
}

.user-options button {
  background-color: #fff;
  color: #333;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: bold;
}

.user-options button:hover {
  background-color: #e8b079;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%; /* Circular avatar */
  object-fit: cover; /* Prevent distortion */
  margin-right: 10px;
}

.logged-in-options {
  display: flex;
  align-items: center;
}

.profile-link {
  color: #fff;
  margin-right: 20px;
  text-decoration: none;
  font-weight: bold;
}

.profile-link:hover {
  text-decoration: underline;
}

.logout-btn {
  background-color: #fff;
  color: #333;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: bold;
}

.logout-btn:hover {
  background-color: #e8b079;
}
.search-cart {
  display: flex;
  align-items: center;
  margin-left: auto; /* Đẩy về bên phải */
  gap: 20px; /* Khoảng cách giữa search và cart */
}

.search {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 20px;
  padding: 5px 15px;
}

.search input {
  border: none;
  padding: 8px;
  width: 200px;
  font-size: 1rem;
  outline: none;
}

.cart {
  color: white;
  text-decoration: none;
  position: relative;
  font-size: 1.2rem;
  padding: 5px;
}

.number {
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  position: absolute;
  top: -8px;
  right: -8px;
  font-size: 0.8rem;
  font-weight: bold;
}
</style>
