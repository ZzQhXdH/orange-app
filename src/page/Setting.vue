<template>
  <div class="col">
    <div class="row">
      <SerialPort class="start_self" />
      <Status class="start_self" />
    </div>
    <div class="row">
      <OTA />
      
    </div>
    <div class="row card m5 p10" data-tauri-drag-region style="height: 60px;">

    </div>
    <div class="row">
      <div class="col p5">
        <el-button type="primary" @click="onClickFull">全屏</el-button>
        <el-button type="primary" class="mt5" @click="onClickNormal">退出全屏</el-button>
      </div>
      <VideoTest />
    </div>
  </div>
</template>

<script setup lang="ts">

import SerialPort from '../components/SerialPort.vue';
import Status from '../components/Status.vue';
import OTA from '../components/OTA.vue';
import { appWindow } from '@tauri-apps/api/window';
import VideoTest from '../components/VideoTest.vue';


async function onClickFull() {
  await appWindow.setFullscreen(true);
}

async function onClickNormal() {
  await appWindow.setFullscreen(false);
}

</script>
