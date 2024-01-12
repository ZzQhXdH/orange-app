import { showToast } from "../utils/Popup";
import { DeviceProtoType, Uint16, Uint8 } from "./codec";
import service, { proto } from "./service";

export class NotifyAckFrame {

    seq: number;
    cmd: number;
    buf: number[];

    constructor(buf: number[]) {
        this.seq = buf[1];
        this.cmd = buf[2];
        this.buf = buf;
    }

    parse(...args: DeviceProtoType[]) {
        let index = 3; // type seq cmd
        for (const arg of args) {
            arg.decode(this.buf, index);
            index += arg.size();
        }
    }
}

export class CoinPayInInfo {

    position = new Uint8();
    type = new Uint8();
    num = new Uint8();
    all = new Uint16();
}

function onCoinPayIn(frame: NotifyAckFrame) {
    const info = new CoinPayInInfo();
    frame.parse(
        info.position,
        info.type,
        info.num,
        info.all
    );
    showToast(`投币:${info.all.value}`);
}

function onBillPayIn(frame: NotifyAckFrame) {
    const rout = new Uint8();
    const type = new Uint8();
    const all = new Uint16();
    frame.parse(rout, type, all);
    switch (rout.value) {
        case 0: showToast(`纸币存进钱箱:${all.value}`); break;
        case 1: showToast(`纸币接收:${all.value}`); break;
        case 2: showToast(`纸币退还:${all.value}`); break;
        default: showToast(`纸币分配:${rout.value} ${all.value}`); break;
    }
}

export function handle_notify_ack(frame: number[]) {
    const n = new NotifyAckFrame(frame);
    service.ack(n.seq);
    switch (n.cmd) {
        case proto.COIN_PAYIN: onCoinPayIn(n); break;
        case proto.BILL_PAYIN: onBillPayIn(n); break;
    }
}



