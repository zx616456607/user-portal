import * as ActionTypes from '../actions/sysServiceManage'

const services = (state, action) => {
  switch (action.type) {
    case ActionTypes.SYS_SERVICE_MANAGE_LIST_REQUEST:
      return {
        ...state,
        isFetching: true,
        data: {
          ...state.data,
          [action.cluster]: [],
        },
      }
    case ActionTypes.SYS_SERVICE_MANAGE_LIST_SUCCESS:
      return {
        ...state,
        isFetching: false,
        data: {
          ...state.data,
          [action.cluster]: action.response.result.data,
        },
      }
    case ActionTypes.SYS_SERVICE_MANAGE_LIST_FAILURE:
      return {
        ...state,
        isFetching: false,
        data: {
          ...state.data,
          [action.cluster]: [],
        },
      }
    default:
      return state
  }
}

const monitor = (state, action) => {
  switch (action.type) {
    case ActionTypes.SYS_SERVICE_MANAGE_MONITOR_REQUEST:
      return {
        ...state,
        isFetching: true,
        data: action.switchFetchType ? state.data : {},
        switchFetchType: action.switchFetchType ? action.switchFetchType : '',
      }
    case ActionTypes.SYS_SERVICE_MANAGE_MONITOR_SUCCESS:
      return {
        ...state,
        isFetching: false,
        data: {
          ...state.data,
          ...action.response.result,
        },
        switchFetchType: '',
      }
    case ActionTypes.SYS_SERVICE_MANAGE_MONITOR_FAILURE:
      return {
        ...state,
        isFetching: false,
        data: {},
        switchFetchType: '',
      }
    default:
      return state
  }
}

function logs(state = { isFetching: false, data: {} }, action) {
  switch (action.type) {
    case ActionTypes.SYS_SERVICE_MANAGE_LOGS_REQUEST:
      return {
        ...state,
        isFetching: true,
        data: {},
      }
    case ActionTypes.SYS_SERVICE_MANAGE_LOGS_SUCCESS:
      return {
        ...state,
        isFetching: false,
        data: action.response.result.data,
      }
    case ActionTypes.SYS_SERVICE_MANAGE_LOGS_FAILURE:
      return {
        ...state,
        isFetching: false,
        data: {},
      }
    default:
      return state
  }
}

const defaultState = {
  services: {
    isFetching: false,
    data: {},
  },
  monitor: {
    isFetching: false,
    data: {},
  },
  logs: {
    isFetching: false,
    data: {},
  },
}

export default function statefulSet(state = defaultState, action) {
  return {
    services: services(state.services, action),
    monitor: monitor(state.monitor, action),
    logs: logs(state.logs, action),
  }
}
