<script setup>
import { ref } from 'vue';
import { useMutation } from '@tanstack/vue-query';
import makeUserService from '@/services/users.service.js';

const useremail = ref('');
const userpwd = ref('');
const error = ref('');

const loginMutation = useMutation({
  mutationFn: (data) => makeUserService.login(data.email, data.password),
  onSuccess: (response) => {
    const { userid, useremail, userrole, useravatar } = response;
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userid', userid);
    localStorage.setItem('useremail', useremail);
    localStorage.setItem('userrole', userrole);
    localStorage.setItem('useravatar', useravatar);
    error.value = ''; 
    window.location.reload(); 
  },
  onError: () => {
    error.value = 'Vui lòng kiểm tra lại tài khoản hoặc mật khẩu!'; 
  },
});
const handleLogin = () => {
  error.value = ''; 
  loginMutation.mutate({
    email: useremail.value,
    password: userpwd.value,
  });
};
</script>
<template>
  <div class="login-container">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">Email</label>
        <input v-model="useremail" type="email" id="email" class="form-control" required />
        <label for="password">Password</label>
        <input v-model="userpwd" type="password" id="password" class="form-control" required />
      </div>
      <button type="submit" class="btn btn-primary" style="margin-top: 20px;" :disabled="loginMutation.isLoading">Login</button>
    </form>
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>
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
