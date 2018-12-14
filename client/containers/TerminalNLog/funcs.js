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

export {
  b64_to_utf8,
  utf8_to_b64,
}
