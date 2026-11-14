import { createApp } from 'vue';
import axios from 'axios';
import App from './App.vue';
import router from './router';

axios.defaults.withCredentials = true;
if (import.meta.env.VITE_API_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_URL;
}

const app = createApp(App);
app.use(router);
app.mount('#app');

