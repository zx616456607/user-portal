/**
 * Redux actions for VM wrap
 *
 * v0.1 - 2017-11-15
 * @author houxz
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'


export const APP_STORE_LIST_REQUEST = 'APP_STORE_LIST_REQUEST'
export const APP_STORE_LIST_SUCCESS = 'APP_STORE_LIST_SUCCESS'
export const APP_STORE_LIST_FAILURE = 'APP_STORE_LIST_FAILURE'

// Fetches wechat auth qr code from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchAppsList(query, callback) {
  let endpoint = `${API_URL_PREFIX}/app-store/apps`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [APP_STORE_LIST_REQUEST, APP_STORE_LIST_SUCCESS, APP_STORE_LIST_FAILURE],
      endpoint,
      schema: {}
    },
    callback,
  }
}

// Fetches wechat auth qr code from API
// Relies on Redux Thunk middleware.
export function getAppsList(query, callback) {
  return (dispatch) => {
    return dispatch(fetchAppsList(query, callback))
  }
}

export const APP_STORE_HOT_LIST_REQUEST = 'APP_STORE_HOT_LIST_REQUEST'
export const APP_STORE_HOT_LIST_SUCCESS = 'APP_STORE_HOT_LIST_SUCCESS'
export const APP_STORE_HOT_LIST_FAILURE = 'APP_STORE_HOT_LIST_FAILURE'

// Fetches wechat auth qr code from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchAppsHotList(callback) {
  let query = {
    from: 0,
    size: 10,
    filter: `type,2,publish_status,2`,
    download_times: 'd'
  }
  let endpoint = `${API_URL_PREFIX}/app-store/apps`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [APP_STORE_HOT_LIST_REQUEST, APP_STORE_HOT_LIST_SUCCESS, APP_STORE_HOT_LIST_FAILURE],
      endpoint,
      schema: {}
    },
    callback,
  }
}

// Fetches wechat auth qr code from API
// Relies on Redux Thunk middleware.
export function getAppsHotList(callback) {
  return (dispatch) => {
    return dispatch(fetchAppsHotList(callback))
  }
}

export const APP_STORE_APPROVAL_REQUEST = 'APP_STORE_APPROVAL_REQUEST'
export const APP_STORE_APPROVAL_SUCCESS = 'APP_STORE_APPROVAL_SUCCESS'
export const APP_STORE_APPROVAL_FAILURE = 'APP_STORE_APPROVAL_FAILURE'

function fetchAppStoreApprove(body, callback) {
  let endpoint = `${API_URL_PREFIX}/app-store/apps/approval`
  return {
    [FETCH_API]: {
      types: [APP_STORE_APPROVAL_REQUEST, APP_STORE_APPROVAL_SUCCESS, APP_STORE_APPROVAL_FAILURE],
      endpoint,
      options: {
        method: 'PUT',
        body: body,
      },
      schema: {}
    },
    callback,
  }
}

export function appStoreApprove(body,callback) {
  return (dispatch) => {
    return dispatch(fetchAppStoreApprove(body,callback))
  }
}

export const IMAGE_APPROVAL_LIST_REQUEST = 'IMAGE_APPROVAL_LIST_REQUEST'
export const IMAGE_APPROVAL_LIST_SUCCESS = 'IMAGE_APPROVAL_LIST_SUCCESS'
export const IMAGE_APPROVAL_LIST_FAILURE = 'IMAGE_APPROVAL_LIST_FAILURE'

function fetImageApprovalList(query, callback) {
  let endpoint = `${API_URL_PREFIX}/app-store/apps/approval`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [IMAGE_APPROVAL_LIST_REQUEST,IMAGE_APPROVAL_LIST_SUCCESS,IMAGE_APPROVAL_LIST_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

export function imageApprovalList(query, callback) {
  return dispatch => dispatch(fetImageApprovalList(query, callback))
}

export const CHECK_APP_NAME_EXIST_REQUEST = 'CHECK_APP_NAME_EXIST_REQUEST'
export const CHECK_APP_NAME_EXIST_SUCCESS = 'CHECK_APP_NAME_EXIST_SUCCESS'
export const CHECK_APP_NAME_EXIST_FAILURE = 'CHECK_APP_NAME_EXIST_FAILURE'

// Fetches wechat auth qr code from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchCheckAppNameExists(name, callback) {
  let endpoint = `${API_URL_PREFIX}/app-store/apps/${name}/existence`
  return {
    [FETCH_API]: {
      types: [CHECK_APP_NAME_EXIST_REQUEST, CHECK_APP_NAME_EXIST_SUCCESS, CHECK_APP_NAME_EXIST_FAILURE],
      endpoint,
      schema: {}
    },
    callback,
  }
}

// Fetches wechat auth qr code from API
// Relies on Redux Thunk middleware.
export function checkAppNameExists(name, callback) {
  return (dispatch) => {
    return dispatch(fetchCheckAppNameExists(name, callback))
  }
}



export const APP_IMAGE_PUBLISH_REQUEST = 'APP_IMAGE_PUBLISH_REQUEST'
export const APP_IMAGE_PUBLISH_SUCCESS = 'APP_IMAGE_PUBLISH_SUCCESS'
export const APP_IMAGE_PUBLISH_FAILURE = 'APP_IMAGE_PUBLISH_FAILURE'

function fetchAppStoreImagePublish(body, callback) {
  let endpoint = `${API_URL_PREFIX}/app-store/apps/images/publishment`
  return {
    [FETCH_API]: {
      types: [APP_IMAGE_PUBLISH_REQUEST, APP_IMAGE_PUBLISH_SUCCESS, APP_IMAGE_PUBLISH_FAILURE],
      endpoint,
      options: {
        method: 'POST',
        body: body,
      },
      schema: {}
    },
    callback,
  }
}

export function imagePublish(body,callback) {
  return (dispatch) => {
    return dispatch(fetchAppStoreImagePublish(body,callback))
  }
}



export const APP_IMAGE_MANAGE_REQUEST = 'APP_IMAGE_MANAGE_REQUEST'
export const APP_IMAGE_MANAGE_SUCCESS = 'APP_IMAGE_MANAGE_SUCCESS'
export const APP_IMAGE_MANAGE_FAILURE = 'APP_IMAGE_MANAGE_FAILURE'

function fetchAppImageManage(body, callback) {
  let endpoint = `${API_URL_PREFIX}/app-store/apps/images/management`
  return {
    [FETCH_API]: {
      types: [APP_IMAGE_MANAGE_REQUEST, APP_IMAGE_MANAGE_SUCCESS, APP_IMAGE_MANAGE_FAILURE],
      endpoint,
      options: {
        method: 'PUT',
        body: body,
      },
      schema: {}
    },
    callback,
  }
}

export function imageManage(body,callback) {
  return (dispatch) => {
    return dispatch(fetchAppImageManage(body,callback))
  }
}


export const APP_IMAGE_STATUS_REQUEST = 'APP_IMAGE_STATUS_REQUEST'
export const APP_IMAGE_STATUS_SUCCESS = 'APP_IMAGE_STATUS_SUCCESS'
export const APP_IMAGE_STATUS_FAILURE = 'APP_IMAGE_STATUS_FAILURE'

function fetchAppImageStatus(body, callback) {
  let endpoint = `${API_URL_PREFIX}/app-store/apps/images/status`
  return {
    [FETCH_API]: {
      types: [APP_IMAGE_STATUS_REQUEST, APP_IMAGE_STATUS_SUCCESS, APP_IMAGE_STATUS_FAILURE],
      endpoint,
      options: {
        method: 'POST',
        body: body,
      },
      schema: {}
    },
    callback,
  }
}

export function getImageStatus(body,callback) {
  return (dispatch) => {
    return dispatch(fetchAppImageStatus(body,callback))
  }
}


export const APP_STORE_IMAGE_LIST_REQUEST = 'APP_STORE_IMAGE_LIST_REQUEST'
export const APP_STORE_IMAGE_LIST_SUCCESS = 'APP_STORE_IMAGE_LIST_SUCCESS'
export const APP_STORE_IMAGE_LIST_FAILURE = 'APP_STORE_IMAGE_LIST_FAILURE'

// Fetches wechat auth qr code from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchImagesList(query, callback) {
  let endpoint = `${API_URL_PREFIX}/app-store/apps/images`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [APP_STORE_IMAGE_LIST_REQUEST, APP_STORE_IMAGE_LIST_SUCCESS, APP_STORE_IMAGE_LIST_FAILURE],
      endpoint,
      schema: {}
    },
    callback,
  }
}

// Fetches wechat auth qr code from API
// Relies on Redux Thunk middleware.
export function getImagesList(query, callback) {
  return (dispatch) => {
    return dispatch(fetchImagesList(query, callback))
  }
}

export const CHECK_IAMGE_NAME_EXISTS_REQUEST = 'CHECK_IAMGE_NAME_EXISTS_REQUEST'
export const CHECK_IAMGE_NAME_EXISTS_SUCCESS = 'CHECK_IAMGE_NAME_EXISTS_SUCCESS'
export const CHECK_IAMGE_NAME_EXISTS_FAILURE = 'CHECK_IAMGE_NAME_EXISTS_FAILURE'

function fetchImageNameExists(body, callback) {
  return {
    [FETCH_API]: {
      types: [CHECK_IAMGE_NAME_EXISTS_REQUEST,CHECK_IAMGE_NAME_EXISTS_SUCCESS,CHECK_IAMGE_NAME_EXISTS_FAILURE],
      endpoint: `${API_URL_PREFIX}/app-store/apps/images/existence`,
      schema: {},
      options: {
        method: 'POST',
        body
      }
    },
    callback
  }
}

export function imageNameExists(body, callback) {
  return dispatch => dispatch(fetchImageNameExists(body, callback))
}