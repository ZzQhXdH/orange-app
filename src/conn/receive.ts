import { proto } from "./service";
import { parseLog, parseStatus } from "./status";
import { handle_notify_ack } from "./notify_ack";
import { RecvFrame } from "./proto";
import { TimeoutError } from "./error";

export module proto_type {

    export const ACK = 0;
    export const PING = 1;
    export const PONG = 2;
    export const REQ = 3;
    export const RES = 4;
    export const SESSION = 5;
    export const SIMPLE_REQ = 6;
    export const SIMPLE_RES = 7;
    export const NOTIFY = 8;
    export const NOTIFY_ACK = 9;
}

// type << 8 + seq
const promiseMap = new Map<number, (_: RecvFrame) => void>();


function handle_notify(frame: RecvFrame) {
    switch (frame.cmd) {
        case proto.STATUS: parseStatus(frame); break
        case proto.LOG: parseLog(frame); break
    }
}

export function setWaitPromise(type: number, seq: number, timeout: number = 500) {
    const key = (type << 8) + seq;
    return new Promise<RecvFrame>((resolve, reject) => {
        const id = setTimeout(() => {
            promiseMap.delete(key);
            reject( new TimeoutError(`${type} ${seq} 超时`) );
        }, timeout);
        promiseMap.set(key, (frame) => {
            clearTimeout(id);
            resolve(frame);
        });
    });
}

export function receive_handle(buf: number[]) {

    const frame = new RecvFrame(buf);

    switch (frame.type) {
        case proto_type.ACK: 
        case proto_type.PONG:
        case proto_type.SIMPLE_RES: 
        case proto_type.RES: 
            const resolve = promiseMap.get(frame.key());
            if (resolve != null) {
                promiseMap.delete(frame.key());
                resolve(frame);
            }
        break;

        case proto_type.NOTIFY: handle_notify(frame); break;
        case proto_type.NOTIFY_ACK: handle_notify_ack(frame); break;
    }
}

