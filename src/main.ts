import { createApp } from 'vue';
import App from './App.vue';
import createRouter from './router';
import "bootstrap/dist/css/bootstrap.css";

createApp(App).use(createRouter).mount('#app')
