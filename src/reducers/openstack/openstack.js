/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */
/**
 * Redux reducers for openstack
 *
 * v0.1 - 2017-07-15
 * @author Baiyu
 */

import * as ActionTypes from '../../actions/openstack/calculation_service'
import * as NetworkTypes from '../../actions/openstack/networks'
import * as snapshotsTypes from '../../actions/openstack/snapshot'
import * as LoadTypes from '../../actions/openstack/lb_real'
import { cluster, keypairs } from './lb'
import reducerFactory from '../factory'
import cloneDeep from 'lodash/cloneDeep'
import merge from 'lodash/merge'

const option = {
  overwrite: true
}
function baseHost(state={}, action) {
  const needLoading = action.needLoading
  switch (action.type) {
    case ActionTypes.OPENSTACK_GET_VM_LIST_REQUEST:{
      return Object.assign({}, state, {
        isFetching: needLoading
      })
    }
    case ActionTypes.OPENSTACK_GET_VM_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        ...action.response.result
      })
    case ActionTypes.OPENSTACK_GET_VM_LIST_FAILURE:
      return Object.assign({}, state, {
        isFetching: false
      })
    case ActionTypes.OPENSTACK_CLEAR_VM_LIST:
      return {
        isFetching: false
      }
    default:
      return state
  }
}


function snapshotsList(state = {}, action){
  switch (action.type) {
    case snapshotsTypes.OPENSTACK_GET_SNAPSHOT_LIST_REQUEST:{
      return Object.assign({}, state, {
        isFetching: true
      })
    }
    case snapshotsTypes.OPENSTACK_GET_SNAPSHOT_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        result: action.response.result.snapshots,
      })
    case snapshotsTypes.OPENSTACK_GET_SNAPSHOT_LIST_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        result: [],
      })
    case snapshotsTypes.OPENSTACK_CLEAR_SNAPSHOT_LIST:
      return {
        isFecthing: false
      }
    default:
      return state
  }
}

function loadlist(state = {}, action){
  switch (action.type) {
    case LoadTypes.OPENSTACK_REAL_LB_LIST_REQUEST:{
      return Object.assign({}, state, {
        isFetching: true
      })
    }
    case LoadTypes.OPENSTACK_REAL_LB_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        result: action.response.result.vnfs,
      })
    case LoadTypes.OPENSTACK_REAL_LB_LIST_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        result: [],
      })
    default:
      return state
  }
}

function loadBanlacerHealthCheck(state = {}, action){
  switch(action.type){
    case LoadTypes.OPENSTACK_LB_HEALTHCHECK_LIST_REQUEST:
      return merge({}, state, {
        [action.vadcsID] : {
          isFecthing: true,
          result: [],
          serachList: [],
        }
      })
    case LoadTypes.OPENSTACK_LB_HEALTHCHECK_LIST_SUCCESS:
      if(action.response.result && action.response.result.response && !action.response.result.success){
        return merge({}, state, {
          [action.vadcsID] : {
            isFecthing: false,
            result: [],
            serachList: [],
          }
        })
      }
      return Object.assign({}, state, {
        [action.vadcsID] : {
          isFecthing: false,
          result: action.response.result.healthChecks,
          serachList: cloneDeep(action.response.result.healthChecks),
        }
      })
    case LoadTypes.OPENSTACK_LB_HEALTHCHECK_LIST_FAILURE:
      return merge({}, state,{
        [action.vadcsID]: {
          isFecthing: false,
          result: [],
          serachList: [],
        }
      })
    case LoadTypes.OPENSTACK_LB_HEALTHCHECK_SEARCH:
      const newState = cloneDeep(state)
      if (action.searchValue == '') {
        newState[action.vadcID].result = newState[action.vadcID].serachList
        return newState
      }
      const temp = newState[action.vadcID].serachList.filter(list => {
        const search = new RegExp(action.searchValue)
        if (search.test(list.name)) {
          return true
        }
        return false
      })
      newState[action.vadcID].result = temp
      return newState
    default:
      return state
  }
}

function loadBanlacerServicePool(state = {}, action){
  switch(action.type){
    case LoadTypes.OPENSTACK_LB_POOLS_LIST_REQUEST:
      return merge({}, state, {
        [action.vadcsID] : {
          isFecthing: true,
          result: [],
          serachList: [],
        }
      })
    case LoadTypes.OPENSTACK_LB_POOLS_LIST_SUCCESS:
      if(action.response.result && action.response.result.response && !action.response.result.success){
        return merge({}, state, {
          [action.vadcsID] : {
            isFecthing: false,
            result: [],
            serachList: [],
          }
        })
      }
      return Object.assign({}, state, {
        [action.vadcsID] : {
          isFecthing: false,
          result: action.response.result.pools,
          serachList: cloneDeep(action.response.result.pools),
        }
      })
    case LoadTypes.OPENSTACK_LB_POOLS_LIST_FAILURE:
      return merge({}, state, {
        [action.vadcsID] : {
          isFecthing: false,
          result: [],
          serachList: [],
        }
      })
    case LoadTypes.OPENSTACK_LB_POOLS_SEARCH:
      const newState = cloneDeep(state)
      if (action.searchValue == '') {
        newState[action.vadcID].result = newState[action.vadcID].serachList
        return newState
      }
      const temp = newState[action.vadcID].serachList.filter(list => {
        const search = new RegExp(action.searchValue)
        if (search.test(list.name)) {
          return true
        }
        return false
      })
      newState[action.vadcID].result = temp
      return newState
    default:
      return state
  }
}

function loadBanlacerVirtualIP(state = {}, action){
  switch(action.type){
    case LoadTypes.OPENSTACK_LB_VIPS_LIST_REQUEST:
      return merge({}, state, {
        [action.vadcsID] : {
          isFecthing: true,
          result: [],
          serachList: [],
        }
      })
    case LoadTypes.OPENSTACK_LB_VIPS_LIST_SUCCESS:
      return Object.assign({}, state, {
        [action.vadcsID] : {
          isFecthing: false,
          result: action.response.result.vips,
          serachList: cloneDeep(action.response.result.vips),
        }
      })
    case LoadTypes.OPENSTACK_LB_VIPS_LIST_FAILURE:
      return merge({}, state, {
        [action.vadcsID] : {
          isFecthing: false,
          result: [],
          serachList: [],
        }
      })
    case LoadTypes.OPENSTACK_LB_VIPS_SEARCH:
      const newState = cloneDeep(state)
      if (action.searchValue == '') {
        newState[action.vadcID].result = newState[action.vadcID].serachList
        return newState
      }
      const temp = newState[action.vadcID].serachList.filter(list => {
        const search = new RegExp(action.searchValue)
        if (search.test(list.vipname)) {
          return true
        }
        return false
      })
      newState[action.vadcID].result = temp
      return newState
    default:
      return state
  }
}

export default function openstack(state={},action) {
  return {
    host: baseHost(state.host, action),
    az: reducerFactory({
      REQUEST: ActionTypes.OPENSTACK_GET_AZ_LIST_REQUEST,
      SUCCESS: ActionTypes.OPENSTACK_GET_AZ_LIST_SUCCESS,
      FAILURE: ActionTypes.OPENSTACK_GET_AZ_LIST_FAILURE
    }, state.az, action, option),
    networks: networks(state.networks, action),
    netDetail: reducerFactory({
      REQUEST: NetworkTypes.NETWORKS_DETAIL_REQUEST,
      SUCCESS: NetworkTypes.NETWORKS_DETAIL_SUCCESS,
      FAILURE: NetworkTypes.NETWORKS_DETAIL_FAILURE
    }, state.netDetail, action, option),
    subnet: reducerFactory({
      REQUEST: NetworkTypes.SUBNETS_DETAIL_REQUEST,
      SUCCESS: NetworkTypes.SUBNETS_DETAIL_SUCCESS,
      FAILURE: NetworkTypes.SUBNETS_DETAIL_FAILURE
    }, state.subnet, action, option),
    snapshotsList: snapshotsList(state.snapshotsList, action),
    flavors: reducerFactory({
      REQUEST: ActionTypes.OPENSTACK_GET_FLAVOR_LIST_REQUEST,
      SUCCESS: ActionTypes.OPENSTACK_GET_FLAVOR_LIST_SUCCESS,
      FAILURE: ActionTypes.OPENSTACK_GET_FLAVOR_LIST_FAILURE
    }, state.flavors, action, option),
    images: reducerFactory({
      REQUEST: ActionTypes.OPENSTACK_GET_IMAGE_LIST_REQUEST,
      SUCCESS: ActionTypes.OPENSTACK_GET_IMAGE_LIST_SUCCESS,
      FAILURE: ActionTypes.OPENSTACK_GET_IMAGE_LIST_FAILURE,
      CLEAR: ActionTypes.OPENSTACK_CLEAR_IMAGE_LIST,
    }, state.images, action, option),
    updateVM: reducerFactory({
      REQUEST: ActionTypes.OPENSTACK_UPDATE_VM_REQUEST,
      SUCCESS: ActionTypes.OPENSTACK_UPDATE_VM_SUCCESS,
      FAILURE: ActionTypes.OPENSTACK_UPDATE_VM_FAILURE
    }, state.updateVM, action, option),
    deleteVM: reducerFactory({
      REQUEST: ActionTypes.OPENSTACK_DELETE_VM_REQUEST,
      SUCCESS: ActionTypes.OPENSTACK_DELETE_VM_SUCCESS,
      FAILURE: ActionTypes.OPENSTACK_DELETE_VM_FAILURE
    }, state.deleteVM, action, option),
    loadlist: loadlist(state.loadlist, action),

    vmDetail: reducerFactory({
      REQUEST: ActionTypes.OPENSTACK_GET_VM_DETAIL_REQUEST,
      SUCCESS: ActionTypes.OPENSTACK_GET_VM_DETAIL_SUCCESS,
      FAILURE: ActionTypes.OPENSTACK_GET_VM_DETAIL_FAILURE
    }, state.vmDetail, action, option),
    floatips: reducerFactory({
      REQUEST: NetworkTypes.FLOATIPS_LIST_REQUEST,
      SUCCESS: NetworkTypes.FLOATIPS_LIST_SUCCESS,
      FAILURE: NetworkTypes.FLOATIPS_LIST_FAILURE,
      CLEAR: NetworkTypes.OPENSTACK_CLEAR_FLOAT_IP_LIST
    },state.floatips,action, option),
    loadBanlacerHealthCheck: loadBanlacerHealthCheck(state.loadBanlacerHealthCheck, action),
    loadBanlacerServicePool: loadBanlacerServicePool(state.loadBanlacerServicePool, action),
    loadBanlacerVirtualIP: loadBanlacerVirtualIP(state.loadBanlacerVirtualIP, action),
    cluster: cluster(state.cluster,action),
    keypairs: keypairs(state.keypairs, action),
  }
}

function networks(state={}, action) {
  switch(action.type) {
    case ActionTypes.OPENSTACK_GET_NETWORK_LIST_REQUEST:
    case NetworkTypes.NETWORKS_LIST_REQUEST: {
      return Object.assign({}, state, {
        isFetching: true
      })
    }
    case ActionTypes.OPENSTACK_GET_NETWORK_LIST_SUCCESS:
    case NetworkTypes.NETWORKS_LIST_SUCCESS: {
      return Object.assign({}, state, {
        isFetching: false,
        result: action.response.result,
        bak: cloneDeep(action.response.result)
      })
    }
    case ActionTypes.OPENSTACK_GET_NETWORK_LIST_FAILURE:
    case NetworkTypes.NETWORKS_LIST_FAILURE: {
      return Object.assign({}, state, {
        isFetching: false,
        result: {networks:[]}
      })
    }
    case NetworkTypes.SEARCH_NETWORK_LIST: {
      const newState = cloneDeep(state)
      if (newState.networks) {
        return state
      }
      const temp = newState.bak.networks.filter(list => {
        const search = new RegExp(action.name)
        if (search.test(list.name)) {
          return true
        }
        return false
      })
      newState.result.networks = temp
      return newState
    }
    case NetworkTypes.OPENSTACK_CLEAR_NETWORK_LIST: {
      return {
        isFetching: false
      }
    }
    default:
      return state
  }
}
