import { tauri } from "@tauri-apps/api";

export interface Pos {
    x: number,
    y: number,
}

export async function set_position_offset(pos: Pos) {
    await tauri.invoke('set_position_offset', {
        pos
    });
}

