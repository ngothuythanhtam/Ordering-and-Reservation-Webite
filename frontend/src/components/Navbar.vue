<!-- <template>
  <header>
    <div class="container">
        <div class="navbar flex1">
            <nav class="navbar navbar-expand-lg navbar-light p-0">
                <div class="menu-main-menu-container">
                    <ul id="top-menu" class="navbar-nav ml-auto">
                        <li class="menu-item">
                            <router-link :to="{ name: 'menu' }" class="nav-link">
                                Menu
                            </router-link>
                        </li>
                        <li class="menu-item">
                            <router-link :to="{ name: 'table' }" class="nav-link">
                                Table
                            </router-link>
                        </li>
                        <li class="menu-item">
                            <router-link :to="{ name: 'reservation' }" class="nav-link">
                                Reservation
                            </router-link>
                        </li>
                        <li class="menu-item">
                            <router-link :to="{ name: 'receipt' }" class="nav-link">
                                Receipt
                            </router-link>
                        </li>
                        <li class="menu-item">
                            <router-link :to="{ name: 'account' }" class="nav-link">
                                Account
                            </router-link>
                        </li>
                    </ul>
                </div>
            </nav>
        </div>
    </div>
</header>
</template>

<style scoped>
@import '@/assets/navbar.css';
</style> -->

<!-- <div class="login flex">
    <div class="navbar-right menu-right">
        <ul class="d-flex align-items-center list-inline m-0">
            <li class="nav-item nav-icon">
                <div class="search-box iq-search-bar d-search">
                    <form action="searchmovie.php" method="get" class="searchbox">
                        <div class="form-group position-relative">
                            <input type="search" class="text search-input font-size-12"
                                placeholder="Type here to search..." aria-label="Search" name="search_data">
                            <input type="submit" value="Search" class="btn" id="btn"
                                name="search_data_movie">
                            <i class="search-link fa fa-search"></i>
                        </div>
                    </form>
                </div>
            </li>
        </ul>
    </div>
    <a href="profile.php">
        <img src="img/user/<?php echo $img ?>" class="user-pic">
    </a> -->

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { makeUserService } from '@/services/users.service';

export default {
  name: 'Navbar',
  setup() {
    const userService = makeUserService();
    const router = useRouter();
    const isLoggedIn = ref(false);

    // Function to check login status based on localStorage
    const checkLoginStatus = () => {
      isLoggedIn.value = !!localStorage.getItem('isLoggedIn');
    };

    // Run checkLoginStatus on component mount
    onMounted(checkLoginStatus);

    const login = () => {
      router.push('/login');
    };

    const registration = () => {
      router.push('/register');
    };

    const logout = async () => {
      try {
        await userService.logout();
        isLoggedIn.value = false;
        localStorage.removeItem('isLoggedIn');
        router.push('/');
      } catch (error) {
        console.error('Error logging out:', error.message);
      }
    };

    const checkAuth = (to) => {
      checkLoginStatus(); // Refresh login status
      if (!isLoggedIn.value) {
        alert('Please log in to access this page.');
        router.push('/login');
        return false;
      }
      router.push(to);
    };

    return {
      registration,
      isLoggedIn,
      login,
      logout,
      checkAuth,
    };
  },
};

</script>

<template>
  <nav class="navbar navbar-expand bg-dark" data-bs-theme="dark">
    <div class="container-fluid">
      <a href="/" class="navbar-brand">
        Savorly
      </a>
      <div class="me-auto navbar-nav">
        <li class="nav-item">
          <a href="javascript:void(0)" @click="checkAuth({ name: 'menu' })" class="nav-link">
            Menu
          </a>
        </li>
        <li class="nav-item">
          <a href="javascript:void(0)" @click="checkAuth({ name: 'table' })" class="nav-link">
            Table
          </a>
        </li>
        <li class="nav-item">
          <a href="javascript:void(0)" @click="checkAuth({ name: 'reservation' })" class="nav-link">
            Reservation
          </a>
        </li>
        <li class="nav-item">
          <a href="javascript:void(0)" @click="checkAuth({ name: 'receipt' })" class="nav-link">
            Receipt
          </a>
        </li>
        <li class="nav-item">
          <a href="javascript:void(0)" @click="checkAuth({ name: 'account' })" class="nav-link">
            Account
          </a>
        </li>
      </div>
    </div>
  </nav>
</template>
