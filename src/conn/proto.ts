import { DeviceProtoType } from "./codec";
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

    parse_res(...args: DeviceProtoType[]) {
        // type seq cmd err
        const ec = this.buf[3];
        if (ec != 0) {
            throw new ExecError(ec);
        }
        let index = 4;
        for (const arg of args) {
            arg.decode(this.buf, index);
            index += arg.size();
        }
    }
}

export interface TaskInfo {
    seq: number;
    cmd: number;
}
