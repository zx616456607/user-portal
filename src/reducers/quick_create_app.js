/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 */
/**
 * Reducer of quick create app
 *
 * v0.1 - 2017-05-05
 * @author Zhangpc
 */
import * as ActionTypes from '../actions/quick_create_app'

export default function quickCreateApp(state = { fields: {} }, action) {
  const { type, key, fields } = action
  // const default
  switch (type) {
    case ActionTypes.QUICK_CREATE_APP_SET_FORM_FIELDS:
      return Object.assign({}, state, {
        fields: Object.assign({}, state.fields, {
          [key]: Object.assign({}, state.fields[key], fields),
        }),
      })
    case ActionTypes.QUICK_CREATE_APP_REMOVE_FORM_FIELDS:
      const newFields = {}
      for (let fieldKey in state.fields) {
        if (state.fields.hasOwnProperty(fieldKey) && fieldKey !== key ) {
          newFields[fieldKey] = state.fields[fieldKey]
        }
      }
      return Object.assign({}, state, {
        fields: newFields,
      })
    case ActionTypes.QUICK_CREATE_APP_REMOVE_ALL_FORM_FIELDS:
      return Object.assign({}, state, {
        fields: {},
      })
    default:
      return state
  }
}
