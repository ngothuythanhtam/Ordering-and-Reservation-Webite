<script setup>
import { ref, useTemplateRef } from 'vue';
import { Form, Field, ErrorMessage } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';

const props = defineProps({
    user: { type: Object, required: true }
});
console.log("props.user: ",props.user);
let avatarFileInput = useTemplateRef('avatar-file-input');
let avatarFile = ref(props.user.useravatar);
const $emit = defineEmits(['submit:user', 'delete:user']);

const validationSchema = toTypedSchema(
    z.object({
        userrole: z.literal('1'),
        username: z.string().min(2, { message: 'Tên phải ít nhất 2 ký tự.' }).max(50, { message: 'Tên có nhiều nhất 50 ký tự.' }),
        useremail: z.string().email({ message: 'E-mail không đúng.' }).max(50, { message: 'E-mail tối đa 50 ký tự.' }),
        useraddress: z.string().max(100, { message: 'Địa chỉ tối đa 100 ký tự.' }),
        userphone: z.string().regex(/(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/g, { message: 'Số điện thoại không hợp lệ.' }),
        userbirthday: z.string().optional(),
        userpwd: z.string().min(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự.' }),
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
            <label for="useremail" class="form-label">E-mail</label>
            <Field name="useremail" type="email" class="form-control" :id="'useremail'" :value="user?.useremail"/>
            <ErrorMessage name="useremail" class="error-feedback" />
        </div>
        <div class="mb-3">
            <label for="userpwd" class="form-label">Password</label>
            <Field name="userpwd" type="password" class="form-control" :id="'userpwd'" autocomplete="new-password"/>
            <ErrorMessage name="userpwd" class="error-feedback" />
        </div>
        <div class="mb-3">
            <label for="useraddress" class="form-label">Address</label>
            <Field name="useraddress" type="text" class="form-control" :id="'useraddress'" :value="user?.useraddress" />
            <ErrorMessage name="useraddress" class="error-feedback" />
        </div>
        <div class="mb-3">
            <label for="userphone" class="form-label">Phone Number</label>
            <Field name="userphone" type="tel" class="form-control" :id="'userphone'" :value="user?.userphone" />
            <ErrorMessage name="userphone" class="error-feedback" />
        </div>
        <div class="mb-3">
            <label for="userbirthday" class="form-label">Birthday</label>
            <Field name="userbirthday" type="date" class="form-control" :id="'userbirthday'" :value="user?.userbirthday"/>
            <ErrorMessage name="userbirthday" class="error-feedback" />
        </div>
        <div class="mb-3">
            <button type="submit" class="btn btn-primary">
                Register
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

.mb-3.w-50.h-50 {
    width: 200px !important;
    height: 200px !important;
    margin: 0 auto 20px;
    position: relative;
    cursor: pointer;
}

.img-fluid.img-thumbnail {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #fff;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    display: block;
}

.mb-3.w-50.h-50::before {
    content: 'Change Photo';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
    z-index: 1;
}
.mb-3.w-50.h-50:hover::before {
    opacity: 1;
}
.mb-3 {
    margin-bottom: 1.5rem;
}
.form-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 400;
    color: #333;
}
.form-control {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
}
.form-control:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.error-feedback {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #dc3545;
    margin-top: 0.5rem;
    padding: 0.5rem;
    border: 1px solid #dc3545;
    border-radius: 4px;
    background-color: rgba(220, 53, 69, 0.1);
    font-size: 0.875rem;
}

.mb-3:last-child {
    display: flex;
    gap: 15px;
    margin-top: 2rem;
}

.btn {
    flex: 1;
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn i {
    margin-right: 8px;
    font-size: 1.1rem;
}

.btn-primary {
    background-color: #ff8d79;
    color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.btn-primary:hover {
    background-color: #ff6347;
    box-shadow: 0 4px 8px rgba(40, 47, 54, 0.3);
    transform: translateY(-1px);
}

.btn-danger {
    background-color: #dc3545;
    color: #fff;
    box-shadow: 0 2px 4px rgba(220, 53, 69, 0.2);
}

.btn-danger:hover {
    background-color: #b02a37;
    box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
    transform: translateY(-1px);
}

.d-none {
    display: none;
}

@media (max-width: 480px) {
    .mb-3:last-child {
        flex-direction: column;
    }
    .btn {
        width: 100%;
    }
    .ms-2 {
        margin-left: 0 !important;
    }
}
</style>
