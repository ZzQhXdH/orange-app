<template>
	<div class="card m5 p10 col">
		<div class="cent_self">纸币器</div>
    <div class="row_center mt5">
      <el-button @click="onClickInit" type="primary">初始化</el-button>
			<el-button @click="onClickStop" type="warning">停机</el-button>
    </div>
		<div class="row_center">
			<BillStatus class="start_self"/>
			<BillMan class="start_self"/>
		</div>
		<div class="row_center">
			<el-button @click="onClickAccept" type="primary">接收</el-button>
			<el-button @click="onClickReject" type="warning">退还</el-button>
		</div>
	</div>
	
</template>

<script setup lang="ts">

import BillStatus from './part/BillStatus.vue'
import BillMan from './part/BillMan.vue';
import { runAction } from '../utils/dialog';
import service from '../conn/service';

async function onClickAccept() {
	runAction('接收', '接收 纸币', async () => {
		await service.billCtrl(1);
	});
}

async function onClickReject() {
	runAction('退还', '退还 纸币', async () => {
		await service.billCtrl(0);
	});
}

async function onClickInit() {
  runAction('纸币器', "初始化", async () => {
    await service.payInit(1, 0);
  });
}

async function onClickStop() {
  runAction('纸币器', "停机", async () => {
    await service.payInit(1, 1);
  });
}

</script>
