/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * v0.1 - 2016/12/08
 * @author Lei
 */

/*
Validation for k8s resource, including service, deployment, ...
*/
export function validateK8sResource(name) {
  if (!name) {
    return false
  }
  if (name.length < 3 || name.length > 64) {
    return false
  }
  // TODO: not work with below syntax
  // let regx = /^[a-z0-9]+([-.~/][a-z0-9]+)*$/
  let regx = new RegExp('^[a-z][-a-z0-9]{1,61}[a-z0-9]$')
  if (!regx.test(name)) {
    return false
  }
  return true
}
/*
 * Validation for service name
 */
export function validateK8sResourceForServiceName(name) {
  if (!name) {
    return false
  }
  if (name.length < 3 || name.length > 24) {
    return false
  }
  // TODO: not work with below syntax
  // let regx = /^[a-z0-9]+([-.~/][a-z0-9]+)*$/
  let regx = new RegExp('^[a-z][-a-z0-9]{1,22}[a-z0-9]$')
  if (!regx.test(name)) {
    return false
  }
  return true
}
/*
 * Validation for service config
 */
export function validateServiceConfig(name) {
  if (!name) {
    return false
  }
  if (name.length < 3 || name.length > 63) {
    return false
  }
  // TODO: not work with below syntax
  // let regx = /^[a-z0-9]+([-.~/][a-z0-9]+)*$/
  let regx = new RegExp('^[-_.a-zA-Z0-9]{3,63}$')
  if (!regx.test(name)) {
    return false
  }
  return true
}

/*
 * Validation for config file of config group
 */
export function validateServiceConfigFile(name) {
  if (!name) {
    return false
  }
  if (name.length > 253) {
    return false
  }
  let regx = new RegExp('^\\.?[a-z0-9]([-a-z0-9]*[a-z0-9])?(\\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*')
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
 * this function for app, storage, compose file, tenxflow, repository,
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

export function volNameCheck(name, itemName) {
  if (name && name.length > 32) {
    return '不能超过32个字符'
  }
  return appNameCheck(name, itemName)
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

/**
 * this function for create app service env check
 */
export function appEnvCheck(name, itemName, existNameFlag) {
  //name for check, itemName for show, existNameFlag for show existed
  let errorMsg = '';
  //null check
  if(!name || name.length == 0) {
    errorMsg = '请输入' + itemName;
    return errorMsg;
  }
  //a-zA-Z start check
  let startCheck = new RegExp('^[A-Za-z_]{1}');
  if(!startCheck.test(name)) {
    errorMsg = '请以字母或下划线开头';
    return errorMsg;
  }
  //a-zA-Z0-9_- body check
  let bodyCheck = new RegExp('^[A-Za-z_]{1}[A-Za-z0-9_]*$');
  if(!bodyCheck.test(name)) {
    errorMsg = '由字母、数字、下划线_组成';
    return errorMsg;
  }
  //min length check
  if(name.length < 2) {
    errorMsg = '请输入2个以上字符';
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
  return 'success';
}
export function IDValide(ID) {
  if(!/^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}$/.test(ID) && !/^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(ID) ) {
    return '请输入正确的身份证号码'
  }
  if(ID.length == 15) {
    return ''
  }
  const v = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const remainder = [1, 0, 'x', 9, 8, 7, 6, 5, 4, 3, 2]
  let valide = 0
  for(var index = 0; index < 18; index ++){
    if(index == 17) {
      continue
    }
    valide += (ID[index].charCodeAt(0) - 48) * v[index]
  }
  if(remainder[valide % 11] == ID[17]) {
    return ''
  }
  return '请输入正确的身份证号码'
}
