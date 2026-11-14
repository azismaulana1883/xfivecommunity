import { createApp } from 'vue';
import axios from 'axios';
import App from './App.vue';
import router from './router';

// Di web/Vercel, vercel.json mem-proxy /api dan /uploads ke backend production (sama-domain, 100% bebas CORS).
// Di localhost, Vite proxy atau VITE_API_URL yang menangani.
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
if (import.meta.env.VITE_API_URL && isLocal) {
  axios.defaults.baseURL = import.meta.env.VITE_API_URL;
}
axios.defaults.withCredentials = false;

const app = createApp(App);
app.use(router);
app.mount('#app');

