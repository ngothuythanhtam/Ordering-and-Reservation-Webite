<script setup>
import { ref, useTemplateRef, watch } from 'vue';
import { Form, Field, ErrorMessage } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';

const props = defineProps({
    user: { type: Object, required: true }
});
console.log("Thông tin user nè: ",props.user);
let avatarFileInput = useTemplateRef('avatar-file-input');
let avatarFile = ref(props.user?.useravatar || '');
const $emit = defineEmits(['submit:user', 'delete:user']);

const validationSchema = toTypedSchema(
    z.object({
        username: z.string().min(2, { message: 'Tên phải ít nhất 2 ký tự.' }).max(50, { message: 'Tên có nhiều nhất 50 ký tự.' }),
        useraddress: z.string().max(100, { message: 'Địa chỉ tối đa 100 ký tự.' }),
        userbirthday: z.string().optional(),
        useravatarFile: z.instanceof(File).optional(),
    })
);

function previewAvatarFile(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
            avatarFile.value = evt.target.result;  
        };
        reader.readAsDataURL(file);
    }
}

function submitUser(values) {
    console.log("Submit form: ", values);
    const formData = new FormData();
    for (let key in values) {
        if (values[key] !== undefined) {
            formData.append(key, values[key]);
        }
    }
    const avatarFileElement = avatarFileInput.value;
    if (avatarFileElement?.files.length > 0) {
        formData.append('useravatarFile', avatarFileElement.files[0]);
    }
    $emit('submit:user', formData);
}

function deleteUser() {
    $emit('delete:user', props.user.userid);
}
</script>
<template>
    <div class="card-container">
        <div class="card">
            <div class="card-body">
                <h2 style="font-family: 'Playfair Display', serif; color: #ff6347; font-weight: 700;">User Profile</h2>
                <Form :validation-schema="validationSchema" @submit="submitUser">
                    <div class="avatar-container">
                        <img class="profile-image" :src="avatarFile" alt=""
                            @click="avatarFileInput.click()"
                        />
                        <Field name="avatarFile" v-slot="{ handleChange }">
                            <input type="file" class="d-none" ref="avatar-file-input" @change="
                                (event) => {
                                    handleChange(event);
                                    previewAvatarFile(event);
                                }"/>
                        </Field>
                    </div>
                    
                    <Field name="userrole" :value="'1'" type="hidden" />
                    
                    <div class="form-group">
                        <label for="username">Full Name</label>
                        <Field name="username" type="text" class="form-control" :id="'username'" :value="user?.username"/>
                        <ErrorMessage name="username" class="error-message" />
                    </div>
                    
                    <div class="form-group">
                        <label for="useraddress">Address</label>
                        <Field name="useraddress" type="text" class="form-control" :id="'useraddress'" :value="user?.useraddress" />
                        <ErrorMessage name="useraddress" class="error-message" />
                    </div>
                    
                    <div class="form-group">
                        <label for="userbirthday">Birthday</label>
                        <Field name="userbirthday" type="date" class="form-control" :id="'userbirthday'" :value="user?.userbirthday"/>
                        <ErrorMessage name="userbirthday" class="error-message" />
                    </div>
                    
                    <div class="button-container">
                        <button type="submit" class="btn btn-save">
                            <i class="fas fa-save"></i> Update
                        </button>
                        <button v-if="user?.userid" type="button" class="btn btn-delete" @click="deleteUser">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </Form>
            </div>
        </div>
    </div>
</template>

<style scoped>
.card-container {
    max-width: 600px;
    margin: 2rem auto;
    padding: 0 15px;
}

.card {
    background: #fff;
    border-radius: 15px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.card-body {
    padding: 2rem;
}

h2 {
    text-align: center;
    margin-bottom: 2rem;
    font-size: 1.8rem;
}

.avatar-container {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
}

.profile-image {
    width: 150px;
    height: 150px;
    object-fit: cover;
    border-radius: 50%;
    cursor: pointer;
    border: 3px solid #ff6347;
    padding: 3px;
    transition: all 0.3s ease;
}

.profile-image:hover {
    transform: scale(1.05);
    box-shadow: 0 0 15px rgba(255, 99, 71, 0.3);
}

.form-group {
    margin-bottom: 1.5rem;
}

label {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 0.5rem;
    display: block;
    font-weight: 500;
}

.form-control {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.3s ease;
    background: #f8f9fa;
}

.form-control:focus {
    outline: none;
    border-color: #ff6347;
    box-shadow: 0 0 0 3px rgba(255, 99, 71, 0.1);
    background: #fff;
}

.button-container {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
}

.btn {
    flex: 1;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.btn-save {
    background: linear-gradient(145deg, #ff6347, #ff7f50);
    color: white;
}

.btn-save:hover {
    background: linear-gradient(145deg, #ff7f50, #ff6347);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 99, 71, 0.2);
}

.btn-delete {
    background: linear-gradient(145deg, #dc3545, #ff4444);
    color: white;
}

.btn-delete:hover {
    background: linear-gradient(145deg, #ff4444, #dc3545);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.2);
}

.error-message {
    color: #dc3545;
    font-size: 0.8rem;
    margin-top: 0.5rem;
}

/* Responsive adjustments */
@media (max-width: 576px) {
    .card-body {
        padding: 1.5rem;
    }

    .button-container {
        flex-direction: column;
    }

    .btn {
        width: 100%;
    }
}
</style>