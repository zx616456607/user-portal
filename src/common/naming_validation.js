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

/**
 * this function for app, compose file, tenxflow, repository, 
 * docker file, image name, image store, users, team,
 * teamspeace, integration
 */
export function appNameCheck(name, itemName, existNameFlag) {
  //name for check, itemName for show, existNameFlag for show existed
  let errorMsg = '';
  //null check
  if(!name || name.length == 0) {
    errorMsg = '请输入' + itemName;
    return errorMsg;
  }
  //a-zA-Z start check
  let startCheck = new RegExp('^[A-Za-z]{1}');
  if(!startCheck.test(name)) {
    errorMsg = '请以字母开头';
    return errorMsg;
  }
  //a-zA-Z0-9_- body check
  let bodyCheck = new RegExp('^[A-Za-z]{1}[A-Za-z0-9_-]*$');
  if(!bodyCheck.test(name)) {
    errorMsg = '由字母、数字、中划线-、下划线_组成';
    return errorMsg;
  }
  //min length check
  if(name.length < 3) {
    errorMsg = '请输入3个以上字符';
    return errorMsg;
  }
  //existName check
  if(!!existNameFlag) {
    errorMsg = itemName + '已经存在';
    return errorMsg;
  }
  //max length check
  if(name.length > 63) {
    errorMsg = '不能超过63个字符';
    return errorMsg;
  }
   //a-zA-Z0-9 end check
  let endCheck = new RegExp('^[A-Za-z]{1}[A-Za-z0-9_\-]{1,61}[A-Za-z0-9]$');
  if(!endCheck.test(name)) {
    errorMsg = '由字母或数字结尾';
    return errorMsg;
  }
  return 'success';
}
/*
 * this function for service, service config, database cluster
 */
export function serviceNameCheck(name, itemName, existNameFlag) {
  //name for check, itemName for show, existNameFlag for show existed
  let errorMsg = '';
  //null check
  if(name.length == 0 || !name) {
    errorMsg = '请输入' + itemName;
    return errorMsg;
  }
  //a-zA-Z start check
  let startCheck = new RegExp('^[a-z]{1}');
  if(!startCheck.test(name)) {
    errorMsg = '请以小写字母开头';
    return errorMsg;
  }
  //a-zA-Z0-9_- body check
  let bodyCheck = new RegExp('^[a-z]{1}[a-z0-9_-]*$');
  if(!bodyCheck.test(name)) {
    errorMsg = '由小写字母、数字、中划线-、下划线_组成';
    return errorMsg;
  }
  //min length check
  if(name.length < 3) {
    errorMsg = '请输入3个以上字符';
    return errorMsg;
  }
  //existName check
  if(!!existNameFlag) {
    errorMsg = itemName + '已经存在';
    return errorMsg;
  }
  //max length check
  if(name.length > 63) {
    errorMsg = '不能超过63个字符';
    return errorMsg;
  }
   //a-z0-9 end check
  let endCheck = new RegExp('^[a-z]{1}[a-z0-9_\-]{1,61}[a-z0-9]$');
  if(!endCheck.test(name)) {
    errorMsg = '由小写字母或数字结尾';
    return errorMsg;
  }
  return 'success';
}