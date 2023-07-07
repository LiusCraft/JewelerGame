<template>
  <div>
    <n-button-group id="listBtns">
      <n-button type="info" secondary round @click="modal_roomCreate.show = true">创建房间</n-button>
      <n-button type="info" secondary round @click="modal_roomSearch.show = true">搜索房间</n-button>
      <n-button type="info" secondary round :loading="getRoomListState" @click="getRoomListByApi()">刷新列表</n-button>
    </n-button-group>
    <n-data-table :columns="columns" :data="data" :bordered="false" :loading="getRoomListState" />

    <n-modal v-model:show="modal_roomCreate.show">
      <n-card style="width: 600px" title="创建房间" :bordered="false" role="dialog" aria-modal="true" closable
        @close="modal_roomCreate.show = false">
        <n-form label-placement="left" label-width="auto">
          <n-form-item label="房间名">
            <n-input v-model:value="modal_roomCreate.roomData.roomName" @keyup.enter="createRoom"></n-input>
          </n-form-item>
          <!-- <n-form-item label="房间人数">
            <n-radio-group>
              <n-radio-button value="2">两人</n-radio-button>
              <n-radio-button value="3">三人</n-radio-button>
              <n-radio-button value="4">四人</n-radio-button>
            </n-radio-group>
          </n-form-item>
          <n-form-item label="玩法">
            <n-select :options="selectModelList">

            </n-select>
          </n-form-item> -->
          <n-button block type="info" @click="createRoom()">创建房间</n-button>
        </n-form>
      </n-card>
    </n-modal>
    <!-- 房间搜索弹窗 -->
    <n-modal v-model:show="modal_roomSearch.show">
      <n-card style="width: 600px" title="房间搜索" :bordered="true" role="dialog" aria-modal="true" closable
        @close="modal_roomSearch.show = false">
        <n-input-group>
          <n-input autofocus v-model:value="modal_roomSearch.queryData" placeholder="房间ID"
            @keyup.enter="searchRoom">
          </n-input>
          <n-button :loading="modal_roomSearch.loading" @click="searchRoom()">搜索</n-button>
        </n-input-group>
      </n-card>
    </n-modal>
  </div>

</template>

<script setup lang="ts">
import { computed } from '@vue/reactivity';
import type { DataTableColumns } from 'naive-ui';
import { NButton, NButtonGroup, NInput, NTag, useDialog, useMessage } from 'naive-ui';
import { h, onMounted, reactive, ref } from 'vue';
import {
API_GET_ROOM_INUSERS,
API_GET_ROOM_PAGE, API_GET_ROOM_SEARCH, API_POST_ROOM_CREATE
} from '../apis/room';
import R from '../entity/R';
import Room from '../entity/Room';
import User from '../entity/User';
import router from '../router';
import { store } from '../store';
import WSUtils from '../websocket';
import { WS_ROOM_JOIN } from '../websocket/room';

const store_user = computed(() => store.getters.getUser as User);
const store_room = computed(() => store.getters.getRoom as Room);

// 创建房间的 modal
const modal_roomCreate = reactive({
  show: false,
  roomData: {
    roomName: "",
  }
});

/**
 * 创建房间，需要弹出modal_roomCreate
 */
function createRoom(): void {
  API_POST_ROOM_CREATE(
    modal_roomCreate.roomData.roomName,
    store_user.value.id as string
  ).then(res => {
    if (!res.data.state) {
      message.error("创建房间失败！" + res.data.message);
      return;
    }
    modal_roomCreate.show = false;
    message.success("创建房间成功!");
    let resultData = res.data.data.data as RoomRow;
    joinGame(resultData);
  })
}

// 搜索房间 modal
const modal_roomSearch = reactive({
  show: false,
  queryData: "",
  loading: false
})
/**
 * 搜索房间，需要弹出queryData
 */
function searchRoom(): void {
  if (modal_roomSearch.show)
    modal_roomSearch.loading = true;
  else
    modal_roomSearch.show = true;

  API_GET_ROOM_SEARCH(modal_roomSearch.queryData).then(res => {
    modal_roomSearch.loading = false;
    if (!res.data.state || res.data.data.data.length==0) {
      message.error("未查询到相关房间!");
      return;
    }
    data.value = res.data.data.data;
    modal_roomSearch.show = false;
    modal_roomSearch.queryData = "";
  });
}

const getRoomListState = ref(true);
/**
 * 获取当前已创建的所有房间
 */
function getRoomListByApi() {
  getRoomListState.value = true;
  data.value = [];
  API_GET_ROOM_PAGE().then(res => {
    let resultR = res.data as R;

    if (!resultR.state) {
      message.error(resultR.message);
      return;
    }
    if(resultR.data.data.data != null)
      data.value = resultR.data.data.data;
    getRoomListState.value = false;
  })
}



function initData() {
  getRoomListByApi()
}

const selectModelList = [
  {
    label: "普通模式",
    key: "pt"
  }
]
const dialog = useDialog()
type RoomRow = {
  roomId: string
  roomName: string
  curPeople: number,
  maxPeople: number,
  roomOwnerId: string,
  roomOwnerName: string,
  createTime: string
}
const playLoading = ref(false);
const createColumns = ({
  play
}: {
  play: (row: RoomRow) => void
}): DataTableColumns<RoomRow> => {
  return [
    {
      title: 'ID',
      key: 'roomId'
    },
    {
      title: '房间名',
      key: 'roomName'
    },
    {
      title: '房间人数',
      key: 'curPeople',
      render(row) {
        return h(
          NTag, {
          bordered: false,
          type: row.maxPeople > row.curPeople ? "info" : "error"
        },
          { default: () => `${row.curPeople}/${row.maxPeople}` }
        )
      }
    },
    {
      title: '创建时间',
      key: 'createTime'
    },
    {
      title: '创建人',
      key: 'roomOwnerName'
    },
    {
      title: '操作',
      key: 'actions',
      render(row) {
        return h(
          NButtonGroup,
          null,
          {
            default: ()=> [
              h(
                NButton,
                {
                  strong: true,
                  tertiary: true,
                  size: 'small',
                  onClick: () => {
                    API_GET_ROOM_INUSERS(row.roomId).then(res => {
                      let resultR = res.data as R;
                      if (!resultR.state) {
                        message.warning("没有玩家");
                        return;
                      }
                      let users = "";
                      for (let index = 0; index < resultR.data.data.length; index++) {
                        const element = resultR.data.data[index] as User;
                        users += index+"."+element.name+"";
                      }
                      dialog.info({
                      title: "房间人数",
                      content: users
                    })
                    })

                  },
                  disabled: playLoading.value
                },
                { default: () => '查看玩家' }
              ),
              h(
                NButton,
                {
                  strong: true,
                  tertiary: true,
                  size: 'small',
                  type: row.maxPeople > row.curPeople ? "info" : "error",
                  onClick: () => play(row),
                  disabled: playLoading.value
                },
                { default: () => '加入房间' }
              )
            ]
          }
        )
      }
    }
  ]
}
function joinGame(row: RoomRow) {
  playLoading.value = true;
  let messageReactive = message.info(`正在尝试加入到 ${row.roomName} 房间`);
  WSUtils.sendClientRequestContent({
    roomId: row.roomId,
    sendId: store_user.value.id as string,
    type: WS_ROOM_JOIN
  }, (e: R) => {
    playLoading.value = false;
    messageReactive.destroy();
    message.info(e.message)
    let room: Room = {
      roomId: row.roomId,
      roomName: row.roomName,
      roomOwnerId: row.roomOwnerId,
      roomOwnerName: row.roomOwnerName
    };
    if (e.code == 201) {
      if (!store_room.value || store_room.value.roomId != row.roomId)
        store.commit("setRoom", room);
    } else if (!e.state) {
      message.error(e.message);
      room.roomId = null;
      room.roomName = null;
      room.roomOwnerId = null;
      store.commit("setRoom", room)
      return true;
    } else {
      message.info(`成功加入到 ${row.roomName} 房间`);

      store.commit("setRoom", room);
    }
    router.push({ name: "Room" });
    return true;
  })
}
let data = ref([])
const message = useMessage()
const columns = createColumns({
  play(row: RoomRow) {
    joinGame(row)
  }
})

onMounted(() => {
  if (store_room.value) {
    router.push({ name: "Room" })
  }
  initData();
});
</script>

<style scoped>
#listBtns {
  float: right;
  margin: 5px;
}
</style>