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
import { API_URL_PREFIX } from '../../constants'
import { toQuerystring } from '../../common/tools'

export const NETWORKS_LIST_REQUEST = 'NETWORKS_LIST_REQUEST'
export const NETWORKS_LIST_SUCCESS = 'NETWORKS_LIST_SUCCESS'
export const NETWORKS_LIST_FAILURE = 'NETWORKS_LIST_FAILURE'

function fetchNetworksList(callback) {
    let endpoint=`${API_URL_PREFIX}/openstack/networks`
    return {
    [FETCH_API]: {
      types: [NETWORKS_LIST_REQUEST, NETWORKS_LIST_SUCCESS, NETWORKS_LIST_FAILURE],
      endpoint,
      schema: {}//Schemas.STORAGE
    },
    callback: callback
  }
}

export function loadNetworksList(callback) {
  return (dispath, getState) => {
    dispath(fetchNetworksList(callback))
  }
}

export const NETWORKS_CREATE_REQUEST = 'NETWORKS_CREATE_REQUEST'
export const NETWORKS_CREATE_SUCCESS = 'NETWORKS_CREATE_SUCCESS'
export const NETWORKS_CREATE_FAILURE = 'NETWORKS_CREATE_FAILURE'

export function createNetworks(body, callback) {
  let endpoint = `${API_URL_PREFIX}/openstack/networks`
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
export function getNetWorksDetail(networkid, callback) {
  let endpoint = `${API_URL_PREFIX}/openstack/networks/`+networkid
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

export function deleteNetwork(networkid, callback) {
  let endpoint = `${API_URL_PREFIX}/openstack/networks/`+networkid

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

function fetchSubnetsList(callback) {
    let endpoint=`${API_URL_PREFIX}/openstack/subnets`
    return {
    [FETCH_API]: {
      types: [SUBNETS_LIST_REQUEST, SUBNETS_LIST_SUCCESS, SUBNETS_LIST_FAILURE],
      endpoint,
      schema: {}
    },
    callback: callback
  }
}

export function loadSubnetsList(callback) {
  return (dispath, getState) => {
    dispath(fetchSubnetsList(callback))
  }
}

export const SUBNETS_CREATE_REQUEST = 'SUBNETS_CREATE_REQUEST'
export const SUBNETS_CREATE_SUCCESS = 'SUBNETS_CREATE_SUCCESS'
export const SUBNETS_CREATE_FAILURE = 'SUBNETS_CREATE_FAILURE'

export function createSubnets(body, callback) {
  let endpoint=`${API_URL_PREFIX}/openstack/networks/subnets`
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
export function getSubnetsDetail(subnetid, callback) {
  return {
    [FETCH_API]: {
      types: [SUBNETS_DETAIL_REQUEST, SUBNETS_DETAIL_SUCCESS, SUBNETS_DETAIL_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/subnets/`+subnetid,
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

export function deleteSubnets(subnetid, callback) {
  let endpoint=`${API_URL_PREFIX}/openstack/subnets/`+subnetid
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

export function fetchPortsList(callback) {
  let endpoint=`${API_URL_PREFIX}/openstack/ports`
  return {
    [FETCH_API]: {
      types: [PORTS_LIST_REQUEST, PORTS_LIST_SUCCESS, PORTS_LIST_FAILURE],
      endpoint,
      schema: {}
    },
    callback: callback
  }
}

export function loadPortsList(callback) {
  return (dispath, getState) => {
    dispath(fetchPortsList(callback))
  }
}

export const PORTS_CREATE_REQUEST = 'PORTS_CREATE_REQUEST'
export const PORTS_CREATE_SUCCESS = 'PORTS_CREATE_SUCCESS'
export const PORTS_CREATE_FAILURE = 'PORTS_CREATE_FAILURE'

export function createPorts(body, callback) {
  return {
    [FETCH_API]: {
      types: [PORTS_CREATE_REQUEST, PORTS_CREATE_SUCCESS, PORTS_CREATE_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/ports`,
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
      endpoint: `${API_URL_PREFIX}/openstack/ports/`+portid,
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
      endpoint: `${API_URL_PREFIX}/openstack/ports/`+portid,
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

export function fetchFloatipsList(callback) {
    let endpoint=`${API_URL_PREFIX}/openstack/networks/floatingips`
    return {
    [FETCH_API]: {
      types: [FLOATIPS_LIST_REQUEST, FLOATIPS_LIST_SUCCESS, FLOATIPS_LIST_FAILURE],
      endpoint,
      schema: {}
    },
    callback: callback
  }
}

export function loadFloatipsList(callback) {
  return (dispath, getState) => {
    dispath(fetchFloatipsList(callback))
  }
}

export const FLOATIPS_CREATE_REQUEST = 'FLOATIPS_CREATE_REQUEST'
export const FLOATIPS_CREATE_SUCCESS = 'FLOATIPS_CREATE_SUCCESS'
export const FLOATIPS_CREATE_FAILURE = 'FLOATIPS_CREATE_FAILURE'

export function createFloatips(body, callback) {
  let endpoint=`${API_URL_PREFIX}/openstack/networks/floatingips`

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
      endpoint: `${API_URL_PREFIX}/openstack/floatips/`+floatipid,
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

export function deleteFloatips(floatipid, callback) {
  let endpoint=`${API_URL_PREFIX}/openstack/networks/floatingips/`+floatipid
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
// /openstack/:serverID/flavors/manage

export const FLOATIPS_MANAGE_REQUEST = 'FLOATIPS_MANAGE_REQUEST'
export const FLOATIPS_MANAGE_SUCCESS = 'FLOATIPS_MANAGE_SUCCESS'
export const FLOATIPS_MANAGE_FAILURE = 'FLOATIPS_MANAGE_FAILURE'

export function manageFloatips(serverID, body, callback) {
  let endpoint=`${API_URL_PREFIX}/openstack/${serverID}/flavors/manage`

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

// router list /openstack/networks/routers
export const GET_ROUTER_MANAGE_REQUEST = 'GET_ROUTER_MANAGE_REQUEST'
export const GET_ROUTER_MANAGE_SUCCESS = 'GET_ROUTER_MANAGE_SUCCESS'
export const GET_ROUTER_MANAGE_FAILURE = 'GET_ROUTER_MANAGE_FAILURE'

export function getRouterList(callback) {
  let endpoint=`${API_URL_PREFIX}/openstack/networks/routers`
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

export function createRouter(body, callback) {
  let endpoint=`${API_URL_PREFIX}/openstack/networks/routers`
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

export function deleteRouter(id,callback) {
  let endpoint=`${API_URL_PREFIX}/openstack/networks/routers/${id}`

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

export function editRouter(id,body,callback) {
  let endpoint=`${API_URL_PREFIX}/openstack/networks/routers/${id}`

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
export function getChildRouter(id,callback) {
  let endpoint=`${API_URL_PREFIX}/openstack/networks/routers/${id}`
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
export function getSubnetsRouter(callback) {
  let endpoint=`${API_URL_PREFIX}/openstack/networks/subnets/ownandcanuse`

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
  let endpoint=`${API_URL_PREFIX}/openstack/networks/routers/${query.routerId}/subnets/${query.subnetId}`
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
export function removeRouterSubnet(callback) {
  let endpoint=`${API_URL_PREFIX}/openstack/networks/routers/${query.routerId}/subnets/${query.subnetId}/remove`

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