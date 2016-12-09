/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * v0.1 - 2016/12/08
 * @author Lei
 */

/*
Validation for k8s resource, including ConfigMap,...
*/
export function validateK8sResource(name) {
  if (!name) {
    return false
  }
  if (name.length < 3 || name.length > 64) {
    return false
  }
  let regx = /^[a-z0-9]+([-.~/][a-z0-9]+)*$/
  if (!regx.test(name)) {
    return false
  }
  return true
}

/*
Validation for app name
*/
export function validateAppName(name) {
  if (!name) {
    return new Error('请输入应用名称')
  }
  if (name.length < 3) {
    return new Error('请输入3个以上字符')
  }
  if (name.length > 63) {
    return new Error('请输入63个以下字符')
  }
  let regx = /^[a-zA-Z0-9]+([-.~/][a-zA-Z0-9]+)*$/
  if (!regx.test(name)) {
    return new Error('可由数字、中划线、下划线组成，以字母开头，字母或者数字结尾')
  }
  return
}