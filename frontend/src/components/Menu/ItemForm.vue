<script setup>
import { ref, useTemplateRef } from 'vue';
import { Form, Field, ErrorMessage } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';

const props = defineProps({
  item: { type: Object, required: true },
});

let img_urlFileInput = useTemplateRef('img_url_file');
let img_urlFile = ref(props.item.img_url);

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

function previewImgFile(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = (evt) => {
    img_urlFile.value = evt.target.result;
  };
  reader.readAsDataURL(file);
}
function submitItem(values) {
  const formData = new FormData();

  // Append fields from values to formData
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

  // for (const value of formData.values()) {
  //   console.log(value)
  // }

  // // Emit the submit event with formData
  // $emit('submit:item', formData);
}

function deleteItem() {
  $emit('delete:item', props.item.item_id);
}
</script>

<template>
  <Form :validation-schema="validationSchema" @submit="submitItem">
    <div class="mb-3 w-50 h-50">
      <img class="img-fluid img-thumbnail" :src="img_urlFile" alt="" @click="img_urlFileInput.click()" />
      <Field name="img_url_file" v-slot="{ handleChange }">
        <input type="file" class="d-none" ref="img_url_file" @change="(event) => {
            handleChange(event);
            previewImgFile(event);
          }
          " />
      </Field>
    </div>
    <div class="mb-3">
      <label for="item_name" class="form-label">Tên</label>
      <Field name="item_name" type="text" class="form-control" v-model="props.item.item_name" />
      <ErrorMessage name="item_name" class="error-feedback" />
    </div>
    <div class="mb-3">
      <label for="item_type" class="form-label">Loại món</label>
      <Field as="select" name="item_type" class="form-control" v-model="props.item.item_type">
        <option value="">Chọn loại món</option>
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
    <div class="mb-3">
      <label for="item_description" class="form-label">Mô tả</label>
      <Field name="item_description" type="text" class="form-control" v-model="props.item.item_description" />
      <ErrorMessage name="item_description" class="error-feedback" />
    </div>
    <div class="mb-3">
      <label for="item_price" class="form-label">Giá</label>
      <Field name="item_price" type="number" placeholder="Giá" class="form-control" v-model="props.item.item_price" />
      <ErrorMessage name="item_price" class="error-feedback" />
    </div>
    <div class="mb-3 form-check">
      <Field name="item_status" type="checkbox" class="form-check-input" v-model="props.item.item_status" :value="1"
        :unchecked-value="0" />
      <label for="item_status" class="form-check-label">
        <strong>Có sẵn</strong>
      </label>
    </div>
    <div class="mb-3">
      <button class="btn btn-primary"><i class="fas fa-save"></i> Lưu</button>
      <button v-if="props.item.item_id" type="button" class="ms-2 btn btn-danger" @click="deleteItem">
        <i class="fas fa-trash"></i> Xóa
      </button>
    </div>
  </Form>
</template>
