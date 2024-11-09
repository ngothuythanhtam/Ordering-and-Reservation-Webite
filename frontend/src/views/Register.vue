<template>
    <div class="form-container">
        <h2 class="text-center mb-4">Register New User</h2>

        <UserForm :user="user" @submit:user="onCreateContact" />

        <div v-if="message" class="alert alert-success mt-3">
        {{ message }}
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useQuery, useMutation } from '@tanstack/vue-query';
import UserForm from '@/components/UserForm.vue';
import UserService from '@/services/users.service.js';

const user = ref({
    username: '',
    useremail: '',
    userphone: '',
    useraddress: '',
    userbirthday: '',
    useravatar: '/public/images/blank-profile-picture.png'
});

const message = ref('');

const mutation = useMutation({
    mutationFn: (newUser) => UserService.createUser(newUser),
    onSuccess: () => {
        message.value = ('Liên hệ mới  đã được thêm thành công vào danh bạ!');
    },
    onError: () => {
        message.value = 'Email hoặc số điện thoại đã được sử dụng. Vui lòng kiểm tra lại.';
    }
});

function onCreateContact(newContact) {
    mutation.mutate(newContact);
}

</script>

<style scoped>
.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.text-center {
  text-align: center;
}

.alert {
  font-size: 1rem;
}
</style>
