<script setup>
import { ref, watch } from 'vue';
import { Form, Field, ErrorMessage } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { useRouter } from 'vue-router';

const router = useRouter();
const hoverImg = ref(false);
const hoverDelete = ref(false);

function goBack() {
  router.back();
}

const props = defineProps({
  item: { type: Object, required: true },
});

let img_urlFileInput = ref(null);
let img_urlFile = ref(props.item?.img_url || '');

const $emit = defineEmits(['submit:item', 'delete:item']);

let validationSchema = toTypedSchema(
  z.object({
    item_name: z.string()
      .min(2, { message: 'Tên món phải ít nhất 2 ký tự.' })
      .max(255, { message: 'Tên món tối đa 255 ký tự.' }),
    item_type: z.enum([
      'Course', 'Salad', 'Soup', 'Side Dish', 'Dessert',
      'Beverage', 'Snack', 'Breakfast', 'Lunch', 'Dinner'
    ], { message: 'Loại món không hợp lệ.' }),
    item_description: z.string()
      .max(255, { message: 'Mô tả tối đa 255 ký tự.' })
      .optional(),
    item_price: z.number()
      .positive({ message: 'Giá phải lớn hơn 0.' })
      .max(999999.99, { message: 'Giá tối đa là 999,999.99.' }),
    item_status: z.number().optional(),
    img_urlFile: z.instanceof(File).optional(),
  })
);

watch(
  () => props.item,
  (newItem) => {
    img_urlFile.value = newItem?.img_url || '';
  },
  { immediate: true }
);

function previewImgFile(event) {
  const file = event.target.files[0];
  if(!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    img_urlFile.value = evt.target.result;
  };
  reader.readAsDataURL(file);
}

function submitItem(values) {
  const formData = new FormData();
  for (let key in values) {
    if (key === "img_url_file" && values[key]) {
      formData.append(key, values[key]);
    } else if (values[key] !== undefined) {
      formData.append(key, values[key]);
    }
  }
  const imgFileElement = img_urlFileInput.value;
    if (imgFileElement?.files.length > 0) {
        formData.append('img_url_file', imgFileElement.files[0]);
    }
    $emit('submit:item', formData);
}

function deleteItem() {
  $emit('delete:item', props.item.item_id);
}
</script>

<template>
  <div class="form-container p-4 shadow-lg rounded">
    <button class="btn btn-secondary mb-3" @click="goBack">
      <i class="fas fa-arrow-left"></i> Back
    </button>
    <Form :validation-schema="validationSchema" @submit="submitItem" class="form-item">
      <div class="mb-4 w-50 mx-auto text-center">
        <img class="img-fluid img-thumbnail preview-img" :src="img_urlFile" alt="Click to upload image"
          @click="img_urlFileInput?.click()" style="cursor: pointer; transition: transform 0.3s ease;"
          @mouseover="hoverImg = true" @mouseleave="hoverImg = false"
          :style="{ transform: hoverImg ? 'scale(1.05)' : 'scale(1)' }" />
        <Field name="img_url_file" v-slot="{ handleChange }">
          <input type="file" class="d-none" ref="img_urlFileInput" @change="(event) => {
            handleChange(event);
            previewImgFile(event);
          }" />
        </Field>
      </div>

      <div class="row mb-3">
        <div class="col-6">
          <label for="item_name" class="form-label">Name</label>
          <Field name="item_name" type="text" class="form-control" :value="item?.item_name" />
          <ErrorMessage name="item_name" class="error-feedback" />
        </div>
        
      </div>

      <div class="row mb-3">
        <div class="col-4">
          <label for="item_type" class="form-label">Type</label>
          <Field as="select" name="item_type" class="form-control" :value ="item?.item_type" style="width: 200px;">
            <option value="">Filter By Type</option>
            <option value="Course">Course</option>
            <option value="Salad">Salad</option>
            <option value="Soup">Soup</option>
            <option value="Side Dish">Side Dish</option>
            <option value="Dessert">Dessert</option>
            <option value="Beverage">Beverage</option>
            <option value="Snack">Snack</option>
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
          </Field>
          <ErrorMessage name="item_type" class="error-feedback" />
        </div>
        <div class="col-4">
          <label for="item_price" class="form-label">Price</label>
          <Field name="item_price" type="number" placeholder="Giá" class="form-control" :value="item?.item_price" style="width: 200px;"/>
          <ErrorMessage name="item_price" class="error-feedback" />
        </div>
        <div class="col-3 align-items-end" style=" height: 25px; margin-top: 48px;">
          <Field name="item_status" type="checkbox" class="form-check-input" :model-value="item?.item_status" :value="1"
          :unchecked-value="0" />
          <label for="item_status" class="form-check-label ms-2">
            <strong>Available</strong>
          </label>
        </div>
      </div>

      <div class="row mb-3">
        <label for="item_description" class="form-label" style="padding: 5px; padding-top: 0;">Description</label>
        <Field name="item_description" type="text" class="form-control description-field" :value="item?.item_description" />
        <ErrorMessage name="item_description" class="error-feedback" />
      </div>

      <div class="mb-3 mt-4 d-flex" style="padding-left: 0px; padding-top: 0;">
        <button class="btn btn-primary me-2" type="submit">
          <i class="fas fa-save"></i> Save
        </button>
        <button v-if="item?.item_id" type="button" class="btn btn-danger" @click="deleteItem"
          @mouseover="hoverDelete = true" @mouseleave="hoverDelete = false"
          :style="{ backgroundColor: hoverDelete ? '#dc3545' : '#ff4d4d' } ">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>


    </Form>
  </div>
</template>

<style scoped>
.form-container {
  max-width: 600px;
  margin: auto;
  background-color: #d8c3a5;
  padding: 0px;
  border-radius: 10px;
  margin-top: 25px;
  color: #565551;
}

.preview-img {
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.preview-img:hover {
  transform: scale(1.05);
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.2);
}

.form-label {
  font-weight: bold;
}

.description-field {
  width: 100%;
}

.btn-primary{
  background-color: #668ece;
  border-color: #668ece;
  color: #EAE7DC;
}

.btn-danger{
  border-color: #ff4d4d;
}

.btn-primary,
.btn-danger {
  font-weight: bold;
  padding: 10px 20px;
  transition: background-color 0.3s ease;
}

.btn-primary:hover {
  background-color: #406eb8;
}

.btn-danger:hover {
  background-color: #c82333;
}

.error-feedback {
  color: #dc3545;
  font-size: 0.9em;
}

.row {
  display: flex;
}

.col-6,
.col-4 {
  flex: 1;
  padding: 0 5px;
}
</style>
