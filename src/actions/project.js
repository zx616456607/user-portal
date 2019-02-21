/**
 * Created by houxz on 2017/6/6.
 */

import { FETCH_API } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'
import { Schemas } from '../middleware/api'
export const PROJECTS_CREATE_REQUEST = 'PROJECTS_CREATE_REQUEST'
export const PROJECTS_CREATE_SUCCESS = 'PROJECTS_CREATE_SUCCESS'
export const PROJECTS_CREATE_FAILURE = 'PROJECTS_CREATE_FAILURE'

// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchCreateProjects(body, callback) {
	let endpoint = `${API_URL_PREFIX}/projects`
	return {
		[FETCH_API]: {
			types: [PROJECTS_CREATE_REQUEST, PROJECTS_CREATE_SUCCESS, PROJECTS_CREATE_FAILURE],
			endpoint,
			schema: {},
			options: {
				method: 'POST',
				body: body.body
			},
		},
		callback
	}
}
// Fetches upgrade or renewals from API
// Relies on Redux Thunk middleware.
export function CreateProjects(body, callback) {
	return (dispatch) => {
		return dispatch(fetchCreateProjects(body, callback))
	}
}




export const PROJECTS_CHECK_REQUEST = 'PROJECTS_CHECK_REQUEST'
export const PROJECTS_CHECK_SUCCESS = 'PROJECTS_CHECK_SUCCESS'
export const PROJECTS_CHECK_FAILURE = 'PROJECTS_CHECK_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchCheckProjectsExists(body, callback) {
	let endpoint = `${API_URL_PREFIX}/projects/${body.projectsName}/check-exists`
  return {
		[FETCH_API]: {
			types: [PROJECTS_CHECK_REQUEST, PROJECTS_CHECK_SUCCESS, PROJECTS_CHECK_FAILURE],
			endpoint,
			schema: {},
			options: {
				method: 'GET',
			},
		},
		callback
	}
}
// Fetches upgrade or renewals from API
// Relies on Redux Thunk middleware.
export function CheckProjects(body, callback) {
	return (dispatch) => {
		return dispatch(fetchCheckProjectsExists(body, callback))
	}
}


export const DISPLAY_NAME_CHECK_REQUEST = 'DISPLAY_NAME_CHECK_REQUEST'
export const DISPLAY_NAME_CHECK_SUCCESS = 'DISPLAY_NAME_CHECK_SUCCESS'
export const DISPLAY_NAME_CHECK_FAILURE = 'DISPLAY_NAME_CHECK_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchCheckDisplayNameExists(body, callback) {
  let endpoint = `${API_URL_PREFIX}/projects/${body.displayName}/name-exists`
  return {
    [FETCH_API]: {
      types: [DISPLAY_NAME_CHECK_REQUEST, DISPLAY_NAME_CHECK_SUCCESS, DISPLAY_NAME_CHECK_FAILURE],
      endpoint,
      schema: {},
    },
    callback
  }
}
// Fetches upgrade or renewals from API
// Relies on Redux Thunk middleware.
export function CheckDisplayName(body, callback) {
  return (dispatch) => {
    return dispatch(fetchCheckDisplayNameExists(body, callback))
  }
}



export const PROJECTS_CHECK_MANAGER_REQUEST = 'PROJECTS_CHECK_MANAGER_REQUEST'
export const PROJECTS_CHECK_MANAGER_SUCCESS = 'PROJECTS_CHECK_MANAGER_SUCCESS'
export const PROJECTS_CHECK_MANAGER_FAILURE = 'PROJECTS_CHECK_MANAGER_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchCheckProjectsManager(callback) {
	let endpoint = `${API_URL_PREFIX}/projects/check-manager`
	return {
		[FETCH_API]: {
			types: [PROJECTS_CHECK_MANAGER_REQUEST, PROJECTS_CHECK_MANAGER_SUCCESS, PROJECTS_CHECK_MANAGER_FAILURE],
			endpoint,
			schema: {},
			options: {
				method: 'GET',
			},
		},
		callback
	}
}
// Fetches upgrade or renewals from API
// Relies on Redux Thunk middleware.
export function CheckProjectsManager(callback) {
	return (dispatch) => {
		return dispatch(fetchCheckProjectsManager(callback))
	}
}




export const PROJECTS_DELETE_REQUEST = 'PROJECTS_DELETE_REQUEST'
export const PROJECTS_DELETE_SUCCESS = 'PROJECTS_DELETE_SUCCESS'
export const PROJECTS_DELETE_FAILURE = 'PROJECTS_DELETE_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.

function fetchDeleteProjects(body, callback) {
  let endpoint = `${API_URL_PREFIX}/projects/batch-delete`
	return {
		[FETCH_API]: {
			types: [PROJECTS_DELETE_REQUEST, PROJECTS_DELETE_SUCCESS, PROJECTS_DELETE_FAILURE],
			endpoint,
			schema: {},
			options: {
				method: 'POST',
				body: body.body
			},
		},
		callback
	}
}
// Fetches upgrade or renewals from API
// Relies on Redux Thunk middleware.
export function DeleteProjects(body, callback) {
	return (dispatch) => {
		return dispatch(fetchDeleteProjects(body, callback))
	}
}


export const PROJECTS_DETAIL_REQUEST = 'PROJECTS_DETAIL_REQUEST'
export const PROJECTS_DETAIL_SUCCESS = 'PROJECTS_DETAIL_SUCCESS'
export const PROJECTS_DETAIL_FAILURE = 'PROJECTS_DETAIL_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.

function fetchGetProjectsDetail(body, callback) {
  const projectsName = body.projectsName
  let endpoint = `${API_URL_PREFIX}/projects/${projectsName}/detail`
	return {
    projectsName,
		[FETCH_API]: {
			types: [PROJECTS_DETAIL_REQUEST, PROJECTS_DETAIL_SUCCESS, PROJECTS_DETAIL_FAILURE],
			endpoint,
			schema: {},
			options: {
				method: 'GET'
			},
		},
		callback
	}
}
// Fetches upgrade or renewals from API
// Relies on Redux Thunk middleware.
export function GetProjectsDetail(body, callback) {
	return (dispatch) => {
		return dispatch(fetchGetProjectsDetail(body, callback))
	}
}

export const PROJECTS_LIST_REQUEST = 'PROJECTS_LIST_REQUEST'
export const PROJECTS_LIST_SUCCESS = 'PROJECTS_LIST_SUCCESS'
export const PROJECTS_LIST_FAILURE = 'PROJECTS_LIST_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchListProjects(query, callback) {
	let endpoint = `${API_URL_PREFIX}/projects/list`
	if (query) {
		endpoint += `?${toQuerystring(query)}`
	}
	return {
		[FETCH_API]: {
			types: [PROJECTS_LIST_REQUEST, PROJECTS_LIST_SUCCESS, PROJECTS_LIST_FAILURE],
			endpoint,
			schema: {},
			options: {
				method: 'GET'
			},
		},
		callback
	}
}
// Fetches upgrade or renewals from API
// Relies on Redux Thunk middleware.
export function ListProjects(query, callback) {
	return (dispatch) => {
		return dispatch(fetchListProjects(query, callback))
	}
}

export const PROJECTS_LIST_STATISTICS_REQUEST = 'PROJECTS_LIST_STATISTICS_REQUEST'
export const PROJECTS_LIST_STATISTICS_SUCCESS = 'PROJECTS_LIST_STATISTICS_SUCCESS'
export const PROJECTS_LIST_STATISTICS_FAILURE = 'PROJECTS_LIST_STATISTICS_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchListProjectsAndStatistics(query, callback) {
  let endpoint = `${API_URL_PREFIX}/projects/list-statistics`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [PROJECTS_LIST_STATISTICS_REQUEST, PROJECTS_LIST_STATISTICS_SUCCESS, PROJECTS_LIST_STATISTICS_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'GET'
      },
    },
    callback
  }
}
// Fetches upgrade or renewals from API
// Relies on Redux Thunk middleware.
export function ListProjectsAndStatistics(query, callback) {
  return (dispatch) => {
    return dispatch(fetchListProjectsAndStatistics(query, callback))
  }
}

export const PROJECTS_LIST_VISIBLE_REQUEST = 'PROJECTS_LIST_VISIBLE_REQUEST'
export const PROJECTS_LIST_VISIBLE_SUCCESS = 'PROJECTS_LIST_VISIBLE_SUCCESS'
export const PROJECTS_LIST_VISIBLE_FAILURE = 'PROJECTS_LIST_VISIBLE_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchListVisibleProjects(body, callback) {
	let endpoint = `${API_URL_PREFIX}/projects/list-visible`
	return {
		[FETCH_API]: {
			types: [PROJECTS_LIST_VISIBLE_REQUEST, PROJECTS_LIST_VISIBLE_SUCCESS, PROJECTS_LIST_VISIBLE_FAILURE],
			endpoint,
			schema: {},
			options: {
				method: 'GET'
			},
		},
		callback
	}
}
// Fetches upgrade or renewals from API
// Relies on Redux Thunk middleware.
export function ListVisibleProjects(body, callback) {
	return (dispatch) => {
		return dispatch(fetchListVisibleProjects(body, callback))
	}
}





export const PROJECTS_UPDATE_REQUEST = 'PROJECTS_UPDATE_REQUEST'
export const PROJECTS_UPDATE_SUCCESS = 'PROJECTS_UPDATE_SUCCESS'
export const PROJECTS_UPDATE_FAILURE = 'PROJECTS_UPDATE_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUpdateProjects(body, callback) {
  let endpoint = `${API_URL_PREFIX}/projects/${body.projectName}`
	return {
		[FETCH_API]: {
			types: [PROJECTS_UPDATE_REQUEST, PROJECTS_UPDATE_SUCCESS, PROJECTS_UPDATE_FAILURE],
			endpoint,
			schema: {},
			options: {
				method: 'PUT',
				body: body.body
			},
		},
		callback
	}
}
// Fetches upgrade or renewals from API
// Relies on Redux Thunk middleware.
export function UpdateProjects(body, callback) {
	return (dispatch) => {
		return dispatch(fetchUpdateProjects(body, callback))
	}
}

export const PROJECTS_CLUSTER_APPROVAL_GET_REQUEST = 'PROJECTS_CLUSTER_APPROVAL_GET_REQUEST'
export const PROJECTS_CLUSTER_APPROVAL_GET_SUCCESS = 'PROJECTS_CLUSTER_APPROVAL_GET_SUCCESS'
export const PROJECTS_CLUSTER_APPROVAL_GET_FAILURE = 'PROJECTS_CLUSTER_APPROVAL_GET_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchGetProjectsApprovalClusters(query,callback) {
  let endpoint = `${API_URL_PREFIX}/projects/approval-clusters`
  if(query){
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [PROJECTS_CLUSTER_APPROVAL_GET_REQUEST,PROJECTS_CLUSTER_APPROVAL_GET_SUCCESS,PROJECTS_CLUSTER_APPROVAL_GET_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'GET'
      },
    },
    status: query,
    callback
  }
}
// Fetches upgrade or renewals from API
// Relies on Redux Thunk middleware.
export function GetProjectsApprovalClusters(query,callback) {
  return (dispatch) => {
    return dispatch(fetchGetProjectsApprovalClusters(query,callback))
  }
}

export const PROJECTS_CLUSTER_APPROVAL_WITHOUT_GET_REQUEST = 'PROJECTS_CLUSTER_APPROVAL_WITHOUT_GET_REQUEST'
export const PROJECTS_CLUSTER_APPROVAL_WITHOUT_GET_SUCCESS = 'PROJECTS_CLUSTER_APPROVAL_WITHOUT_GET_SUCCESS'
export const PROJECTS_CLUSTER_APPROVAL_WITHOUT_GET_FAILURE = 'PROJECTS_CLUSTER_APPROVAL_WITHOUT_GET_FAILURE'
function fetchGetProjectsApprovalClustersWithoutTypes(query,callback) {
  let endpoint = `${API_URL_PREFIX}/projects/approval-clusters`
  if(query){
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [PROJECTS_CLUSTER_APPROVAL_WITHOUT_GET_REQUEST,PROJECTS_CLUSTER_APPROVAL_WITHOUT_GET_SUCCESS,PROJECTS_CLUSTER_APPROVAL_WITHOUT_GET_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'GET'
      },
    },
    status: query,
    callback
  }
}
// Fetches upgrade or renewals from API
// Relies on Redux Thunk middleware.
export function GetProjectsApprovalClustersWithoutTypes(query,callback) {
  return (dispatch) => {
    return dispatch(fetchGetProjectsApprovalClustersWithoutTypes(query,callback))
  }
}

export const SEARCH_PROJECTS_CLUSTER_APPROVAL_GET = 'SEARCH_PROJECTS_CLUSTER_APPROVAL_GET'

export function searchProjectsClusterApproval(keyWord) {
  return {
    type: SEARCH_PROJECTS_CLUSTER_APPROVAL_GET,
    keyWord,
  }
}

export const PROJECTS_CLUSTER_ALL_GET_REQUEST = 'PROJECTS_CLUSTER_ALL_GET_REQUEST'
export const PROJECTS_CLUSTER_ALL_GET_SUCCESS = 'PROJECTS_CLUSTER_ALL_GET_SUCCESS'
export const PROJECTS_CLUSTER_ALL_GET_FAILURE = 'PROJECTS_CLUSTER_ALL_GET_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchGetProjectsAllClusters(body, callback) {
	const query = {}
	if (body.withNetworkType) {
		query.withNetworkType = true
	}
  const endpoint = `${API_URL_PREFIX}/projects/${body.projectsName}/clusters?${toQuerystring(query)}`
  return {
    projectName: body.projectsName,
    [FETCH_API]: {
      types: [PROJECTS_CLUSTER_ALL_GET_REQUEST, PROJECTS_CLUSTER_ALL_GET_SUCCESS, PROJECTS_CLUSTER_ALL_GET_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'GET'
      },
    },
    callback
  }
}
// Fetches upgrade or renewals from API
// Relies on Redux Thunk middleware.
export function GetProjectsAllClusters(body,callback) {
  return (dispatch) => {
    return dispatch(fetchGetProjectsAllClusters(body,callback))
  }
}

export const PROJECT_VISIBLE_CLUSTERS_GET_REQUEST = 'PROJECT_VISIBLE_CLUSTERS_GET_REQUEST'
export const PROJECT_VISIBLE_CLUSTERS_GET_SUCCESS = 'PROJECT_VISIBLE_CLUSTERS_GET_SUCCESS'
export const PROJECT_VISIBLE_CLUSTERS_GET_FAILURE = 'PROJECT_VISIBLE_CLUSTERS_GET_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchGetProjectVisibleClusters(projectName, callback) {
  let endpoint = `${API_URL_PREFIX}/projects/${projectName}/visible-clusters`
  return {
    projectName,
    [FETCH_API]: {
      types: [PROJECT_VISIBLE_CLUSTERS_GET_REQUEST, PROJECT_VISIBLE_CLUSTERS_GET_SUCCESS, PROJECT_VISIBLE_CLUSTERS_GET_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'GET'
      },
    },
    callback
  }
}
// Relies on Redux Thunk middleware.
export function getProjectVisibleClusters(projectName, callback) {
  return (dispatch) => {
    return dispatch(fetchGetProjectVisibleClusters(projectName, callback))
  }
}

export const PROJECTS_CLUSTER_UPDATE_REQUEST = 'PROJECTS_CLUSTER_UPDATE_REQUEST'
export const PROJECTS_CLUSTER_UPDATE_SUCCESS = 'PROJECTS_CLUSTER_UPDATE_SUCCESS'
export const PROJECTS_CLUSTER_UPDATE_FAILURE = 'PROJECTS_CLUSTER_UPDATE_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUpdateProjectsCluster(body, callback) {
	let endpoint = `${API_URL_PREFIX}/projects/${body.projectsName}/clusters`
	return {
		[FETCH_API]: {
			types: [PROJECTS_CLUSTER_UPDATE_REQUEST, PROJECTS_CLUSTER_UPDATE_SUCCESS, PROJECTS_CLUSTER_UPDATE_FAILURE],
			endpoint,
			schema: {},
			options: {
				method: 'PUT',
				body: body.body
			},
		},
		callback
	}
}
// Fetches upgrade or renewals from API
// Relies on Redux Thunk middleware.
export function UpdateProjectsCluster(body, callback) {
	return (dispatch) => {
		return dispatch(fetchUpdateProjectsCluster(body, callback))
	}
}

export const PROJECTS_CLUSTER_APPROVAL_UPDATE_REQUEST = 'PROJECTS_CLUSTER_APPROVAL_UPDATE_REQUEST'
export const PROJECTS_CLUSTER_APPROVAL_UPDATE_SUCCESS = 'PROJECTS_CLUSTER_APPROVAL_UPDATE_SUCCESS'
export const PROJECTS_CLUSTER_APPROVAL_UPDATE_FAILURE = 'PROJECTS_CLUSTER_APPROVAL_UPDATE_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUpdateProjectsApprovalCluster(body,callback) {
  let endpoint = `${API_URL_PREFIX}/projects/clusters`
  return {
    [FETCH_API]: {
      types: [PROJECTS_CLUSTER_APPROVAL_UPDATE_REQUEST,PROJECTS_CLUSTER_APPROVAL_UPDATE_SUCCESS,PROJECTS_CLUSTER_APPROVAL_UPDATE_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'PUT',
        body: body
      },
    },
    callback
  }
}
// Fetches upgrade or renewals from API
// Relies on Redux Thunk middleware.
export function UpdateProjectsApprovalCluster(body,callback) {
  return (dispatch) => {
    return dispatch(fetchUpdateProjectsApprovalCluster(body,callback))
  }
}

export const PROJECTS_USER_GET_REQUEST = 'PROJECTS_USER_GET_REQUEST'
export const PROJECTS_USER_GET_SUCCESS = 'PROJECTS_USER_GET_SUCCESS'
export const PROJECTS_USER_GET_FAILURE = 'PROJECTS_USER_GET_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchGetProjectsRelatedUsers(body, callback) {
	let endpoint = `${API_URL_PREFIX}/projects/${body.projectsName}/user`
	return {
		[FETCH_API]: {
			types: [PROJECTS_USER_GET_REQUEST, PROJECTS_USER_GET_SUCCESS, PROJECTS_USER_GET_FAILURE],
			endpoint,
			schema: {},
			options: {
				method: 'GET'
			},
		},
		callback
	}
}
// Fetches upgrade or renewals from API
// Relies on Redux Thunk middleware.
export function GetProjectsRelatedUsers(body, callback) {
	return (dispatch) => {
		return dispatch(fetchGetProjectsRelatedUsers(body, callback))
	}
}

export const PROJECTS_USER_ADD_REQUEST = 'PROJECTS_USER_ADD_REQUEST'
export const PROJECTS_USER_ADD_SUCCESS = 'PROJECTS_USER_ADD_SUCCESS'
export const PROJECTS_USER_ADD_FAILURE = 'PROJECTS_USER_ADD_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchAddProjectsRelatedUsers(body, callback) {
	let endpoint = `${API_URL_PREFIX}/projects/${body.projectsName}/user`
	return {
		[FETCH_API]: {
			types: [PROJECTS_USER_ADD_REQUEST, PROJECTS_USER_ADD_SUCCESS, PROJECTS_USER_ADD_FAILURE],
			endpoint,
			schema: {},
			options: {
				method: 'POST',
				body: body.body
			},
		},
		callback
	}
}
// Fetches upgrade or renewals from API
// Relies on Redux Thunk middleware.
export function AddProjectsRelatedUsers(body, callback) {
	return (dispatch) => {
		return dispatch(fetchAddProjectsRelatedUsers(body, callback))
	}
}


export const PROJECTS_USER_DELETE_REQUEST = 'PROJECTS_USER_DELETE_REQUEST'
export const PROJECTS_USER_DELETE_SUCCESS = 'PROJECTS_USER_DELETE_SUCCESS'
export const PROJECTS_USER_DELETE_FAILURE = 'PROJECTS_USER_DELETE_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchDeleteProjectsRelatedUsers(body, callback) {
	let endpoint = `${API_URL_PREFIX}/projects/${body.projectsName}/user`
	return {
		[FETCH_API]: {
			types: [PROJECTS_USER_DELETE_REQUEST, PROJECTS_USER_DELETE_SUCCESS, PROJECTS_USER_DELETE_FAILURE],
			endpoint,
			schema: {},
			options: {
				method: 'DELETE',
				body: body.body
			},
		},
		callback
	}
}
// Fetches upgrade or renewals from API
// Relies on Redux Thunk middleware.
export function DeleteProjectsRelatedUsers(body, callback) {
	return (dispatch) => {
		return dispatch(fetchDeleteProjectsRelatedUsers(body, callback))
	}
}


export const PROJECTS_USER_UPDATE_REQUEST = 'PROJECTS_USER_UPDATE_REQUEST'
export const PROJECTS_USER_UPDATE_SUCCESS = 'PROJECTS_USER_UPDATE_SUCCESS'
export const PROJECTS_USER_UPDATE_FAILURE = 'PROJECTS_USER_UPDATE_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUpdateProjectsRelatedUsers(body, callback) {
	let endpoint = `${API_URL_PREFIX}/projects/${body.projectsName}/user`
	return {
		[FETCH_API]: {
			types: [PROJECTS_USER_UPDATE_REQUEST, PROJECTS_USER_UPDATE_SUCCESS, PROJECTS_USER_UPDATE_FAILURE],
			endpoint,
			schema: {},
			options: {
				method: 'PUT',
				body: body.body
			},
		},
		callback
	}
}
// Fetches upgrade or renewals from API
// Relies on Redux Thunk middleware.
export function UpdateProjectsRelatedUsers(body, callback) {
	return (dispatch) => {
		return dispatch(fetchUpdateProjectsRelatedUsers(body, callback))
	}
}


export const PROJECTS_ROLE_UPDATE_REQUEST = 'PROJECTS_ROLE_UPDATE_REQUEST'
export const PROJECTS_ROLE_UPDATE_SUCCESS = 'PROJECTS_ROLE_UPDATE_SUCCESS'
export const PROJECTS_ROLE_UPDATE_FAILURE = 'PROJECTS_ROLE_UPDATE_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUpdateProjectsRelatedRoles(body, callback) {
	let endpoint = `${API_URL_PREFIX}/projects/${body.projectsName}/roles`
	return {
		[FETCH_API]: {
			types: [PROJECTS_ROLE_UPDATE_REQUEST, PROJECTS_ROLE_UPDATE_SUCCESS, PROJECTS_ROLE_UPDATE_FAILURE],
			endpoint,
			schema: {},
			options: {
				method: 'PUT',
				body: body.body
			},
		},
		callback
	}
}
// Fetches upgrade or renewals from API
// Relies on Redux Thunk middleware.
export function UpdateProjectsRelatedRoles(body, callback) {
	return (dispatch) => {
		return dispatch(fetchUpdateProjectsRelatedRoles(body, callback))
	}
}

export const PROJECTS_ROLE_GET_REQUEST = 'PROJECTS_ROLE_GET_REQUEST'
export const PROJECTS_ROLE_GET_SUCCESS = 'PROJECTS_ROLE_GET_SUCCESS'
export const PROJECTS_ROLE_GET_FAILURE = 'PROJECTS_ROLE_GET_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchGetProjectsRelatedRoles(body, callback) {
	let endpoint = `${API_URL_PREFIX}/projects/${body.projectsName}/roles`
	return {
		[FETCH_API]: {
			types: [PROJECTS_ROLE_GET_REQUEST, PROJECTS_ROLE_GET_SUCCESS, PROJECTS_ROLE_GET_FAILURE],
			endpoint,
			schema: {},
			options: {
				method: 'GET'
			},
		},
		callback
	}
}
// Fetches upgrade or renewals from API
// Relies on Redux Thunk middleware.
export function GetProjectsRelatedRoles(body, callback) {
	return (dispatch) => {
		return dispatch(fetchGetProjectsRelatedRoles(body, callback))
	}
}

export const PROJECTS_ROLE_DELETE_REQUEST = 'PROJECTS_ROLE_DELETE_REQUEST'
export const PROJECTS_ROLE_DELETE_SUCCESS = 'PROJECTS_ROLE_DELETE_SUCCESS'
export const PROJECTS_ROLE_DELETE_FAILURE = 'PROJECTS_ROLE_DELETE_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchDeleteProjectsRelatedRoles(body, callback) {
	let endpoint = `${API_URL_PREFIX}/projects/${body.projectsName}/roles/batch-delete`
	return {
		[FETCH_API]: {
			types: [PROJECTS_ROLE_DELETE_REQUEST, PROJECTS_ROLE_DELETE_SUCCESS, PROJECTS_ROLE_DELETE_FAILURE],
			endpoint,
			schema: {},
			options: {
				body: body.body,
				method: 'POST'
			},
		},
		callback
	}
}
// Fetches upgrade or renewals from API
// Relies on Redux Thunk middleware.
export function DeleteProjectsRelatedRoles(body, callback) {
	return (dispatch) => {
		return dispatch(fetchDeleteProjectsRelatedRoles(body, callback))
	}
}



export const PROJECTS_MEMBERS_LIST_REQUEST = 'PROJECTS_MEMBERS_LIST_REQUEST'
export const PROJECTS_MEMBERS_LIST_SUCCESS = 'PROJECTS_MEMBERS_LIST_SUCCESS'
export const PROJECTS_MEMBERS_LIST_FAILURE = 'PROJECTS_MEMBERS_LIST_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchGetProjectsMembers(query, callback) {
	let endpoint = `${API_URL_PREFIX}/projects/members`
	if (query) {
    endpoint += `?${toQuerystring(query)}`
	}
	return {
		[FETCH_API]: {
			types: [PROJECTS_MEMBERS_LIST_REQUEST, PROJECTS_MEMBERS_LIST_SUCCESS, PROJECTS_MEMBERS_LIST_FAILURE],
			endpoint,
			schema: {},
			options: {
				method: 'GET'
			},
		},
		callback
	}
}
// Fetches upgrade or renewals from API
// Relies on Redux Thunk middleware.
export function GetProjectsMembers(query, callback) {
	return (dispatch) => {
		return dispatch(fetchGetProjectsMembers(query, callback))
	}
}

export const REMOVE_PROJECT_MEMBER_REQUEST = 'REMOVE_PROJECT_MEMBER_REQUEST'
export const REMOVE_PROJECT_MEMBER_SUCCESS = 'REMOVE_PROJECT_MEMBER_SUCCESS'
export const REMOVE_PROJECT_MEMBER_FAILURE = 'REMOVE_PROJECT_MEMBER_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchRemoveProjectMember(projectId, userId, teamspace, callback) {
	let endpoint = `${API_URL_PREFIX}/projects/${projectId}/users/${userId}`
	return {
		[FETCH_API]: {
			types: [ REMOVE_PROJECT_MEMBER_REQUEST, REMOVE_PROJECT_MEMBER_SUCCESS, REMOVE_PROJECT_MEMBER_FAILURE ],
			endpoint,
			schema: {},
			options: {
				method: 'DELETE',
        headers: { teamspace }
			},
		},
		callback
	}
}

// Relies on Redux Thunk middleware.
export function removeProjectMember(projectId, userId,teamspace, callback) {
	return (dispatch) => {
		return dispatch(fetchRemoveProjectMember(projectId, userId, teamspace, callback))
	}
}

export const PROJECT_ROLE_BINDING_REQUEST = 'PROJECT_ROLE_BINDING_REQUEST'
export const PROJECT_ROLE_BINDING_SUCCESS = 'PROJECT_ROLE_BINDING_SUCCESS'
export const PROJECT_ROLE_BINDING_FAILURE = 'PROJECT_ROLE_BINDING_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchProjectRoleBinding(body, callback) {
	let endpoint = `${API_URL_PREFIX}/projects/rolebinding`
	return {
		[FETCH_API]: {
			types: [ PROJECT_ROLE_BINDING_REQUEST, PROJECT_ROLE_BINDING_SUCCESS, PROJECT_ROLE_BINDING_FAILURE ],
			endpoint,
			schema: {},
			options: {
        method: 'POST',
        body,
			},
		},
		callback
	}
}

// Relies on Redux Thunk middleware.
export function hadnleProjectRoleBinding(body, callback) {
	return (dispatch) => {
		return dispatch(fetchProjectRoleBinding(body, callback))
	}
}

// 获取插件当前开启状态
export const GET_PLUGIN_STATUS_REQUEST = 'GET_PLUGIN_STATUS_REQUEST'
export const GET_PLUGIN_STATUS_SUCCESS = 'GET_PLUGIN_STATUS_SUCCESS'
export const GET_PLUGIN_STATUS_FAILURE = 'GET_PLUGIN_STATUS_FAILURE'
const fetchPluginStatus = (query, teamspace, callback) => {
  return {
    [FETCH_API]: {
      types: [
        GET_PLUGIN_STATUS_REQUEST,
        GET_PLUGIN_STATUS_SUCCESS,
        GET_PLUGIN_STATUS_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/projects/plugins/enabled?${toQuerystring(query)}`,
      schema: {},
			options: {
      	headers: { teamspace }
			}
    },
    callback,
  }
}

export const getPluginStatus = (query, teamspace, callback) => {
  return dispatch => {
    return dispatch (fetchPluginStatus(query, teamspace, callback))
  }
}

// 检查项目所需插件是否安装
export const CHECK_PLUGIN_INSTALL_STATUS_REQUEST = 'CHECK_PLUGIN_INSTALL_STATUS_REQUEST'
export const CHECK_PLUGIN_INSTALL_STATUS_SUCCESS = 'CHECK_PLUGIN_INSTALL_STATUS_SUCCESS'
export const CHECK_PLUGIN_INSTALL_STATUS_FAILURE = 'CHECK_PLUGIN_INSTALL_STATUS_FAILURE'
const fetchPluginsInstallStatus = (query, teamspace, callback) => {
  return {
    [FETCH_API]: {
      types: [
        CHECK_PLUGIN_INSTALL_STATUS_REQUEST,
        CHECK_PLUGIN_INSTALL_STATUS_SUCCESS,
        CHECK_PLUGIN_INSTALL_STATUS_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/projects/plugins/installed?${toQuerystring(query)}`,
      schema: {},
			options: {
      	headers: { teamspace }
			}
    },
    callback,
  }
}

export const checkPluginsInstallStatus = (query, teamspace, callback) => {
  return dispatch => {
    return dispatch (fetchPluginsInstallStatus(query, teamspace, callback))
  }
}

// 开启插件
export const PLUGIN_TURN_ON_REQUEST = 'PLUGIN_TURN_ON_REQUEST'
export const PLUGIN_TURN_ON_SUCCESS = 'PLUGIN_TURN_ON_SUCCESS'
export const PLUGIN_TURN_ON_FAILURE = 'PLUGIN_TURN_ON_FAILURE'
const putPluginTurnOn = (name, query, teamspace, callback) => {
  return {
    [FETCH_API]: {
      types: [
        PLUGIN_TURN_ON_REQUEST,
        PLUGIN_TURN_ON_SUCCESS,
        PLUGIN_TURN_ON_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/projects/plugins/${name}/enable?${toQuerystring(query)}`,
      schema: {},
			options: {
      	method: 'PUT',
      	headers: { teamspace }
			}
    },
    callback,
  }
}

export const pluginTurnOn = (name, query, teamspace, callback) => {
  return dispatch => {
    dispatch (putPluginTurnOn(name, query, teamspace, callback))
  }
}

// 关闭插件
export const PLUGIN_TURN_OFF_REQUEST = 'PLUGIN_TURN_OFF_REQUEST'
export const PLUGIN_TURN_OFF_SUCCESS = 'PLUGIN_TURN_OFF_SUCCESS'
export const PLUGIN_TURN_OFF_FAILURE = 'PLUGIN_TURN_OFF_FAILURE'
const putPluginTurnOff = (name, query, teamspace, callback) => {
  return {
    [FETCH_API]: {
      types: [
        PLUGIN_TURN_OFF_REQUEST,
        PLUGIN_TURN_OFF_SUCCESS,
        PLUGIN_TURN_OFF_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/projects/plugins/${name}/disable?${toQuerystring(query)}`,
      schema: {},
			options: {
      	method: 'PUT',
      	headers: { teamspace }
			}
    },
    callback,
  }
}

export const pluginTurnOff = (name, query, teamspace, callback) => {
  return dispatch => {
    dispatch (putPluginTurnOff(name, query, teamspace, callback))
  }
}


