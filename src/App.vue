<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { MenuOption } from 'naive-ui';
import { h, ref, watchEffect, computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router'
import JoinGameModal from './components/JoinGameModal.vue';
let isRoom = computed(()=>{
  return route.name=="Room"
})
const menuOptions: MenuOption[] = [
  {
    label: () => h(
      RouterLink,
      {
        to: {
          path: "/"
        }
      },
      { default: () => '房间列表' }
    ),
    key: "RoomList",
  },
  {
    label: '关于我们',
    key: 'a-wild-sheep-chase',
    disabled: false
  }
]

const route = useRoute();
const activeKey = ref<string | null>(null)

watchEffect(()=>{
  // 自动获取当前route的name用于适配菜单高亮
  activeKey.value = route.name as string
})

</script>

<template>
  <n-loading-bar-provider>
    <n-dialog-provider>
    <n-message-provider placement="top-left">
      <n-notification-provider :max="3">
        <n-layout v-if="!isRoom">
          <n-layout-header>
            <div id="header">
              <n-menu v-model:value="activeKey" mode="horizontal" :options="menuOptions" />
            </div>

          </n-layout-header>
        </n-layout>
        <n-layout-content id="content" style="margin-top: 5px; margin-bottom: 20px;">
          <router-view></router-view>
          <join-game-modal/>
        </n-layout-content>
      </n-notification-provider>
    </n-message-provider>
  </n-dialog-provider>
  </n-loading-bar-provider>
</template>

<style scoped>
#header {
  padding-top: 5px;
  padding-bottom: 5px;
  border-bottom: solid 1px rgba(128, 128, 128, 0.327);
  margin-bottom: 15px;
}
@media screen and (min-width: 1278px) {
  #content {
    padding-left: 100px;
    padding-right: 100px;
  }
}
@media screen and (max-width: 1278px) {
  #content {
    padding: 15px;
  }
}

</style>