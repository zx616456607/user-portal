/**
 * Created by dengqiaoling on 2017/6/6.
 */
import { FETCH_API } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'
export const PROJECT_CREATE_REQUEST = 'PROJECT_CREATE_REQUEST'
export const PROJECT_CREATE_SUCCESS = 'PROJECT_CREATE_SUCCESS'
export const PROJECT_CREATE_FAILURE = 'PROJECT_CREATE_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchCreateProject(body, callback) {
	let endpoint = `${API_URL_PREFIX}/project`
	return {
		[FETCH_API]: {
			types: [PROJECT_CREATE_REQUEST,PROJECT_CREATE_SUCCESS, PROJECT_CREATE_FAILURE],
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
export function CreateProject(body, callback) {
	return (dispatch) => {
		return dispatch(fetchCreateProject(body, callback))
	}
}




export const PROJECT_CHECK_REQUEST = 'PROJECT_CHECK_REQUEST'
export const PROJECT_CHECK_SUCCESS = 'PROJECT_CHECK_SUCCESS'
export const PROJECT_CHECK_FAILURE = 'PROJECT_CHECK_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchCheckProjectExists(body, callback) {
	let endpoint = `${API_URL_PREFIX}/project/${body.projectName}/check-exists`
	return {
		[FETCH_API]: {
			types: [PROJECT_CHECK_REQUEST,PROJECT_CHECK_SUCCESS, PROJECT_CHECK_FAILURE],
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
export function CheckProject(body, callback) {
	return (dispatch) => {
		return dispatch(fetchCheckProjectExists(body,callback))
	}
}




export const PROJECT_CHECK_MANAGER_REQUEST = 'PROJECT_CHECK_MANAGER_REQUEST'
export const PROJECT_CHECK_MANAGER_SUCCESS = 'PROJECT_CHECK_MANAGER_SUCCESS'
export const PROJECT_CHECK_MANAGER_FAILURE = 'PROJECT_CHECK_MANAGER_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchCheckProjectManager(callback) {
	let endpoint = `${API_URL_PREFIX}/project/check-manager`
	return {
		[FETCH_API]: {
			types: [PROJECT_CHECK_MANAGER_REQUEST,PROJECT_CHECK_MANAGER_SUCCESS, PROJECT_CHECK_MANAGER_FAILURE],
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
export function CheckProjectManager(callback) {
	return (dispatch) => {
		return dispatch(fetchCheckProjectManager(callback))
	}
}




export const PROJECT_DELETE_REQUEST = 'PROJECT_DELETE_REQUEST'
export const PROJECT_DELETE_SUCCESS = 'PROJECT_DELETE_SUCCESS'
export const PROJECT_DELETE_FAILURE = 'PROJECT_DELETE_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchDeleteProject(body, callback) {
	let endpoint = `${API_URL_PREFIX}/project/batch-delete`
	return {
		[FETCH_API]: {
			types: [PROJECT_DELETE_REQUEST,PROJECT_DELETE_SUCCESS, PROJECT_DELETE_FAILURE],
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
export function DeleteProject(body, callback) {
	return (dispatch) => {
		return dispatch(fetchDeleteProject(body, callback))
	}
}


export const PROJECT_DETAIL_REQUEST = 'PROJECT_DETAIL_REQUEST'
export const PROJECT_DETAIL_SUCCESS = 'PROJECT_DETAIL_SUCCESS'
export const PROJECT_DETAIL_FAILURE = 'PROJECT_DETAIL_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchGetProjectDetail(body, callback) {
	let endpoint = `${API_URL_PREFIX}/project/${body.projectName}/detail`
	return {
		[FETCH_API]: {
			types: [PROJECT_DETAIL_REQUEST,PROJECT_DETAIL_SUCCESS, PROJECT_DETAIL_FAILURE],
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
export function GetProjectDetail(body, callback) {
	return (dispatch) => {
		return dispatch(fetchGetProjectDetail(body, callback))
	}
}

export const PROJECT_LIST_REQUEST = 'PROJECT_LIST_REQUEST'
export const PROJECT_LIST_SUCCESS = 'PROJECT_LIST_SUCCESS'
export const PROJECT_LIST_FAILURE = 'PROJECT_LIST_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchListProject(body, query, callback) {
  let endpoint = `${API_URL_PREFIX}/project/list`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [PROJECT_LIST_REQUEST,PROJECT_LIST_SUCCESS, PROJECT_LIST_FAILURE],
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
export function ListProject(body, query, callback) {
  return (dispatch) => {
    return dispatch(fetchListProject(body,query,callback))
  }
}



export const PROJECT_LIST_VISIBLE_REQUEST = 'PROJECT_LIST_VISIBLE_REQUEST'
export const PROJECT_LIST_VISIBLE_SUCCESS = 'PROJECT_LIST_VISIBLE_SUCCESS'
export const PROJECT_LIST_VISIBLE_FAILURE = 'PROJECT_LIST_VISIBLE_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchListVisibleProject(body, callback) {
	let endpoint = `${API_URL_PREFIX}/project/list-visible`
	return {
		[FETCH_API]: {
			types: [PROJECT_LIST_VISIBLE_REQUEST,PROJECT_LIST_VISIBLE_SUCCESS, PROJECT_LIST_VISIBLE_FAILURE],
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
export function ListVisibleProject(body, callback) {
	return (dispatch) => {
		return dispatch(fetchListVisibleProject(body, callback))
	}
}





export const PROJECT_UPDATE_REQUEST = 'PROJECT_UPDATE_REQUEST'
export const PROJECT_UPDATE_SUCCESS = 'PROJECT_UPDATE_SUCCESS'
export const PROJECT_UPDATE_FAILURE = 'PROJECT_UPDATE_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUpdateProject(body, callback) {
	let endpoint = `${API_URL_PREFIX}/project/${body.projectName}`
	return {
		[FETCH_API]: {
			types: [PROJECT_UPDATE_REQUEST,PROJECT_UPDATE_SUCCESS, PROJECT_UPDATE_FAILURE],
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
export function UpdateProject(body, callback) {
	return (dispatch) => {
		return dispatch(fetchUpdateProject(body, callback))
	}
}

export const PROJECT_CLUSTER_GET_REQUEST = 'PROJECT_CLUSTER_GET_REQUEST'
export const PROJECT_CLUSTER_GET_SUCCESS = 'PROJECT_CLUSTER_GET_SUCCESS'
export const PROJECT_CLUSTER_GET_FAILURE = 'PROJECT_CLUSTER_GET_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchGetProjectClusters(body, callback) {
	let endpoint = `${API_URL_PREFIX}/project/${body.projectName}/cluster`
	return {
		[FETCH_API]: {
			types: [PROJECT_CLUSTER_GET_REQUEST,PROJECT_CLUSTER_GET_SUCCESS, PROJECT_CLUSTER_GET_FAILURE],
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
export function GetProjectClusters(body, callback) {
	return (dispatch) => {
		return dispatch(fetchGetProjectClusters(body, callback))
	}
}

export const PROJECT_CLUSTER_ADD_REQUEST = 'PROJECT_CLUSTER_ADD_REQUEST'
export const PROJECT_CLUSTER_ADD_SUCCESS = 'PROJECT_CLUSTER_ADD_SUCCESS'
export const PROJECT_CLUSTER_ADD_FAILURE = 'PROJECT_CLUSTER_ADD_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchAddProjectClusters(body, callback) {
	let endpoint = `${API_URL_PREFIX}/project/${body.projectName}/cluster`
	return {
		[FETCH_API]: {
			types: [PROJECT_CLUSTER_ADD_REQUEST,PROJECT_CLUSTER_ADD_SUCCESS, PROJECT_CLUSTER_ADD_FAILURE],
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
export function AddProjectClusters(body, callback) {
	return (dispatch) => {
		return dispatch(fetchAddProjectClusters(body, callback))
	}
}


export const PROJECT_CLUSTER_DELETE_REQUEST = 'PROJECT_CLUSTER_DELETE_REQUEST'
export const PROJECT_CLUSTER_DELETE_SUCCESS = 'PROJECT_CLUSTER_DELETE_SUCCESS'
export const PROJECT_CLUSTER_DELETE_FAILURE = 'PROJECT_CLUSTER_DELETE_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchDeleteProjectClusters(body, callback) {
	let endpoint = `${API_URL_PREFIX}/project/${body.projectName}/cluster`
	return {
		[FETCH_API]: {
			types: [PROJECT_CLUSTER_DELETE_REQUEST,PROJECT_CLUSTER_DELETE_SUCCESS, PROJECT_CLUSTER_DELETE_FAILURE],
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
export function DeleteProjectClusters(body, callback) {
	return (dispatch) => {
		return dispatch(fetchDeleteProjectClusters(body, callback))
	}
}

export const PROJECT_USER_GET_REQUEST = 'PROJECT_USER_GET_REQUEST'
export const PROJECT_USER_GET_SUCCESS = 'PROJECT_USER_GET_SUCCESS'
export const PROJECT_USER_GET_FAILURE = 'PROJECT_USER_GET_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchGetProjectRelatedUsers(body, callback) {
	let endpoint = `${API_URL_PREFIX}/project/${body.projectName}/user`
	return {
		[FETCH_API]: {
			types: [PROJECT_USER_GET_REQUEST,PROJECT_USER_GET_SUCCESS, PROJECT_USER_GET_FAILURE],
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
export function GetProjectRelatedUsers(body, callback) {
	return (dispatch) => {
		return dispatch(fetchGetProjectRelatedUsers(body, callback))
	}
}

export const PROJECT_USER_ADD_REQUEST = 'PROJECT_USER_ADD_REQUEST'
export const PROJECT_USER_ADD_SUCCESS = 'PROJECT_USER_ADD_SUCCESS'
export const PROJECT_USER_ADD_FAILURE = 'PROJECT_USER_ADD_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchAddProjectRelatedUsers(body, callback) {
	let endpoint = `${API_URL_PREFIX}/project/${body.projectName}/user`
	return {
		[FETCH_API]: {
			types: [PROJECT_USER_ADD_REQUEST,PROJECT_USER_ADD_SUCCESS, PROJECT_USER_ADD_FAILURE],
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
export function AddProjectRelatedUsers(body, callback) {
	return (dispatch) => {
		return dispatch(fetchAddProjectRelatedUsers(body, callback))
	}
}


export const PROJECT_USER_DELETE_REQUEST = 'PROJECT_USER_DELETE_REQUEST'
export const PROJECT_USER_DELETE_SUCCESS = 'PROJECT_USER_DELETE_SUCCESS'
export const PROJECT_USER_DELETE_FAILURE = 'PROJECT_USER_DELETE_FAILURE'
// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchDeleteProjectRelatedUsers(body, callback) {
	let endpoint = `${API_URL_PREFIX}/project/${body.projectName}/user`
	return {
		[FETCH_API]: {
			types: [PROJECT_USER_DELETE_REQUEST,PROJECT_USER_DELETE_SUCCESS, PROJECT_USER_DELETE_FAILURE],
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
export function DeleteProjectRelatedUsers(body, callback) {
	return (dispatch) => {
		return dispatch(fetchDeleteProjectRelatedUsers(body, callback))
	}
}

