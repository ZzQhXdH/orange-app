<template>
	<div class="m5 col">
		<div class="mt5 row_center">
			<label>纸币器信息</label>
			<el-button class="ml10" @click="onClickQueryBillInfo" type="primary">查询</el-button>
		</div>
		<div class="mt5 row_center">
			<label>MDB等级:</label>
			<label>{{ setup?.featureLevel.value }}</label>
			<label class="ml10">地区码:</label>
			<label>{{ setup?.getCountryCode() }}</label>
		</div>
		<div class="mt5 row_center">
			<label>纸币系数:</label>
			<label>{{ setup?.scalingFactor?.value }}</label>
			<label class="ml10">小数位:</label>
			<label>{{ setup?.decimal.value }}</label>
		</div>
		<div class="mt5 row_center">
			<label>容量:</label>
			<label>{{ setup?.stacker.value }}</label>
		</div>
		<div class="mt5 row_center" v-for="(item, index) in setup?.getType()" :key="index">
			<label>面值:{{ item }}</label>
		</div>
	</div>
</template>

<script setup lang="ts">
import service from '../../conn/service';
import { runAction } from '../../utils/dialog';
import { ref } from 'vue';
import { BillSetupResp } from '../../conn/status';

const setup = ref<BillSetupResp>();

async function onClickQueryBillInfo() {
	runAction('查询', '查询纸币', async () => {
		setup.value = await service.billInfo();
	});
}

</script>
