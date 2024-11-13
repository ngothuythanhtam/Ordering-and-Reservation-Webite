import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Customer/Home.vue';
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: false }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notfound',
    component: () => import('@/views/Customer/NotFound.vue'),
  },
  {
    path: '/login/',
    name: 'Login',
    component: () => import('@/views/Customer/Login.vue'),
    beforeEnter: (to, from, next) => {
      if (localStorage.getItem('isLoggedIn') === 'true') {
        if(localStorage.getItem('userrole')==2) next('/');
        else next('/');
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
    component: () => import('@/views/Customer/Register.vue'),
    meta: { requiresAuth: false } // Cho phép truy cập mà không cần đăng nhập
  },
  {
    path: '/info/',
    name: 'Profile',
    component: () => import('@/views/Customer/Profile.vue'),
    meta: { requiresAuth: true } // Chỉ cho phép truy cập nếu đã đăng nhập
  },
  {
    path: '/updateProfile/',
    name: 'UpdateUser',
    component: () => import('@/views/Customer/UpdateUser.vue'),
    meta: { requiresAuth: true } // Chỉ cho phép truy cập nếu đã đăng nhập
  },
  {
    path: '/mycart/',
    name: 'MyCart',
    component: () => import('@/views/Customer/MyCart.vue'),
    meta: { requiresAuth: true } // Chỉ cho phép truy cập nếu đã đăng nhập
  },
  {
    path: '/history/',
    name: 'History',
    component: () => import('@/views/Customer/Activity.vue'),
    meta: { requiresAuth: true } // Chỉ cho phép truy cập nếu đã đăng nhập
  },
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
