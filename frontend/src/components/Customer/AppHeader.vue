<script setup>
import { ref, watchEffect,provide } from 'vue';
import { useRouter } from 'vue-router';
import makeUserService from '@/services/Customer/users.service';

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
        <h1>Savorly</h1>
      </div>

      <nav class="navigation">
        <ul>
          <li><router-link to="/">Home</router-link></li>
          <li><router-link to="/history/">Activity</router-link></li>
        </ul>
      </nav>
      <div class="user-options">
        <button v-if="!isLoggedIn" @click="login">Login</button>
        <button v-if="!isLoggedIn" @click="register">Register</button>
        <div v-if="isLoggedIn" class="logged-in-options">
          <router-link to="/info/" class="profile-link" style="margin-right: 0px;">Profile</router-link>
          <router-link to="/mycart/" class="profile-link">
            <div class="search-cart">
              <a href="/cart" class="cart ms-3">
                <i class="fas fa-shopping-cart"></i>
              </a>
          </div></router-link>
          <button @click="logout" class="logout-btn">Logout</button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Poppins', sans-serif;
  background-color: #f4f4f4;
  color: #333;
  line-height: 1.6;
}

a {
  text-decoration: none;
  color: inherit;
}

.app-header {
  background-color: #fff;
  border-bottom: 2px solid #eaeaea;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 10px 0;
}

.app-header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.logo h1 {
  font-size: 2rem;
  color: #ff6347;
  font-family: 'Playfair Display', serif;
  font-weight: 700;
  letter-spacing: 1px;
}

.logo h1:hover {
  color: #e5533d;
}

.navigation ul {
  list-style: none;
  display: flex;
  gap: 20px;
}

.navigation li {
  font-size: 1rem;
  font-weight: 500;
}

.navigation li a {
  color: #333;
  transition: color 0.3s ease;
}

.navigation li a:hover {
  color: #ff6347;
  font-weight: 600;
}

.user-options {
  display: flex;
  align-items: center;
  gap: 15px;
}

button {
  background-color: #ff6347;
  color: #fff;
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #e5533d;
}

.logout-btn {
  background-color: #333;
}

.logout-btn:hover {
  background-color: #e5533d;
}

.logged-in-options {
  display: flex;
  align-items: center;
  gap: 15px;
}

.profile-link {
  color: #333;
  font-weight: 500;
  padding: 8px 16px;
  background-color: #f4f4f4;
  border-radius: 5px;
  transition: background-color 0.3s ease;
  margin: 0;
}

.profile-link:hover {
  background-color: #ff6347;
  color: #fff;
}
.profile-link:hover .cart{
  color: #fff;
}
.search-cart{
  margin-left: -20px;
}
.search-cart .cart {
  color: #333;
  font-size: 1.5rem;
}
.search-cart:hover .cart {
  color: #ffffff;
}
</style>