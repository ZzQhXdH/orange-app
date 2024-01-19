<template>
	<div class="card m5 p10 col">
		<label class="cent_self">取物门测试</label>
		<div class="row_center mt10">
			<el-button @click="onClickOpen" type="primary">打开</el-button>
			<el-button @click="onClickClose" type="primary">关闭</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { runAction } from '../utils/dialog';
import service from '../conn/service';

async function onClickOpen() {
	runAction('取物门', '打开', async () => {
		await service.pickDoorCtrl(0);
	});
}

async function onClickClose() {
	runAction('取物门', '关闭', async () => {
		await service.pickDoorCtrl(1);
	});
}

</script>
