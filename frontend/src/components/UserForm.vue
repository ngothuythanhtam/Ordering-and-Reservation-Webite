<script setup>
import { ref, watch } from 'vue';
import { Form, Field, ErrorMessage } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';

const props = defineProps({
    user: { type: Object, required: true }
});

const avatarFileInput = ref(null);
const avatarFile = ref(props.user?.useravatar || '');
const $emit = defineEmits(['submit:user', 'delete:user']);

const validationSchema = toTypedSchema(
    z.object({
        username: z.string().min(2, { message: 'Tên phải ít nhất 2 ký tự.' }).max(50, { message: 'Tên có nhiều nhất 50 ký tự.' }),
        useremail: z.string().email({ message: 'E-mail không đúng.' }).max(50, { message: 'E-mail tối đa 50 ký tự.' }),
        useraddress: z.string().max(100, { message: 'Địa chỉ tối đa 100 ký tự.' }),
        userphone: z.string().regex(/(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/g, {message: 'Số điện thoại không hợp lệ.'}),
        userbirthday: z.string().optional(),
        userpwd: z.string().min(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự.' }),
        avatarFile: z.instanceof(File).optional()
    })
);
watch(
    () => props.user,
    (newUser) => {
        avatarFile.value = newUser?.useravatar || '';
    },
    { immediate: true }
);

function previewAvatarFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
        avatarFile.value = evt.target.result;
    };
    reader.readAsDataURL(file);
}

function submitUser(values) {
    const formData = new FormData();
    for (let key in values) {
        if (values[key] !== undefined) {
        formData.append(key, values[key]);
        }
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
        <img class="img-fluid img-thumbnail" :src="avatarFile" alt="Avatar"
            @click="avatarFileInput?.click()"
        />
        <Field name="avatarFile" v-slot="{ handleChange }">
            <input type="file" class="d-none" ref="avatarFileInput" @change="
                (event) => {
                    handleChange(event);
                    previewAvatarFile(event);
                }
            "/>
        </Field>
        </div>
        <div class="mb-3">
            <label for="username" class="form-label">Tên</label>
            <Field name="username" type="text" class="form-control" :value="user?.username" />
            <ErrorMessage name="username" class="error-feedback" />
        </div>
        <div class="mb-3">
            <label for="useremail" class="form-label">E-mail</label>
            <Field name="useremail" type="email" class="form-control" :value="user?.useremail" />
            <ErrorMessage name="useremail" class="error-feedback" />
        </div>
        <div class="mb-3">
            <label for="useraddress" class="form-label">Địa chỉ</label>
            <Field name="useraddress" type="text" class="form-control" :value="user?.useraddress" />
            <ErrorMessage name="useraddress" class="error-feedback" />
        </div>
        <div class="mb-3">
            <label for="userphone" class="form-label">Điện thoại</label>
            <Field name="userphone" type="tel" class="form-control" :value="user?.userphone" />
            <ErrorMessage name="userphone" class="error-feedback" />
        </div>
        <div class="mb-3">
            <label for="userbirthday" class="form-label">Ngày sinh</label>
            <Field name="userbirthday" type="date" class="form-control" :value="user?.userbirthday"/>
            <ErrorMessage name="userbirthday" class="error-feedback" />
        </div>
        <div class="mb-3">
        <button type="submit" class="btn btn-primary">
            <i class="fas fa-save"></i> Lưu
        </button>
        <button v-if="user?.userid" type="button" class="ms-2 btn btn-danger" @click="deleteUser">
            <i class="fas fa-trash"></i> Xóa
        </button>
        </div>
    </Form>
</template>

<style scoped>
@import '@/assets/form.css';
</style>
