<script setup>
  defineProps({
    item: { type: Object, required: true },
  });
</script>

<template>
  <div>
    <div class="p-1 w-75 h-75">
      <img class="img-fluid img-thumbnail" :src="item.img_url" alt="" />
    </div>

    <div class="p-1">
      <strong>Tên:</strong>
      {{ item.item_name }}
    </div>

    <div class="p-1">
      <strong>Thể loại:</strong>
      {{ item.item_type }}
    </div>

    <div class="p-1">
      <strong>Mô tả:</strong>
      {{ item.item_description }}
    </div>

    <div class="p-1">
      <strong>Giá:</strong>
      {{ item.item_price }}
    </div>

    <div class="p-1">
      <strong>Trạng thái:&nbsp;</strong>
      <span v-if="item.item_status === 1">Có sẵn</span>
      <span v-else>Tạm hết</span>
    </div>
  </div>
</template>