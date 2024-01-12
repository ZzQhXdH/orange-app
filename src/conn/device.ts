import { invoke } from "@tauri-apps/api"
import { UnlistenFn } from "@tauri-apps/api/event";
import { appWindow } from "@tauri-apps/api/window";
import { receive_handle } from "./receive";

const NOTIFY_FRAME_EVENT = "ON_SERIAL_RECEIVE";

let listenFn: UnlistenFn | null = null;

async function listen() {
    if (listenFn != null) {
        listenFn();
        listenFn = null;
    }
    listenFn = await appWindow.listen<number[]>(NOTIFY_FRAME_EVENT, (event) => {
        receive_handle(event.payload);
    });
}

listen();

export default {

    async open(name: string) {
        await invoke('conn_open', {
            name
        });
    },

    async close() {
        await invoke('conn_close');
    },

    async write(buf: number[]) {
        await invoke('conn_write', {
            buf
        });
    },

    async serial_port_name() {
        return await invoke('serial_port_name') as string[];
    },

    async is_open() {
        return await invoke('conn_is_open') as boolean;
    }
}



