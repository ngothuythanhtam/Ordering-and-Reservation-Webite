import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';
const queryClient = new QueryClient();

createApp(App)
    .use(router)
    .use(VueQueryPlugin, { queryClient })
    .mount('#app');