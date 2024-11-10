<script setup>
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
</script>

<template>
    <Form :validation-schema="validationSchema" @submit="submitTable" >
        <div class="mb-3">
            <label for="table_number" class="form-label">Tên bàn</label>
            <Field name="table_number" type="text" class="form-control" v-model="props.table.table_number" />
            <ErrorMessage name="table_number" class="error-feedback" />
        </div>
        <div class="mb-3">
            <label for="seating_capacity" class="form-label">Số chỗ ngồi</label>
            <Field name="seating_capacity" type="number" placeholder="Chỗ ngồi" class="form-control"
                v-model="props.table.seating_capacity" />
            <ErrorMessage name="seating_capacity" class="error-feedback" />
        </div>
        <div class="mb-2 mt-5 d-flex justify-content-center">
            <button class="save-btn btn"><i class="fas fa-save"></i> Lưu</button>
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
}
</style>