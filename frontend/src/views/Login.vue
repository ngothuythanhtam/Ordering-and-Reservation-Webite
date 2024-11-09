<template>
  <div class="login-container">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">Email</label>
        <input v-model="useremail" type="email" id="email" class="form-control" required/>
        <label for="password">Password</label>
        <input v-model="userpwd" type="password" id="password" class="form-control" required/>
      </div>
      <button type="submit" class="btn btn-primary" style="margin-top: 20px;">Login</button>
    </form>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { makeUserService } from '@/services/users.service.js';
const userService = makeUserService();
export default {
  data() {
    return {
      useremail: '',
      userpwd: '',
      error: null,
    };
  },
  methods: {
    async handleLogin() {
      this.error = null; // Xóa lỗi cũ
      try {
        const userData = await userService.login(this.useremail, this.userpwd);
        console.log('Login successful:', userData);

        // Lưu trạng thái đăng nhập và thông tin người dùng vào localStorage
        localStorage.setItem('isLoggedIn', true);
        localStorage.setItem('user', JSON.stringify(userData)); // Lưu thông tin người dùng nếu cần thiết    
        // Sau khi đăng nhập thành công, điều hướng người dùng đến trang Home
        this.$router.push({ name: 'Home' }).then(() => {
          // Làm mới trang Home sau khi điều hướng
          window.location.reload();
        });
      } catch (error) {
        this.error = error.message || 'Login failed. Please try again.';
      }
    },
  }
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: auto;
  padding: 20px;
}

.error-message {
  color: red;
  margin-top: 10px;
}
</style>