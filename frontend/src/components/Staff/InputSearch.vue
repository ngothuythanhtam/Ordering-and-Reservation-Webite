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
      placeholder="Type here to search"
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
  height:40px;
  padding: 15px;        
  font-size: 18px;     
  border-radius: 5px; 
}
.input-group .btn {
  margin-top: 0px;
  height: 40px;
  padding: 10px 20px;    
  font-size: 16px;       
  border-radius: 5px;
}

.search-btn {
  height: 30px;
  display: flex;
  align-items: center; 
  justify-content: center;
  padding: 0 10px;
}

.search-icon {
  font-size: 16px;
  margin-top: -1px;
}
</style>
