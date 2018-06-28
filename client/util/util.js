/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * util.js page
 *
 * @author zhangtao
 * @date Tuesday June 26th 2018
 */
/**
 * safely get deep value in a Nested Object or Array
 * @param {object | array} target the obj or array you need to read value from
 * @param {array} propsList the propsList you read
 * @return {any} if read error, return null
 * @example getDeepValue(userList, ['group', 0, 'name'])
 */
export const getDeepValue = (target, propsList) => propsList.reduce(
  (result, prop) => ((result && result[prop]) ? result[prop] : null), target)
