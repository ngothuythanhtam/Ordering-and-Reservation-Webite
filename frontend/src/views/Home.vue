<template>
  <div class="home-container">
    <h1>Welcome to the Home Page</h1>
    <p v-if="user">Hello, {{ user.username }}!</p>
    <p v-else>Welcome! Please log in to access more features.</p>

    <div class="user-info" v-if="user">
      <h2>Your Information:</h2>
      <ul>
        <li><strong>Email:</strong> {{ user.useremail }}</li>
        <li><strong>Avatar:</strong></li>
        <img :src="user.useravatar" alt="User Avatar" class="user-avatar" />
      </ul>
    </div>

    <div v-if="!user">
      <p>Don't have an account? <router-link to="/register">Register here</router-link></p>
      <p>Or <router-link to="/login">login</router-link> to your account.</p>
    </div>

    <button v-if="user" @click="handleLogout" class="btn btn-danger">Logout</button>
  </div>
</template>

<script>
import { makeUserService } from '@/services/users.service.js';
const userService = makeUserService();

export default {
  data() {
    return {
      user: null,
    };
  },
  async created() {
    // Kiểm tra và lấy thông tin người dùng từ sessionStorage thay vì localStorage
    const userData = sessionStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    }
  },
  methods: {
    async handleLogout() {
      try {
        await userService.logout(); // Gọi dịch vụ đăng xuất
        sessionStorage.removeItem('user'); // Xóa thông tin người dùng trong sessionStorage
        this.user = null; // Đặt lại thông tin người dùng
        this.$router.push({ name: 'Home' }); // Điều hướng về trang Home
      } catch (error) {
        console.error('Logout failed:', error);
      }
    },
  },
};

</script>

<style scoped>
.home-container {
  max-width: 600px;
  margin: auto;
  padding: 20px;
  text-align: center;
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-top: 10px;
}
</style>