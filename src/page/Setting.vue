<template>
  <div class="col">
    <div class="row">
      <SerialPort class="start_self" />
      <Status class="start_self" />
    </div>
    <div class="row">
      <OTA />
    </div>
  </div>
</template>

<script setup lang="ts">

import SerialPort from '../components/SerialPort.vue';
import Status from '../components/Status.vue';
import OTA from '../components/OTA.vue';

</script>



