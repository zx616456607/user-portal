/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux actions
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { getCookie, setCookie } from '../common/tools'
import { USER_CURRENT_CONFIG } from '../../constants'

export const RESET_ERROR_MESSAGE = 'RESET_ERROR_MESSAGE'
// Resets the currently visible error message.
export function resetErrorMessage() {
  return {
    type: RESET_ERROR_MESSAGE
  }
}

export const SET_CURRENT = 'SET_CURRENT'
// Resets the currently visible error message.
export function setCurrent(current) {
  const config = getCookie(USER_CURRENT_CONFIG)
  let [teamID, spaceID, clusterID] = config.split(',')
  if (current.team) {
    teamID = current.team.teamID
  }
  if (current.space) {
    spaceID = current.space.spaceID
  }
  if (current.cluster) {
    clusterID = current.cluster.clusterID
  }
  setCookie(USER_CURRENT_CONFIG, `${teamID},${spaceID},${clusterID}`)
  return {
    current,
    type: SET_CURRENT
  }
}