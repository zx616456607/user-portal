import * as ActionTypes from '../actions/statefulSet'

function pods(state = { isFetching: false, list: [] }, action) {
  switch (action.type) {
    case ActionTypes.GET_STATEFUL_SET_PODS_LIST_REQUEST:
      return {
        ...state,
        isFetching: true,
      }
    case ActionTypes.GET_STATEFUL_SET_PODS_LIST_SUCCESS:
      return {
        ...state,
        isFetching: false,
        list: action.response.result.data.items,
      }
    case ActionTypes.GET_STATEFUL_SET_PODS_LIST_FAILURE:
      return {
        ...state,
        isFetching: false,
      }
    default:
      return state
  }
}

function logs(state = { isFetching: false, data: {} }, action) {
  switch (action.type) {
    case ActionTypes.GET_STATEFUL_SET_LOG_REQUEST:
      return {
        ...state,
        isFetching: true,
      }
    case ActionTypes.GET_STATEFUL_SET_LOG_SUCCESS:
      return {
        ...state,
        isFetching: false,
        data: action.response.result.data,
      }
    case ActionTypes.GET_STATEFUL_SET_LOG_FAILURE:
      return {
        ...state,
        isFetching: false,
      }
    default:
      return state
  }
}

const defaultState = {
  pods: {
    isFetching: false,
    list: [],
  },
  monitor: {},
  logs: {
    isFetching: false,
    data: {},
  },
}

export default function statefulSet(state = defaultState, action) {
  return {
    pods: pods(state.pods, action),
    logs: logs(state.logs, action),
  }
}
