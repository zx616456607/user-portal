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

export const PROJECTS_CLUSTER_VISIBLE_GET_REQUEST = 'PROJECTS_CLUSTER_VISIBLE_GET_REQUEST'
export const PROJECTS_CLUSTER_VISIBLE_GET_SUCCESS = 'PROJECTS_CLUSTER_VISIBLE_GET_SUCCESS'
export const PROJECTS_CLUSTER_VISIBLE_GET_FAILURE = 'PROJECTS_CLUSTER_VISIBLE_GET_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchGetProjectsVisibleClusters(body, callback) {
	let endpoint = `${API_URL_PREFIX}/projects/${body.projectsName}/visible-clusters`
	return {
		[FETCH_API]: {
			types: [PROJECTS_CLUSTER_VISIBLE_GET_REQUEST, PROJECTS_CLUSTER_VISIBLE_GET_SUCCESS, PROJECTS_CLUSTER_VISIBLE_GET_FAILURE],
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
export function GetProjectsVisibleClusters(body, callback) {
	return (dispatch) => {
		return dispatch(fetchGetProjectsVisibleClusters(body, callback))
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

export const PROJECTS_CLUSTER_ALL_GET_REQUEST = 'PROJECTS_CLUSTER_ALL_GET_REQUEST'
export const PROJECTS_CLUSTER_ALL_GET_SUCCESS = 'PROJECTS_CLUSTER_ALL_GET_SUCCESS'
export const PROJECTS_CLUSTER_ALL_GET_FAILURE = 'PROJECTS_CLUSTER_ALL_GET_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchGetProjectsAllClusters(body, callback) {
  let endpoint = `${API_URL_PREFIX}/projects/${body.projectsName}/clusters`
  return {
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
function fetchRemoveProjectMember(projectId, userId, callback) {
	let endpoint = `${API_URL_PREFIX}/projects/${projectId}/users/${userId}`
	return {
		[FETCH_API]: {
			types: [ REMOVE_PROJECT_MEMBER_REQUEST, REMOVE_PROJECT_MEMBER_SUCCESS, REMOVE_PROJECT_MEMBER_FAILURE ],
			endpoint,
			schema: {},
			options: {
				method: 'DELETE'
			},
		},
		callback
	}
}

// Relies on Redux Thunk middleware.
export function removeProjectMember(projectId, userId, callback) {
	return (dispatch) => {
		return dispatch(fetchRemoveProjectMember(projectId, userId, callback))
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