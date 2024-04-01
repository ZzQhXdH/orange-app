<template>
	<div class="card m5 p10 col">
		<div class="cent_self">纸币器</div>
		<div class="row_center mt5">
			<el-button @click="onClickInit" type="primary">初始化</el-button>

			<el-input class="ml10" clearable placeholder="控制码" style="width: 80px;" v-model="ctx.pay_ctrl" />
			<el-button @click="onClickPayCtrl" type="primary" class="ml10">启用/禁用</el-button>
		</div>
		<div class="row_center">
			<BillStatus class="start_self" />
			<BillMan class="start_self" />
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
import { reactive } from 'vue';

interface Ctx {
	pay_ctrl: string,
}

const ctx = reactive<Ctx>({
	pay_ctrl: '',
});

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
		await service.payInit(1);
	});
}

async function onClickPayCtrl() {
	runAction('启用/禁用', '控制', async () => {
		if (ctx.pay_ctrl.length == 0) {
			throw '请输入控制码';
		}
		const v = parseInt(ctx.pay_ctrl, 16);
		await service.payCtrl(1, v);
	});
}


</script>
