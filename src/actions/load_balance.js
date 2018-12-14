/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Redux actions for load balance
 *
 * v0.1 - 2018-01-30
 * @author zhangxuan
 */

import { FETCH_API } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'

export const LOAD_BALANCE_IP_LIST_REQUEST = 'LOAD_BALANCE_IP_LIST_REQUEST'
export const LOAD_BALANCE_IP_LIST_SUCCESS = 'LOAD_BALANCE_IP_LIST_SUCCESS'
export const LOAD_BALANCE_IP_LIST_FAILURE = 'LOAD_BALANCE_IP_LIST_FAILURE'

const fetchLBIPList = cluster => {
  return {
    [FETCH_API]: {
      types: [
        LOAD_BALANCE_IP_LIST_REQUEST,
        LOAD_BALANCE_IP_LIST_SUCCESS,
        LOAD_BALANCE_IP_LIST_FAILURE
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/loadbalances/ip`,
      schema: {},
    }
  }
}

export const getLBIPList = cluster =>
  dispatch => dispatch(fetchLBIPList(cluster))

export const CREATE_LOAD_BALANCES_REQUEST = 'CREATE_LOAD_BALANCES_REQUEST'
export const CREATE_LOAD_BALANCES_SUCCESS = 'CREATE_LOAD_BALANCES_SUCCESS'
export const CREATE_LOAD_BALANCES_FAILURE = 'CREATE_LOAD_BALANCES_FAILURE'

const fetchCreateLB = (cluster, agentType, body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        CREATE_LOAD_BALANCES_REQUEST,
        CREATE_LOAD_BALANCES_SUCCESS,
        CREATE_LOAD_BALANCES_FAILURE
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/loadbalances/displayname/${body.displayName}/agentType/${agentType}`,
      schema: {},
      options: {
        method: 'POST',
        body
      }
    },
    callback
  }
}

export const createLB = (cluster, agentType, body, callback) =>
  dispatch => dispatch(fetchCreateLB(cluster, agentType, body, callback))


export const EDIT_LOAD_BALANCE_REQUEST = 'EDIT_LOAD_BALANCE_REQUEST'
export const EDIT_LOAD_BALANCE_SUCCESS = 'EDIT_LOAD_BALANCE_SUCCESS'
export const EDIT_LOAD_BALANCE_FAILURE = 'EDIT_LOAD_BALANCE_FAILURE'

const fetchEditLB = (cluster, name, displayname, agentType, body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        EDIT_LOAD_BALANCE_REQUEST,
        EDIT_LOAD_BALANCE_SUCCESS,
        EDIT_LOAD_BALANCE_FAILURE
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/loadbalances/${name}/displayname/${displayname}/agentType/${agentType}`,
      schema: {},
      options: {
        method: 'PUT',
        body
      }
    },
    callback
  }
}

export const editLB = (cluster, name, displayname, agentType, body, callback) =>
  dispatch => dispatch(fetchEditLB(cluster, name, displayname, agentType, body, callback))

export const LOAD_BALANCE_LIST_REQUEST = 'LOAD_BALANCE_LIST_REQUEST'
export const LOAD_BALANCE_LIST_SUCCESS = 'LOAD_BALANCE_LIST_SUCCESS'
export const LOAD_BALANCE_LIST_FAILURE = 'LOAD_BALANCE_LIST_FAILURE'

const fetchLBList = (cluster, query, callback) => {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/loadbalances`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [
        LOAD_BALANCE_LIST_REQUEST,
        LOAD_BALANCE_LIST_SUCCESS,
        LOAD_BALANCE_LIST_FAILURE
      ],
      endpoint,
      schema: {},
    },
    callback
  }
}

export const getLBList = (cluster, query, callback) =>
  dispatch => dispatch(fetchLBList(cluster, query, callback))


export const GET_LOAD_BALANCE_DETAIL_REQUEST = 'GET_LOAD_BALANCE_DETAIL_REQUEST'
export const GET_LOAD_BALANCE_DETAIL_SUCCESS = 'GET_LOAD_BALANCE_DETAIL_SUCCESS'
export const GET_LOAD_BALANCE_DETAIL_FAILURE = 'GET_LOAD_BALANCE_DETAIL_FAILURE'

const fetchLBDetail = (cluster, name, displayName, callback) => {
  return {
    [FETCH_API]: {
      types: [
        GET_LOAD_BALANCE_DETAIL_REQUEST,
        GET_LOAD_BALANCE_DETAIL_SUCCESS,
        GET_LOAD_BALANCE_DETAIL_FAILURE
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/loadbalances/${name}/displayname/${displayName}`,
      schema: {}
    },
    callback
  }
}

export const getLBDetail = (cluster, name, displayName, callback) =>
  dispatch => dispatch(fetchLBDetail(cluster, name, displayName, callback))

export const DELETE_LOAD_BALANCE_REQUEST = 'DELETE_LOAD_BALANCE_REQUEST'
export const DELETE_LOAD_BALANCE_SUCCESS = 'DELETE_LOAD_BALANCE_SUCCESS'
export const DELETE_LOAD_BALANCE_FAILURE = 'DELETE_LOAD_BALANCE_FAILURE'

const fetchDeleteLB = (cluster, name, displayName, agentType, callback) => {
  return {
    [FETCH_API]: {
      types: [
        DELETE_LOAD_BALANCE_REQUEST,
        DELETE_LOAD_BALANCE_SUCCESS,
        DELETE_LOAD_BALANCE_FAILURE
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/loadbalances/${name}/displayname/${displayName}/agentType/${agentType}`,
      schema: {},
      options: {
        method: 'DELETE'
      }
    },
    callback
  }
}

export const deleteLB = (cluster, name, displayName, agentType, callback) =>
  dispatch => dispatch(fetchDeleteLB(cluster, name, displayName, agentType, callback))

export const CREATE_LOAD_BALANCE_INGRESS_REQUEST = 'CREATE_LOAD_BALANCE_INGRESS_REQUEST'
export const CREATE_LOAD_BALANCE_INGRESS_SUCCESS = 'CREATE_LOAD_BALANCE_INGRESS_SUCCESS'
export const CREATE_LOAD_BALANCE_INGRESS_FAILURE = 'CREATE_LOAD_BALANCE_INGRESS_FAILURE'

const fetchCreateIngress = (cluster, name, ingressName, displayName, agentType, body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        CREATE_LOAD_BALANCE_INGRESS_REQUEST,
        CREATE_LOAD_BALANCE_INGRESS_SUCCESS,
        CREATE_LOAD_BALANCE_INGRESS_FAILURE
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/loadbalances/${name}/ingress/${ingressName}/displayname/${displayName}/agentType/${agentType}`,
      schema: {},
      options: {
        method: 'POST',
        body
      }
    },
    callback
  }
}

export const createIngress = (cluster, name, ingressName, displayName, agentType, body, callback) =>
  dispatch => dispatch(fetchCreateIngress(cluster, name, ingressName, displayName, agentType, body, callback))

export const UPDATE_LOAD_BALANCE_INGRESS_REQUEST = 'UPDATE_LOAD_BALANCE_INGRESS_REQUEST'
export const UPDATE_LOAD_BALANCE_INGRESS_SUCCESS = 'UPDATE_LOAD_BALANCE_INGRESS_SUCCESS'
export const UPDATE_LOAD_BALANCE_INGRESS_FAILURE = 'UPDATE_LOAD_BALANCE_INGRESS_FAILURE'

const fetchUpdateIngress = (cluster, name, displayName, lbDisplayName, agentType, body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        UPDATE_LOAD_BALANCE_INGRESS_REQUEST,
        UPDATE_LOAD_BALANCE_INGRESS_SUCCESS,
        UPDATE_LOAD_BALANCE_INGRESS_FAILURE
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/loadbalances/${name}/ingress/${displayName}/displayname/${lbDisplayName}/agentType/${agentType}`,
      schema: {},
      options: {
        method: 'PUT',
        body
      }
    },
    callback
  }
}

export const updateIngress = (cluster, name, displayName, lbDisplayName, agentType, body, callback) =>
  dispatch => dispatch(fetchUpdateIngress(cluster, name, displayName, lbDisplayName, agentType, body, callback))

export const DELETE_LOAD_BALANCE_INGRESS_REQUESS = 'DELETE_LOAD_BALANCE_INGRESS_REQUESS'
export const DELETE_LOAD_BALANCE_INGRESS_SUCCESS = 'DELETE_LOAD_BALANCE_INGRESS_SUCCESS'
export const DELETE_LOAD_BALANCE_INGRESS_FAILURE = 'DELETE_LOAD_BALANCE_INGRESS_FAILURE'

const fetchDeleteIngress = (cluster, lbname, name, ingressDisplayName, displayName, agentType, callback) => {
  return {
    [FETCH_API]: {
      types: [
        DELETE_LOAD_BALANCE_INGRESS_REQUESS,
        DELETE_LOAD_BALANCE_INGRESS_SUCCESS,
        DELETE_LOAD_BALANCE_INGRESS_FAILURE
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/loadbalances/${lbname}/ingresses/${name}/${ingressDisplayName}/displayname/${displayName}/agentType/${agentType}`,
      schema: {},
      options: {
        method: 'DELETE'
      }
    },
    callback
  }
}

export const deleteIngress = (cluster, lbname, name, ingressDisplayName, displayName, agentType, callback) =>
  dispatch => dispatch(fetchDeleteIngress(cluster, lbname, name, ingressDisplayName, displayName, agentType, callback))

export const CREATE_APP_INGRESS_REQUEST = 'CREATE_APP_INGRESS_REQUEST'
export const CREATE_APP_INGRESS_SUCCESS = 'CREATE_APP_INGRESS_SUCCESS'
export const CREATE_APP_INGRESS_FAILURE = 'CREATE_APP_INGRESS_FAILURE'

const fetchCreateAppIngress = (cluster, lbname, ingressName, displayName, agentType, body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        CREATE_APP_INGRESS_REQUEST,
        CREATE_APP_INGRESS_SUCCESS,
        CREATE_APP_INGRESS_FAILURE
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/loadbalances/${lbname}/ingress/${ingressName}/app/displayname/${displayName}/agentType/${agentType}`,
      schema: {},
      options: {
        method: 'POST',
        body
      },
    },
    callback
  }
}

export const createAppIngress = (cluster, lbname, ingressName, displayName, agentType, body, callback) =>
  dispatch => dispatch(fetchCreateAppIngress(cluster, lbname, ingressName, displayName, agentType, body, callback))

export const GET_SERVICE_LOADBALANCE_REQUEST = 'GET_SERVICE_LOADBALANCE_REQUEST'
export const GET_SERVICE_LOADBALANCE_SUCCESS = 'GET_SERVICE_LOADBALANCE_SUCCESS'
export const GET_SERVICE_LOADBALANCE_FAILURE = 'GET_SERVICE_LOADBALANCE_FAILURE'

const fetchServiceLB = (cluster, serviceName, callback) => {
  return {
    [FETCH_API]: {
      types: [
        GET_SERVICE_LOADBALANCE_REQUEST,
        GET_SERVICE_LOADBALANCE_SUCCESS,
        GET_SERVICE_LOADBALANCE_FAILURE
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/loadbalances/services/${serviceName}/controller`,
      schema: {},
    },
    callback
  }
}

export const getServiceLBList = (cluster, serviceName, callback) =>
  dispatch => dispatch(fetchServiceLB(cluster, serviceName, callback))

export const DELETE_INGRESS_SERVICES_REQUEST = 'DELETE_INGRESS_SERVICES_REQUEST'
export const DELETE_INGRESS_SERVICES_SUCCESS = 'DELETE_INGRESS_SERVICES_SUCCESS'
export const DELETE_INGRESS_SERVICES_FAILURE = 'DELETE_INGRESS_SERVICES_FAILURE'

const fetchUnbindService = (cluster, lbname, serviceName, agentType, callback) => {
  return {
    [FETCH_API]: {
      types: [
        DELETE_INGRESS_SERVICES_REQUEST,
        DELETE_INGRESS_SERVICES_SUCCESS,
        DELETE_INGRESS_SERVICES_FAILURE
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/loadbalances/${lbname}/services/${serviceName}/agentType/${agentType}`,
      schema: {},
      options: {
        method: 'DELETE'
      }
    },
    callback
  }
}

export const unbindIngressService = (cluster, lbname, serviceName, agentType, callback) =>
  dispatch => dispatch(fetchUnbindService(cluster, lbname, serviceName, agentType, callback))

export const INGRESS_NAME_AND_HOST_EXISTENCE_REQUEST = 'INGRESS_NAME_AND_HOST_EXISTENCE_REQUEST'
export const INGRESS_NAME_AND_HOST_EXISTENCE_SUCCESS = 'INGRESS_NAME_AND_HOST_EXISTENCE_SUCCESS'
export const INGRESS_NAME_AND_HOST_EXISTENCE_FAILURE = 'INGRESS_NAME_AND_HOST_EXISTENCE_FAILURE'

const fetchIngressNameAndHost = (cluster, lbname, query, callback) => {
  return {
    [FETCH_API]: {
      types: [
        INGRESS_NAME_AND_HOST_EXISTENCE_REQUEST,
        INGRESS_NAME_AND_HOST_EXISTENCE_SUCCESS,
        INGRESS_NAME_AND_HOST_EXISTENCE_FAILURE
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/loadbalances/${lbname}/ingresses/exist?${toQuerystring(query)}`,
      schema: {}
    },
    callback
  }
}

export const checkIngressNameAndHost = (cluster, lbname, query, callback) =>
  dispatch => dispatch(fetchIngressNameAndHost(cluster, lbname, query, callback))

export const CREATE_TCP_UDP_INGRESS_REQUEST = 'CREATE_TCP_UDP_INGRESS_REQUEST'
export const CREATE_TCP_UDP_INGRESS_SUCCESS = 'CREATE_TCP_UDP_INGRESS_SUCCESS'
export const CREATE_TCP_UDP_INGRESS_FAILURE = 'CREATE_TCP_UDP_INGRESS_FAILURE'

const fetchCreateTcpUdpIngress = (cluster, lbname, type, name, agentType, body) => ({
  [FETCH_API]: {
    types: [
      CREATE_TCP_UDP_INGRESS_REQUEST,
      CREATE_TCP_UDP_INGRESS_SUCCESS,
      CREATE_TCP_UDP_INGRESS_FAILURE,
    ],
    endpoint: `${API_URL_PREFIX}/clusters/${cluster}/loadbalances/${lbname}/stream/type/${type}/displayname/${name}/agentType/${agentType}`,
    schema: {},
    options: {
      method: 'POST',
      body,
    }
  }
})

export const createTcpUdpIngress = (cluster, lbname, type, name, agentType, body) =>
  dispatch => dispatch(fetchCreateTcpUdpIngress(cluster, lbname, type, name, agentType, body))

export const GET_TCP_UDP_INGRESS_REQUEST = 'GET_TCP_UDP_INGRESS_REQUEST'
export const GET_TCP_UDP_INGRESS_SUCCESS = 'GET_TCP_UDP_INGRESS_SUCCESS'
export const GET_TCP_UDP_INGRESS_FAILURE = 'GET_TCP_UDP_INGRESS_FAILURE'

const fetchTcpUdpIngress = (cluster, lbname, type) => ({
  ingressType: type,
  [FETCH_API]: {
    types: [
      GET_TCP_UDP_INGRESS_REQUEST,
      GET_TCP_UDP_INGRESS_SUCCESS,
      GET_TCP_UDP_INGRESS_FAILURE
    ],
    endpoint: `${API_URL_PREFIX}/clusters/${cluster}/loadbalances/${lbname}/protocols/${type}`,
    schema: {},
  }
})

export const getTcpUdpIngress = (cluster, lbname, type) =>
  dispatch => dispatch(fetchTcpUdpIngress(cluster, lbname, type))

export const UPDATE_TCP_UDP_INGRESS_REQUEST = 'UPDATE_TCP_UDP_INGRESS_REQUEST'
export const UPDATE_TCP_UDP_INGRESS_SUCCESS = 'UPDATE_TCP_UDP_INGRESS_SUCCESS'
export const UPDATE_TCP_UDP_INGRESS_FAILURE = 'UPDATE_TCP_UDP_INGRESS_FAILURE'

const fetchUpdateTcpUdpIngress = (cluster, lbname, type, name, agentType, body) => ({
  [FETCH_API]: {
    types: [
      UPDATE_TCP_UDP_INGRESS_REQUEST,
      UPDATE_TCP_UDP_INGRESS_SUCCESS,
      UPDATE_TCP_UDP_INGRESS_FAILURE,
    ],
    endpoint: `${API_URL_PREFIX}/clusters/${cluster}/loadbalances/${lbname}/stream/type/${type}/displayname/${name}/agentType/${agentType}`,
    schema: {},
    options: {
      method: 'PUT',
      body,
    }
  }
})

export const updateTcpUdpIngress = (cluster, lbname, type, name, agentType, body) =>
  dispatch => dispatch(fetchUpdateTcpUdpIngress(cluster, lbname, type, name, agentType, body))

export const DELETE_TCP_UDP_INGRESS_REQUEST = 'DELETE_TCP_UDP_INGRESS_REQUEST'
export const DELETE_TCP_UDP_INGRESS_SUCCESS = 'DELETE_TCP_UDP_INGRESS_SUCCESS'
export const DELETE_TCP_UDP_INGRESS_FAILURE = 'DELETE_TCP_UDP_INGRESS_FAILURE'

const fetchDeleteTcpUdpIngress = (cluster, lbname, type, ports, name, agentType) => ({
  [FETCH_API]: {
    types: [
      DELETE_TCP_UDP_INGRESS_REQUEST,
      DELETE_TCP_UDP_INGRESS_SUCCESS,
      DELETE_TCP_UDP_INGRESS_FAILURE,
    ],
    endpoint: `${API_URL_PREFIX}/clusters/${cluster}/loadbalances/${lbname}/stream/protocols/${type}/ports/${ports}/displayname/${name}/agentType/${agentType}`,
    schema: {},
    options: {
      method: 'DELETE',
    }
  }
})

export const deleteTcpUdpIngress = (cluster, lbname, type, ports, name, agentType) =>
  dispatch => dispatch(fetchDeleteTcpUdpIngress(cluster, lbname, type, ports, name, agentType))

export const UPDATE_LB_WHITELIST_REQUEST = 'UPDATE_LB_WHITELIST_REQUEST'
export const UPDATE_LB_WHITELIST_SUCCESS = 'UPDATE_LB_WHITELIST_SUCCESS'
export const UPDATE_LB_WHITELIST_FAILURE = 'UPDATE_LB_WHITELIST_FAILURE'

const fetchUpdateLBWhiteList = (cluster, lbname, body, name, agentType) => ({
  [FETCH_API]: {
    types: [
      UPDATE_LB_WHITELIST_REQUEST,
      UPDATE_LB_WHITELIST_SUCCESS,
      UPDATE_LB_WHITELIST_FAILURE,
    ],
    endpoint: `${API_URL_PREFIX}/clusters/${cluster}/loadbalances/${lbname}/whitelist/displayname/${name}/agentType/${agentType}`,
    schema: {},
    options: {
      method: 'PUT',
      body,
    }
  }
})

export const updateLBWhiteList = (cluster, lbname, body, name, agentType) =>
  dispatch => dispatch(fetchUpdateLBWhiteList(cluster, lbname, body, name, agentType))

export const CHECK_LB_PERMISSION_REQUEST = 'CHECK_LB_PERMISSION_REQUEST'
export const CHECK_LB_PERMISSION_SUCCESS = 'CHECK_LB_PERMISSION_SUCCESS'
export const CHECK_LB_PERMISSION_FAILURE = 'CHECK_LB_PERMISSION_FAILURE'

const fetchCheckLbPermission = callback => ({
  [FETCH_API]: {
    types: [
      CHECK_LB_PERMISSION_REQUEST,
      CHECK_LB_PERMISSION_SUCCESS,
      CHECK_LB_PERMISSION_FAILURE,
    ],
    schema: {},
    endpoint: `${API_URL_PREFIX}/loadbalances/checkpermission`,
  },
  callback,
})

export const checkLbPermission = callback =>
  dispatch => dispatch(fetchCheckLbPermission(callback))

const CHECK_VIP_ISUSED_REQUEST = 'CHECK_VIP_ISUSED_REQUEST'
const CHECK_VIP_ISUSED_SUCCESS = 'CHECK_VIP_ISUSED_SUCCESS'
const CHECK_VIP_ISUSED_FAILURE = 'CHECK_VIP_ISUSED_FAILURE'

const fetchVipIsUsed = (cluster, vip, callback) => ({
  [FETCH_API]: {
    types: [
      CHECK_VIP_ISUSED_REQUEST,
      CHECK_VIP_ISUSED_SUCCESS,
      CHECK_VIP_ISUSED_FAILURE,
    ],
    schema: {},
    endpoint: `${API_URL_PREFIX}/clusters/${cluster}/loadbalances/vip/${vip}`,
  },
  callback,
})

export const getVipIsUsed = (cluster, vip, callback) =>
  dispatch => dispatch(fetchVipIsUsed(cluster, vip, callback))