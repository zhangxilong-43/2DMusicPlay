import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import axios from 'axios';
import './assets/css/global.css';
import VueCompositionApi from '@vue/composition-api';

axios.defaults.baseURL = 'http://localhost:3000';

Vue.config.productionTip = false;

Vue.use(VueCompositionApi);

const setAppHeight = () => {
  const app = document.getElementById('app') as HTMLElement;
  app.style.height = `${window.innerHeight}px`;
};
window.onresize = setAppHeight;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
