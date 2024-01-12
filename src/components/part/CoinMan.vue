<template>
	<div class="m10">
		<div class="row_center" style="align-self: center;">
			<label>制作商信息</label>
			<el-button class="ml5" type="primary" @click="onClickQuery">查询</el-button>
		</div>
		
		<div class="row_center">
			<label>制造商:</label>
			<label>{{ id?.getManfacturerCode() }}</label>
		</div>
		<div class="row_center mt5">
			<label>序列号:</label>
			<label>{{ id?.getSerialNumber() }}</label>
		</div>
		<div class="row_center mt5">
			<label>Model:</label>
			<label>{{ id?.getModel() }}</label>
		</div>
		<div class="row_center mt5">
			<label>版本:</label>
			<label>{{ id?.getVersion() }}</label>
		</div>
	</div>
</template>

<script setup lang="ts">

import { ref } from 'vue'
import { CoinIdentificationResp } from '../../conn/status';
import { runAction } from '../../utils/dialog';
import service from '../../conn/service';

const id = ref<CoinIdentificationResp>();

async function onClickQuery() {
	runAction('查询', '查询制造商信息', async () => {
		id.value = await service.coinId();
	});
}

</script>
