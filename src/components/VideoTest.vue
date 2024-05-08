<template>
    <div class="row col m5">
        <video ref="videoEle" autoplay @ended="onPlayEnd" class="my-video"></video>
        <div class="row p10">
            <el-button @click="onClickOpen">打开视频</el-button>
            <el-button @click="testhtttp">测试http</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">

import { dialog } from '@tauri-apps/api';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { onActivated, ref } from 'vue';
import { runAction } from '../utils/dialog';
import { delay } from '../utils/util';

const videoEle = ref<HTMLVideoElement|null>(null);
let videoPaths: string[] = [];
let playIndex = 0;

onActivated(() => {
    if (videoPaths.length != 0) {
        playNext();
    }
});

async function onPlayEnd() {
    console.log('播放完成', new Date());
    await playNext();
}

async function playNext() {
    if (playIndex >= videoPaths.length) {
        playIndex = 0;
    }
    const path = videoPaths[playIndex];
    playIndex ++;

    const video = videoEle.value as HTMLVideoElement;
    const path2 = convertFileSrc(path);
    console.log(path, path2);
    video.src = path2; //convertFileSrc(path);
    await video.play();
}

async function onClickOpen() {
    const path = await dialog.open({
        multiple: true,
    }) as string[];
    if (path == null) {
        return;
    }
    videoPaths = path;
    if (videoPaths.length == 0) {
        return;
    }
    playIndex = 0;
    await playNext();
}

async function testhtttp() {
    runAction('http', '测试', async (d) => {
        const resp = await fetch('https://www.baidu.com');
        const text = await resp.text();
        d.setMsg(text);
        await delay(1000);
    });

}


</script>

<style>


.my-video {
    width: 320px;
    height: 200px;
    box-shadow: 0px 0px 5px #ccc;
    border-radius: 15px;
    object-fit: fill;
    outline: 1px solid white;
    outline-offset: -1px;
}

</style>

