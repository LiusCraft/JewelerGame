<template>
  <n-modal v-model:show="modal_login.show" :mask-closable="false">
    <n-card style="width: 600px" title="设置昵称" :bordered="true" role="dialog" aria-modal="true">
      <n-input-group>
        <n-input autofocus v-model:value="modal_login.userName" placeholder="游玩的名字" @keyup.enter="joinGame">
        </n-input>
        <n-button @click="joinGame()">加入</n-button>
      </n-input-group>
    </n-card>
  </n-modal>
</template>
<script setup lang="ts">
import { useMessage } from 'naive-ui';
import { computed, onMounted, reactive } from 'vue';
import { useStore } from 'vuex';
import { API_GET_USER_EXIST, API_POST_USER_CREATE } from '../apis/user';
import User from '../entity/User';
import { key } from '../store';
import WSUtils from '../websocket';
import { WS_ROOM_BIND_CHAENLE } from '../websocket/room';

const message = useMessage()

const store = useStore(key);
const store_user = computed(() => store.getters.getUser as User)

const modal_login = reactive({
  show: false,
  userName: ""
})


function bindChanle() {
  WSUtils.sendClientRequestContent(
    {
      type: WS_ROOM_BIND_CHAENLE,
      sendId: store_user.value.id as string,
    }
  )
}
var hiddenTime = 0;
document.addEventListener('visibilitychange', function () {
  if (document.visibilityState == 'hidden') {
    hiddenTime = new Date().getTime()	//记录页面隐藏时间
  } else if (hiddenTime != 0) {
    let visibleTime = new Date().getTime();
    if ((visibleTime - hiddenTime) / 1000 > 10) {	//页面再次可见的时间-隐藏时间>10S,重连
      joinGame()
    }
    hiddenTime = 0;
  }
});

/**
 * 加入游戏 (弹出设置游戏昵称窗口)
 * @note 若已加入游戏需先离开游戏(fun: leaveGame)再加入！
 */
async function joinGame() {
  if (!modal_login.show && store_user.value && await API_GET_USER_EXIST(store_user.value.id as string)) {
    message.info("您已经加入到游戏当中啦！")
    // todo
    bindChanle();
    return;
  }
  if (!modal_login.show) {
    message.info("请为自己设置昵称~");
    modal_login.show = true;
  } else {
    let messageReactive = message.loading("正在加入到游戏中...");
    API_POST_USER_CREATE(modal_login.userName).then(res => {
      messageReactive.destroy();
      if (!res.data.state) {
        message.error("加入游戏失败！" + res.data.message);
        store.commit('setUser', {
          id: null,
          name: null
        });
        return;
      }
      message.success("您已加入到游戏，开始游玩吧~");
      // 已加入到游戏，那么弹窗可以关闭
      modal_login.show = false;
      var user: User = {
        id: res.data.data.userId,
        name: modal_login.userName,
      };
      store.commit('setUser', user);
      // todo
      bindChanle();
    })
  }

}

onMounted(() => {
  joinGame();
});

</script>