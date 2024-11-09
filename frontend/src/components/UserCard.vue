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
    <div class="d-flex align-items-center">
      <div class="p-1">
        <img class="user-avatar" :src="user.useravatar" alt="User Avatar" />
      </div>
      <div class="user-info">
        <div class="info-row">
          <strong>Full Name:</strong>
          <p>{{ user.username }}</p>
        </div>

        <div class="info-row">
          <strong>Email:</strong>
          <p>{{ user.useremail }}</p>
        </div>

        <div class="info-row">
          <strong>Address:</strong>
          <p>{{ user.useraddress }}</p>
        </div>

        <div class="info-row">
          <strong>Phone:</strong>
          <p>{{ user.userphone }}</p>
        </div>

        <div class="info-row">
          <strong>Birthday:</strong>
          <p>{{ formatDate(user.userbirthday) }}</p>
        </div>

        <div class="info-row">
          <strong>Role:</strong>
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
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.222);
  padding: 20px;
  max-width: 650px;
  margin: 20px auto;
}

.user-avatar {
  width: 250px;
  height: 250px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #ddd;
}

.user-info {
  margin-left: 30px;
  display: inline-block;
  vertical-align: top;
}

.user-info strong {
  color: #333;
  font-size: 16px;
}

.user-info p {
  font-size: 20px;
  color: #555;
  margin: 5px 0;
}

.info-row {
  margin-bottom: 15px;
}

.info-row strong {
  color: #333;
  font-weight: bold;
}

.info-row p {
  margin: 5px 0;
  color: #666;
}

.update-btn {
  background-color: #6fd572;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.update-btn:hover {
  background-color: #45a049;
}
</style> -->
