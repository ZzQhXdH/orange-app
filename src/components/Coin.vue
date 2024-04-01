<template>
  <div class="card col p10 m5">
    <div class="cent_self">硬币器</div>
    <div class="row_center mt5">
      <el-input placeholder="退款金额" clearable style="width: 80px;" v-model="ctx.payout_value" />
      <el-button type="warning" @click="onClickPayout" class="ml10">退款</el-button>

      <el-input class="ml10" clearable placeholder="控制码" style="width: 80px;" v-model="ctx.pay_ctrl" />
      <el-button @click="onClickPayCtrl" type="primary" class="ml10">启用/禁用</el-button>
    </div>
    <div class="row_center mt5">

    </div>
    <div class="row_center mt5">
      <el-button type="primary" @click="onClickInit">初始化</el-button>
    </div>
    <div class="row">
      <CoinStatus />
      <CoinMan />
    </div>

  </div>
</template>

<script setup lang="ts">

import CoinStatus from './part/CoinStatus.vue';
import CoinMan from './part/CoinMan.vue';
import { reactive } from 'vue';
import { runAction } from '../utils/dialog';
import service from '../conn/service';

interface Ctx {
  payout_value: string,
  pay_ctrl: string,
}

const ctx = reactive<Ctx>({
  payout_value: '',
  pay_ctrl: '',
});

async function onClickPayout() {
  runAction('退款', '退款中', async () => {
    if (ctx.payout_value.length == 0) {
      throw '请输入退款金额';
    }
    const v = parseInt(ctx.payout_value);
    const out = await service.coinPayout(v);
    if (out != v) {
      throw `退款异常:退款${out}`;
    }
  });
}

async function onClickPayCtrl() {
  runAction('启用/禁用', '控制', async () => {
    if (ctx.pay_ctrl.length == 0) {
      throw '请输入控制码';
    }
    const v = parseInt(ctx.pay_ctrl, 16);
    await service.payCtrl(0, v);
  });
}

async function onClickInit() {
  runAction('硬币器', "初始化", async () => {
    await service.payInit(0);
  });
}

</script>
