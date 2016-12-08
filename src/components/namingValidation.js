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