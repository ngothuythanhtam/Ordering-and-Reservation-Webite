<script setup>
  const model = defineModel({
    type: String,
    default: '',  
  });
</script>

<template>
  <div class="input-group">
    <input type="text" class="form-control px-3" placeholder="Type to search name or seating capacity" v-model="model"/>
    <button class="btn btn-outline-secondary" type="button" @click="$emit('submit')">
        <i class="fas fa-search"></i>
    </button>
  </div>
</template>
<style>
.input-group{
  padding-left: 200px ;
  padding-right: 200px ;
  display: flex;
  max-width: 1200px;
}
.input-group .form-control {
  height: 60px;
  padding: 15px;        
  font-size: 18px;     
  border-radius: 30px 0 0 30px; 
}
.input-group .btn {
  margin-top: 0px;
  height: 60px;
  padding: 10px 20px;    
  font-size: 18px;       
  border-radius: 30px;   
}
</style>