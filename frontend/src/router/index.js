import { createWebHistory, createRouter } from 'vue-router';
import Home from '@/views/Home.vue'
import Menu from '@/views/Menu/Menu.vue';
import ItemCard from '@/components/Menu/ItemCard.vue';
import Table from '@/views/Table/Table.vue';
import Reservation from '@/views/Reservation/Reservation.vue';
import Receipt from '@/views/Receipt/Receipt.vue';
import UserAccount from '@/views/Account/UserAccount.vue';
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
        name: 'home',
        component: Home,
    },

    {
        path: '/menu',
        name: 'menu',
        component: Menu,
    },
    
    {
        path: '/:pathMatch(.*)*',
        name: 'notfound',
        component: () => import('@/views/NotFound.vue'),
    },

    {
        path: '/menu/items/:item_id',
        name: 'item.edit',
        component: () => import('@/views/Menu/ItemEdit.vue'),
        props: (route) => ({ item_id: route.params.item_id })
    },
    {
        path: '/menu/items/add',
        name: 'item.add',
        component: () => import('@/views/Menu/ItemAdd.vue'),
    },

    {
        path: '/table',
        name: 'table',
        component: Table,
    },
    {
        path: '/table/add',
        name: 'table.add',
        component: () => import('@/views/Table/TableAdd.vue'),
    },

    {
        path: '/reservation',
        name: 'reservation',
        component: Reservation,
    },

    {
        path: '/receipt',
        name: 'receipt',
        component: Receipt,
    },

    {
        path: '/UserAccount',
        name: 'UserAccount',
        component: UserAccount,
    },
    
    {
        path: '/MyAccount',
        name: 'MyAccount',
        component: MyAccount,
    },
];
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});
export default router;