/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 */
/**
 * Reducer of harbor registry
 *
 * v0.1 - 2017-05-05
 * @author Zhangpc
 */
import * as ActionTypes from '../actions/harbor'
import merge from 'lodash/merge'

function projects(state = {}, action) {
  const { registry } = action
  const defaultState = {
    [registry]: {
      isFetching: false,
      list: []
    }
  }
  switch (action.type) {
    case ActionTypes.HARBOR_PROJECT_LIST_REQUEST:
      return merge({}, defaultState, state, {
        [registry]: {
          isFetching: true
        }
      })
    case ActionTypes.HARBOR_PROJECT_LIST_SUCCESS:
      return Object.assign({}, state, {
        [registry]: {
          isFetching: false,
          server: action.response.result.server,
          list: action.response.result.data,
          total: action.response.result.total,
        }
      })
    case ActionTypes.HARBOR_PROJECT_LIST_FAILURE:
      return merge({}, defaultState, state, {
        [registry]: { isFetching: false }
      })
    default:
      return state
  }
}

function projectLogs(state = {}, action) {
  const { registry } = action
  const defaultState = {
    [registry]: {
      isFetching: false, logs: []
    }
  }
  switch (action.type) {
  case ActionTypes.HARBOR_PROJECT_LOGS_REQUEST:
    return merge({}, defaultState, state, {
      [registry]: {
        isFetching: true
      }
    })
  case ActionTypes.HARBOR_PROJECT_LOGS_SUCCESS:
    return Object.assign({}, state, {
      [registry]: {
        isFetching: false,
        server: action.response.result.server,
        list: action.response.result.data,
        total: action.response.result.total
      }
    })
  case ActionTypes.HARBOR_PROJECT_LOGS_FAILURE:
    return merge({}, defaultState, state, {
      [registry]: { isFetching: false }
    })
  default:
    return state
  }
}

function allProject(state = {}, action) {
  const { registry } = action
  const defaultState = {
    [registry]: {
      isFetching: false,
      list: []
    }
  }
  switch (action.type) {
    case ActionTypes.HARBOR_ALL_PROJECT_REQUEST:
      return merge({}, defaultState, state, {
        [registry]: {
          isFetching: true
        }
      })
    case ActionTypes.HARBOR_ALL_PROJECT_SUCCESS:
      const result = action.response.result.data
      const mergeState = {
        publicImages: [],
        privateImages:[]
      }
      if(result.repository) {
        const publicList = result.repository.filter(item => {
          return item.projectPublic == 1
        })
        const privateList = result.repository.filter(item => {
          return item.projectPublic == 0
        })
        mergeState.publicImages = publicList
        mergeState.privateImages = privateList
      }
      return Object.assign({}, state, {
        [registry]: {
          isFetching: false,
          server: action.response.result.server.replace(/(http:\/\/|https:\/\/)/, ''),
          ...mergeState
        }
      })
    case ActionTypes.HARBOR_ALL_PROJECT_FAILURE:
      return merge({}, defaultState, state, {
        [registry]: { isFetching: false }
      })
    default:
      return state
  }
}

function repos(state = {}, action) {
  const { registry } = action
  const defaultState = {
    isFetching: false,
    list: []
  }
  switch (action.type) {
    case ActionTypes.HARBOR_GET_PROJECT_REPOS_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.HARBOR_GET_PROJECT_REPOS_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        server: action.response.result.server,
        list: action.response.result.data,
        total: action.response.result.total,
      })
    case ActionTypes.HARBOR_GET_PROJECT_REPOS_FAILURE:
      return Object.assign({}, defaultState, state, {
        isFetching: false,
        list: [],
      })
    default:
      return state
  }
}

function repositoriesTags(state = {}, action) {
  const { registry, imageName } = action
  const defaultState = {
    [registry]: {
      [imageName]: {
        isFetching: false,
        tag: []
      }
    }
  }
  switch (action.type) {
  case ActionTypes.HARBOR_REPOSITORIES_TAGS_REQUEST:
    return merge({}, defaultState, state, {
      [registry]: {
        [imageName]: {
          isFetching: true
        }
      }
    })
  case ActionTypes.HARBOR_REPOSITORIES_TAGS_SUCCESS:
    return Object.assign({}, state, {
      [registry]: {
        [imageName]: {
          isFetching: false,
          server: action.response.result.server,
          tag: action.response.result.data
        }
      }
    })
  case ActionTypes.HARBOR_REPOSITORIES_TAGS_FAILURE:
    return merge({}, defaultState, state, {
      [registry]: {
        [imageName]: {
          isFetching: false
        }
      }
    })
  default:
    return state
  }
}

function detail(state = {}, action) {
  const { registry } = action
  const defaultState = {
    isFetching: false,
    data: {}
  }
  switch (action.type) {
    case ActionTypes.HARBOR_GET_PROJECT_DETAIL_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.HARBOR_GET_PROJECT_DETAIL_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        server: action.response.result.server,
        data: action.response.result.data,
      })
    case ActionTypes.HARBOR_GET_PROJECT_DETAIL_FAILURE:
      return Object.assign({}, defaultState, state, {
        isFetching: false,
        data: {},
      })
    default:
      return state
  }
}

function members(state = {}, action) {
  const { registry } = action
  const defaultState = {
    isFetching: false,
    list: []
  }
  switch (action.type) {
    case ActionTypes.HARBOR_GET_PROJECT_MEMBERS_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.HARBOR_GET_PROJECT_MEMBERS_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        server: action.response.result.server,
        list: action.response.result.data,
        total: action.response.result.total,
      })
    case ActionTypes.HARBOR_GET_PROJECT_MEMBERS_FAILURE:
      return Object.assign({}, defaultState, state, {
        isFetching: false,
        list: [],
      })
    default:
      return state
  }
}

function projectLogs(state = {}, action) {
  const { registry } = action
  const defaultState = {
    [registry]: {
      isFetching: false, logs: []
    }
  }
  switch (action.type) {
  case ActionTypes.HARBOR_PROJECT_LOGS_REQUEST:
    return merge({}, defaultState, state, {
      [registry]: {
        isFetching: true
      }
    })
  case ActionTypes.HARBOR_PROJECT_LOGS_SUCCESS:
    return Object.assign({}, state, {
      [registry]: {
        isFetching: false,
        server: action.response.result.server,
        list: action.response.result.data,
        total: action.response.result.total
      }
    })
  case ActionTypes.HARBOR_PROJECT_LOGS_FAILURE:
    return merge({}, defaultState, state, {
      [registry]: { isFetching: false }
    })
  default:
    return state
  }
}

function repositoriesTagConfigInfo(state = {}, action) {
  const { registry, imageName, tag } = action
  const defaultState = {
    [registry]: {
      isFetching: false,
    }
  }
  switch (action.type) {
    case ActionTypes.HARBOR_REPOSITORIES_TAG_CONFIGINFO_REQUEST:
      return merge({}, defaultState, state, {
        [registry]: {
          isFetching: true
        }
      })
    case ActionTypes.HARBOR_REPOSITORIES_TAG_CONFIGINFO_SUCCESS:
      return Object.assign({}, state, {
        [registry]: {
          isFetching: false,
          server: action.response.result.server.replace(/(http:\/\/|https:\/\/)/, ''),
          [tag]: action.response.result.data
        }
      })
    case ActionTypes.HARBOR_REPOSITORIES_TAG_CONFIGINFO_FAILURE:
      return merge({}, defaultState, state, {
        [registry]: { isFetching: false }
      })
    default:
      return state
  }
}

export default function harborRegistry(state = { projects: {} }, action) {
  return {
    projects: projects(state.projects, action),
    projectLogs: projectLogs(state.projectLogs, action),
    allProject: allProject(state.allProject, action),
    imageTags: repositoriesTags(state.imageTags, action),
    imageTagConfig: repositoriesTagConfigInfo(state.imageTagConfig, action),
    detail: detail(state.detail, action),
    repos: repos(state.repos, action),
    members: members(state.members, action),
  }
}