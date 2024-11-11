import { createWebHistory, createRouter } from 'vue-router';
import Home from '@/views/Home.vue'
import Menu from '@/views/Menu/Menu.vue';
import Table from '@/views/Table/Table.vue';
import Reservation from '@/views/Reservation/Reservation.vue';
import Receipt from '@/views/Receipt/Receipt.vue';
import MyAccount from '@/views/Account/MyAccount.vue';

const routes = [
    {
        path: '/login/',
        name: 'Login',
        component: () => import('@/views/Login.vue'),
        meta: { requiresAuth: false } // Cho phép truy cập mà không cần đăng nhập
    },
    {
        path: '/',
        name: 'Home',
        component: Home,
        meta: { requiresAuth: true }
    },

    {
        path: '/admin/menu',
        name: 'menu',
        component: Menu,
        meta: { requiresAuth: true }
    },
    
    {
        path: '/:pathMatch(.*)*',
        name: 'notfound',   
        component: () => import('@/views/NotFound.vue'),
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
];
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});
export default router;