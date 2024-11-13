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
  <nav>
    <ul class="pagination">
      <li
        class="page-item"
        :class="{ disabled: currentPage === 1 }"
      >
        <a
          role="button"
          class="page-link"
          @click.prevent="
          $emit('update:currentPage', currentPage - 1)"
        >
          <span>&laquo;</span>
        </a>
      </li>
      <li
        v-for="page in pages"
        :key="page"
        class="page-item"
        :class="{ active: currentPage === page }"
        >
        <a
          role="button"
          class="page-link"
          @click.prevent="
          $emit('update:currentPage', page)"
          >{{ page }}</a
        >
      </li>
      <li
        class="page-item"
        :class="{ disabled: currentPage === totalPages }"
      >
        <a
          role="button"
          class="page-link"
          @click.prevent="
          $emit('update:currentPage', currentPage + 1)"
        >
        <span>&raquo;</span>
        </a>
      </li>
    </ul>
  </nav>
</template>
<style scoped>
.pagination {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
}
.page-item {
  margin: 0 5px;
}

.page-link {
  display: inline-block;
  padding: 8px 16px;
  color: #fff;
  background-color: #ecbab6;
  border: none;
  border-radius: 5px;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.page-link:hover {
  background-color: #e03f31;
  transform: scale(1.05);
}

.page-link:disabled {
  background-color: #ecbab6;
  color: #bbb;
  cursor: not-allowed;
}

.page-item.active .page-link {
  background-color: #ff6347;
  border-color: #ff6347;
}

.page-item.disabled .page-link {
  background-color: #efc4c0;
  border: none;
  color: white;
  cursor: not-allowed;
}
</style>