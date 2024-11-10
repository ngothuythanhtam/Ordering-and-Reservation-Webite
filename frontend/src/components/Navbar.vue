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
      </div>
      
      <div class="ms-auto navbar-nav">
        <li class="nav-item">
          <a href="javascript:void(0)" @click="checkAuth({ name: 'MyAccount' })" class="nav-link">
            My Account
          </a>
        </li>
        <li class="nav-item">
          <a href="javascript:void(0)" @click="login" class="nav-link">
            Login
          </a>
        </li>
      </div>
    </div>
  </nav>
</template>

