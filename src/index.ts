import { createRouter, createWebHashHistory } from "vue-router";
import Setting from './page/Setting.vue';
import MDB from './page/MDB.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      component: Setting,
      path: '/'
    }, {
      component: MDB,
      path: '/mdb'
    }
  ],
});

export default router;

