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
            .min(2, { message: 'Table name must be at least 2 characters.' })
            .max(255, { message: 'Table name maximum 255 characters.' }),
        seating_capacity: z.number()
            .positive({ message: 'Seating capacity must be greater than 0.' })
            .max(10, { message: 'Maximum seating per table is 10.' }),
        status: z.enum([
            'available', 'reserved', 'occupied'
        ], { message: 'Invalid status' })
        .optional(),
    })
);

function submitTable(values) {
    const formData = new FormData();
    for (let key in values) {
        if (values[key] !== undefined) {
            formData.append(key, values[key]);
        }
    }
    $emit('submit:table', formData); 
}
</script>

<template>
    <Form :validation-schema="validationSchema" @submit="submitTable" >
        <div class="mb-3">
            <label for="table_number" class="form-label">Table</label>
            <Field name="table_number" type="text" class="form-control" :value="table?.table_number" />
            <ErrorMessage name="table_number" class="error-feedback" />
        </div>
        <div class="mb-3">
            <label for="seating_capacity" class="form-label">Seating Capacity</label>
            <Field name="seating_capacity" type="number" placeholder="Chỗ ngồi" class="form-control" :value="table?.seating_capacity"/>
            <ErrorMessage name="seating_capacity" class="error-feedback" />
        </div>
        <div class="mb-2 mt-5 d-flex justify-content-center">
            <button class="save-btn btn"><i class="fas fa-save"></i> Save</button>
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
</style>