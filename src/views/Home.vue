<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { API_GET_ROOM_INFOS } from '../apis/room';
import RoomList from '../components/RoomList.vue';
import R from '../entity/R';

import homeLogo from '@/assets/logo.png';
var homeInfos = ref({
  rooms: 0,
  waitRooms: 0,
  runRooms: 0,
  onLineUser: 0,
})

function getHomeInfo() {
  API_GET_ROOM_INFOS().then(res=>{
    var resultR = res.data as R;
    if(!resultR.state){
      return;
    }
    homeInfos.value = resultR.data.data
  })
}
var timers : number|null = null;
onMounted(()=>{
  getHomeInfo();
  if(timers != null)
    clearInterval(timers);
  timers = setInterval(getHomeInfo,1000,1000);
})


onUnmounted(()=>{
  if(timers != null)
    clearInterval(timers);
})

</script>

<template>
  <n-layout>
    <n-layout-header style="text-align: center;">
      <n-image :src="homeLogo" :width="255"></n-image>
      <n-page-header subtitle="脑力游戏">
        <n-grid :cols="4">
          <n-gi>
            <n-statistic label="房间总数" :value="homeInfos.rooms" />
          </n-gi>
          <n-gi>
            <n-statistic label="等待房间" :value="homeInfos.waitRooms" />
          </n-gi>
          <n-gi>
            <n-statistic label="进行中房间" :value="homeInfos.runRooms" />
          </n-gi>
          <n-gi>
            <n-statistic label="在线玩家" :value="homeInfos.onLineUser" />
          </n-gi>
        </n-grid>
        <template #title>
          <a href="./" style="text-decoration: none; color: inherit">宝石商人</a>
        </template>
      </n-page-header>
    </n-layout-header>
    <n-layout-content>
      <room-list />

    </n-layout-content>
    
  </n-layout>
</template>