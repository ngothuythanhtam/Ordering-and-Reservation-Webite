import { createWebHistory, createRouter } from 'vue-router';
import Menu from '@/views/Menu/Menu.vue';
import Table from '@/views/Table/Table.vue';
import Reservation from '@/views/Reservation/Reservation.vue';
import Receipt from '@/views/Receipt/Receipt.vue';
import MyAccount from '@/views/Account/MyAccount.vue';
import Home from '@/views/Customer/Home.vue';

const routes = [
    {
        path: '/admin/menu',
        name: 'menu',
        component: Menu,
        meta: { requiresAuth: true }
    },
    {
        path: '/admin/menu/items/:item_id',
        name: 'item.edit',
        component: () => import('@/views/Menu/ItemEdit.vue'),
        props: (route) => ({ item_id: route.params.item_id }),
        meta: { requiresAuth: true }
    },
    {
        path: '/admin/menu/items/add',
        name: 'item.add',
        component: () => import('@/views/Menu/ItemAdd.vue'),
        meta: { requiresAuth: true },
    },

    {
        path: '/admin/table',
        name: 'table',
        component: Table,
        meta: { requiresAuth: true }
    },
    {
        path: '/admin/table/add',
        name: 'table.add',
        component: () => import('@/views/Table/TableAdd.vue'),
        meta: { requiresAuth: true }
    },

    {
        path: '/admin/reservation',
        name: 'reservation',
        component: Reservation,
        meta: { requiresAuth: true }
    },

    {
        path: '/admin/receipt',
        name: 'receipt',
        component: Receipt,
        meta: { requiresAuth: true }
    },
    {
        path: '/admin/MyAccount',
        name: 'MyAccount',
        component: MyAccount,
        meta: { requiresAuth: true }
    },
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
    meta: { requiresAuth: false } 
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
    meta: { requiresAuth: false } 
  },
  {
    path: '/info/',
    name: 'Profile',
    component: () => import('@/views/Customer/Profile.vue'),
    meta: { requiresAuth: true } 
  },
  {
    path: '/updateProfile/',
    name: 'UpdateUser',
    component: () => import('@/views/Customer/UpdateUser.vue'),
    meta: { requiresAuth: true } 
  },
  {
    path: '/mycart/',
    name: 'MyCart',
    component: () => import('@/views/Customer/MyCart.vue'),
    meta: { requiresAuth: true } 
  },
  {
    path: '/history/',
    name: 'History',
    component: () => import('@/views/Customer/Activity.vue'),
    meta: { requiresAuth: true } 
  },
];
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});
export default router;