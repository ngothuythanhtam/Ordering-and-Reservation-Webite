import { createWebHistory, createRouter } from 'vue-router';
import Menu from '@/views/Staff/Menu/Menu.vue';
import Table from '@/views/Staff/Table/Table.vue';
import Reservation from '@/views/Staff/Reservation/Reservation.vue';
import Receipt from '@/views/Staff/Receipt/Receipt.vue';
import Home from '@/views/Customer/Home.vue';

const routes = [
  // Staff routes
  {
  path: '/staff/menu',
  name: 'menu',
  component: Menu,
  meta: {
    requiresAuth: true, title: 'Menu Management'}
  },

  {
    path: '/staff/menu/items/:item_id',
    name: 'item.edit',
    component: () => import('@/views/Staff/Menu/ItemEdit.vue'),
    props: (route) => ({ item_id: route.params.item_id }),
    meta: { requiresAuth: true, title: 'Edit menu' }
  },
  {
    path: '/staff/menu/items/add',
    name: 'item.add',
    component: () => import('@/views/Staff/Menu/ItemAdd.vue'),
    meta: { requiresAuth: true, title: 'Add menu' }
  },
  {
    path: '/staff/table',
    name: 'table',
    component: Table,
    meta: { requiresAuth: true ,title: 'Table Management'}
  },

  {
    path: '/staff/reservation',
    name: 'reservation',
    component: Reservation,
    meta: { requiresAuth: true, title: 'Manage table orders' }
  },
  {
    path: '/staff/receipt',
    name: 'receipt',
    component: Receipt,
    meta: { requiresAuth: true, title: 'Manage receipts' }
  },

  // Customer routes
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: false, title: 'Home' }
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
        const userRole = localStorage.getItem('userrole');
        if (userRole === '2') next('/staff/menu');
        else next('/');
      } else {
        next();
      }
    },
    meta: { requiresAuth: false , title: 'Log in'}
  },
  {
    path: '/logout/',
    name: 'Logout',
    meta: { requiresAuth: true, title: 'Log out' }
  },
  {
    path: '/registration/',
    name: 'Register',
    component: () => import('@/views/Customer/Register.vue'),
    meta: { requiresAuth: false, title: 'Register' }
  },
  {
    path: '/info/',
    name: 'Profile',
    component: () => import('@/views/Customer/Profile.vue'),
    meta: { requiresAuth: true , title: 'My Profile'}
  },
  {
    path: '/updateProfile/',
    name: 'UpdateUser',
    component: () => import('@/views/Customer/UpdateUser.vue'),
    meta: { requiresAuth: true , title: 'Edit Profile'}
  },
  {
    path: '/mycart/',
    name: 'MyCart',
    component: () => import('@/views/Customer/MyCart.vue'),
    meta: { requiresAuth: true , title: 'My Cart'}
  },
  {
    path: '/history/',
    name: 'History',
    component: () => import('@/views/Customer/Activity.vue'),
    meta: { requiresAuth: true , title: 'Order history'}
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title;
  }
  next();
  
  const userRole = localStorage.getItem('userrole');
  
  if (to.path === '/' && userRole === '2') {
    return next('/staff/menu'); 
  }

  
});

export default router;
