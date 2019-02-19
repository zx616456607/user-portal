export const SET_FLOW_CONTAINS_VALUE = 'SET_FLOW_CONTAINS_VALUE'
export const setFlowContainersFields = (fields, callback) => {
    return {
      type: SET_FLOW_CONTAINS_VALUE,
      fields,
      callback,
    }
  }