<template>
  <div>
    <div v-if="!isClick">
      <n-space>
        <n-tag round :bordered="false" v-for="gem in gemCountCom">
          x{{gem[1]}}个
          <template #icon>
            <n-icon :component="Gem" :color="(gem[2] as string)" />
          </template>
        </n-tag>
      </n-space>
      <n-space>
        <n-tag round :bordered="false" v-for="card in cardCountCom">
          x{{card[1]}}张
          <template #icon>
            <n-icon :component="CreditCardRegular" :color="(card[2] as string)" />
          </template>
        </n-tag>
      </n-space>

    </div>
    <div v-else>
      <n-space>
        <n-popconfirm v-for="gem in gemCountCom">
          <n-space v-if="gem[0]!=6">
            <n-tag>选:{{giveItems.gems.get(gem[0])||"否"}}</n-tag>
            <n-tag>听:{{giveItems.replaceGems.get(gem[0])||"否"}}</n-tag>
          </n-space>
          <n-space v-else>
            选:{{goldGemCountCom||"否"}}
          </n-space>
          
          <template #action>
            <n-button size="small" @click="minusGem(gem[0])" :disabled="gem[0]!=6?(giveItems.gems.get(gem[0])||0)==0:goldGemCountCom==0">
              放下
            </n-button>
            <n-button size="small" @click="addGem(gem[0])" :type="'primary'">
              拿起
            </n-button>
          </template>
          <template #trigger>
            <n-tag round :bordered="false">
              x{{gem[1]}}个
              <template #icon>
                <n-icon :component="Gem" :color="(gem[2] as string)" />
              </template>
            </n-tag>
          </template>

        </n-popconfirm>
      </n-space>
      <n-space>
        <n-popconfirm v-for="card in cardCountCom">
          已选:{{giveItems.cards.get(card[0])||"否"}}
          <template #action>
            <n-button size="small" @click="minusCard(card[0])" :disabled="(giveItems.cards.get(card[0])||0)==0">
              放下
            </n-button>
            <n-button size="small" @click="addCard(card[0])" :type="'primary'">
              拿起
            </n-button>
          </template>
          <template #trigger>
            <n-tag round :bordered="false">
              x{{card[1]}}张
              <template #icon>
                <n-icon :component="CreditCardRegular" :color="(card[2] as string)" />
              </template>
            </n-tag>
          </template>
        </n-popconfirm>
      </n-space>
    </div>
    <n-space vertical style="margin-right: 20px;">
      <n-skeleton v-if="gemCountCom.length==0" height="20px" round></n-skeleton>
      <n-skeleton v-if="cardCountCom.length==0" height="20px" round></n-skeleton>
    </n-space>
  </div>


</template>
<script setup lang="ts">
import { Gem, CreditCardRegular } from '@vicons/fa'
import { NSelect, SelectOption, useDialog, useMessage } from 'naive-ui';
import { computed, h } from 'vue';
import { GemMap, IGem } from '../entity/Gem';
const props = defineProps({
  giveItems: {
    type: Object,
    default: {
      gems: new Map(),
      cards: new Map(),
      replaceGems: new Map(),
    }
  },
  isClick: {
    type: Boolean,
    default: false,
  },
  gemCount: {
    type: Object,
    default: []
  },
  cardCount: {
    type: Object,
    default: []
  }
})
let gemCountCom = computed(() => props.gemCount.filter((value: any[]) => {
  return value[1] > 0;
}));
let cardCountCom = computed(() => props.cardCount.filter((value: any[]) => {
  return value[1] > 0;
}));
let goldGemCountCom = computed(() => {
  let goldCountList = props.giveItems.replaceGems.values();
  let result = 0;
  for(const item of goldCountList) {
    result += item;
  }
  return result;
})
const emits = defineEmits(["callBackGiveItem"]);
const dialog = useDialog();
const message = useMessage();

function changeTing(add = true) {
  let optionsGem: SelectOption[] = [];
  let gemList = GemMap.values();
  for (const item of gemList) {
    optionsGem.push({
      label: item.name +` 已听:${props.giveItems.replaceGems.get(item.type)||"否"}`,
      value: item.type,
      class: item.color,
      disabled: add==false? !(props.giveItems.replaceGems.get(item.type)||false):false
    });
  }
  let selectDialog = dialog.info(
    {
      title: add?"请先择要听的宝石":"请选择被取消听的宝石",
      content: () => h(
        NSelect,
        {
          options: optionsGem,
          onUpdateValue: (e) => {
            emits("callBackGiveItem", e, 6, add);
            selectDialog.destroy();
            let tGem : IGem | undefined = GemMap.get(e);
            if(!tGem) return;
            if(add)
              message.info(`您听了一个${tGem.name}宝石`)
            else
              message.info(`您取消听${tGem.name}宝石一个`)
          }
        },
      ),
    }
  )
}
function addGem(type: number) {
  if (type == 6) // 金宝石
  {
    changeTing(true);
  } else {
    emits("callBackGiveItem", type, 1, true);
  }
}
function addCard(type: number) {
  emits("callBackGiveItem", type, 2, true);
}

function minusGem(type: number) {
  if (type == 6) changeTing(false)
  else emits("callBackGiveItem", type, 1, false);
}
function minusCard(type: number) {
  emits("callBackGiveItem", type, 2, false);
}

</script>