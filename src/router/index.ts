/**
 * createRouter 这个为创建路由的方法
 * createWebHashHistory 这个就是vue2中路由的模式，
 *                      这里的是hash模式，这个还可以是createWebHistory等
 * RouteRecordRaw 这个为要添加的路由记录，也可以说是routes的ts类型
 */
 import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
 // 路由记录，这个跟vue2中用法一致，就不做过多解释了
 const routes:Array<RouteRecordRaw> = [
   {
     path: '/',
     name: 'RoomList',
     component: () => import("@/views/Home.vue"),
     alias: '/roomlist',
     meta: {
       title: '房间列表'
     }
   },
   {
    path: '/room',
    name: 'Room',
    component: () => import('@/views/Room.vue'),
    meta: {
      title: "房间"
    }
   }
 ];
 
 const router = createRouter({
   history: createWebHashHistory(),
   routes
 });

 router.beforeEach((to,from,next)=>{
  // 根据路由元信息设置文档标题
  window.document.title = ((`${to.meta.title} - ` || "") as string) + "宝石商人"
  next()
})
 export default router;
 