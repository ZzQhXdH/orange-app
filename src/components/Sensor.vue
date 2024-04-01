<template>
    <div class="card col p10">
        <label>传感器状态</label>
        <div class="row">
            <SensorState name="测试" :value="false" />
        </div>
        

    </div>
</template>

<script setup lang="ts">

import SensorState from './part/SensorState.vue';



</script>
