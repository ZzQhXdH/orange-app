import { DeviceProtoType, Uint8 } from "./codec";
import { ExecError } from "./error";


export class RecvFrame {

    type: number;
    seq: number;
    cmd: number;
    buf: number[];

    key(): number {
        return (this.type << 8) + this.seq;
    }

    constructor(buf: number[]) {
        this.type = buf[0];
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
