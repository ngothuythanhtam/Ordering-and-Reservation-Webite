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
    beforeEnter: (to, from, next) => {
      if (localStorage.getItem('isLoggedIn') === 'true') {
        next('/');
      } else {
        next();
      }
    },
    meta: { requiresAuth: false } // Cho phép truy cập mà không cần đăng nhập
  },
  {
    path: '/logout/',
    name: 'Logout',
    meta: { requiresAuth: true }
  },
  {
    path: '/registration/',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { requiresAuth: false } // Cho phép truy cập mà không cần đăng nhập
  },
  {
    path: '/info/',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true } // Chỉ cho phép truy cập nếu đã đăng nhập
  },
  {
    path: '/updateProfile/',
    name: 'UpdateUser',
    component: () => import('@/views/UpdateUser.vue'),
    meta: { requiresAuth: true } // Chỉ cho phép truy cập nếu đã đăng nhập
  },
  {
    path: '/mycart/',
    name: 'MyCart',
    component: () => import('@/views/MyCart.vue'),
    meta: { requiresAuth: true } // Chỉ cho phép truy cập nếu đã đăng nhập
  },
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
