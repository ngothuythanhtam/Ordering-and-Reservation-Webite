<script setup>
  const model = defineModel({
    type: String,
    default: '',
  });
</script>

<template>
  <div class="input-group search-bar">
    <input
      type="text"
      class="form-control px-2"
      placeholder="Nhập thông tin cần tìm"
      v-model="model"
    />
    <button
      class="btn btn-outline-secondary search-btn"
      type="button"
      @click="$emit('submit')"
    >
      <i class="fas fa-search search-icon"></i>
    </button>
  </div>
</template>

<style scoped>
.input-group {
  padding-left: 15px;
  padding-right: 10px;
  display: flex;
  max-width: 300px;
}

.input-group .form-control{
  height:35px;
  padding: 15px;        
  font-size: 18px;     
  border-radius: 5px; 
}
.input-group .btn {
  margin-top: 0px;
  height: 35px;
  padding: 10px 20px;    
  font-size: 16px;       
  border-radius: 5px;
}

.search-btn {
  height: 30px;
  display: flex;
  align-items: center; /* Center icon vertically */
  justify-content: center;
  padding: 0 10px;
}

.search-icon {
  font-size: 16px; /* Adjust icon size if needed */
  margin-top: -1px; /* Fine-tune vertical positioning */
}
</style>
