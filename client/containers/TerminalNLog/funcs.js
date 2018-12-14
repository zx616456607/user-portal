/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 * helper Functions
 *
 * @author Songsz
 * @date 2018-12-12
 *
*/

function utf8_to_b64(str) {
  return window.btoa(window.unescape(encodeURIComponent(str)));
}

function b64_to_utf8(str) {
  // For k8s only
  str = str.slice(1)
  try {
    str = decodeURIComponent(window.escape(window.atob(str)));
  } catch (error) {
    str = window.atob(str);
  }
  return str;
}
// 获取浏览器信息
function getExploreName() {
  const userAgent = navigator.userAgent
  if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
    return 'Opera'
  } else if (userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1) {
    return 'IE'
  } else if (userAgent.indexOf('Edge') > -1) {
    return 'Edge'
  } else if (userAgent.indexOf('Firefox') > -1) {
    return 'Firefox'
  } else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
    return 'Safari'
  } else if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Safari') > -1) {
    return 'Chrome'
  } else if (!!window.ActiveXObject || 'ActiveXObject' in window) {
    return 'IE>=11'
  }
  return 'Unknown'
}


export {
  b64_to_utf8,
  utf8_to_b64,
  getExploreName,
}
