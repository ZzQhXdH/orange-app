import { DeviceProtoType, Uint16, Uint8, encode_u16, encode_u8 } from "./codec";
import device from "./device";
import { proto_type, setWaitPromise } from "./receive";
import { TaskInfo } from "./proto";
import { TimeoutError } from "./error";
import { BillIdentificationResp, BillSetupResp, CoinIdentificationResp, CoinSetupResp, CoinStatusResp } from "./status";

export module proto {

	export const HEAD = 0xE11E;
	export const END = 0xEF;

	export const STATUS = 0x00;
	export const LOG = 0x01;
	export const GET_TASK_INFO = 0x02;
	export const OTA_START = 0x03;
	export const OTA_TRANSLATE = 0x04;
	export const OTA_COMPLETE = 0x05;
	export const COIN_PAYOUT = 0x06;
	export const PAYL_CTRL = 0x07;
	export const COIN_INFO = 0x08;
	export const COIN_STATUS = 0x09;
	export const COIN_ID = 0x0A;
	export const BILL_INFO = 0x0B;
	export const BILL_ID = 0x0C;

	export const COIN_PAYIN = 0x0D;
	export const BILL_PAYIN = 0x0E;
	export const BILL_CTRL = 0x0F;

	export const PAY_INIT = 0x10;

	export const PICK_CTRL = 0x11;
}

let defaultSeq = 0;

function getSeq() {
	if (defaultSeq > 255) {
		defaultSeq = 0;
	}
	const seq = defaultSeq;
	defaultSeq++;
	return seq;
}

function makeProto(...args: DeviceProtoType[]) {
	let len = 0;
	for (const arg of args) {
		len += arg.size();
	}
	len += 5;
	const buf = new Array<number>(len);
	encode_u16(buf, 0, proto.HEAD);
	encode_u8(buf, 2, len);
	let index = 3;
	for (const arg of args) {
		arg.encode(buf, index);
		index += arg.size();
	}
	let s = 0;
	for (let i = 3; i < index; i++) {
		s = s ^ buf[i];
	}
	encode_u8(buf, index, s);
	encode_u8(buf, index + 1, proto.END);
	return buf;
}

async function simpleReq(seq: number, cmd: number, ...args: DeviceProtoType[]) {
	const buf = makeProto(new Uint8(proto_type.SIMPLE_REQ), new Uint8(seq), new Uint8(cmd), ...args);
	const fut = setWaitPromise(proto_type.SIMPLE_RES, seq, 500);
	await device.write(buf);
	const res = await fut;
	if ((res.seq != seq) || (res.cmd != cmd)) {
		throw `seq or cmd invalid`;
	}
	return res;
}

async function getTaskInfo(): Promise<TaskInfo> {
	const frame = await simpleReq(getSeq(), proto.GET_TASK_INFO);
	const seq = new Uint8();
	const cmd = new Uint8();
	frame.parse(seq, cmd);
	return {
		cmd: cmd.value,
		seq: seq.value
	};
}

async function session() {
	const seq = getSeq();
	const buf = makeProto(new Uint8(proto_type.SESSION), new Uint8(seq));
	const fut = setWaitPromise(proto_type.ACK, seq);
	await device.write(buf);
	const ack = await fut;
	if (ack.seq != seq) {
		throw `session seq invalid`;
	}
}

async function session3() {
	let err: any = null;
	for (let i = 0; i < 3; i++) {
		try {
			await session();
			return;
		} catch (e) {
			err = e;
		}
	}
	throw err;
}

async function write_ack(seq: number) {
	const buf = makeProto(new Uint8(proto_type.ACK), new Uint8(seq));
	await device.write(buf);
}

async function res3(seq: number, buf: number[]) {
	let err: any = null;
	for (let i = 0; i < 3; i++) {
		try {
			let ackFut = setWaitPromise(proto_type.ACK, seq);
			await device.write(buf);
			const ack = await ackFut;
			if (ack.seq != seq) {
				throw `ack seq invalid ${ack.seq} - ${seq}`;
			}
			return;
		} catch (e) {
			if (!(e instanceof TimeoutError)) {
				throw e;
			}
			err = e;
		}
	}
	throw err;
}

async function req(seq: number, cmd: number, ...args: DeviceProtoType[]) {
	await session3();

	const buf = makeProto(new Uint8(proto_type.REQ), new Uint8(seq), new Uint8(cmd), ...args);
	let resFut = setWaitPromise(proto_type.RES, seq, 3000);
	await res3(seq, buf);

	for (; ;) {

		try {
			const frame = await resFut;
			await write_ack(seq);
			return frame;
		} catch (e) {
			if (e instanceof TimeoutError) {
				console.log('res 超时');

				resFut = setWaitPromise(proto_type.RES, seq, 3000);
				const taskInfo = await getTaskInfo();
				console.log(taskInfo);

				if ((taskInfo.seq != seq) || (taskInfo.cmd != cmd)) {
					const frame = await resFut;
					await write_ack(seq);
					return frame;
				}
			} else {
				throw e;
			}
		}
	}
}

export default {

	async ack(seq: number) {
		await write_ack(seq);
	},

	async ping() {
		const seq = getSeq();
		const buf = makeProto(new Uint8(proto_type.PING), new Uint8(seq));
		const fut = setWaitPromise(proto_type.PONG, seq);
		await device.write(buf);
		const pong = await fut;
		if (seq != pong.seq) {
			throw 'pong seq invalid';
		}
	},

	async coinPayout(value: number) {
		const frame = await req(getSeq(), proto.COIN_PAYOUT, new Uint16(value));
		frame.assert();
		const ec = new Uint8();
		const v = new Uint16();
		frame.parse(ec, v);
		return v.value;
	},

	async coinInfo() {
		const frame = await req(getSeq(), proto.COIN_INFO);
		frame.assert();
		const ec = new Uint8();
		const resp = new CoinSetupResp();
		frame.parse(ec,
			resp.featureLevel,
			resp.countryCode,
			resp.coinScalingFactor,
			resp.decimalPlaces,
			resp.coinTypeRouting,
			resp.coinTypeCredit
		);
		return resp;
	},

	async coinStatus() {
		const frame = await req(getSeq(), proto.COIN_STATUS);
		frame.assert();
		const ec = new Uint8();
		const resp = new CoinStatusResp();
		frame.parse(ec,
			resp.tubeFullStatus,
			resp.tubeStatus
		);
		return resp;
	},

	async coinId() {
		const frame = await req(getSeq(), proto.COIN_ID);
		frame.assert();
		const ec = new Uint8();
		const resp = new CoinIdentificationResp();
		frame.parse(
			ec,
			resp.manufacturerCode,
			resp.serialNumber,
			resp.model,
			resp.version,
			resp.optionFeatures
		);
		return resp;
	},

	async billInfo() {
		const frame = await req(getSeq(), proto.BILL_INFO);
		frame.assert();
		const ec = new Uint8();
		const resp = new BillSetupResp();
		frame.parse(
			ec,
			resp.featureLevel,
			resp.countryCode,
			resp.scalingFactor,
			resp.decimal,
			resp.stacker,
			resp.securityLevel,
			resp.escrow,
			resp.credit
		);
		return resp;
	},

	async builId() {
		const frame = await req(getSeq(), proto.BILL_ID);
		frame.assert();
		const ec = new Uint8();
		const resp = new BillIdentificationResp();
		frame.parse(
			ec,
			resp.manufacturerCode,
			resp.serialNumber,
			resp.model,
			resp.version,
			resp.optionFeatures
		);
		return resp;
	},

	async payCtrl(id: number, mask: number) {
		const frame = await req(getSeq(), proto.PAYL_CTRL, new Uint8(id), new Uint16(mask));
		frame.assert();
	},

	async billCtrl(v: number) { // 0 退还  1: 接收
		const frame = await req(getSeq(), proto.BILL_CTRL, new Uint8(v));
		frame.assert();
	},

	// id: 0硬币器 1纸币器 2VPOS
	async payInit(id: number) {
		const frame = await req(getSeq(), proto.PAY_INIT, new Uint8(id));
		frame.assert();
	},

	async pickDoorCtrl(ctrl: number) {
		const frame = await req(getSeq(), proto.PICK_CTRL, new Uint8(ctrl));
		frame.assert();
	}
}


