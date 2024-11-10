<script setup>
import { Form, Field, ErrorMessage } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';

const props = defineProps({
    reservation: { type: Object, required: true },
});

const $emit = defineEmits(['submit:reservation', 'delete:reservation']);

// Updated validation schema with proper date handling
const validationSchema = toTypedSchema(
    z.object({
        useremail: z
            .string()
            .email({ message: 'Email không hợp lệ' })
            .min(2, { message: 'Email phải có ít nhất 2 ký tự' })
            .max(255, { message: 'Email không được vượt quá 255 ký tự' }),
        table_number: z
            .string()
            .min(1, { message: 'Vui lòng chọn số bàn' })
            .max(10, { message: 'Số bàn không hợp lệ' }),
        reservation_date: z
            .string()
            .min(1, { message: 'Vui lòng chọn ngày đặt bàn' }),
        special_request: z
            .string()
            .max(255, { message: 'Yêu cầu không được vượt quá 255 ký tự' })
            .optional()
            .nullable()
    })
);

function formatDateForBackend(dateString) {
    // Convert date string to ISO format
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

function submitTable(values) {
    try {
        // Create FormData object
        const formData = new FormData();
        formData.append('useremail', values.useremail);
        formData.append('table_number', values.table_number);
        formData.append('reservation_date', formatDateForBackend(values.reservation_date));
        if (values.special_request) {
            formData.append('special_request', values.special_request);
        }
        
        // Emit the submit event with FormData
        $emit('submit:reservation', formData);
    } catch (error) {
        console.error('Form submission error:', error);
    }
}

</script>

<template>
    <Form :validation-schema="validationSchema" @submit="submitTable">
        <div class="mb-3">
            <label for="useremail" class="form-label">Email khách hàng</label>
            <Field name="useremail" type="email" class="form-control" placeholder="Email khách hàng"
                v-model="props.reservation.useremail" />
            <ErrorMessage name="useremail" class="error-feedback" />
        </div>

        <div class="mb-3">
            <label for="table_number" class="form-label">Số bàn</label>
            <Field name="table_number" type="text" placeholder="Số bàn" class="form-control"
                v-model="props.reservation.table_number" />
            <ErrorMessage name="table_number" class="error-feedback" />
        </div>

        <div class="mb-3">
            <label for="reservation_date" class="form-label">Ngày đặt</label>
            <Field name="reservation_date" type="datetime-local" placeholder="Ngày lấy bàn" class="form-control"
                v-model="props.reservation.reservation_date" />
            <ErrorMessage name="reservation_date" class="error-feedback" />
        </div>

        <div class="mb-3">
            <label for="special_request" class="form-label">Yêu cầu</label>
            <Field name="special_request" type="text" placeholder="Yêu cầu của khách hàng" class="form-control"
                v-model="props.reservation.special_request" />
            <ErrorMessage name="special_request" class="error-feedback" />
        </div>

        <div class="mb-2 mt-5 d-flex justify-content-center">
            <button type="submit" class="save-btn btn">
                <i class="fas fa-save"></i> Lưu
            </button>
        </div>
    </Form>
</template>

<style scoped>
.save-btn {
    width: 100px;
    height: 50px;
    background-color: rgb(104, 144, 231);
    font-size: 18px;
    font-weight: bold;
    color: white;
}

.error-feedback {
    color: red;
    font-size: 0.875em;
    margin-top: 0.25rem;
}
</style>