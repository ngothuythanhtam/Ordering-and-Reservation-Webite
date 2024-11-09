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
    <Form :validation-schema="validationSchema" @submit="submitUser">
        <div class="mb-3 w-50 h-50">
            <img class="img-fluid img-thumbnail" :src="avatarFile" alt=""
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
        <div class="mb-3">
            <label for="username" class="form-label">Full Name</label>
            <Field name="username" type="text" class="form-control" :id="'username'" :value="user?.username"/>
            <ErrorMessage name="username" class="error-feedback" />
        </div>
        <div class="mb-3">
            <label for="useraddress" class="form-label">Address</label>
            <Field name="useraddress" type="text" class="form-control" :id="'useraddress'" :value="user?.useraddress" />
            <ErrorMessage name="useraddress" class="error-feedback" />
        </div>
        <div class="mb-3">
            <label for="userbirthday" class="form-label">Birthday</label>
            <Field name="userbirthday" type="date" class="form-control" :id="'userbirthday'" :value="user?.userbirthday"/>
            <ErrorMessage name="userbirthday" class="error-feedback" />
        </div>
        <div class="mb-3">
            <button type="submit" class="btn btn-primary">
                <i class="fas fa-save"></i> Update
            </button>
            <button v-if="user?.userid" type="button" class="ms-2 btn btn-danger" @click="deleteUser">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    </Form>
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

.avatar-container {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
}

.input-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 15px;
}

.input-group label {
    font-weight: 500;
    margin-bottom: 5px;
}

.input-group .form-control {
    padding: 10px;
    border-radius: 5px;
}

.error-feedback {
    color: red;
    font-size: 0.875rem;
}

.form-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.form-actions button {
    padding: 8px 16px;
    font-size: 1rem;
}

.btn-primary {
    background-color: #007bff;
    border-color: #007bff;
}

.btn-danger {
    background-color: #dc3545;
    border-color: #dc3545;
}

.img-thumbnail {
    max-width: 200px;
    height: 200px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 15px;
}
</style>
