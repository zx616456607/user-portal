/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for personalized
 *
 * v0.1 - 2017-05-19
 * @author Baiyu
 */


export const SET_BACK_COLOR = 'SET_BACK_COLOR'

export function setBackColor(types) {
  return {
    type:SET_BACK_COLOR,
    types
  }
}
