import Vue from 'vue'
import VueSocketio from 'vue-socket.io';
import App from './App.vue'

Vue.use(VueSocketio, 'http://localhost:8081');

new Vue({
  el: '#app',
  render: h => h(App)
})
