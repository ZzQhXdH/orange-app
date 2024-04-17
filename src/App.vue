<template>

  <div class="root-app" @mousemove="onMouseMove" @mousedown="onMouseDown" style="width: 100%; height: 100%;">

    <div class="row">

      <el-menu style="flex-grow: 1; height: 50px;" router mode="horizontal" default_active="/" >
      <el-menu-item index="/">设置</el-menu-item>
      <el-menu-item index="/mdb">MDB调试</el-menu-item>
      <el-menu-item index="/motor">电机测试</el-menu-item>
    </el-menu>

    <el-button @click="onClose" type="info" :icon="CloseBold" circle></el-button>
    </div>

    <RouterView v-slot="{ Component }">
      <KeepAlive>
        <component :is="Component" />
      </KeepAlive>
    </RouterView>

  </div>



</template>

<script setup lang="ts">

import { window as tauriWindow } from "@tauri-apps/api";
import { CloseBold } from '@element-plus/icons-vue'
// ...

let pressedFlag = false;

async function onMouseDown() {
  pressedFlag = true;
}

async function onMouseMove() {
  if (!pressedFlag) {
    return;
  }
  pressedFlag = false;
  await tauriWindow.appWindow.startDragging();
}

async function onClose() {
  await tauriWindow.appWindow.close();
}

</script>

<style></style>
