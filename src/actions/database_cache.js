/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux actions for database cache
 *
 * v0.1 - 2016-10-27
 * @author GaoJian
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'

export const DATABASE_CACHE_ALL_LIST_REQUEST = 'DATABASE_CACHE_ALL_LIST_REQUEST'
export const DATABASE_CACHE_ALL_LIST_SUCCESS = 'DATABASE_CACHE_ALL_LIST_SUCCESS'
export const DATABASE_CACHE_ALL_LIST_FAILURE = 'DATABASE_CACHE_ALL_LIST_FAILURE'

export function loadDatabaseCacheAllList(clusters) {
  return {
    registry,
    [FETCH_API]: {
      types: [DATABASE_CACHE_ALL_LIST_REQUEST, DATABASE_CACHE_ALL_LIST_SUCCESS, DATABASE_CACHE_ALL_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${clusters}/dbservices`,
      schema: Schemas.REGISTRYS
    }
  }
}
