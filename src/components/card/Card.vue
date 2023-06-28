<template>
  <n-popconfirm :negative-text="null" :positive-text="null">
    <template #action v-if="give">
      <n-button size="small" @click="pressCard()" type="warning">
        压牌
      </n-button>
      <n-button size="small" @click="handlePositiveClick()" :type="'primary'">
        换牌
      </n-button>
    </template>
    <template #trigger>
      
      <n-card :class="gemType?.color + ' box-box'" content-style="padding: 0px;"
        style="cursor: pointer;padding: 0px;margin: 0px;" hoverable :bordered="false">

        <n-collapse-transition :show="cardShow">
          <n-card :title="gemType?.name" embedded :bordered="false" style="background-color: transparent;">
            <template #header-extra>
              <n-tag round :bordered="false" :class="gemType?.color">
                {{ gradeName }}
                <template #icon>
                  <n-badge :value="jewelerData.score" :max="15" :color="gemType.color">

                  </n-badge>
                </template>
              </n-tag>

            </template>
            <n-space>
              <n-tag round :bordered="false" v-for="gem in gems">
                x{{ gem.count }}
                <template #icon>
                  <n-icon :component="Gem" :color="gem.color" />
                </template>
              </n-tag>

            </n-space>
          </n-card>
        </n-collapse-transition>
        <n-modal v-model:show="modal_triggerCard.show">
          <n-card title="请选择更换条件" style="width: 550px;background-color: #ffffff2a;" closable
            @close="modal_triggerCard.show = false">
            <UserItem :giveItems="giveItems" :gemCount="store_user.gems" :cardCount="store_user.cards" isClick
              v-on:callBackGiveItem="callBackGiveItem" />
            <template #footer>
              <n-button block @click="tirggerCard()">确认替换</n-button>
            </template>
          </n-card>
        </n-modal>
      </n-card>

    </template>

    <span v-if="give">
      操作此卡牌:
    </span>
    <span v-else>
      无法操作此卡牌
    </span>
  </n-popconfirm>

</template>
<script setup lang="ts">
import { Gem } from '@vicons/fa'
import { useMessage } from 'naive-ui';
import { computed, defineComponent, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { IGem, GemMap } from '../../entity/Gem';
import R from '../../entity/R';
import Room from '../../entity/Room';
import User from '../../entity/User';
import { store } from '../../store';
import WSUtils from '../../websocket';
import { WS_ROOM_GIVE_CARD, WS_ROOM_PRESS_CARD } from '../../websocket/room';
import UserItem from '../UserItem.vue';
defineComponent({
  UserItem,
})
const message = useMessage();
const store_user = computed(() => store.getters.getUser as User)
const store_room = computed(() => store.getters.getRoom as Room)
const gradeName = computed(() => props.grade == 1 ? "一级卡" : props.grade == 2 ? "二级卡" : "三级卡");
const props = defineProps({
  give: {
    type: Boolean,
    default: true,
  },
  grade: {
    type: Number,
    default: 1
  },
  jewelerData: {
    type: Object,
    default: {
      type: 0,
      name: "未知",
      score: 0,
      gems: {}
    }
  }
})

const modal_triggerCard = reactive({
  show: false,

})

let cardShow = ref(true);
let gemType = reactive<IGem>(GemMap.get(props.jewelerData.cardBuff) as IGem);
const emits = defineEmits(['giveCard']);

let giveItems = reactive({
  gems: new Map(),
  cards: new Map(),
  replaceGems: new Map(),
})

let gems = reactive<IGem[]>([])
function callBackGiveItem(type: number, gemType: number, add: boolean) {
  if (gemType == 1) {
    let temp = giveItems.gems.get(type);
    if (temp == undefined)
      temp = 0;
    if (add) {
      temp += 1;
      giveItems.gems.set(type, temp);
    }
    else {
      if (temp == 1)
        giveItems.gems.delete(type);
      else
        giveItems.gems.set(type, --temp);
    }
  } else if (gemType == 2) {
    let temp = giveItems.cards.get(type);
    if (temp == undefined)
      temp = 0;
    if (add) {
      temp += 1;
      giveItems.cards.set(type, temp);
    }
    else {
      if (temp == 1)
        giveItems.cards.delete(type);
      else
        giveItems.cards.set(type, --temp);
    }
  } else if (gemType == 6) {
    let temp = giveItems.replaceGems.get(type);
    if (temp == undefined)
      temp = 0;
    if (add) {
      temp += 1;
      giveItems.replaceGems.set(type, temp);
    }
    else {
      if (temp == 1)
        giveItems.replaceGems.delete(type);
      else
        giveItems.replaceGems.set(type, --temp);
    }
  }
}
function handlePositiveClick() {
  modal_triggerCard.show = true;
  // 自动帮忙选择宝石与宝石BUFF
  for (let index = 0; index < gems.length; index++) {
    const elementP = gems[index];
    let count = 0;
    // 先看有没有BUFF
    for (let index2 = 0; index2 < store_user.value.gems.length; index2++) {
      const element = store_user.value.cards[index2];
      let elementCount = element[1];
      if (element[1] == 0) continue; // 没有BUFF就跳过
      if (element[0] != elementP.type) continue; // 不是相同宝石就跳过
      if (count == elementP.count) break; // 先看看count有没有达到所需数量
      while (elementCount) {
        let reamin = elementP.count - count;
        if (reamin == 0) break;
        count++;
        elementCount--;
      }
      giveItems.cards.set(element[0], element[1] - elementCount);
    }
    for (let index2 = 0; index2 < store_user.value.gems.length; index2++) {
      const element = store_user.value.gems[index2];
      let elementCount = element[1];
      if (element[1] == 0) continue; // 没有宝石就跳过
      if (element[0] != elementP.type) continue; // 不是相同宝石就跳过
      if (count == elementP.count) break; // 先看看count有没有达到所需数量
      while (elementCount) {
        let reamin = elementP.count - count;
        if (reamin == 0) break;
        count++;
        elementCount--;
      }
      giveItems.gems.set(element[0], element[1] - elementCount);
    }
  }

}
function dumpCard() {

}
function pressCard() {
  WSUtils.sendClientRequestContent({
    type: WS_ROOM_PRESS_CARD,
    roomId: store_room.value.roomId as string,
    sendId: store_user.value.id as string,
    content: {
      id: store_user.value.id as string,
      cardInfo: {
        no: props.jewelerData.no,
        type: props.jewelerData.type,
        score: props.jewelerData.score,
        cardBuff: props.jewelerData.cardBuff,
      }
    }
  }, (e: R) => {
    if (!e.state) {
      return true;
    }
    cardShow.value = false;
    return true;
  })
}

function tirggerCard() {
  if (giveItems.cards.size == 0 && giveItems.gems.size == 0) {
    message.error("请选择拥于替换卡牌的宝石!");
    return;
  }
  WSUtils.sendClientRequestContent({
    type: WS_ROOM_GIVE_CARD,
    roomId: store_room.value.roomId as string,
    sendId: store_user.value.id as string,
    content: {
      id: store_user.value.id as string,
      cardInfo: {
        no: props.jewelerData.no,
        type: props.jewelerData.type,
        score: props.jewelerData.score,
        cardBuff: props.jewelerData.cardBuff,
        gemCards: Object.fromEntries(giveItems.cards.entries()),
        gems: Object.fromEntries(giveItems.gems.entries()),
        replaceGems: Object.fromEntries(giveItems.replaceGems.entries())
      }
    }
  }, (e: R) => {
    if (!e.state) {
      return true;
    }
    cardShow.value = false;
    return true;
  })
}
watch(() => props.jewelerData, (next, prev) => {
  gems = [];
  if (next == null) return;
  gemType = GemMap.get(props.jewelerData.cardBuff) as IGem;

  Object.entries(next.gems).forEach(([k, v]) => {
    let kN = Number(k);
    let vN = Number(v);
    let gem = GemMap.get(kN);
    gems.push({
      type: kN,
      count: vN,
      name: gem?.name as string,
      color: gem?.color as string
    })
  });
}, { deep: true, immediate: true });
</script>

<style scoped>
.light-green {
  background-color: rgba(0, 128, 0, 0.12);
}

.blue {
  background-color: rgba(0, 11, 128, 0.24);
}

.green {
  background-color: rgba(0, 128, 0, 0.24);
}

.black {
  background-color: rgba(16, 16, 16, 0.24);
}

.red {
  background-color: rgba(128, 21, 0, 0.24);
}

.grey {
  background-color: rgba(152, 152, 152, 0.24);
}

.gold {
  background-color: rgba(128, 122, 0, 0.24);
}

</style>