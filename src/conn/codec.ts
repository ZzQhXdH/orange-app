import { memcpy, parseUtf8 } from "../utils/util";

export function encode_u8(buf: number[], index: number, value: number) {
    buf[index] = value & 0xFF;
}

export function encode_u16(buf: number[], index: number, value: number) {
    buf[index] = (value >> 8) & 0xFF;
    buf[index + 1] = value & 0xFF;
}

export function encode_u32(buf: number[], index: number, value: number) {
    buf[index] = (value >> 24) & 0xFF;
    buf[index + 1] = (value >> 16) & 0xFF;
    buf[index + 2] = (value >> 8) & 0xFF;
    buf[index + 3] = value & 0xFF;
}

export interface DeviceProtoType {

    size(): number,
    encode(buf: number[], index: number): void,
    decode(buf: number[], index: number): void,
}

export class Uint8 implements DeviceProtoType {

    value: number;

    signalValue(): number {
        if ((this.value & 0x80) != 0) {
            return -(0x100 - (this.value));
        }
        return this.value;
    }

    constructor(v: number = 0) {
        this.value = v;
    }

    size(): number {
        return 1;
    }
    encode(buf: number[], index: number): void {
        buf[index] = this.value & 0xFF;
    }
    decode(buf: number[], index: number): void {
        if (index >= buf.length) {
            throw "parse uint8 out of range";
        }
        this.value = buf[index];
    }
};

export class Uint16 implements DeviceProtoType {
    value: number;

    constructor(v: number = 0) {
        this.value = v;
    }

    isSet(bit: number): boolean {
        return (this.value & (0x01 << bit)) != 0x00; 
    }

    size(): number {
        return 2;
    }
    encode(buf: number[], index: number): void {
        if ((index + 1) >= buf.length) {
            throw "parse uint16 out of range";
        }

        buf[index] = (this.value >> 8) & 0xFF;
        buf[index + 1] = this.value & 0xFF;
    }
    decode(buf: number[], index: number): void {
        this.value = (buf[index] << 8) + buf[index + 1];
    }
}

export class Uint32 implements DeviceProtoType {
    value: number;

    constructor(v: number = 0) {
        this.value = v;
    }

    size(): number {
        return 4;
    }
    encode(buf: number[], index: number): void {
        buf[index] = (this.value >> 24) & 0xFF;
        buf[index + 1] = (this.value >> 16) & 0xFF;
        buf[index + 2] = (this.value >> 8) & 0xFF;
        buf[index + 3] = this.value & 0xFF;
    }
    decode(buf: number[], index: number): void {
        if ((index + 3) >= buf.length) {
            throw "parse uint32 out of range";
        }

        this.value = (buf[index] << 24) +
            (buf[index + 1] << 16) +
            (buf[index + 2] << 8) +
            buf[index + 3];
    }
}

export class ByteArray implements DeviceProtoType {

    buf: number[]

    constructor(len: number) {
        this.buf = new Array<number>(len);
    }

    size(): number {
        return this.buf.length;
    }
    encode(buf: number[], index: number): void {
        memcpy(buf, index, this.buf, 0, this.buf.length);
    }
    decode(buf: number[], index: number): void {
        memcpy(this.buf, 0, buf, index, this.buf.length);
    }
}

export class ByteView implements DeviceProtoType {

    buf: number[] | Uint8Array;
    index: number;
    len: number;

    constructor(buf: number[] | Uint8Array = [], index: number = 0, len: number = 0) {
        this.buf = buf;
        this.index = index;
        this.len = len;
    }

    size(): number {
        return 1 + this.len;
    }

    encode(buf: number[], index: number): void {
        buf[index] = this.len & 0xFF;
        memcpy(buf, index + 1, this.buf, this.index, this.len);
    }

    decode(buf: number[], index: number): void {
        this.buf = buf;
        this.index = index + 1;
        this.len = buf[index] & 0xFF;
    }

    toString() {
        return parseUtf8(this.buf, this.index, this.len)
    }
}

