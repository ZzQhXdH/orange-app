<template>
    <div class="card col p10 m5">
        <label style="font-size: large;" class="cent_self">传感器状态</label>
        <div class="row mt5">
            <SensorState name="导流槽上" :value="deviceStatus.sensor.div_up" />
            <SensorState name="导流槽下" :value="deviceStatus.sensor.div_down" />
            <SensorState name="第一层检测" :value="deviceStatus.sensor.layer1"/>
            <SensorState name="第二层检测" :value="deviceStatus.sensor.layer2"/>
        </div>
        <div class="row">
            <SensorState name="轨道上有橙子" :value="deviceStatus.sensor.track"/>
            <SensorState name="橙子掉落" :value="deviceStatus.sensor.orange_drop"/>
            <SensorState name="移动检测" :value="deviceStatus.sensor.move_checked"/>
            <SensorState name="落杯检测" :value="deviceStatus.sensor.drop_cup_checked"/>
        </div>        
        <div class="row">
            <SensorState name="封膜检测" :value="deviceStatus.sensor.film_checked"/>
            <SensorState name="取物门关" :value="deviceStatus.sensor.pick_close"/>
            <SensorState name="门禁开关" :value="deviceStatus.sensor.door"/>
            <SensorState name="温度传感器" :value="deviceStatus.sensor.temp_ok"/>
        </div>
        <div class="row">
            <div class="card2 row_center m5 p5">
                <label>温度:</label>
                <label class="ml5" style="width: 60px;">{{ deviceStatus.temp }}℃</label>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">

import SensorState from './part/SensorState.vue';
import { deviceStatus } from '../conn/status';


</script>
