import { ref } from 'vue';
import { ByteArray, ByteView, Uint16, Uint8 } from './codec.ts';
import { NotiftyFrame } from './proto.ts';
import { parseUtf8, toHex } from '../utils/util.ts';

const HEX_LIST = [
  '0', '1', '2', '3',
  '4', '5', '6', '7',
  '8', '9', 'A', 'B',
  'C', 'D', 'E', 'F'
];

function toHex4(n: number) {
  const h4 = HEX_LIST[(n >> 12) & 0x0F];
  const h3 = HEX_LIST[(n >> 8) & 0x0F];
  const h2 = HEX_LIST[(n >> 4) & 0x0F];
  const h1 = HEX_LIST[n & 0x0F];
  return `${h4}${h3}${h2}${h1}`;
}

class DeviceStatus {

  version: string = '';

  constructor(frame: NotiftyFrame | null = null) {
    if (frame == null) {
      return;
    }
    const version = new Uint16();

    frame.parse(version);

    this.version = toHex4(version.value);
  }
};

export const deviceStatus = ref<DeviceStatus>(new DeviceStatus());

export function parseStatus(frame: NotiftyFrame) {
  deviceStatus.value = new DeviceStatus(frame);
  //console.log(deviceStatus.value);
}

export function parseLog(frame: NotiftyFrame) {
  const bw = new ByteView();
  frame.parse(bw);
  console.log(`log:${bw.toString()}`);
}

export class CoinIdentificationResp {

  manufacturerCode = new ByteArray(3);
  serialNumber = new ByteArray(12);
  model = new ByteArray(12);
  version = new ByteArray(2);
  optionFeatures = new ByteArray(4);

  getManfacturerCode() {
    const buf = this.manufacturerCode.buf;
    return parseUtf8(buf, 0, buf.length);
  }

  getSerialNumber() {
    const buf = this.serialNumber.buf;
    return parseUtf8(buf, 0, buf.length);
  }

  getModel() {
    const buf = this.model.buf;
    return parseUtf8(buf, 0, buf.length);
  }

  getVersion() {
    const buf = this.version.buf;
    return toHex(buf, 0, buf.length);
  }

}

export class CoinStatusResp {

  tubeFullStatus = new Uint16();
  tubeStatus = new ByteArray(16);

  toString() {
    let s = `full:${this.tubeFullStatus.value} `;
    for (let i = 0; i < 16; i++) {
      s += `status: ${i} ${this.tubeStatus.buf[i]} `
    }
    return s;
  }
}

export class CoinSetupResp {

  featureLevel = new Uint8();
  countryCode = new ByteArray(2);
  coinScalingFactor = new Uint8();
  decimalPlaces = new Uint8();
  coinTypeRouting = new Uint16();
  coinTypeCredit = new ByteArray(16);

  getCountryCode() {
    const buf = this.countryCode.buf;
    return toHex(buf, 0, buf.length);
  }
}

export interface CoinInfo {
  value: number; // 面值
  count: number; // 个数
}

export interface CoinPriceInfo {
  value: number; // 总金额
  infos: CoinInfo[]
}

export function calcCoinInfo(setup: CoinSetupResp, status: CoinStatusResp) {
  const infos: CoinInfo[] = [];
  let all = 0;
  const route = setup.coinTypeRouting.value;
  for (let i = 0; i < 16; i ++) {
    const mask = 0x01 << i;
    if ((route & mask) == 0) {
      continue;
    }
    const value = setup.coinScalingFactor.value * setup.coinTypeCredit.buf[i];
    const count = status.tubeStatus.buf[i];
    infos.push({
      value,
      count
    });
    all += value * count;
  }
  const price: CoinPriceInfo = {
    value: all,
    infos
  }
  return price;
}

export class BillSetupResp {

  featureLevel = new Uint8()
  countryCode = new ByteArray(2)
  scalingFactor = new Uint16()
  decimal = new Uint8()
  stacker = new Uint16()
  securityLevel = new Uint16()
  escrow = new Uint8()
  credit = new ByteArray(16);

  getCountryCode() {
    const buf = this.countryCode.buf;
    return toHex(buf, 0, buf.length);
  }

  getType() {
    let s = [];
    for (let i = 0; i < 16; i ++) {
      const v = this.credit.buf[i];
      if (v != 0) {
        s.push(v * this.scalingFactor.value);
      }
    }
    return s;
  }
}

export class BillIdentificationResp {

  manufacturerCode = new ByteArray(3);
  serialNumber = new ByteArray(12);
  model = new ByteArray(12);
  version = new ByteArray(2);
  optionFeatures = new ByteArray(4);

  getManfacturerCode() {
    const buf = this.manufacturerCode.buf;
    return parseUtf8(buf, 0, buf.length);
  }

  getSerialNumber() {
    const buf = this.serialNumber.buf;
    return parseUtf8(buf, 0, buf.length);
  }

  getModel() {
    const buf = this.model.buf;
    return parseUtf8(buf, 0, buf.length);
  }

  getVersion() {
    const buf = this.version.buf;
    return toHex(buf, 0, buf.length);
  }

}