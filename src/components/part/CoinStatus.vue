<template>
  <div class="col">
    <div class="row_center mt10" style="align-self: center;">
      <label>硬币信息</label>
      <el-button class="ml5" @click="onClickQuery" type="primary">查询</el-button>
    </div>
    <div class="row_center mt5">
      <label>MDB等级:</label>
      <label>{{ setup?.featureLevel.value }}</label>
      <label class="ml10">地区码:</label>
      <label>{{ setup?.getCountryCode() }}</label>
    </div>
    <div class="row_center mt5">
      <label>硬币系数:</label>
      <label>{{ setup?.coinScalingFactor.value }}</label>
      <label class="ml10">小数位:</label>
      <label>{{ setup?.decimalPlaces.value }}</label>
    </div>
    <div class="row_center mt5" v-for="(item, index) in coinStatus?.infos" :key="index">
      <label>面值:</label>
      <label>{{ item.value }}</label>
      <label class="ml10">个数:</label>
      <label>{{ item.count }}</label>
    </div>
    <div class="row_center mt5">
      <label>总金额:</label>
      <label>{{ coinStatus?.value }}</label>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref } from 'vue';
import { CoinPriceInfo, CoinSetupResp, calcCoinInfo } from '../../conn/status';
import { runAction } from '../../utils/dialog';
import service from '../../conn/service';

const setup = ref<CoinSetupResp>();
const coinStatus = ref<CoinPriceInfo>();

async function onClickQuery() {
  runAction("查询", "查询硬币信息", async () => {
    setup.value = await service.coinInfo();
    const status = await service.coinStatus();
    coinStatus.value = calcCoinInfo(setup.value, status);
  });
}

</script>
