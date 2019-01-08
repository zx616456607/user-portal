/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * Redux actions for right cloud integration
 *
 * v0.1 - 2018-11-23
 * @author zhangxuan
 */
import { FETCH_API } from '../../../src/middleware/api';
import { API_URL_PREFIX } from '../../../src/constants';
import { toQuerystring } from '../../../src/common/tools';

export const RIGHT_CLOUD_HOSTLIST_REQUEST = 'RIGHT_CLOUD_HOSTLIST_REQUEST'
export const RIGHT_CLOUD_HOSTLIST_SUCCESS = 'RIGHT_CLOUD_HOSTLIST_SUCCESS'
export const RIGHT_CLOUD_HOSTLIST_FAILURE = 'RIGHT_CLOUD_HOSTLIST_FAILURE'

const fetchHostList = query => ({
  [FETCH_API]: {
    types: [
      RIGHT_CLOUD_HOSTLIST_REQUEST,
      RIGHT_CLOUD_HOSTLIST_SUCCESS,
      RIGHT_CLOUD_HOSTLIST_FAILURE,
    ],
    endpoint: `${API_URL_PREFIX}/rightcloud/hosts?${toQuerystring(query)}`,
    schema: {},
  },
})

export const hostList = query =>
  dispatch => dispatch(fetchHostList(query))

export const RIGHT_CLOUD_VOLUMES_REQUEST = 'RIGHT_CLOUD_VOLUMES_REQUEST'
export const RIGHT_CLOUD_VOLUMES_SUCCESS = 'RIGHT_CLOUD_VOLUMES_SUCCESS'
export const RIGHT_CLOUD_VOLUMES_FAILURE = 'RIGHT_CLOUD_VOLUMES_FAILURE'

const fetchVolumeList = query => ({
  [FETCH_API]: {
    types: [
      RIGHT_CLOUD_VOLUMES_REQUEST,
      RIGHT_CLOUD_VOLUMES_SUCCESS,
      RIGHT_CLOUD_VOLUMES_FAILURE,
    ],
    endpoint: `${API_URL_PREFIX}/rightcloud/volumes?${toQuerystring(query)}`,
    schema: {},
  },
})

export const volumeList = query =>
  dispatch => dispatch(fetchVolumeList(query))

export const RIGHT_CLOUD_ENVS_REQUEST = 'RIGHT_CLOUD_ENVS_REQUEST'
export const RIGHT_CLOUD_ENVS_SUCCESS = 'RIGHT_CLOUD_ENVS_SUCCESS'
export const RIGHT_CLOUD_ENVS_FAILURE = 'RIGHT_CLOUD_ENVS_FAILURE'

const fetchCloudEnvList = query => ({
  [FETCH_API]: {
    types: [
      RIGHT_CLOUD_ENVS_REQUEST,
      RIGHT_CLOUD_ENVS_SUCCESS,
      RIGHT_CLOUD_ENVS_FAILURE,
    ],
    endpoint: `${API_URL_PREFIX}/rightcloud/envs?${toQuerystring(query)}`,
    schema: {},
  },
})

export const cloudEnvList = query =>
  dispatch => dispatch(fetchCloudEnvList(query))

export const CURRENT_CLOUD_ENV_CHANGE = 'CURRENT_CLOUD_ENV_CHANGE'

export const cloudEnvChange = env => ({
  type: CURRENT_CLOUD_ENV_CHANGE,
  env,
})

export const RIGHT_CLOUD_SUBNETS_REQUEST = 'RIGHT_CLOUD_SUBNETS_REQUEST'
export const RIGHT_CLOUD_SUBNETS_SUCCESS = 'RIGHT_CLOUD_SUBNETS_SUCCESS'
export const RIGHT_CLOUD_SUBNETS_FAILURE = 'RIGHT_CLOUD_SUBNETS_FAILURE'

const fetchSubnets = (vpcId, query) => {
  return {
    [FETCH_API]: {
      types: [
        RIGHT_CLOUD_SUBNETS_REQUEST,
        RIGHT_CLOUD_SUBNETS_SUCCESS,
        RIGHT_CLOUD_SUBNETS_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/rightcloud/vpc/${vpcId}/subnets?${toQuerystring(query)}`,
      schema: {},
    },
  }
}

export const getSubnets = (vpcId, query) =>
  dispatch => dispatch(fetchSubnets(vpcId, query))

export const RIGHT_CLOUD_NETWORK_REQUEST = 'RIGHT_CLOUD_NETWORK_REQUEST'
export const RIGHT_CLOUD_NETWORK_SUCCESS = 'RIGHT_CLOUD_NETWORK_SUCCESS'
export const RIGHT_CLOUD_NETWORK_FAILURE = 'RIGHT_CLOUD_NETWORK_FAILURE'

const fetchNetworks = (envId, query) => {
  return {
    [FETCH_API]: {
      types: [
        RIGHT_CLOUD_NETWORK_REQUEST,
        RIGHT_CLOUD_NETWORK_SUCCESS,
        RIGHT_CLOUD_NETWORK_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/rightcloud/env/${envId}/vpc?${toQuerystring(query)}`,
      schema: {},
    },
  }
}

export const getNetWorks = (envId, query) =>
  dispatch => dispatch(fetchNetworks(envId, query))

export const RIGHT_CLOUD_VIRTUAL_NETWORK_REQUEST = 'RIGHT_CLOUD_VIRTUAL_NETWORK_REQUEST'
export const RIGHT_CLOUD_VIRTUAL_NETWORK_SUCCESS = 'RIGHT_CLOUD_VIRTUAL_NETWORK_SUCCESS'
export const RIGHT_CLOUD_VIRTUAL_NETWORK_FAILURE = 'RIGHT_CLOUD_VIRTUAL_NETWORK_FAILURE'

const fetchVirtualNetworks = query => {
  return {
    [FETCH_API]: {
      types: [
        RIGHT_CLOUD_VIRTUAL_NETWORK_REQUEST,
        RIGHT_CLOUD_VIRTUAL_NETWORK_SUCCESS,
        RIGHT_CLOUD_VIRTUAL_NETWORK_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/rightclod/networks/ports?${toQuerystring(query)}`,
      schema: {},
    },
  }
}

export const getVirtualNetworks = query =>
  dispatch => dispatch(fetchVirtualNetworks(query))
