<template>
	<div class="card m10 p10 col">
		<div style="align-self: center;">设备状态</div>
		<div class="row_center mt10">
			<label>软件版本:</label>
			<label class="ml5">{{ deviceStatus.version }}</label>
		</div>
		<div class="row_center mt5">
			<label>硬币器:</label>
			<label class="ml5">{{ deviceStatus.coinStatus }}</label>
		</div>
		<div class="row_center mt5">
			<label>纸币器:</label>
			<label class="ml5">{{ deviceStatus.billStatus }}</label>
		</div>
	</div>
</template>

<script setup lang="ts">

import { deviceStatus } from '../conn/status';



</script>
