
<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { makeUserService } from '@/services/users.service';

export default {
  name: 'AppHeader',
  setup() {
    const userService = makeUserService();
    const isLoggedIn = ref(!!localStorage.getItem('isLoggedIn')); // Kiểm tra trạng thái đăng nhập
    const router = useRouter();

    const login = () => {
      router.push('/login'); // Điều hướng đến trang login
    };
    const registration = () => {
      router.push('/register'); // Điều hướng đến trang đăng ký
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

    return {
      registration,
      isLoggedIn,
      login,
      logout,
    };
  },
};
</script>
<template>
  <header class="app-header">
    <div class="container">
      <div class="logo">
        <!-- Thêm logo của bạn ở đây -->
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
        <button v-if="!isLoggedIn" @click="login">Login</button>
        <button v-if="!isLoggedIn" @click="registration">Registration</button>
        <button v-if="isLoggedIn" @click="logout">Logout</button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background-color: #333;
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
</style>
