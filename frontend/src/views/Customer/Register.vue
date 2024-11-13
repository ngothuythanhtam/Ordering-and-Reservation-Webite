<script setup>
import { ref } from 'vue';
import { useMutation } from '@tanstack/vue-query';
import UserForm from '@/components/Customer/UserForm.vue';
import UserService from '@/services/Customer/users.service.js';

const user = ref({
    username: '',
    useremail: '',
    userphone: '',
    useraddress: '',
    userbirthday: '',
    useravatar: '/public/images/blank-profile-picture.png'
});

const message = ref('');
const isSuccess = ref(false);

const mutation = useMutation({
    mutationFn: (newUser) => UserService.createUser(newUser),
    onSuccess: () => {
        message.value = 'Bạn đã đăng ký tài khoản thành công. Vui lòng đăng nhập!';
        isSuccess.value = true;
    },
    onError: () => {
        message.value = 'Email hoặc số điện thoại đã được sử dụng hoặc thiếu thông tin. Vui lòng kiểm tra lại.';
        isSuccess.value = false;
    }
});
function onCreateContact(newContact) {
    mutation.mutate(newContact);
}
</script>
<template>
    <div class="form-container">
        <h2 class="text-center mb-4" 
            style="font-family: 'Playfair Display', serif;
            margin-top: 50px;
            padding-bottom: 40px;
            color: #ff6347;
            font-weight: 600;
            font-size: 40px;"
        >Register</h2>

        <UserForm :user="user" @submit:user="onCreateContact" />

        <div v-if="message" :class="{'alert': true, 'alert-success': isSuccess, 'alert-danger': !isSuccess}">
            {{ message }}
        </div>
    </div>
</template>
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
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1rem;
    padding: 10px;
    margin-top: 1rem;
    border-radius: 5px;
    transition: background-color 0.3s ease, color 0.3s ease;
}

.alert-success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.alert-danger {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}
</style>
