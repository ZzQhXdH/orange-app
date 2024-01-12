<template>
  <div class="card p10 m10 col">
    <div class="row_center">
      <label class="mr10">端口号:</label>
      <el-select style="width: 120px;" v-model="port" placeholder="端口号">
        <el-option v-for="(item, index) in ports" :key="index" :value="item" :label="item" />
      </el-select>
      <el-button class="ml10" @click="init" type="warning">刷新</el-button>
    </div>
    <div class="row_center mt10">
      <el-button @click="onClickOpen" type="primary">{{ btnText }}</el-button>
      <el-button @click="onClickPing" type="primary">Ping</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import device from '../conn/device';
import { showErr, runAsync, runAction } from '../utils/dialog';
import service from '../conn/service';

const ports = ref<string[]>([]);
const port = ref<string>('');
const btnText = ref<string>('打开');

async function init() {
  const names = await device.serial_port_name();
  ports.value = names;

  if (await device.is_open()) {
    btnText.value = '关闭';
  } else {
    btnText.value = '打开';
  }
  if (names.length != 0) {
    port.value = names[0];
  }
}

async function onClickOpen() {

  runAsync(async () => {
    if (await device.is_open()) {
      await device.close();
      btnText.value = '打开';
    } else {
      if (port.value.length == 0) {
        showErr('没有选择串口');
      } else {
        await device.open(port.value);
        btnText.value = '关闭';
      }
    }
  });
}

async function onClickPing() {
  runAction("Ping", "测试通信", async () => {
    await service.ping();
  });
}

init();

</script>
