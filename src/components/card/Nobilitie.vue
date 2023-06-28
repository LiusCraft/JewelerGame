<template>
  <n-popconfirm :positive-text="null" :negative-text="null">
    <template #action v-if="give">
      <n-button  size="small" @click="tirggerCard()" :type="'primary'">
        拿取贵族
      </n-button>
    </template>
    <template #trigger>
      <n-card :class="gemType?.color + ' box-box'" content-style="padding: 0px;"
        style="cursor: pointer;padding: 0px;margin: 0px;" hoverable :bordered="false">

        <n-collapse-transition :show="cardShow">
          <n-card :title="gemType?.name" embedded :bordered="false" style="background-color: transparent;">
            <template #header-extra>
              <n-badge :value="jewelerData.score" :max="15">

              </n-badge>

            </template>
            <n-space>
              <n-tag round :bordered="false" v-for="gem in gems">
                x{{gem.count}}
                <template #icon>
                  <n-icon :component="CreditCardRegular" :color="gem.color" />
                </template>
              </n-tag>

            </n-space>
          </n-card>
        </n-collapse-transition>
      </n-card>

    </template>
    <span v-if="give">
      操作此贵族牌:
    </span>
    <span v-else>
      无法操作此贵族牌
    </span>
    
  </n-popconfirm>

</template>
<script setup lang="ts">
import { CreditCardRegular } from '@vicons/fa'
import { useMessage } from 'naive-ui';
import { computed, defineComponent, reactive, ref, watch } from 'vue';
import { IGem, GemMap } from '../../entity/Gem';
import R from '../../entity/R';
import Room from '../../entity/Room';
import User from '../../entity/User';
import { store } from '../../store';
import WSUtils from '../../websocket';
import { WS_ROOM_GIVE_NOBILITY } from '../../websocket/room';
import UserItem from '../UserItem.vue';
defineComponent({
  UserItem,
})
const message = useMessage();
const store_user = computed(() => store.getters.getUser as User)
const store_room = computed(() => store.getters.getRoom as Room)
const props = defineProps({
  give: {
    type: Boolean,
    default: false
  },
  jewelerData: {
    type: Object,
    default: {
      no: -1,
      score: 0,
      cards: {}
    }
  }
})


let cardShow = ref(true);
let gemType = reactive<IGem>({
  color: "gold",
  name: "贵族卡",
  type: 4,
  count: 1,
});
const emits = defineEmits(['giveCard']);

let giveItems = reactive({
  gems: new Map(),
  cards: new Map()
})

let gems = reactive<IGem[]>([])

function tirggerCard() {
  WSUtils.sendClientRequestContent({
    type: WS_ROOM_GIVE_NOBILITY,
    roomId: store_room.value.roomId as string,
    sendId: store_user.value.id as string,
    content: {
      id: store_user.value.id as string,
      nobility: {
        no: props.jewelerData.no,
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
  Object.entries(next.cards).forEach(([k, v]) => {
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

.black2 {
  background-color: rgba(16, 16, 16, 0.6);
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

.box-box {
  display: table-cell;
}
</style>