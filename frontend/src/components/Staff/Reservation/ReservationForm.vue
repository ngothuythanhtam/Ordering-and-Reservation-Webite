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
            .email({ message: 'Invalid Email' })
            .min(2, { message: 'Email must have at least 2 characters.' })
            .max(255, { message: 'Email must not exceed 255 characters.' }),
        table_number: z
            .string()
            .min(1, { message: 'Please type table name.' })
            .max(10, { message: 'Invalid Name' }),
        reservation_date: z
            .string()
            .min(1, { message: 'Please select a reservation date.' }),
        special_request: z
            .string()
            .max(255, { message: 'Requirement must not exceed 255 characters.' })
            .optional()
            .nullable()
    })
);

function formatDateForBackend(dateString) {
    // Convert date string to ISO format
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

function submitReserv(values) {
    try {
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
    <Form :validation-schema="validationSchema" @submit="submitReserv">
        <div class="mb-3">
            <label for="useremail" class="form-label">Customer Email</label>
            <Field name="useremail" type="email" class="form-control" placeholder="Customer Email" :value="reservation?.useremail" />
            <ErrorMessage name="useremail" class="error-feedback" />
        </div>

        <div class="mb-3">
            <label for="table_number" class="form-label">Table</label>
            <Field name="table_number" type="text" placeholder="Table" class="form-control" :value="reservation?.table_number" />
            <ErrorMessage name="table_number" class="error-feedback" />
        </div>

        <div class="mb-3">
            <label for="reservation_date" class="form-label">Date to use</label>
            <Field name="reservation_date" type="date" placeholder="Date to use" class="form-control" :value="reservation?.reservation_date" />
            <ErrorMessage name="reservation_date" class="error-feedback" />
        </div>

        <div class="mb-3">
            <label for="special_request" class="form-label">Requirement</label>
            <Field name="special_request" type="text" placeholder="Requirement" class="form-control" :value="reservation?.special_request" />
            <ErrorMessage name="special_request" class="error-feedback" />
        </div>

        <div class="mb-2 mt-5 d-flex justify-content-center">
            <button type="submit" class="save-btn btn">
                <i class="fas fa-save"></i> Save
            </button>
        </div>
    </Form>
</template>

<style scoped>
.save-btn {
    width: 100px;
    height: 50px;
    background-color: #668ece;
    border-color: #668ece;
    color: #EAE7DC;
    font-size: 18px;
    font-weight: bold;
}
.save-btn:hover{
    background-color: #406eb8;
}

.error-feedback {
    color: red;
    font-size: 0.875em;
    margin-top: 0.25rem;
}
</style>