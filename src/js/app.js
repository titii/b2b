import Vue from 'vue';
import Store from './store/store';
import * as Controller from './controllers/controller';
import * as Components from './view/components/component';
import * as Directives from './controllers/directives'

var app = new Vue({
  data: Store.state,
  methods: Controller,
  components: Components,
  directives: Directives
});

app.$mount('#app');
