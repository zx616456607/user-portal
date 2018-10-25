/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Redux actions for networks
 *
 * v0.1 - 2017-07-15
 * @author houxz
 */
import { FETCH_API, Schemas } from '../../middleware/api'
import { API_URL_PREFIX } from '../../../constants'
import { toQuerystring } from '../../common/tools'

export const NETWORKS_LIST_REQUEST = 'NETWORKS_LIST_REQUEST'
export const NETWORKS_LIST_SUCCESS = 'NETWORKS_LIST_SUCCESS'
export const NETWORKS_LIST_FAILURE = 'NETWORKS_LIST_FAILURE'

function fetchNetworksList(query, callback) {
    let endpoint=`${API_URL_PREFIX}/openstack/vm/networks`
    if (query) {
        endpoint += `?${toQuerystring(query)}`
    }
    return {
    [FETCH_API]: {
      types: [NETWORKS_LIST_REQUEST, NETWORKS_LIST_SUCCESS, NETWORKS_LIST_FAILURE],
      endpoint,
      schema: {}//Schemas.STORAGE
    },
    callback: callback
  }
}

export function loadNetworksList(query, callback) {
  return (dispath, getState) => {
    dispath(fetchNetworksList(query, callback))
  }
}

export const NETWORKS_CREATE_REQUEST = 'NETWORKS_CREATE_REQUEST'
export const NETWORKS_CREATE_SUCCESS = 'NETWORKS_CREATE_SUCCESS'
export const NETWORKS_CREATE_FAILURE = 'NETWORKS_CREATE_FAILURE'

export function createNetworks(body, query, callback) {
  let endpoint = `${API_URL_PREFIX}/openstack/vm/networks/create`
  if(query) {
    endpoint = `${endpoint}?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [NETWORKS_CREATE_REQUEST, NETWORKS_CREATE_SUCCESS, NETWORKS_CREATE_FAILURE],
      endpoint,
      options: {
        method: 'POST',
        body: body
      },
      schema: {}//Schemas.STORAGE
    },
    callback: callback
  }
}


export const NETWORKS_DETAIL_REQUEST = 'NETWORKS_DETAIL_REQUEST'
export const NETWORKS_DETAIL_SUCCESS = 'NETWORKS_DETAIL_SUCCESS'
export const NETWORKS_DETAIL_FAILURE = 'NETWORKS_DETAIL_FAILURE'
export function getNetWorksDetail(networkid, query, callback) {
  let endpoint = `${API_URL_PREFIX}/openstack/vm/networks/`+networkid
  if(query) {
    endpoint = `${endpoint}?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [NETWORKS_DETAIL_REQUEST, NETWORKS_DETAIL_SUCCESS, NETWORKS_DETAIL_FAILURE],
      endpoint,
      options: {
        method: 'GET'
      },
      schema: {}//Schemas.STORAGE
    },
    callback
  }
}

export const NETWORKS_DELETE_REQUEST = 'NETWORKS_DELETE_REQUEST'
export const NETWORKS_DELETE_SUCCESS = 'NETWORKS_DELETE_SUCCESS'
export const NETWORKS_DELETE_FAILURE = 'NETWORKS_DELETE_FAILURE'

export function deleteNetwork(networkid, query, callback) {
  let endpoint = `${API_URL_PREFIX}/openstack/vm/networks/`+networkid
  if(query) {
    endpoint = `${endpoint}?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [NETWORKS_DELETE_REQUEST, NETWORKS_DELETE_SUCCESS, NETWORKS_DELETE_FAILURE],
      endpoint,
      options: {
        method: 'DELETE'
      },
      schema: {}//Schemas.STORAGE
    },
    callback
  }
}

export const SEARCH_NETWORK_LIST = 'SEARCH_NETWORK_LIST'
export function searchNetworks(types) {
  return {
    type: SEARCH_NETWORK_LIST,
    name:types
  }
}

//subnets
export const SUBNETS_LIST_REQUEST = 'SUBNETS_LIST_REQUEST'
export const SUBNETS_LIST_SUCCESS = 'SUBNETS_LIST_SUCCESS'
export const SUBNETS_LIST_FAILURE = 'SUBNETS_LIST_FAILURE'

function fetchSubnetsList(query, callback) {
    let endpoint=`${API_URL_PREFIX}/openstack/vm/subnets`
    if (query) {
        endpoint += `?${toQuerystring(query)}`
    }
    return {
    [FETCH_API]: {
      types: [SUBNETS_LIST_REQUEST, SUBNETS_LIST_SUCCESS, SUBNETS_LIST_FAILURE],
      endpoint,
      schema: {}
    },
    callback: callback
  }
}

export function loadSubnetsList(query, callback) {
  return (dispath, getState) => {
    dispath(fetchSubnetsList(query, callback))
  }
}

export const SUBNETS_CREATE_REQUEST = 'SUBNETS_CREATE_REQUEST'
export const SUBNETS_CREATE_SUCCESS = 'SUBNETS_CREATE_SUCCESS'
export const SUBNETS_CREATE_FAILURE = 'SUBNETS_CREATE_FAILURE'

export function createSubnets(body, query, callback) {
  let endpoint=`${API_URL_PREFIX}/openstack/vm/subnets/create`
  if (query) {
      endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [SUBNETS_CREATE_REQUEST, SUBNETS_CREATE_SUCCESS, SUBNETS_CREATE_FAILURE],
      endpoint,
      options: {
        method: 'POST',
        body: body
      },
      schema: {}
    },
    callback: callback
  }
}


export const SUBNETS_DETAIL_REQUEST = 'SUBNETS_DETAIL_REQUEST'
export const SUBNETS_DETAIL_SUCCESS = 'SUBNETS_DETAIL_SUCCESS'
export const SUBNETS_DETAIL_FAILURE = 'SUBNETS_DETAIL_FAILURE'
export function getSubnetsDetail(subnetid, query, callback) {
  let endpoint=`${API_URL_PREFIX}/openstack/vm/subnets/`+subnetid
  if (query) {
      endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [SUBNETS_DETAIL_REQUEST, SUBNETS_DETAIL_SUCCESS, SUBNETS_DETAIL_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/vm/subnets/`+subnetid,
      options: {
        method: 'GET'
      },
      schema: {}
    },
    callback
  }
}

export const SUBNETS_DELETE_REQUEST = 'SUBNETS_DELETE_REQUEST'
export const SUBNETS_DELETE_SUCCESS = 'SUBNETS_DELETE_SUCCESS'
export const SUBNETS_DELETE_FAILURE = 'SUBNETS_DELETE_FAILURE'

export function deleteSubnets(subnetid, query, callback) {
  let endpoint=`${API_URL_PREFIX}/openstack/vm/subnets/`+subnetid
  if (query) {
      endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      pool,
      types: [SUBNETS_DELETE_REQUEST, SUBNETS_DELETE_SUCCESS, SUBNETS_DELETE_FAILURE],
      endpoint,
      options: {
        method: 'DELETE'
      },
      schema: {}
    },
    callback
  }
}


//ports
export const PORTS_LIST_REQUEST = 'PORTS_LIST_REQUEST'
export const PORTS_LIST_SUCCESS = 'PORTS_LIST_SUCCESS'
export const PORTS_LIST_FAILURE = 'PORTS_LIST_FAILURE'

export function fetchPortsList(query, callback) {
    let endpoint=`${API_URL_PREFIX}/openstack/vm/ports`
    if (query) {
        endpoint += `?${toQuerystring(query)}`
    }
    return {
    [FETCH_API]: {
      types: [PORTS_LIST_REQUEST, PORTS_LIST_SUCCESS, PORTS_LIST_FAILURE],
      endpoint,
      schema: {}
    },
    callback: callback
  }
}

export function loadPortsList(query, callback) {
  return (dispath, getState) => {
    dispath(fetchPortsList(query, callback))
  }
}

export const PORTS_CREATE_REQUEST = 'PORTS_CREATE_REQUEST'
export const PORTS_CREATE_SUCCESS = 'PORTS_CREATE_SUCCESS'
export const PORTS_CREATE_FAILURE = 'PORTS_CREATE_FAILURE'

export function createPorts(body, callback) {
  return {
    [FETCH_API]: {
      types: [PORTS_CREATE_REQUEST, PORTS_CREATE_SUCCESS, PORTS_CREATE_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/vm/ports`,
      options: {
        method: 'POST',
        body: body
      },
      schema: {}
    },
    callback: callback
  }
}


export const PORTS_DETAIL_REQUEST = 'PORTS_DETAIL_REQUEST'
export const PORTS_DETAIL_SUCCESS = 'PORTS_DETAIL_SUCCESS'
export const PORTS_DETAIL_FAILURE = 'PORTS_DETAIL_FAILURE'
export function getPortsDetail(portid, callback) {
  return {
    [FETCH_API]: {
      types: [STORAGE_DETAIL_REQUEST, STORAGE_DETAIL_SUCCESS, STORAGE_DETAIL_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/vm/ports/`+portid,
      options: {
        method: 'GET'
      },
      schema: {}
    },
    callback
  }
}

export const PORTS_DELETE_REQUEST = 'PORTS_DELETE_REQUEST'
export const PORTS_DELETE_SUCCESS = 'PORTS_DELETE_SUCCESS'
export const PORTS_DELETE_FAILURE = 'PORTS_DELETE_FAILURE'

export function deletePorts(portid, callback) {
  return {
    [FETCH_API]: {
      pool,
      types: [PORTS_DELETE_REQUEST, PORTS_DELETE_SUCCESS, PORTS_DELETE_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/vm/ports/`+portid,
      options: {
        method: 'DELETE'
      },
      schema: {}
    },
    callback
  }
}




//floatips
export const FLOATIPS_LIST_REQUEST = 'FLOATIPS_LIST_REQUEST'
export const FLOATIPS_LIST_SUCCESS = 'FLOATIPS_LIST_SUCCESS'
export const FLOATIPS_LIST_FAILURE = 'FLOATIPS_LIST_FAILURE'

export function fetchFloatipsList(query, callback) {
    let endpoint=`${API_URL_PREFIX}/openstack/vm/floatingips`
    if (query) {
        endpoint += `?${toQuerystring(query)}`
    }
    return {
    [FETCH_API]: {
      types: [FLOATIPS_LIST_REQUEST, FLOATIPS_LIST_SUCCESS, FLOATIPS_LIST_FAILURE],
      endpoint,
      schema: {}
    },
    callback: callback
  }
}

export function loadFloatipsList(query, callback) {
  return (dispath, getState) => {
    dispath(fetchFloatipsList(query, callback))
  }
}

export const FLOATIPS_CREATE_REQUEST = 'FLOATIPS_CREATE_REQUEST'
export const FLOATIPS_CREATE_SUCCESS = 'FLOATIPS_CREATE_SUCCESS'
export const FLOATIPS_CREATE_FAILURE = 'FLOATIPS_CREATE_FAILURE'

export function createFloatips(body, query, callback) {
  let endpoint=`${API_URL_PREFIX}/openstack/vm/floatingips/create`
  if(query) {
    endpoint = `${endpoint}?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [FLOATIPS_CREATE_REQUEST, FLOATIPS_CREATE_SUCCESS, FLOATIPS_CREATE_FAILURE],
      endpoint,
      options: {
        method: 'POST',
        body: body
      },
      schema: {}
    },
    callback: callback
  }
}


export const FLOATIPS_DETAIL_REQUEST = 'FLOATIPS_DETAIL_REQUEST'
export const FLOATIPS_DETAIL_SUCCESS = 'FLOATIPS_DETAIL_SUCCESS'
export const FLOATIPS_DETAIL_FAILURE = 'FLOATIPS_DETAIL_FAILURE'
export function getFloatipsDetail(floatipid, callback) {
  return {
    [FETCH_API]: {
      types: [STORAGE_DETAIL_REQUEST, STORAGE_DETAIL_SUCCESS, STORAGE_DETAIL_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/vm/floatips/`+floatipid,
      options: {
        method: 'GET'
      },
      schema: {}
    },
    callback
  }
}

export const FLOATIPS_DELETE_REQUEST = 'FLOATIPS_DELETE_REQUEST'
export const FLOATIPS_DELETE_SUCCESS = 'FLOATIPS_DELETE_SUCCESS'
export const FLOATIPS_DELETE_FAILURE = 'FLOATIPS_DELETE_FAILURE'

export function deleteFloatips(floatipid, query, callback) {
  let endpoint=`${API_URL_PREFIX}/openstack/vm/floatingips/`+floatipid
  if(query) {
    endpoint = `${endpoint}?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [FLOATIPS_DELETE_REQUEST, FLOATIPS_DELETE_SUCCESS, FLOATIPS_DELETE_FAILURE],
      endpoint,
      options: {
        method: 'DELETE'
      },
      schema: {}
    },
    callback
  }
}
// /openstack/vm/:serverID/floatingips/manage

export const FLOATIPS_MANAGE_REQUEST = 'FLOATIPS_MANAGE_REQUEST'
export const FLOATIPS_MANAGE_SUCCESS = 'FLOATIPS_MANAGE_SUCCESS'
export const FLOATIPS_MANAGE_FAILURE = 'FLOATIPS_MANAGE_FAILURE'

export function manageFloatips(serverID, body, query, callback) {
  let endpoint=`${API_URL_PREFIX}/openstack/vm/${serverID}/floatingips/manage`
  if(query) {
    endpoint = `${endpoint}?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [FLOATIPS_MANAGE_REQUEST, FLOATIPS_MANAGE_SUCCESS, FLOATIPS_MANAGE_FAILURE],
      endpoint ,
      options: {
        method: 'POST',
        body
      },
      schema: {}
    },
    callback
  }
}

export const OPENSTACK_CLEAR_NETWORK_LIST = 'OPENSTACK_CLEAR_NETWORK_LIST'
export function clearNetworkList() {
  return {
    type: OPENSTACK_CLEAR_NETWORK_LIST
  }
}

export const OPENSTACK_CLEAR_FLOAT_IP_LIST = 'OPENSTACK_CLEAR_FLOAT_IP_LIST'
export function clearFloatips() {
  return {
    type: OPENSTACK_CLEAR_FLOAT_IP_LIST
  }
}

// router list /openstack/network/routers
export const GET_ROUTER_MANAGE_REQUEST = 'GET_ROUTER_MANAGE_REQUEST'
export const GET_ROUTER_MANAGE_SUCCESS = 'GET_ROUTER_MANAGE_SUCCESS'
export const GET_ROUTER_MANAGE_FAILURE = 'GET_ROUTER_MANAGE_FAILURE'

export function getRouterList(query, callback) {
  let endpoint=`${API_URL_PREFIX}/openstack/network/routers`
  if (query) {
      endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [GET_ROUTER_MANAGE_REQUEST, GET_ROUTER_MANAGE_SUCCESS, GET_ROUTER_MANAGE_FAILURE],
      endpoint,
      schema: {}
    },
    callback: callback
  }
}

export const CREATE_ROUTER_MANAGE_REQUEST = 'CREATE_ROUTER_MANAGE_REQUEST'
export const CREATE_ROUTER_MANAGE_SUCCESS = 'CREATE_ROUTER_MANAGE_SUCCESS'
export const CREATE_ROUTER_MANAGE_FAILURE = 'CREATE_ROUTER_MANAGE_FAILURE'

export function createRouter(query,body, callback) {
  let endpoint=`${API_URL_PREFIX}/openstack/network/routers`
  if (query) {
      endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [CREATE_ROUTER_MANAGE_REQUEST, CREATE_ROUTER_MANAGE_SUCCESS, CREATE_ROUTER_MANAGE_FAILURE],
      endpoint,
      options:{
        method:'POST',
        body
      },
      schema: {}
    },
    callback: callback
  }
}

export const DELETE_ROUTER_MANAGE_REQUEST = 'DELETE_ROUTER_MANAGE_REQUEST'
export const DELETE_ROUTER_MANAGE_SUCCESS = 'DELETE_ROUTER_MANAGE_SUCCESS'
export const DELETE_ROUTER_MANAGE_FAILURE = 'DELETE_ROUTER_MANAGE_FAILURE'

export function deleteRouter(query,id,callback) {
  let endpoint=`${API_URL_PREFIX}/openstack/network/routers/${id}`
  if (query) {
      endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [DELETE_ROUTER_MANAGE_REQUEST, DELETE_ROUTER_MANAGE_SUCCESS, DELETE_ROUTER_MANAGE_FAILURE],
      endpoint,
      options:{
        method:'DELETE',
      },
      schema: {}
    },
    callback: callback
  }
}

export const EDIT_ROUTER_MANAGE_REQUEST = 'EDIT_ROUTER_MANAGE_REQUEST'
export const EDIT_ROUTER_MANAGE_SUCCESS = 'EDIT_ROUTER_MANAGE_SUCCESS'
export const EDIT_ROUTER_MANAGE_FAILURE = 'EDIT_ROUTER_MANAGE_FAILURE'

export function editRouter(query,id,body,callback) {
  let endpoint=`${API_URL_PREFIX}/openstack/network/routers/${id}`
  if (query) {
      endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [EDIT_ROUTER_MANAGE_REQUEST, EDIT_ROUTER_MANAGE_SUCCESS, EDIT_ROUTER_MANAGE_FAILURE],
      endpoint,
      options:{
        method:'PUT',
        body
      },
      schema: {}
    },
    callback: callback
  }
}


export const CHILD_ROUTER_MANAGE_REQUEST = 'CHILD_ROUTER_MANAGE_REQUEST'
export const CHILD_ROUTER_MANAGE_SUCCESS = 'CHILD_ROUTER_MANAGE_SUCCESS'
export const CHILD_ROUTER_MANAGE_FAILURE = 'CHILD_ROUTER_MANAGE_FAILURE'
// 获取子网列表
export function getChildRouter(query,id,callback) {
  let endpoint=`${API_URL_PREFIX}/openstack/network/routers/${id}/subnet`
  if (query) {
      endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [CHILD_ROUTER_MANAGE_REQUEST, CHILD_ROUTER_MANAGE_SUCCESS, CHILD_ROUTER_MANAGE_FAILURE],
      endpoint,
      schema: {}
    },
    callback: callback
  }
}

export const GET_ROUTER_SUBNETS_REQUEST = 'GET_ROUTER_SUBNETS_REQUEST'
export const GET_ROUTER_SUBNETS_SUCCESS = 'GET_ROUTER_SUBNETS_SUCCESS'
export const GET_ROUTER_SUBNETS_FAILURE = 'GET_ROUTER_SUBNETS_FAILURE'
// 获取可用子网列表
export function getSubnetsRouter(query,callback) {
  let endpoint=`${API_URL_PREFIX}/openstack/vm/subnets/ownandcanuse`
  if (query) {
      endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [GET_ROUTER_SUBNETS_REQUEST, GET_ROUTER_SUBNETS_SUCCESS, GET_ROUTER_SUBNETS_FAILURE],
      endpoint,
      schema: {}
    },
    callback: callback
  }
}

export const ADD_ROUTER_SUBNET_REQUEST = 'ADD_ROUTER_SUBNET_REQUEST'
export const ADD_ROUTER_SUBNET_SUCCESS = 'ADD_ROUTER_SUBNET_SUCCESS'
export const ADD_ROUTER_SUBNET_FAILURE = 'ADD_ROUTER_SUBNET_FAILURE'
// 连接子网
export function addRouterSubnet(query,callback) {
  let endpoint=`${API_URL_PREFIX}/openstack/network/routers/${query.routerId}/subnet/${query.subnetId}`
  return {
    [FETCH_API]: {
      types: [ADD_ROUTER_SUBNET_REQUEST, ADD_ROUTER_SUBNET_SUCCESS, ADD_ROUTER_SUBNET_FAILURE],
      endpoint,
      options:{
        method:'PUT'
      },
      schema: {}
    },
    callback: callback
  }
}

export const REMOVE_ROUTER_SUBNET_REQUEST = 'REMOVE_ROUTER_SUBNET_REQUEST'
export const REMOVE_ROUTER_SUBNET_SUCCESS = 'REMOVE_ROUTER_SUBNET_SUCCESS'
export const REMOVE_ROUTER_SUBNET_FAILURE = 'REMOVE_ROUTER_SUBNET_FAILURE'
// 断开子网
export function removeRouterSubnet(query,callback) {
  let endpoint=`${API_URL_PREFIX}/openstack/network/routers/${query.routerId}/subnet/${query.subnetId}/remove`
  if (query) {
      endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [REMOVE_ROUTER_SUBNET_REQUEST, REMOVE_ROUTER_SUBNET_SUCCESS, REMOVE_ROUTER_SUBNET_FAILURE],
      endpoint,
      options:{
        method:'PUT'
      },
      schema: {}
    },
    callback: callback
  }
}