import * as ActionTypes from '../actions/sysServiceManage'

const services = (state, action) => {
  switch (action.type) {
    case ActionTypes.SYS_SERVICE_MANAGE_LIST_REQUEST:
      return {
        ...state,
        isFetching: true,
        list: [],
      }
    case ActionTypes.SYS_SERVICE_MANAGE_LIST_SUCCESS:
      return {
        ...state,
        isFetching: false,
        list: action.response.result.data,
      }
    case ActionTypes.SYS_SERVICE_MANAGE_LIST_FAILURE:
      return {
        ...state,
        isFetching: false,
        list: [],
      }
    default:
      return state
  }
}

// function logs(state = { isFetching: false, data: {} }, action) {
//   switch (action.type) {
//     case ActionTypes.GET_STATEFUL_SET_LOG_REQUEST:
//       return {
//         ...state,
//         isFetching: true,
//       }
//     case ActionTypes.GET_STATEFUL_SET_LOG_SUCCESS:
//       return {
//         ...state,
//         isFetching: false,
//         data: action.response.result.data,
//       }
//     case ActionTypes.GET_STATEFUL_SET_LOG_FAILURE:
//       return {
//         ...state,
//         isFetching: false,
//       }
//     default:
//       return state
//   }
// }

const defaultState = {
  services: {
    isFetching: false,
    list: [],
  },
  // monitor: {},
  // logs: {
  //   isFetching: false,
  //   data: {},
  // },
}

export default function statefulSet(state = defaultState, action) {
  return {
    services: services(state.services, action),
    // logs: logs(state.logs, action),
  }
}
