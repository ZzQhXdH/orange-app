<template>
  <el-menu
    router
    mode="horizontal"
    default_active="/">
    <el-menu-item index="/">设置</el-menu-item>
    <el-menu-item index="/mdb">MDB调试</el-menu-item>
    <el-menu-item index="/motor">电机测试</el-menu-item>
  </el-menu>
  <RouterView v-slot="{ Component }">
    <KeepAlive>
      <component :is="Component" />
    </KeepAlive>
  </RouterView>
</template>

<script setup lang="ts">


</script>
