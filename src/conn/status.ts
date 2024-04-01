import { ref } from 'vue';
import { ByteArray, ByteView, Uint16, Uint8 } from './codec.ts';
import { RecvFrame } from './proto.ts';
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

function parseCoinStatus(value: number) {
  const type = (value >> 8) & 0xFF;
  const status = value & 0xFF;

  switch (type) {
    case 0: return '手动取币';
    case 1: return '投币';
    case 2: return `状态:${status}`;
    case 3: return `SLUG:${status}`;
    case 4: return `ACK`;
    case 5: return '通信异常';
    case 6: return '无法处理的数据';
    default: return '未知状态';
  }
}

function parseBillStatus(value: number) {
  const type = (value >> 8) & 0xFF;
  const status = value & 0xFF;
  switch (type) {
    case 0: return 'ACK';
    case 1: return '收取纸币';
    case 2: return `状态:${status}`;
    case 3: return '通信异常';
    default: return '未知状态';
  }
}

class SensorFlagValue {
  div_up: boolean;
  div_down: boolean;
  layer1: boolean;
  layer2: boolean;
  track: boolean;
  orange_drop: boolean;
  move_checked: boolean;
  drop_cup_checked: boolean;
  film_checked: boolean;
  pick_close: boolean;
  door: boolean;

  constructor(v: Uint16) {
    this.div_up = v.isSet(0);
    this.div_down = v.isSet(1);
    this.layer1 = v.isSet(2);
    this.layer2 = v.isSet(3);
    this.track = v.isSet(4);
    this.orange_drop = v.isSet(5);
    this.move_checked = v.isSet(6);
    this.drop_cup_checked = v.isSet(7);
    this.film_checked = v.isSet(8);
    this.pick_close = v.isSet(9);
    this.door = v.isSet(10);
  }
};

class DeviceStatus {

  version: string = '';
  coinStatus: string = '';
  billStatus: string = '';
  sensor: SensorFlagValue = new SensorFlagValue(new Uint16(0));

  constructor(frame: RecvFrame | null = null) {
    if (frame == null) {
      return;
    }
    const version = new Uint16();
    const coin = new Uint16();
    const bill = new Uint16();
    const sensorFlag = new Uint16();

    frame.parse(version, coin, bill, sensorFlag);

    this.version = toHex4(version.value);
    this.coinStatus = parseCoinStatus(coin.value);
    this.billStatus = parseBillStatus(bill.value);
    this.sensor = new SensorFlagValue(sensorFlag);
  }
};

export const deviceStatus = ref<DeviceStatus>(new DeviceStatus());

export function parseStatus(frame: RecvFrame) {
  deviceStatus.value = new DeviceStatus(frame);
  //console.log(deviceStatus.value);
}

export function parseLog(frame: RecvFrame) {
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
  for (let i = 0; i < 16; i++) {
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
    for (let i = 0; i < 16; i++) {
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