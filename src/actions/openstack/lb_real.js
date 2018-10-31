/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Redux actions for lb
 *
 * v0.1 - 2017-07-28
 * @author houxz
 */

import { FETCH_API, Schemas } from '../../middleware/api'
import { API_URL_PREFIX } from '../../constants'
import { toQuerystring } from '../../common/tools'

export const OPENSTACK_REAL_LB_LIST_REQUEST = 'OPENSTACK_REAL_LB_LIST_REQUEST'
export const OPENSTACK_REAL_LB_LIST_SUCCESS = 'OPENSTACK_REAL_LB_LIST_SUCCESS'
export const OPENSTACK_REAL_LB_LIST_FAILURE = 'OPENSTACK_REAL_LB_LIST_FAILURE'

function fetchopenstackRealLBList(query, callback) {
    let endpoint=`${API_URL_PREFIX}/openstack/lb`
    if (query) {
        endpoint += `?${toQuerystring(query)}`
    }
    return {
    [FETCH_API]: {
      types: [OPENSTACK_REAL_LB_LIST_REQUEST, OPENSTACK_REAL_LB_LIST_SUCCESS, OPENSTACK_REAL_LB_LIST_FAILURE],
      endpoint,
      schema: {}
    },
    callback: callback
  }
}

export function loadopenstackRealLBList(query, callback) {
  return (dispath, getState) => {
    dispath(fetchopenstackRealLBList(query, callback))
  }
}

export const GET_OPENSTACK_LB_DESCRIPT_REQUEST = 'GET_OPENSTACK_LB_DESCRIPT_REQUEST'
export const GET_OPENSTACK_LB_DESCRIPT_SUCCESS = 'GET_OPENSTACK_LB_DESCRIPT_SUCCESS'
export const GET_OPENSTACK_LB_DESCRIPT_FAILURE = 'GET_OPENSTACK_LB_DESCRIPT_FAILURE'

function fetchopenstackdescriptName(callback) {
  return {
    [FETCH_API]: {
      types: [GET_OPENSTACK_LB_DESCRIPT_REQUEST, GET_OPENSTACK_LB_DESCRIPT_SUCCESS, GET_OPENSTACK_LB_DESCRIPT_FAILURE],
      endpoint:`${API_URL_PREFIX}/openstack/lb/descriptor`,
      schema: {}
    },
    callback: callback
  }
}

export function getLbDescriptName(callback) {
  return (dispath) => {
    dispath(fetchopenstackdescriptName(callback))
  }
}

export const OPENSTACK_REAL_LB_CREATE_REQUEST = 'OPENSTACK_REAL_LB_CREATE_REQUEST'
export const OPENSTACK_REAL_LB_CREATE_SUCCESS = 'OPENSTACK_REAL_LB_CREATE_SUCCESS'
export const OPENSTACK_REAL_LB_CREATE_FAILURE = 'OPENSTACK_REAL_LB_CREATE_FAILURE'

function fetchCreateopenstackRealLB(body, callback) {
  return {
    [FETCH_API]: {
      types: [OPENSTACK_REAL_LB_CREATE_REQUEST, OPENSTACK_REAL_LB_CREATE_SUCCESS, OPENSTACK_REAL_LB_CREATE_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/lb`,
      options: {
        method: 'POST',
        body: body
      },
      schema: {}
    },
    callback: callback
  }
}

export function createopenstackRealLB(body, callback) {
  return (dispath, getState) => {
    dispath(fetchCreateopenstackRealLB(body, callback))
  }
}



export const OPENSTACK_REAL_LB_DELETE_REQUEST = 'OPENSTACK_REAL_LB_DELETE_REQUEST'
export const OPENSTACK_REAL_LB_DELETE_SUCCESS = 'OPENSTACK_REAL_LB_DELETE_SUCCESS'
export const OPENSTACK_REAL_LB_DELETE_FAILURE = 'OPENSTACK_REAL_LB_DELETE_FAILURE'

function fetchDeleteopenstackRealLB(name, callback) {
  return {
    [FETCH_API]: {
      types: [OPENSTACK_REAL_LB_DELETE_REQUEST, OPENSTACK_REAL_LB_DELETE_SUCCESS, OPENSTACK_REAL_LB_DELETE_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/lb/${name}`,
      options: {
        method: 'DELETE'
      },
      schema: {}
    },
    callback
  }
}

export function deleteopenstackRealLB(name, callback) {
  return (dispath) => {
    return dispath(fetchDeleteopenstackRealLB(name, callback))
  }
}


//healthcheck
export const OPENSTACK_LB_HEALTHCHECK_LIST_REQUEST = 'OPENSTACK_LB_HEALTHCHECK_LIST_REQUEST'
export const OPENSTACK_LB_HEALTHCHECK_LIST_SUCCESS = 'OPENSTACK_LB_HEALTHCHECK_LIST_SUCCESS'
export const OPENSTACK_LB_HEALTHCHECK_LIST_FAILURE = 'OPENSTACK_LB_HEALTHCHECK_LIST_FAILURE'

function fetchopenstackLBHealthCheckList(query,vadcsID,callback) {
    let endpoint=`${API_URL_PREFIX}/openstack/lb/healthcheck/${vadcsID}`
    if (query) {
        endpoint += `?${toQuerystring(query)}`
    }
    return {
      vadcsID,
      [FETCH_API]: {
        types: [OPENSTACK_LB_HEALTHCHECK_LIST_REQUEST, OPENSTACK_LB_HEALTHCHECK_LIST_SUCCESS, OPENSTACK_LB_HEALTHCHECK_LIST_FAILURE],
        endpoint,
        schema: {}
      },
    callback: callback
  }
}

export function loadopenstackLbHealthcheckList(query,vadcsID,callback) {
  return (dispath, getState) => {
    dispath(fetchopenstackLBHealthCheckList(query,vadcsID,callback))
  }
}


export const OPENSTACK_LB_HEALTHCHECK_CREATE_REQUEST = 'OPENSTACK_LB_HEALTHCHECK_CREATE_REQUEST'
export const OPENSTACK_LB_HEALTHCHECK_CREATE_SUCCESS = 'OPENSTACK_LB_HEALTHCHECK_CREATE_SUCCESS'
export const OPENSTACK_LB_HEALTHCHECK_CREATE_FAILURE = 'OPENSTACK_LB_HEALTHCHECK_CREATE_FAILURE'

function fetchCreateopenstackLbHealthcheck(vadcsID,body, callback) {
  return {
    [FETCH_API]: {
      types: [OPENSTACK_LB_HEALTHCHECK_CREATE_REQUEST, OPENSTACK_LB_HEALTHCHECK_CREATE_SUCCESS, OPENSTACK_LB_HEALTHCHECK_CREATE_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/lb/healthcheck/${vadcsID}`,
      options: {
        method: 'POST',
        body: body
      },
      schema: {}
    },
    callback: callback
  }
}

export function createopenstackLbHealthcheck(vadcsID, body, callback) {
  return (dispath, getState) => {
    dispath(fetchCreateopenstackLbHealthcheck(vadcsID,body, callback))
  }
}



export const OPENSTACK_LB_HEALTHCHECK_DELETE_REQUEST = 'OPENSTACK_LB_HEALTHCHECK_DELETE_REQUEST'
export const OPENSTACK_LB_HEALTHCHECK_DELETE_SUCCESS = 'OPENSTACK_LB_HEALTHCHECK_DELETE_SUCCESS'
export const OPENSTACK_LB_HEALTHCHECK_DELETE_FAILURE = 'OPENSTACK_LB_HEALTHCHECK_DELETE_FAILURE'

function fetchDeleteopenstackLbHealthcheck(vadcsID,hcName,callback) {
  return {
    [FETCH_API]: {
      types: [OPENSTACK_LB_HEALTHCHECK_DELETE_REQUEST, OPENSTACK_LB_HEALTHCHECK_DELETE_SUCCESS, OPENSTACK_LB_HEALTHCHECK_DELETE_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/lb/healthcheck/${vadcsID}/${hcName}`,
      options: {
        method: 'DELETE'
      },
      schema: {}
    },
    callback
  }
}

export function deleteopenstackLbHealthcheck(vadcsID,hcName,callback) {
  return (dispath) => {
    return dispath(fetchDeleteopenstackLbHealthcheck(vadcsID,hcName,callback))
  }
}


export const OPENSTACK_LB_HEALTHCHECK_SEARCH = 'OPENSTACK_LB_HEALTHCHECK_SEARCH'
export function searchHealthCheck(vadcID,searchValue) {
  return {
    type: OPENSTACK_LB_HEALTHCHECK_SEARCH,
    vadcID,
    searchValue,
  }
}


//pools
export const OPENSTACK_LB_POOLS_LIST_REQUEST = 'OPENSTACK_LB_POOLS_LIST_REQUEST'
export const OPENSTACK_LB_POOLS_LIST_SUCCESS = 'OPENSTACK_LB_POOLS_LIST_SUCCESS'
export const OPENSTACK_LB_POOLS_LIST_FAILURE = 'OPENSTACK_LB_POOLS_LIST_FAILURE'

function fetchopenstackLBPoolsList(query,vadcsID,callback) {
  let endpoint=`${API_URL_PREFIX}/openstack/lb/pool/${vadcsID}`
  if (query) {
      endpoint += `?${toQuerystring(query)}`
  }
  return {
    vadcsID,
    [FETCH_API]: {
      types: [OPENSTACK_LB_POOLS_LIST_REQUEST, OPENSTACK_LB_POOLS_LIST_SUCCESS, OPENSTACK_LB_POOLS_LIST_FAILURE],
      endpoint,
      schema: {}
    },
    callback: callback
  }
}

export function loadopenstackLbPoolsList(query,vadcsID,callback) {
  return (dispath, getState) => {
    dispath(fetchopenstackLBPoolsList(query,vadcsID,callback))
  }
}


export const OPENSTACK_LB_POOLS_CREATE_REQUEST = 'OPENSTACK_LB_POOLS_CREATE_REQUEST'
export const OPENSTACK_LB_POOLS_CREATE_SUCCESS = 'OPENSTACK_LB_POOLS_CREATE_SUCCESS'
export const OPENSTACK_LB_POOLS_CREATE_FAILURE = 'OPENSTACK_LB_POOLS_CREATE_FAILURE'

function fetchCreateopenstackLbPools(vadcsID,body, callback) {
  return {
    [FETCH_API]: {
      types: [OPENSTACK_LB_POOLS_CREATE_REQUEST, OPENSTACK_LB_POOLS_CREATE_SUCCESS, OPENSTACK_LB_POOLS_CREATE_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/lb/pool/${vadcsID}`,
      options: {
        method: 'POST',
        body: body
      },
      schema: {}
    },
    callback: callback
  }
}

export function createopenstackLbPools(vadcsID, body, callback) {
  return (dispath, getState) => {
    dispath(fetchCreateopenstackLbPools(vadcsID,body, callback))
  }
}



export const OPENSTACK_LB_POOLS_DELETE_REQUEST = 'OPENSTACK_LB_POOLS_DELETE_REQUEST'
export const OPENSTACK_LB_POOLS_DELETE_SUCCESS = 'OPENSTACK_LB_POOLS_DELETE_SUCCESS'
export const OPENSTACK_LB_POOLS_DELETE_FAILURE = 'OPENSTACK_LB_POOLS_DELETE_FAILURE'

function fetchDeleteopenstackLbPools(vadcsID,poolName,callback) {
  return {
    [FETCH_API]: {
      types: [OPENSTACK_LB_POOLS_DELETE_REQUEST, OPENSTACK_LB_POOLS_DELETE_SUCCESS, OPENSTACK_LB_POOLS_DELETE_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/lb/pool/${vadcsID}/${poolName}`,
      options: {
        method: 'DELETE'
      },
      schema: {}
    },
    callback
  }
}

export function deleteopenstackLbPools(vadcsID,poolName,callback) {
  return (dispath) => {
    return dispath(fetchDeleteopenstackLbPools(vadcsID,poolName,callback))
  }
}


export const OPENSTACK_LB_POOLS_UPDATE_REQUEST = 'OPENSTACK_LB_POOLS_UPDATE_REQUEST'
export const OPENSTACK_LB_POOLS_UPDATE_SUCCESS = 'OPENSTACK_LB_POOLS_UPDATE_SUCCESS'
export const OPENSTACK_LB_POOLS_UPDATE_FAILURE = 'OPENSTACK_LB_POOLS_UPDATE_FAILURE'

export function fetchUpdateopenstackLbPools(vadcsID,poolName,body, callback) {
  return {
    [FETCH_API]: {
      types: [OPENSTACK_LB_POOLS_UPDATE_REQUEST, OPENSTACK_LB_POOLS_UPDATE_SUCCESS, OPENSTACK_LB_POOLS_UPDATE_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/lb/pool/${vadcsID}/${poolName}`,
      options: {
        method: 'PUT',
        body: body
      },
      schema: {}
    },
    callback: callback
  }
}



export const OPENSTACK_LB_POOLS_MEMBERS_CREATE_REQUEST = 'OPENSTACK_LB_POOLS_MEMBERS_CREATE_REQUEST'
export const OPENSTACK_LB_POOLS_MEMBERS_CREATE_SUCCESS = 'OPENSTACK_LB_POOLS_MEMBERS_CREATE_SUCCESS'
export const OPENSTACK_LB_POOLS_MEMBERS_CREATE_FAILURE = 'OPENSTACK_LB_POOLS_MEMBERS_CREATE_FAILURE'

export function fetchCreateopenstackLbPoolsCreateMembers(vadcsID,poolName,body, callback) {
  return {
    [FETCH_API]: {
      types: [OPENSTACK_LB_POOLS_MEMBERS_CREATE_REQUEST, OPENSTACK_LB_POOLS_MEMBERS_CREATE_SUCCESS, OPENSTACK_LB_POOLS_MEMBERS_CREATE_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/lb/pool/${vadcsID}/${poolName}/members`,
      options: {
        method: 'POST',
        body: body
      },
      schema: {}
    },
    callback: callback
  }
}

export const OPENSTACK_LB_POOLS_MEMBERS_DELETE_REQUEST = 'OPENSTACK_LB_POOLS_MEMBERS_DELETE_REQUEST'
export const OPENSTACK_LB_POOLS_MEMBERS_DELETE_SUCCESS = 'OPENSTACK_LB_POOLS_MEMBERS_DELETE_SUCCESS'
export const OPENSTACK_LB_POOLS_MEMBERS_DELETE_FAILURE = 'OPENSTACK_LB_POOLS_MEMBERS_DELETE_FAILURE'

export function fetchDeleteopenstackLbPoolsMembers(vadcsID,poolName, callback) {
  return {
    [FETCH_API]: {
      types: [OPENSTACK_LB_POOLS_MEMBERS_DELETE_REQUEST, OPENSTACK_LB_POOLS_MEMBERS_DELETE_SUCCESS, OPENSTACK_LB_POOLS_MEMBERS_DELETE_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/lb/pool/${vadcsID}/${poolName}/members`,
      options: {
        method: 'DELETE'
      },
      schema: {}
    },
    callback: callback
  }
}


export const OPENSTACK_LB_POOLS_SEARCH = 'OPENSTACK_LB_POOLS_SEARCH'
export function searchPools(vadcID,searchValue) {
  return {
    type: OPENSTACK_LB_POOLS_SEARCH,
    vadcID,
    searchValue,
  }
}


//vips
export const OPENSTACK_LB_VIPS_LIST_REQUEST = 'OPENSTACK_LB_VIPS_LIST_REQUEST'
export const OPENSTACK_LB_VIPS_LIST_SUCCESS = 'OPENSTACK_LB_VIPS_LIST_SUCCESS'
export const OPENSTACK_LB_VIPS_LIST_FAILURE = 'OPENSTACK_LB_VIPS_LIST_FAILURE'

function fetchopenstackLBVipsList(vadcsID,callback) {
  let endpoint=`${API_URL_PREFIX}/openstack/lb/vip/${vadcsID}`
  return {
    vadcsID,
    [FETCH_API]: {
      types: [OPENSTACK_LB_VIPS_LIST_REQUEST, OPENSTACK_LB_VIPS_LIST_SUCCESS, OPENSTACK_LB_VIPS_LIST_FAILURE],
      endpoint,
      schema: {}
    },
    callback: callback
  }
}

export function loadopenstackLbVipsList(vadcsID,callback) {
  return (dispath, getState) => {
    dispath(fetchopenstackLBVipsList(vadcsID,callback))
  }
}


export const OPENSTACK_LB_VIPS_CREATE_REQUEST = 'OPENSTACK_LB_VIPS_CREATE_REQUEST'
export const OPENSTACK_LB_VIPS_CREATE_SUCCESS = 'OPENSTACK_LB_VIPS_CREATE_SUCCESS'
export const OPENSTACK_LB_VIPS_CREATE_FAILURE = 'OPENSTACK_LB_VIPS_CREATE_FAILURE'

function fetchCreateopenstackLbVips(vadcsID,body, callback) {
  return {
    [FETCH_API]: {
      types: [OPENSTACK_LB_VIPS_CREATE_REQUEST, OPENSTACK_LB_VIPS_CREATE_SUCCESS, OPENSTACK_LB_VIPS_CREATE_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/lb/vip/${vadcsID}`,
      options: {
        method: 'POST',
        body: body
      },
      schema: {}
    },
    callback: callback
  }
}

export function createopenstackLbVips(vadcsID, body, callback) {
  return (dispath, getState) => {
    dispath(fetchCreateopenstackLbVips(vadcsID,body, callback))
  }
}



export const OPENSTACK_LB_VIPS_DELETE_REQUEST = 'OPENSTACK_LB_VIPS_DELETE_REQUEST'
export const OPENSTACK_LB_VIPS_DELETE_SUCCESS = 'OPENSTACK_LB_VIPS_DELETE_SUCCESS'
export const OPENSTACK_LB_VIPS_DELETE_FAILURE = 'OPENSTACK_LB_VIPS_DELETE_FAILURE'

function fetchDeleteopenstackLbVips(vadcsID,vipName,callback) {
  return {
    [FETCH_API]: {
      types: [OPENSTACK_LB_VIPS_DELETE_REQUEST, OPENSTACK_LB_VIPS_DELETE_SUCCESS, OPENSTACK_LB_VIPS_DELETE_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/lb/vip/${vadcsID}/${vipName}`,
      options: {
        method: 'DELETE'
      },
      schema: {}
    },
    callback
  }
}

export function deleteopenstackLbVips(vadcsID,vipName,callback) {
  return (dispath) => {
    return dispath(fetchDeleteopenstackLbVips(vadcsID,vipName,callback))
  }
}


export const OPENSTACK_LB_VIPS_UPDATE_REQUEST = 'OPENSTACK_LB_VIPS_UPDATE_REQUEST'
export const OPENSTACK_LB_VIPS_UPDATE_SUCCESS = 'OPENSTACK_LB_VIPS_UPDATE_SUCCESS'
export const OPENSTACK_LB_VIPS_UPDATE_FAILURE = 'OPENSTACK_LB_VIPS_UPDATE_FAILURE'

export function fetchUpdateopenstackLbVips(vadcsID,vipName,body, callback) {
  return {
    [FETCH_API]: {
      types: [OPENSTACK_LB_VIPS_UPDATE_REQUEST, OPENSTACK_LB_VIPS_UPDATE_SUCCESS, OPENSTACK_LB_VIPS_UPDATE_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/lb/vip/${vadcsID}/${vipName}`,
      options: {
        method: 'PUT',
        body: body
      },
      schema: {}
    },
    callback: callback
  }
}


export const OPENSTACK_LB_VIPS_SEARCH = 'OPENSTACK_LB_VIPS_SEARCH'
export function searchVips(vadcID,searchValue) {
  return {
    type: OPENSTACK_LB_VIPS_SEARCH,
    vadcID,
    searchValue,
  }
}

export const GET_OPENSTACK_LB_DNS_REQUEST = 'GET_OPENSTACK_LB_DNS_REQUEST'
export const GET_OPENSTACK_LB_DNS_SUCCESS = 'GET_OPENSTACK_LB_DNS_SUCCESS'
export const GET_OPENSTACK_LB_DNS_FAILURE = 'GET_OPENSTACK_LB_DNS_FAILURE'

export function loadLbDns(name,callback) {
  return {
    [FETCH_API]: {
      types: [GET_OPENSTACK_LB_DNS_REQUEST, GET_OPENSTACK_LB_DNS_SUCCESS, GET_OPENSTACK_LB_DNS_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/lb/dns/${name}/dns_listener`,
      schema: {}
    },
    callback: callback
  }
}

export const CREATE_OPENSTACK_LB_DNS_REQUEST = 'CREATE_OPENSTACK_LB_DNS_REQUEST'
export const CREATE_OPENSTACK_LB_DNS_SUCCESS = 'CREATE_OPENSTACK_LB_DNS_SUCCESS'
export const CREATE_OPENSTACK_LB_DNS_FAILURE = 'CREATE_OPENSTACK_LB_DNS_FAILURE'

export function createLbDns(name, body, callback) {
  return {
    [FETCH_API]: {
      types: [CREATE_OPENSTACK_LB_DNS_REQUEST, CREATE_OPENSTACK_LB_DNS_SUCCESS, CREATE_OPENSTACK_LB_DNS_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/lb/dns/${name}/dns_listener`,
      options: {
        method:'POST',
        body,
      },
      schema: {}
    },
    callback: callback
  }
}

export const DELETE_OPENSTACK_LB_DNS_REQUEST = 'DELETE_OPENSTACK_LB_DNS_REQUEST'
export const DELETE_OPENSTACK_LB_DNS_SUCCESS = 'DELETE_OPENSTACK_LB_DNS_SUCCESS'
export const DELETE_OPENSTACK_LB_DNS_FAILURE = 'DELETE_OPENSTACK_LB_DNS_FAILURE'

export function deleteLbDns(body, callback) {
  return {
    [FETCH_API]: {
      types: [DELETE_OPENSTACK_LB_DNS_REQUEST, DELETE_OPENSTACK_LB_DNS_SUCCESS, DELETE_OPENSTACK_LB_DNS_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/lb/dns/${body.name}/dns_listener/${body.domain}`,
      options: {
        method:'DELETE',
      },
      schema: {}
    },
    callback: callback
  }
}

export const GET_OPENSTACK_LB_DOMAIN_REQUEST = 'GET_OPENSTACK_LB_DOMAIN_REQUEST'
export const GET_OPENSTACK_LB_DOMAIN_SUCCESS = 'GET_OPENSTACK_LB_DOMAIN_SUCCESS'
export const GET_OPENSTACK_LB_DOMAIN_FAILURE = 'GET_OPENSTACK_LB_DOMAIN_FAILURE'

export function loadLbDomain(name,callback) {
  return {
    [FETCH_API]: {
      types: [GET_OPENSTACK_LB_DNS_REQUEST, GET_OPENSTACK_LB_DNS_SUCCESS, GET_OPENSTACK_LB_DNS_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/lb/dns/${name}/domains`,
      schema: {}
    },
    callback: callback
  }
}

export const DELETE_OPENSTACK_LB_DOMAIN_REQUEST = 'DELETE_OPENSTACK_LB_DOMAIN_REQUEST'
export const DELETE_OPENSTACK_LB_DOMAIN_SUCCESS = 'DELETE_OPENSTACK_LB_DOMAIN_SUCCESS'
export const DELETE_OPENSTACK_LB_DOMAIN_FAILURE = 'DELETE_OPENSTACK_LB_DOMAIN_FAILURE'

export function deleteLbDomain(body, callback) {
  return {
    [FETCH_API]: {
      types: [DELETE_OPENSTACK_LB_DOMAIN_REQUEST, DELETE_OPENSTACK_LB_DOMAIN_SUCCESS, DELETE_OPENSTACK_LB_DOMAIN_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/lb/dns/${body.name}/domains/${body.domain}`,
      options: {
        method:'DELETE',
      },
      schema: {}
    },
    callback: callback
  }
}

export const CREATE_OPENSTACK_LB_DOMAIN_REQUEST = 'CREATE_OPENSTACK_LB_DOMAIN_REQUEST'
export const CREATE_OPENSTACK_LB_DOMAIN_SUCCESS = 'CREATE_OPENSTACK_LB_DOMAIN_SUCCESS'
export const CREATE_OPENSTACK_LB_DOMAIN_FAILURE = 'CREATE_OPENSTACK_LB_DOMAIN_FAILURE'

export function createLbDomain(name, body, callback) {
  return {
    [FETCH_API]: {
      types: [CREATE_OPENSTACK_LB_DNS_REQUEST, CREATE_OPENSTACK_LB_DNS_SUCCESS, CREATE_OPENSTACK_LB_DNS_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/lb/dns/${name}/domains`,
      options: {
        method:'POST',
        body,
      },
      schema: {}
    },
    callback: callback
  }
}