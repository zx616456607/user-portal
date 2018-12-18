import { FETCH_API } from '../../src/middleware/api'
import { API_URL_PREFIX } from '../../src/constants/index'

export const GET_STATEFUL_SET_PODS_LIST_REQUEST = 'GET_STATEFUL_SET_PODS_LIST_REQUEST'
export const GET_STATEFUL_SET_PODS_LIST_SUCCESS = 'GET_STATEFUL_SET_PODS_LIST_SUCCESS'
export const GET_STATEFUL_SET_PODS_LIST_FAILURE = 'GET_STATEFUL_SET_PODS_LIST_FAILURE'

function fetchPodsList(cluster, type, name, callback) {
  return {
    [FETCH_API]: {
      types: [
        GET_STATEFUL_SET_PODS_LIST_REQUEST,
        GET_STATEFUL_SET_PODS_LIST_SUCCESS,
        GET_STATEFUL_SET_PODS_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/native/${type}/${name}/instances`,
      schema: {},
    },
    callback,
  }
}

export function getPodsList(cluster, type, name, callback) {
  return dispatch => {
    return dispatch(fetchPodsList(cluster, type, name, callback))
  }
}

export const GET_STATEFUL_SET_LOG_REQUEST = 'GET_STATEFUL_SET_LOG_REQUEST'
export const GET_STATEFUL_SET_LOG_SUCCESS = 'GET_STATEFUL_SET_LOG_SUCCESS'
export const GET_STATEFUL_SET_LOG_FAILURE = 'GET_STATEFUL_SET_LOG_FAILURE'

function fetchNativeLogs(cluster, instances, body, callback) {
  return {
    [FETCH_API]: {
      types: [GET_STATEFUL_SET_LOG_REQUEST, GET_STATEFUL_SET_LOG_SUCCESS, GET_STATEFUL_SET_LOG_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/logs/instances/${instances}/logs`,
      schema: {},
      options: {
        method: 'POST',
        body,
      },
    },
    callback,
  }
}

export function getNativeLogs(cluster, body, callback) {
  return (dispatch, getState) => {
    const { statefulSet } = getState()
    const { pods } = statefulSet
    const instances = []
    if (pods.list.length !== 0) {
      pods.list.map(pod => instances.push(pod.metadata.name))
      return dispatch(fetchNativeLogs(cluster, instances, body, callback))
    } else {
      return
    }
  }
}
