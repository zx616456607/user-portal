import * as ActionTypes from '../actions/FlowContainer'

export function FlowContainerValue(state = {}, action) {
    switch (action.type) {
      case ActionTypes.SET_FLOW_CONTAINS_VALUE: {
        return Object.assign({}, state, {
          ...action.fields,
        }) }
      default:
        return state
    }
  }

export default function getFlowContainerValue(state= { }, action) {
  return {
    getFlowContainerValue: FlowContainerValue(state.getFlowContainerValue, action),
   };
}