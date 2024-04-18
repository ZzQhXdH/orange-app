<template>

  <div class="root-app" style="width: 100%; height: 100%;"
      @mousedown="onMouseDown" @touchstart="onMouseDown"
      @mousemove="onMouseMove" @touchmove="onMouseMove"
      @mouseup="onMouseUp" @touchend="onMouseUp"
    >

    <div class="row">

      <el-menu style="flex-grow: 1; height: 50px;" router mode="horizontal" default_active="/">
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
import { set_position_offset } from "./conn/win";

let pressedFlag = false;
let pressedPos = {
  x: 0,
  y: 0,
};

function onMouseDown(e: MouseEvent | TouchEvent) {
  pressedFlag = true;
  if (e instanceof MouseEvent) {
    pressedPos.x = e.clientX;
    pressedPos.y = e.clientY;
  } else {
    pressedPos.x = e.touches[0].clientX;
    pressedPos.y = e.touches[0].clientY;
  }
}

function onMouseUp() {
  pressedFlag = false;
}

async function onMouseMove(e: MouseEvent | TouchEvent) {
  if (!pressedFlag) {
    return;
  }
  e.preventDefault();
  let obj = {
    x: 0,
    y: 0,
  };
  if (e instanceof MouseEvent) {
    obj.x = e.clientX - pressedPos.x;
    obj.y = e.clientY - pressedPos.y;
   // console.log(e.screenX, e.screenY);
  } else {
    obj.x = Math.floor(e.touches[0].clientX - pressedPos.x);
    obj.y = Math.floor(e.touches[0].clientY - pressedPos.y);
  }
  if ((obj.x * obj.x + obj.y * obj.y) < 400) {
    return;
  }
 // await tauriWindow.appWindow.setPosition(new PhysicalPosition(obj.x, obj.y));
  await set_position_offset(obj);
}

async function onClose() {
  await tauriWindow.appWindow.close();
}



</script>

<style></style>
