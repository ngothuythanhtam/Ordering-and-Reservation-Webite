<script setup>
import { ref, useTemplateRef } from 'vue';
import { Form, Field, ErrorMessage } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';

const props = defineProps({
    table: { type: Object, required: true },
});

const $emit = defineEmits(['submit:table', 'delete:table']);

let validationSchema = toTypedSchema(
    z.object({
        table_number: z.string()
            .min(2, { message: 'Tên bàn phải ít nhất 2 ký tự.' })
            .max(255, { message: 'Tên bàn tối đa 255 ký tự.' }),
        seating_capacity: z.number()
            .positive({ message: 'Chỗ ngồi phải lớn hơn 0.' })
            .max(10, { message: 'Chỗ ngồi tối đa 1 bàn là 10.' }),
        status: z.enum([
            'available', 'reserved', 'occupied'
        ], { message: 'Trạng thái không hợp lệ.' })
        .optional(),
    })
);
function submitTable(values) {
    let formData = new FormData();

    // Append fields from values to formData
    for (let key in values) {
        if (values[key] !== undefined) {
            formData.append(key, values[key]);
        }
    }

    // Emit the submit event with formData
    $emit('submit:table', formData); 
}

function deleteTable() {
    $emit('delete:table', props.table.table_id);
}

</script>

<template>
    <Form :validation-schema="validationSchema" @submit="submitTable">
        <div class="mb-3">
            <label for="table_number" class="form-label">Tên</label>
            <Field name="table_number" type="text" class="form-control" v-model="props.table.table_number" />
            <ErrorMessage name="table_number" class="error-feedback" />
        </div>
        <div class="mb-3">
            <label for="seating_capacity" class="form-label">Chỗ ngồi</label>
            <Field name="seating_capacity" type="number" placeholder="Chỗ ngồi" class="form-control"
                v-model="props.table.seating_capacity" />
            <ErrorMessage name="seating_capacity" class="error-feedback" />
        </div>
        <div class="mb-3">
            <label for="status" class="form-label">Trạng thái</label>
            <Field as="select" name="status" class="form-control" v-model="props.table.status">
                <option value="">available</option>
            </Field>
            <ErrorMessage name="status" class="error-feedback" />
        </div>
        <div class="mb-3">
            <button class="btn btn-primary"><i class="fas fa-save"></i> Lưu</button>
            <button v-if="props.table.table_id" type="button" class="ms-2 btn btn-danger" @click="deleteTable">
                <i class="fas fa-trash"></i> Xóa
            </button>
            <RouterLink to="/table">
                <button type="button" class="btn btn-secondary ms-2">
                    <i class="fas fa-backward"></i> Back
                </button>
            </RouterLink>

        </div>
    </Form>
</template>
