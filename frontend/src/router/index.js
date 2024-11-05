import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notfound',
    component: () => import('@/views/NotFound.vue'),
  },
  {
    path: '/login/',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false } // Cho phép truy cập mà không cần đăng nhập
  },
  {
    path: '/registration/',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { requiresAuth: false } // Cho phép truy cập mà không cần đăng nhập
  },
  {
    path: '/updateProfile/',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true } // Chỉ cho phép truy cập nếu đã đăng nhập
  }
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
