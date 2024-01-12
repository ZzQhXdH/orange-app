
export abstract class Error {
    abstract msg: string;
}

export class TimeoutError extends Error {
    msg: string;

    constructor(msg: string) {
        super();
        this.msg = msg;
    }
}

export function errMsg(ec: number) {
    switch (ec) {
        case 0: return '正常';
        case 1: return '参数无效';
        case 2: return '解析参数错误';
        case 3: return 'FLASH错误';
        case 4: return 'STORE错误';
        case 5: return 'OTA ID错误';
        case 6: return 'OTA MD5错误';
        case 7: return 'OTA PKG超时';
        case 8: return '取物门超时';
        case 9: return 'MDB超时'; 
        case 0x0A: return 'MDB无效的返回';
        case 0x0B: return 'MDB退款错误'; 
        default: return `未知错误:${ec}`;
    }
}

export class ExecError extends Error {

    msg: string;
    constructor(ec: number) {
        super();
        this.msg = errMsg(ec);
    }
}