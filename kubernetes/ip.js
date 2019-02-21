/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2019 TenxCloud. All Rights Reserved.
 */

'use strict'

// https://tech.mybuilder.com/determining-if-an-ipv4-address-is-within-a-cidr-range-in-javascript/

const ip4ToInt = ip =>
  ip.split('.').reduce((int, oct) => (int << 8) + parseInt(oct, 10), 0) >>> 0;

const isIp4InCidr = ip => cidr => {
  const [range, bits = 32] = cidr.split('/');
  const mask = ~(2 ** (32 - bits) - 1);
  return (ip4ToInt(ip) & mask) === (ip4ToInt(range) & mask);
};

const isIp4InCidrs = (ip, cidrs) => cidrs.some(isIp4InCidr(ip));

const intToIp4 = int =>
  [(int >>> 24) & 0xFF, (int >>> 16) & 0xFF,
    (int >>> 8) & 0xFF, int & 0xFF].join('.');

const calculateCidrRange = cidr => {
  const [range, bits = 32] = cidr.split('/');
  const mask = ~(2 ** (32 - bits) - 1);
  return [intToIp4(ip4ToInt(range) & mask), intToIp4(ip4ToInt(range) | ~mask)];
};

/**
 * @return {boolean}
 */
function RangeCollision(abegin, aend, bbegin, bend) {
  const abi = ip4ToInt(abegin)
  const aei = ip4ToInt(aend)
  const bbi = ip4ToInt(bbegin)
  const bei = ip4ToInt(bend)
  if (abi <= bei && abi >= bbi) {
    return true
  }
  if (aei <= bei && aei >= bbi) {
    return true
  }
  if (bbi <= aei && bbi >= abi) {
    return true
  }
  return bei <= aei && bei >= abi;
}

/**
 *
 * @return {boolean}
 */
const checkIPInRange = (value, begin, end) => {
  const valInt = ip4ToInt(value)
  const beginInt = ip4ToInt(begin)
  const endInt = ip4ToInt(end)
  if (beginInt <= valInt && valInt <= endInt) {
    return true
  }
  return false
}

/**
 * @return {boolean}
 */
function CidrCollision(a, b) {
  const [ab, ae] = calculateCidrRange(a)
  const [bb, be] = calculateCidrRange(b)
  return RangeCollision(ab, ae, bb, be)
}

export { ip4ToInt, isIp4InCidrs, checkIPInRange, CidrCollision }

function test() {
  console.log("192.168.1.0/24 and 192.168.0.0/16 should collision", CidrCollision("192.168.1.0/24", "192.168.0.0/16"))
  console.log("192.168.1.1~192.168.1.8 and 192.168.1.5~192.168.1.18 should collision", RangeCollision(
    "192.168.1.1", "192.168.1.8", "192.168.1.5", "192.168.1.18"))
  // TODO:
  // 1. 判断 begin、end，begin 比 end 小，用 ip4ToInt 把 begin、end 转成 int，然后判断 int 值大小；
  // 2. 建 ippool 时，判断界面上填的 cidr 是否跟现有的冲突，调 ippool 列取接口，把现有 ippool 都取到，然后把界面上填的 cidr 跟每个
  //    ippool 里的 cidr 用 CidrCollision 判断一下，返回 true 说明冲突了；
  // 3. 建 ipassignment 时，判断 begin、end 构成的范围，是否跟现有 ipassgnment 冲突，同理 ippool，调列取，然后把每个 ipassignment
  //    的 begin、end 跟界面上填的 begin、end 用 RangeCollision 判断一下，返回 true 说明冲突了。
}

// test()
