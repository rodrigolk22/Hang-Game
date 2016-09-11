import Vue from 'vue'
import VueSocketio from 'vue-socket.io';
import App from './App.vue'

/**
 * Get the server port to sync the browser with
 * the backend via websockets
 * @returns {*}
 */
function getMetaContentByName(name,content){
  var content = (content==null)?'content':content;
  return document.querySelector("meta[name='"+name+"']").getAttribute(content);
}

var serverPort = getMetaContentByName('port');
Vue.use(VueSocketio, 'http://localhost:' + serverPort);

new Vue({
  el: '#app',
  render: h => h(App)
})
