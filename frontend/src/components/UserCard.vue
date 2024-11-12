<script setup>
import { useRouter } from 'vue-router';
defineProps({
  user: { type: Object, required: true },
});

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

const router = useRouter();
function handleSubmit() {
  router.push('/updateProfile/');
}
</script>
<template>
  <div class="user-card">
    <h1 style="display: flex; 
      align-items: center; 
      justify-content: flex-start; 
      margin: 20px;
      font-family: 'Playfair Display', serif; 
      color: black; 
      font-weight: 700;
      font-size: 40px;">
      Hi,
      <div style="color: #ff6347;
      padding-left: 15px;
      font-size: 40px;"> {{ user.username }}</div>
      <i class="fas fa-grin-beam" style="margin-left: 15px; 
      color: #333;
      font-size: 30px;"></i>!

    </h1>
    <div class="d-flex align-items-center justify-content-center">
      <div class="p-1">
        <img class="user-avatar" :src="user.useravatar" alt="User Avatar" />
      </div>
      <div class="user-info">
        <div class="info-row">
          <strong>Full Name</strong>
          <p>{{ user.username }}</p>
        </div>

        <div class="info-row">
          <strong>Email</strong>
          <p>{{ user.useremail }}</p>
        </div>

        <div class="info-row">
          <strong>Address</strong>
          <p>{{ user.useraddress }}</p>
        </div>

        <div class="info-row">
          <strong>Phone</strong>
          <p>{{ user.userphone }}</p>
        </div>

        <div class="info-row">
          <strong>Birthday</strong>
          <p>{{ formatDate(user.userbirthday) }}</p>
        </div>

        <div class="info-row">
          <strong>Role</strong>
          <p>{{ user.userrole }}</p>
        </div>

        <div class="p-2">
          <button class="update-btn" @click="handleSubmit">Update Profile</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.user-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
  max-width: 600px;
  margin: 40px auto;
  font-family: 'Arial', sans-serif;
  text-align: center;
}

.user-avatar {
  width: 250px;
  height: 250px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #ddd;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

h1 {
  text-align: center;
  color: #ff6347;
  margin-bottom: 30px;
}

.info-row {
  margin-bottom: 18px;
  width: 100%;
}

.info-row strong {
  color: #333;
  font-weight: bold;
  font-size: 16px;
}

.info-row p {
  color: #555;
  font-size: 20px;
  margin: 5px 0;
}

.update-btn {
  background-color: #ff7a66;
  color: white;
  padding: 12px 25px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 18px;
  width: 100%;
  transition: background-color 0.3s;
  text-align: center;
  margin-top: 20px;
}

.update-btn:hover {
  background-color: #e5533d;
}

.update-btn:focus {
  outline: none;
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
}

@media screen and (max-width: 768px) {
  .user-card {
    padding: 20px;
    max-width: 100%;
  }
  .user-avatar {
    width: 150px;
    height: 150px;
  }
}
</style>