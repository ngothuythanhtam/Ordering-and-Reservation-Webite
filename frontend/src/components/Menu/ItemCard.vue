<script setup>
  defineProps({
    item: { type: Object, required: true },
  });
</script>

<template>
  <div class="box-card">
    <div class="img-card">
      <img class="img-fluid img-thumbnail" :src="item.img_url" alt="" />
    </div>
    <div class="card-content">
      <div class="p-1">
        <strong>Tên:</strong>
        {{ item.item_name }}
      </div>

      <div class="p-1">
        <strong>Thể loại:</strong>
        {{ item.item_type }}
      </div>

      <div class="p-1 describe">
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
  </div>
</template>

<style scoped>
.img-card {
  border-radius: 15px;
  padding: 8px;
  background-color: #e9bdbd;
}
.describe{
  max-width: 100%;
}
.box-card{
  background-color: #e9bdbd;
  border-style: none;
}
.card-content{
  margin-top: 15px;
  width: 96%;
  margin-left: 10px;
  font-size: 20px;
}
</style>
