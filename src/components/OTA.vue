<template>
    <div class="card col p10 m10">
        <label class="cent_self">软件更新</label>
        <div class="row mt10">
            <el-button @click="onClickOpen">打开升级bin</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { dialog, fs } from '@tauri-apps/api';
import service from '../conn/service';
import { ByteView } from '../conn/codec';
import { Md5 } from 'ts-md5';
import { Dialog, runAction } from '../utils/dialog';

async function startOTA(buf: Uint8Array, dialog: Dialog) {
    const size = buf.length;
    let id = 0;
    
    await service.otaStart(size);
    for (let index = 0; index < size; ) {
        let n = size - index;
        if (n > 200) {
            n = 200;
        }
        const bw = new ByteView(buf, index, n);
        await service.otaTranslate(id, bw);
        index += n;
        id += 1;
        const prog = Math.floor(index * 100 / size)
        dialog.setMsg(`进度:${prog}%`);
    }
    const md5 = new Md5();
    md5.appendByteArray(buf);
    const m = md5.end(true);
    const m5 = new Uint8Array((m as Int32Array).buffer);
    await service.otaComplete(new ByteView(m5, 0, m5.length));
}

async function onClickOpen() {

    const path = await dialog.open({
        title: '选择更新文件',
        filters: [{ extensions: ['bin'], name: '' }],
        multiple: false,
    });
    if (path == null) {
        return;
    }
    const buf = await fs.readBinaryFile(path as string);
    await runAction('升级', '软件升级中', async (it) => {
        await startOTA(buf, it);
    });
    
}


</script>
