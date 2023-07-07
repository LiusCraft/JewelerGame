<template>
  <div style="margin-bottom: 50px;">
    <div style="text-align: center" v-if="roomInfo.gameStart&&!roomInfo.gameEnd">
      <n-countdown
        ref="countdownRef"
        :duration="currentData.curBeginTime"
        :render="renderCountdown"
        :active="countdownActive"
      />
    </div>
    <n-tabs
      animated
      ref="tabsUserRef"
      v-model:value="tabsUser.currentId"
      type="segment"
      :size="'medium'"
      :tabs-padding="20"
    >
      <n-tab-pane
        :disabled="!roomInfo.gameStart"
        :name="(user.id as string)"
        v-for="user in (roomInfo.users)"
      >
        <template #tab>
          <n-badge dot :show="currentData.playUserId==user.id">
            <n-text>{{((user.id==store_user.id?'自己('+store_user.name+')':user.name) as string)}} - {{user.ownScore||0}}分</n-text>
          </n-badge>
          <n-badge v-if="user.id==store_room.roomOwnerId" value="房主"></n-badge>
        </template>
        <n-page-header v-if="roomInfo.gameStart">
          <n-grid cols="1 1100:2 1100:2" item-responsive style="padding: 10px;">
            <n-grid-item>
              <UserItem :gemCount="currentData.gemCount" :cardCount="currentData.cardCount" />
            </n-grid-item>
            <n-grid-item style="text-align: center;margin-top: 5px;">
              <n-scrollbar x-scrollable>
                <n-button-group :size="'medium'">
                  <n-button
                    strong
                    color="blue"
                    secondary
                    type="primary"
                    round
                    @click="giveJeweler(1)"
                  >
                    <n-badge :value="roomInfo.gems[1]" processing color="blue">蓝宝石</n-badge>
                  </n-button>

                  <n-button
                    strong
                    color="red"
                    secondary
                    type="primary"
                    round
                    @click="giveJeweler(2)"
                  >
                    <n-badge :value="roomInfo.gems[2]" processing color="red">红宝石</n-badge>
                  </n-button>

                  <n-button
                    strong
                    color="black"
                    secondary
                    type="primary"
                    round
                    @click="giveJeweler(3)"
                  >
                    <n-badge :value="roomInfo.gems[3]" processing color="black">黑宝石</n-badge>
                  </n-button>

                  <n-button
                    strong
                    color="green"
                    secondary
                    type="primary"
                    round
                    @click="giveJeweler(4)"
                  >
                    <n-badge :value="roomInfo.gems[4]" processing color="green">绿宝石</n-badge>
                  </n-button>

                  <n-button strong secondary round @click="giveJeweler(5)">
                    <n-badge :value="roomInfo.gems[5]" processing color="grey">白宝石</n-badge>
                  </n-button>

                  <n-button
                    strong
                    color="rgb(160, 160, 0)"
                    secondary
                    type="primary"
                    round
                    @click="giveJeweler(6)"
                  >
                    <n-badge :value="roomInfo.gems[6]" processing color="rgb(160, 160, 0)">金宝石</n-badge>
                  </n-button>
                </n-button-group>
              </n-scrollbar>
            </n-grid-item>
          </n-grid>

          <template #title>
            <a style="text-decoration: none; color: inherit">{{currentData.user?.name}}</a>
          </template>

          <template #avatar>
            <n-popover trigger="hover">
              <template #trigger>
                <n-button circle secondary strong type="error" @click="leaveGame()">
                  <n-icon :component="ArrowCircleLeft" :size="32" />
                </n-button>
              </template>
              离开房间
            </n-popover>
          </template>
          <template #extra>
            <n-space>
              <n-button-group>
                <n-button @click="skipGemRound()" round type="warning">结束宝石回合</n-button>
                <n-button @click="skipRound()" round type="error">结束游戏回合</n-button>
              </n-button-group>
              <n-button-group>
                <n-button @click="modal_userCard.show = true" round type="info">查看TA贵族与压牌</n-button>
                <n-button
                  @click="getRoomLogInfo();modal_gameTimeBc.show = true;"
                  round
                  type="success"
                >查看游戏记录</n-button>
              </n-button-group>
            </n-space>
          </template>
        </n-page-header>
      </n-tab-pane>
    </n-tabs>
    <n-result
      style="margin-top: 20px;"
      status="418"
      title="等待玩家加入"
      :description="roomInfo.users.length+ '/4'"
      v-if="!roomInfo.gameStart"
    >
      <template #footer>
        <template v-if="store_room.roomOwnerId==store_user.id">
          <n-button @click="startGame()">开始游戏</n-button>
          <n-button @click="addBot()">添加机器人</n-button>
        </template>
        <n-button @click="leaveGame()">离开房间</n-button>
      </template>
    </n-result>
    <n-card
      v-else-if="!roomInfo.gameEnd"
      content-style="padding: 10px;"
      size="small"
      style="background-color: transparent;"
    >
      <n-collapse :default-expanded-names="['1']">
        <n-collapse-item title="一级卡牌" name="1" v-if="roomInfo.cardsOne.length>0">
          <n-grid :x-gap="12" :y-gap="8" :cols="4">
            <n-grid-item v-for="card in roomInfo.cardsOne" class="box-block">
              <Card :jewelerData="card" :grade="1" class="box-box" />
            </n-grid-item>
          </n-grid>
        </n-collapse-item>
        <n-collapse-item title="二级卡牌" name="2" v-if="roomInfo.cardsTwo.length>0">
          <n-grid :x-gap="12" :y-gap="8" :cols="4">
            <n-grid-item v-for="card in roomInfo.cardsTwo" class="box-block">
              <Card :jewelerData="card" :grade="2" class="box-box" />
            </n-grid-item>
          </n-grid>
        </n-collapse-item>
        <n-collapse-item title="三级卡牌" name="3" v-if="roomInfo.cardsThrid.length>0">
          <n-grid :x-gap="12" :y-gap="8" :cols="4">
            <n-grid-item v-for="card in roomInfo.cardsThrid" class="box-block">
              <Card :jewelerData="card" :grade="3" class="box-box" />
            </n-grid-item>
          </n-grid>
        </n-collapse-item>
        <n-collapse-item title="贵族卡牌" name="4" v-if="roomInfo.nobilities.length>0">
          <n-grid :x-gap="12" :y-gap="8" :cols="4">
            <n-grid-item v-for="nobilitie in roomInfo.nobilities" class="box-block">
              <Nobilitie :jewelerData="nobilitie" give class="box-box" />
            </n-grid-item>
          </n-grid>
        </n-collapse-item>
      </n-collapse>
    </n-card>
    <n-result style="margin-top: 20px;" status="418" title="游戏结束啦~" v-else>
      <template #footer>
        <n-button @click="startGame()" v-if="store_room.roomOwnerId==store_user.id">再来一局</n-button>
        <n-button @click="leaveGame()">离开房间</n-button>
      </template>
    </n-result>

    <n-drawer v-model:show="settingData.show" :default-width="502" placement="bottom" resizable>
      <n-drawer-content body-content-style="padding:0px">
        <n-card title="设置">
          <n-space>
            <n-space>
              自动切换用户
              <n-switch v-model:value="settingData.data.autoChangeUser" :round="false" />
            </n-space>
            <n-space>
              播放声音
              <n-switch v-model:value="settingData.data.autoPlayAudio" :round="false" />
            </n-space>
            <n-space>
              换牌结束宝石回合
              <n-switch
                :disabled="true"
                v-model:value="settingData.data.autoEndGemRound"
                :round="false"
              />
            </n-space>
          </n-space>
        </n-card>
      </n-drawer-content>
    </n-drawer>
    <n-drawer v-model:show="chatData.chatShow" :default-width="502" placement="bottom" resizable>
      <n-drawer-content body-content-style="padding:0px">
        <n-card title="聊天" size="small" style="margin-top: 0px;">
          <template #header-extra>
            <n-button-group>
              <n-button secondary>
                <n-switch size="large" :round="false" v-model:value="chatData.notificationShow">
                  <template #checked>聊天提示</template>
                  <template #unchecked>聊天提示</template>
                </n-switch>
              </n-button>
              <n-dropdown
                trigger="hover"
                :options="chatData.quickList"
                @select="chatData.handleSelect"
              >
                <n-button secondary type="success">快速喊话</n-button>
              </n-dropdown>
              <n-button secondary :type="'info'" round @click="sendMessage()">发送消息</n-button>
            </n-button-group>
          </template>
          <n-grid cols="100" style="margin-bottom: 5px">
            <n-grid-item span="100">
              <n-input
                v-model:value="chatData.inputData"
                @keyup.enter="sendMessage"
                default-value="@"
              />
            </n-grid-item>
            <n-grid-item></n-grid-item>
          </n-grid>
          <n-scrollbar style="max-height: 100px;" ref="chatMessageRef">
            <n-list size="small">
              <n-list-item style="padding: 2px" v-for="chat in chatData.messageList">{{chat}}</n-list-item>
            </n-list>
          </n-scrollbar>
        </n-card>
      </n-drawer-content>
    </n-drawer>
    <n-modal v-model:show="modal_userCard.show">
      <n-card
        style="width: 600px; height: 600px;"
        title="Ta的贵族和压的卡牌"
        closable
        v-on:close="modal_userCard.show=false"
      >
        <div v-if="!currentData.user?.tscards">暂无压牌数据</div>
        <n-grid :x-gap="12" :y-gap="8" :cols="4" v-else>
          <n-grid-item v-for="card in currentData.user?.tscards" class="box-block">
            <Card :jewelerData="(card as ICard)" :grade="3" class="box-box" />
          </n-grid-item>
        </n-grid>
        <div v-if="!currentData.user?.nobility">暂无贵族数据</div>
        <Nobilitie v-else :jewelerData="currentData.user?.nobility" class="box-box" />
      </n-card>
    </n-modal>
    <n-modal v-model:show="modal_gameTimeBc.show">
      <n-card
        style="width: 600px; height: 600px;"
        title="游戏操作记录"
        closable
        v-on:close="modal_gameTimeBc.show=false"
      >
        <n-scrollbar style="max-height: 500px">
          <n-timeline>
            <n-timeline-item
              v-for="message in roomInfo.gameLogs"
              :title="getMessageType(message.messageColor).name"
              :type="getMessageType(message.messageColor).type"
              :content="(message.message)"
              :time="message.date"
            ></n-timeline-item>
          </n-timeline>
        </n-scrollbar>
      </n-card>
    </n-modal>
    <n-space id="chatDiv">
      <n-button :size="'large'" type="info" @click="settingData.show=true">
        <template #icon>
          <n-icon>
            <setting-filled />
          </n-icon>
        </template>
      </n-button>
      <n-button :size="'large'" type="info" @click="chatData.chatShow=true">聊天</n-button>
    </n-space>
    <audio id="bgMusic" />
  </div>
</template>
<script setup lang="ts">
import { SettingFilled } from "@vicons/antd";
import { ArrowCircleLeft } from "@vicons/fa";
import {
CountdownInst,
CountdownProps,
MentionOption,
TabsInst,
useDialog,
useMessage,
useNotification
} from "naive-ui";
import {
computed,
nextTick,
onMounted,
onUnmounted,
reactive,
ref,
watch
} from "vue";
import { API_GET_GAME_INFO } from "../apis/game";
import { API_GET_LOG_ROOM } from "../apis/log";
import { API_GET_ROOM_INUSERS } from "../apis/room";
import UserItem from "../components/UserItem.vue";
import Card from "../components/card/Card.vue";
import Nobilitie from "../components/card/Nobilitie.vue";
import { ICard } from "../entity/Card";
import { GemMap } from "../entity/Gem";
import INobility from "../entity/Nobility";
import R from "../entity/R";
import Room from "../entity/Room";
import Setting from "../entity/Setting";
import User from "../entity/User";
import router from "../router";
import { store } from "../store";
import WSUtils from "../websocket";
import {
WS_ROOM_BOT_ADD,
WS_ROOM_CHAT,
WS_ROOM_END,
WS_ROOM_GIVE_CARD,
WS_ROOM_GIVE_GEM,
WS_ROOM_GIVE_NOBILITY,
WS_ROOM_HEAT,
WS_ROOM_JOIN,
WS_ROOM_LEAVE,
WS_ROOM_PRESS_CARD,
WS_ROOM_ROUND,
WS_ROOM_SKIP2_ROUND,
WS_ROOM_SKIP_ROUND,
WS_ROOM_SKIP_ROUND_GEM,
WS_ROOM_START
} from "../websocket/room";
const store_user = computed(() => store.getters.getUser as User);
const store_room = computed(() => store.getters.getRoom as Room);
const store_setting = computed(() => store.getters.getSetting as Setting);
const atUserList = computed(() => {
  if (roomInfo.users) {
    return roomInfo.users.map((user: User) => {
      return {
        label: user.name,
        value: user.name
      } as MentionOption;
    });
  }
});
const countdownRef = ref<CountdownInst | null>();

const countdownActive = ref(false);
const renderCountdown: CountdownProps["render"] = ({ seconds }) => {
  return `倒计时:${String(seconds).padStart(2, "0")}`;
};
const dialog = useDialog();
const tabsUser = reactive({
  currentId: store_user.value.id as string
});
const tabsUserRef = ref<TabsInst | null>();

const modal_userCard = reactive({
  show: false
});
const modal_gameTimeBc = reactive({
  show: false
});
interface LogMessage {
  message: string;
  date: string;
  messageColor: number;
}
interface IRoomInfo {
  users: User[];
  gameStart: boolean;
  gameEnd: boolean;
  cardsOne: ICard[];
  cardsTwo: ICard[];
  cardsThrid: ICard[];
  nobilities: INobility[];
  gems: any;
  gameLogs: LogMessage[];
}

const roomInfo = reactive<IRoomInfo>({
  users: [],
  gameStart: false,
  gameEnd: false,
  cardsOne: [],
  cardsTwo: [],
  cardsThrid: [],
  nobilities: [],
  gems: new Map(),
  gameLogs: []
});

const message = useMessage();
const currentData = reactive({
  currentUserNo: -1,
  playUserId: "",
  curBeginTime: 0,
  user: getUserByIndex(getUserIndexById(tabsUser.currentId)),
  cardCount: [
    [1, 0, "color"],
    [2, 0, "color"],
    [3, 0, "color"],
    [4, 0, "color"],
    [5, 0, "color"],
    [6, 0, "color"]
  ],
  gemCount: [
    [1, 0, "color"],
    [2, 0, "color"],
    [3, 0, "color"],
    [4, 0, "color"],
    [5, 0, "color"],
    [6, 0, "color"]
  ],
  nobilitie: null
});

const settingData = reactive({
  show: false,
  data: store_setting.value
});
const audioList = [
  new Audio("http://zuoye.free.fr/files/到当前玩家回合.wav"),
  new Audio("http://zuoye.free.fr/files/消息提示2.wav"),
  new Audio("http://zuoye.free.fr/files/拿宝石换牌换贵族.wav"),
  new Audio("http://zuoye.free.fr/files/快点吧，我等的花谢了.wav"),
  new Audio("http://zuoye.free.fr/files/3kzrd-02bwl(1).wav") // 回合
];
const chatData = reactive({
  inputData: "",
  chatCount: 0,
  chatShow: false,
  notificationShow: true,
  messageList: [],
  quickList: [
    {
      label: "快点吧，我等的花谢了",
      key: "快点吧，我等的花谢了"
    },
    {
      label: "我需要思考一下...",
      key: "我需要思考一下..."
    },
    {
      label: "有人要赢了，我们需要合作",
      key: "有人要赢了，我们需要合作"
    }
  ],
  handleSelect: (key: string | number) => {
    chatData.inputData = String(key);
    sendMessage();
  }
});
interface MessageType {
  name: string;
  type: "default" | "error" | "info" | "success" | "warning";
}
function getMessageType(type: number): MessageType {
  let messageType: MessageType = {
    name: "系统",
    type: "info"
  };
  switch (type) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 6:
      break;
    case 5:
      messageType = {
        name: "聊天",
        type: "success"
      };
      break;
    default:
      break;
  }
  return messageType;
}
/**
 * 根据UserId查找Users中index
 * @param id userId
 * @returns 若查到了返回users下标或
 */
function getUserIndexById(id: string): number {
  for (let index in roomInfo.users) {
    const element = roomInfo.users[Number(index)];
    if (element.id == id) {
      return Number(index);
    } // 0, 1, 2
  }
  return -1;
}
/**
 * 根据下标获取User
 * @param index users的下标
 * @returns 存在返回User否则返回空的内容
 */
function getUserByIndex(index: number): User | null {
  if (index >= 0 && index < roomInfo.users.length) return roomInfo.users[index];
  return null;
}
function getRoomUsersInfo(): void {
  if (!store_room.value.roomId) return;
  API_GET_ROOM_INUSERS(store_room.value.roomId as string).then(res => {
    let resultR = res.data as R;
    if (!resultR.state) {
      message.error(resultR.message);
      return;
    }
    roomInfo.users = resultR.data.data as User[];
    nextTick(() => {
      tabsUser.currentId = tabsUser.currentId;
      tabsUserRef.value?.syncBarPosition();
    });
  });
}
function leaveGame() {
  WSUtils.sendClientRequestContent(
    {
      type: WS_ROOM_LEAVE,
      roomId: store_room.value.roomId as string,
      sendId: store_user.value.id as string
    },
    (e: R) => {
      if (e.state) {
        store.commit("setRoom", {});
        router.push({ name: "RoomList" });
      }
    }
  );
}
var bgMusicAudio: HTMLAudioElement | null = null;
/**
 *
 * @param type 0.回合开始 1.聊天提示 2.换牌提示 3.催促 4.回合过半
 */
function playAudio(type: 0 | 1 | 2 | 3 | 4) {
  if (!settingData.data.autoPlayAudio) return;
  audioList[type].pause();
  audioList[type].muted = false;
  audioList[type].currentTime = 0;
  audioList[type].play();
}
function pauseAudio(type: 0 | 1 | 2 | 3 | 4) {
  if (!settingData.data.autoPlayAudio) return;
  audioList[type].pause();
}
function addBot() {
  WSUtils.sendClientRequestContent({
    type: WS_ROOM_BOT_ADD,
    roomId: store_room.value.roomId as string,
    sendId: store_user.value.id as string,
    robotLevel: 0
  });
}
function startGame() {
  // if (store_user.value.id != store_room.value.roomOwnerId) {
  //   message.error("你个钩吧不是房主想开始游戏？")
  //   return;
  // }
  WSUtils.sendClientRequestContent({
    type: WS_ROOM_START,
    roomId: store_room.value.roomId as string,
    sendId: store_user.value.id as string
  });
}

/**
 * 发送聊天消息
 */
function sendMessage() {
  if (chatData.inputData.length == 0) return;
  if (chatData.chatCount > 5) {
    message.warning("操作频繁，请稍后再试~");
    return;
  }

  chatData.chatCount += 1;
  WSUtils.sendClientRequestContent({
    type: WS_ROOM_CHAT,
    roomId: store_room.value.roomId as string,
    sendId: store_user.value.id as string,
    content: {
      id: store_user.value.id as string,
      message: chatData.inputData
    }
  });
  chatData.inputData = "";
}
var play4Audio: number | null = null;
function getCurrentGameData() {
  API_GET_GAME_INFO(store_room.value.roomId as string).then(res => {
    let resultR = res.data as R;
    if (!resultR.state) {
      message.error(resultR.message);
      roomInfo.gameStart = false;
      return;
    }
    if (resultR.data.data == null) return;

    countdownActive.value = true;
    if (resultR.data.data.currentUserNo != currentData.currentUserNo) {
      if (play4Audio != null) clearTimeout(play4Audio);
      pauseAudio(4);
      pauseAudio(0);
      if (settingData.data.autoChangeUser)
        tabsUser.currentId = resultR.data.data.userId;
      currentData.currentUserNo = resultR.data.data.currentUserNo;
      if (resultR.data.data.userId == store_user.value.id) {
        playAudio(0);
        dialog.info({
          title: "提示",
          content: "这是你的回合，请开始!",
          positiveText: "好的"
        });
      }
    }

    currentData.playUserId = resultR.data.data.userId;

    roomInfo.users = resultR.data.data.users as User[];
    roomInfo.cardsOne = [];
    roomInfo.cardsTwo = [];
    roomInfo.cardsThrid = [];
    roomInfo.nobilities = [];
    nextTick(() => {
      roomInfo.cardsOne = resultR.data.data.showCards["1"] as ICard[];
      roomInfo.cardsTwo = resultR.data.data.showCards["2"] as ICard[];
      roomInfo.cardsThrid = resultR.data.data.showCards["3"] as ICard[];
      roomInfo.nobilities = resultR.data.data.nobilities as INobility[];
      let tempTime =
        (resultR.data.data.curBeginTime as number) +
        60 * 1000 -
        Date.parse(new Date().toString());
      currentData.curBeginTime = tempTime > 0 ? tempTime : 0;
      countdownActive.value = true;
      countdownRef.value?.reset();
      if (tempTime > 0)
        if (tempTime < 30 * 1000) playAudio(4);
        else {
          if (play4Audio != null) clearTimeout(play4Audio);
          play4Audio = setTimeout(() => {
            playAudio(4);
          }, 30 * 1000);
        }
    });

    roomInfo.gems = resultR.data.data.gems;
    updateViewData();
  });
}

function getRoomLogInfo() {
  API_GET_LOG_ROOM(store_room.value.roomId as string).then(res => {
    let resultR = res.data as R;
    if (resultR.state) {
      roomInfo.gameLogs = resultR.data.data;
    }
  });
}

function giveJeweler(type: number) {
  WSUtils.sendClientRequestContent({
    type: WS_ROOM_GIVE_GEM,
    roomId: store_room.value.roomId as string,
    sendId: store_user.value.id as string,
    content: {
      id: store_user.value.id as string,
      gem: type
    }
  });
}

function skipGemRound() {
  WSUtils.sendClientRequestContent({
    type: WS_ROOM_SKIP_ROUND_GEM,
    roomId: store_room.value.roomId as string,
    sendId: store_user.value.id as string
  });
}

function skipRound() {
  WSUtils.sendClientRequestContent({
    type: WS_ROOM_SKIP_ROUND,
    roomId: store_room.value.roomId as string,
    sendId: store_user.value.id as string
  });
}
const notification = useNotification();
function initEvent() {
  // 开始游戏监听
  WSUtils.addHandlerFun(WS_ROOM_START, (e: R) => {
    if (!e.state) {
      return false;
    }
    roomInfo.gameStart = true;
    roomInfo.gameEnd = false;
  });
  // 添加游戏回合事件
  WSUtils.addHandlerFun(WS_ROOM_ROUND, (e: R) => {
    if (!e.state) {
    } else {
    }
  });
  // 添加游戏结束事件
  WSUtils.addHandlerFun(WS_ROOM_END, (e: R) => {
    if (!e.state) {
    } else {
      roomInfo.gameEnd = true;
    }
  });
  // 添加那宝石事件
  WSUtils.addHandlerFun(WS_ROOM_GIVE_GEM, (e: R) => {
    if (!e.state) {
    } else {
    }
    return false;
  });
  // 添加拿卡牌事件
  WSUtils.addHandlerFun(WS_ROOM_GIVE_CARD, (e: R) => {
    if (!e.state) {
    } else {
    }
  });
  // 添加拿贵族事件
  WSUtils.addHandlerFun(WS_ROOM_GIVE_NOBILITY, (e: R) => {
    if (!e.state) {
    } else {
    }
  });
  // 添加玩家跳过回合
  WSUtils.addHandlerFun(WS_ROOM_SKIP_ROUND, (e: R) => {
    if (!e.state) {
    } else {
    }
  });
  // 跳过拿宝石回合
  WSUtils.addHandlerFun(WS_ROOM_SKIP_ROUND_GEM, (e: R) => {
    if (!e.state) {
    } else {
    }
  });

  // 添加玩家长时间挂机跳过回合
  WSUtils.addHandlerFun(WS_ROOM_SKIP2_ROUND, (e: R) => {
    if (!e.state) {
    } else {
    }
  });
  // 添加玩家压牌事件
  WSUtils.addHandlerFun(WS_ROOM_PRESS_CARD, (e: R) => {
    if (!e.state) {
    } else {
    }
  });
  // 离开房间
  WSUtils.addHandlerFun(WS_ROOM_LEAVE, (e: R) => {
    if (!e.state) {
    } else {
      store.commit(
        "setRoom",
        Object.assign(store_room.value, { roomOwnerId: e.data.data })
      );
    }
  });
  WSUtils.addHandlerFun(WS_ROOM_CHAT, (e: R) => {
    if (!e.state) {
    } else {
      if (e.message.indexOf("快点吧，我等的花谢了") != -1) {
        playAudio(3);
      } else playAudio(1);
      if (chatData.notificationShow) message.info(e.message);
      chatData.messageList.unshift(e.message as never);
    }
  });
  // 全局事件处理
  WSUtils.addHandlerFun(-1, (e: R) => {
    if (e.type == 15) return;
    if (e.type == WS_ROOM_CHAT) return;

    if (!e.state) {
      message.error(e.message);
    } else {
      message.info(e.message);
      if (roomInfo.users.length > 0) {
        if (roomInfo.gameStart) {
          switch (e.type) {
            case WS_ROOM_GIVE_CARD:
            case WS_ROOM_ROUND:
            case WS_ROOM_GIVE_GEM:
            case WS_ROOM_PRESS_CARD:
            case WS_ROOM_GIVE_NOBILITY:
            case WS_ROOM_START:
            case WS_ROOM_LEAVE:
            case WS_ROOM_BOT_ADD:
              getCurrentGameData();
              break;
            case WS_ROOM_HEAT:
              break;
            default:
              break;
          }
        } else {
          getRoomUsersInfo();
        }
      }
    }
  });
}
let chatCountTimer: number | null = null;
onMounted(() => {
  if (chatCountTimer) clearInterval(chatCountTimer);
  chatCountTimer = setInterval(() => {
    chatData.chatCount = 0;
  }, 1000 * 8);
  if (!store_room.value) {
    message.error("请先加入到房间!");
    router.push({ name: "RoomList" });
  } else {
    WSUtils.sendClientRequestContent(
      {
        roomId: store_room.value.roomId as string,
        sendId: store_user.value.id as string,
        type: WS_ROOM_JOIN
      },
      (e: R) => {
        if (!e.state && e.code != 201) {
          store.commit("setRoom", {});
          router.push({ name: "RoomList" });
          message.error(e.message);
          return true;
        }
        getRoomUsersInfo();
        initEvent();
        if (e.data.data == true) {
          roomInfo.gameStart = true;
          getCurrentGameData();
        }
        return true;
      }
    );
  }
});

onUnmounted(() => {
  if (chatCountTimer) clearInterval(chatCountTimer);
  WSUtils.clearHandlerFun();
});

function updateViewData() {
  currentData.user = getUserByIndex(getUserIndexById(tabsUser.currentId));
  if (currentData.user == null) return;
  currentData.cardCount = [];
  currentData.gemCount = [];
  for (let index = 0; index < 6; index++) {
    currentData.cardCount.push([
      index + 1,
      currentData.user.cards[index + 1].length,
      GemMap.get(index + 1)?.color
    ]);
    currentData.gemCount.push([
      index + 1,
      currentData.user.gems[index + 1],
      GemMap.get(index + 1)?.color as string
    ]);
  }
  store_user.value.gems = currentData.gemCount;
  store_user.value.cards = currentData.cardCount;
  store.commit("setUser", store_user.value);
}

watch(
  () => settingData.data,
  (next, prev) => {
    store.commit(
      "setSetting",
      Object.assign(store_setting.value, settingData.data)
    );
  },
  { deep: true }
);

watch(
  () => tabsUser.currentId,
  (next, prev) => {
    updateViewData();
  },
  { deep: true, immediate: true }
);
</script>
<style scoped>
.box-block {
  display: table;
  width: 100%;
}

.box-box {
  display: table-cell;
}

#chatDiv {
  position: fixed;
  bottom: 10px;
  left: 10px;
}
</style>