import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const queryClient = new QueryClient()
createApp(App)
    .use(VueQueryPlugin,{
        queryClient,
    })
    .use(router)
    .mount('#app');
