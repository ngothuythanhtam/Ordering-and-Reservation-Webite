<script setup>
import { computed } from 'vue';
const props = defineProps({
  totalPages: {
    type: Number,
    required: true,
  },
  length: {
    type: Number,
    default: 3,
  },
  currentPage: {
    type: Number,
    default: 1,
  },
});
const $emit = defineEmits(['update:currentPage']);
const pages = computed(() => {
  const pages = [];

  const half = Math.floor(props.length / 2);
  let start = props.currentPage - half;
  let end = props.currentPage + half;

  if (start <= 0) {
    start = 1;
    end = props.length;
  }
  if (end > props.totalPages) {
    end = props.totalPages;
    start = end - props.length + 1;
    if (start <= 0) start = 1;
  }
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});
</script>

<template>
  <div class="pagination-container">
    <nav>
      <ul class="pagination">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <a role="button" class="page-link" @click.prevent="$emit('update:currentPage', currentPage - 1)">
            <span>&laquo;</span>
          </a>
        </li>
        <li v-for="page in pages" :key="page" class="page-item" :class="{ active: currentPage === page }">
          <a role="button" class="page-link" @click.prevent="$emit('update:currentPage', page)">{{ page }}</a>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <a role="button" class="page-link" @click.prevent="$emit('update:currentPage', currentPage + 1)">
            <span>&raquo;</span>
          </a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: center;
  color: #000;
}

.pagination {
  display: inline-flex;
  padding-left: 0;
  list-style: none;
}

.page-item {
  margin: 0 0px;
}

.page-item.disabled .page-link {
  cursor: not-allowed;
  color: #9a9892;
}

.page-item.active .page-link {
  background-color: #d8c3a5;
  color: #565551;
  border-color: #d8c3a5;
}
</style>