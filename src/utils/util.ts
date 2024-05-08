
const HEX_LIST = [
    '0', '1', '2', '3',
    '4', '5', '6', '7',
    '8', '9', 'A', 'B',
    'C', 'D', 'E', 'F',
];

export async function delay(ms: number) {
    return new Promise((resolve, _) => {
        setTimeout(resolve, ms);
    });
}

export function parseUtf8(buf: number[] | Uint8Array, index: number, len: number) {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(Uint8Array.from(buf.slice(index, index + len)));
}

export function toHex(buf: number[] | Uint8Array, index: number, len: number) {
    let s = '';
    for (let i = 0; i < len; i++) {
        const v = buf[i + index];
        s += HEX_LIST[(v >> 4) & 0x0F];
        s += HEX_LIST[v & 0x0F];
    }
    return s;
}

export function memcpy(dst: number[] | Uint8Array, dst_index: number, src: number[] | Uint8Array, src_index: number, src_len: number) {
    for (let i = 0; i < src_len; i++) {
        dst[i + dst_index] = src[i + src_index];
    }
}

export function uid() {
    return crypto.getRandomValues(new Uint32Array(1))[0];
}

