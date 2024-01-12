import { DeviceProtoType, Uint8 } from "./codec";
import { ExecError } from "./error";

export class NotiftyFrame {

    cmd: number;
    buf: number[];

    constructor(buf: number[]) {
        this.cmd = buf[1];
        this.buf = buf;
    }

    parse(...args: DeviceProtoType[]) {
        let index = 2;
        for (const arg of args) {
            arg.decode(this.buf, index);
            index += arg.size();
        }
    }
}

export class SimpleResFrame {

    cmd: number;
    buf: number[];

    constructor(buf: number[]) {
        this.cmd = buf[1];
        this.buf = buf;
    }

    parse(...args: DeviceProtoType[]) {
        let index = 2;
        for (const arg of args) {
            arg.decode(this.buf, index);
            index += arg.size();
        }
    }
}

export class ResFrame {

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

    assert() {
        const err = new Uint8();
        this.parse(err);
        if (err.value != 0) {
            throw new ExecError(err.value);
        }
    }
}

export interface TaskInfo {
    seq: number;
    cmd: number;
}
