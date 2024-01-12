import { TimeoutError } from "./error";
import { NotiftyFrame, ResFrame, SimpleResFrame } from "./proto";
import { proto } from "./service";
import { parseLog, parseStatus } from "./status";
import { handle_notify_ack } from "./notify_ack";

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

let ackHandle = (_: number) => { }
let pongHandle = () => { }
let simpleResHandle = (_: SimpleResFrame) => { }
let resHandle = (_: ResFrame) => { }
let notifyMap = new Map<number, (_: NotiftyFrame) => void>();

function handle_ack(frame: number[]) {
    let seq = frame[1];
    ackHandle(seq);
}

function handle_pong(_: number[]) {
    pongHandle();
}

function handle_simple_res(buf: number[]) {
    let frame = new SimpleResFrame(buf);
    simpleResHandle(frame);
}

function handle_res(buf: number[]) {
    let frame = new ResFrame(buf);
    resHandle(frame);
}

function handle_notify(buf: number[]) {
    let frame = new NotiftyFrame(buf);
    let f = notifyMap.get(frame.cmd);
    if (f != null) {
        f(frame);
    }
    switch (frame.cmd) {
        case proto.STATUS: parseStatus(frame); break
        case proto.LOG: parseLog(frame); break
    }
}


export function registerNotify(cmd: number, f: (_: NotiftyFrame) => void) {
    notifyMap.set(cmd, f);
}

export function unregisterNotify(cmd: number) {
    notifyMap.delete(cmd);
}

export function setAckPromise() {
    return new Promise<number>((resolve, reject) => {
        const id = setTimeout(() => {
            reject( new TimeoutError('ACK超时') );
        }, 500);
        ackHandle = (n: number) => {
            clearTimeout(id);
            resolve(n);
        };
    });
}

export function setPongPromise() {
    return new Promise<void>((resolve, reject) => {
        const id = setTimeout(() => {
            reject( new TimeoutError("Pong超时") );
        }, 500);
        pongHandle = () => {
            clearTimeout(id);
            resolve();
        }
    });
}

export function setSimpleResPromise(timeout: number = 500) {
    return new Promise<SimpleResFrame>((resolve, reject) => {
        const id = setTimeout(() => {
            reject( new TimeoutError("simple res 超时") );
        }, timeout);
        simpleResHandle = (frame: SimpleResFrame) => {
            clearTimeout(id);
            resolve(frame);
        }
    });
}

export function setResPromise(timeout: number = 3000) {
    return new Promise<ResFrame>((resolve, reject) => {
        const id = setTimeout(() => {
            reject( new TimeoutError("res 超时") );
        }, timeout);
        resHandle = (frame: ResFrame) => {
            clearTimeout(id);
            resolve(frame);
        }
    });
}

export function receive_handle(frame: number[]) {

    let type = frame[0];

    switch (type) {
        case proto_type.ACK: handle_ack(frame); break;
        case proto_type.PONG: handle_pong(frame); break;
        case proto_type.SIMPLE_RES: handle_simple_res(frame); break;
        case proto_type.RES: handle_res(frame); break;
        case proto_type.NOTIFY: handle_notify(frame); break;
        case proto_type.NOTIFY_ACK: handle_notify_ack(frame); break;
    }
}

