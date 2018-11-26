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
import isEmpty from 'lodash/isEmpty'
import { SYSTEM_STORE } from '../../constants'

function systeminfo(state = {}, action) {
  const { registry } = action
  const defaultState = {
    [registry]: {
      isFetching: false,
      info: {}
    }
  }
  switch (action.type) {
    case ActionTypes.HARBOR_SYSTEMINFO_REQUEST:
      return merge({}, defaultState, state, {
        [registry]: {
          isFetching: true
        }
      })
    case ActionTypes.HARBOR_SYSTEMINFO_SUCCESS:
      return Object.assign({}, state, {
        [registry]: {
          isFetching: false,
          server: action.response.result.server,
          info: action.response.result.data,
        }
      })
    case ActionTypes.HARBOR_SYSTEMINFO_FAILURE:
      return merge({}, defaultState, state, {
        [registry]: { isFetching: false }
      })
    default:
      return state
  }
}

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
      // let total = action.response.result.total
      // let hasTenxStore = action.response.result.data.some(item => item.name !== SYSTEM_STORE)
      return Object.assign({}, state, {
        [registry]: {
          isFetching: false,
          server: action.response.result.server,
          list: action.response.result.data,
          total: action.response.result.total,
        }
      })
    case ActionTypes.HARBOR_PROJECT_LIST_FAILURE:
      return Object.assign({}, defaultState, state, {
        [registry]: {
          isFetching: false,
          list: [],
          total: 0
        }
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
      const tempState =  merge({}, defaultState, state, {
        [registry]: { isFetching: false }
      })
      tempState[registry].publicImages = []
      tempState[registry].privateImages = []
      return tempState
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
    const LATEST = 'latest'
    let data = action.response.result.data || []
    // Do reverse, maybe helpful for timestamp based tags
    data = merge([], data.reverse())
    const latestTagIndex = data.indexOf(LATEST)
    if (latestTagIndex > 0) {
      data.splice(latestTagIndex,1)
      data.unshift(LATEST)
    }
    return Object.assign({}, state, {
      [registry]: {
        [imageName]: {
          isFetching: false,
          server: action.response.result.server,
          tag: data[0] && data[0].name && data.map(tag => tag.name) || data
        }
      }
    })
  case ActionTypes.HARBOR_REPOSITORIES_TAGS_FAILURE:
    return merge({}, defaultState, state, {
      [registry]: {
        [imageName]: {
          isFetching: false,
          server: "",
          tag: [],
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
      return merge({}, state, {
        [registry]: {
          isFetching: false,
          server: action.response.result.server.replace(/(http:\/\/|https:\/\/)/, ''),
          [tag]: action.response.result.data,
          [imageName]: {
            server: action.response.result.server.replace(/(http:\/\/|https:\/\/)/, ''),
            [tag]: action.response.result.data
          }
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

function getConfigurations(state = {}, action) {
  const { registry } = action
  const defaultState = {
    [registry]: {
      isFetching: false,
    }
  }
  switch (action.type) {
    case ActionTypes.GET_CONFIGURATIONS_REQUEST:
      return merge({}, defaultState, state, {
        [registry]: {
          isFetching: true
        }
      })
    case ActionTypes.GET_CONFIGURATIONS_SUCCESS:
      return Object.assign({}, state, {
        [registry]: {
          isFetching: false,
          data: action.response.result.data
        }
      })
    case ActionTypes.GET_CONFIGURATIONS_FAILURE:
      return merge({}, defaultState, state, {
        [registry]: { isFetching: false }
      })
    default:
      return state
  }
}


function updateConfigurations(state = {}, action) {
  const { registry } = action
  const defaultState = {
    [registry]: {
      isFetching: false,
    }
  }
  switch (action.type) {
    case ActionTypes.UPDATE_CONFIGURATIONS_REQUEST:
      return merge({}, defaultState, state, {
        [registry]: {
          isFetching: true
        }
      })
    case ActionTypes.UPDATE_CONFIGURATIONS_SUCCESS:
      return Object.assign({}, state, {
        [registry]: {
          isFetching: false,
          data: action.response.result.data
        }
      })
    case ActionTypes.UPDATE_CONFIGURATIONS_FAILURE:
      return merge({}, defaultState, state, {
        [registry]: { isFetching: false }
      })
    default:
      return state
  }
}

function imageUpdate(state = {},action) {
  const { registry } = action
  const defaultState = {
    isFetching: false,
  }
  switch(action.type){
    case ActionTypes.LOAD_IMAGEUPDATE_LIST_REQUEST:
      return merge({},defaultState,state,{
        isFetching: true
      })
    case ActionTypes.LOAD_IMAGEUPDATE_LIST_SUCCESS:
      let policies = action.response.result.data.policies
      let targets = action.response.result.data.targets
      let jobs = action.response.result.data.jobs
      for(let i = 0; i < jobs.length; i++){
        jobs[i].key = i
        jobs[i].timeConsuming = {
          begin: jobs[i].creationTime,
          end: jobs[i].updateTime
        }
      }
      for(let i = 0; i < policies.length; i++){
        policies[i].key = i
        for(let j = 0; j < targets.length; j++){
          if(policies[i].targetId == targets[j].id){
            policies[i].targetName = targets[j].name
          }
        }
      }
      return Object.assign({},state,{
        isFetching: false,
        policies,
        jobs,
        targets,
      })
    case ActionTypes.LOAD_IMAGEUPDATE_LIST_FAILURE:
      return merge({},defaultState,state,{
        isFetching: false
      })
    default:
      return state
  }
}

function imageUpdateLogs(state = {},action) {
  const { registry } = action
  const defaultState = {
    isFetching: false,
  }
  switch(action.type){
    case ActionTypes.GET_IMAGE_UPDATE_TASK_LOG_REQUEST:
      return merge({},defaultState,state,{
        isFetching: true
      })
    case ActionTypes.GET_IMAGE_UPDATE_TASK_LOG_SUCCESS:
      return Object.assign({},state,{
        isFetching: false,
        logs: action.response.result.data
      })
    case ActionTypes.GET_IMAGE_UPDATE_TASK_LOG_FAILURE:
      return merge({},defaultState,state,{
        isFetching: false
      })
    default:
      return state
  }
}

function getCurrentRuleTask(state = {},action) {
  const { registry } = action
  const defaultState = {
    isFetching: false,
  }
  switch(action.type){
    case ActionTypes.GET_CURRENT_RULE_TASK_REQUEST:
      return merge({},defaultState,state,{
        isFetching: true
      })
    case ActionTypes.GET_CURRENT_RULE_TASK_SUCCESS:
      return Object.assign({},state,{
        isFetching: false,
        logs: action.response.result.data
      })
    case ActionTypes.GET_CURRENT_RULE_TASK_FAILURE:
      return merge({},defaultState,state,{
        isFetching: false
      })
    default:
      return state
  }
}

function targets(state = {},action) {
  switch(action.type){
    case ActionTypes.GET_TARGETS_REQUEST:
      return merge({}, state, {
        isFetching: true
      })
    case ActionTypes.GET_TARGETS_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.response.result.data
      })
    case ActionTypes.GET_TARGETS_FAILURE:
      return merge({}, state, {
        isFetching: false
      })
    default:
      return state
  }
}

function rules(state = {}, action) {
  switch(action.type) {
    case ActionTypes.GET_REPLICATION_POLICIES_REQUEST:
      return merge({}, state, {
        isFetching: true
      })
    case ActionTypes.GET_REPLICATION_POLICIES_SUCCESS:
      let data = action.response.result.data
      return Object.assign({}, state, {
        isFetching: false,
        data: data && data.length ? data.map((item, index) => Object.assign(item, { key: index })) : []
      })
    case ActionTypes.GET_REPLICATION_POLICIES_FAILURE:
      return merge({}, state, {
        isFetching: false
      })
    default:
      return state
  }
}
function imageBasicInfo(state = {}, action) {
  const { registry } = action
  switch (action.type) {
    case ActionTypes.GET_HARBOR_IMAGEINFO_REQUEST:
      return Object.assign({}, state, {
        [registry]: {
          isFetching: true,
        },
      })
    case ActionTypes.GET_HARBOR_IMAGEINFO_SUCCESS:
      return Object.assign({}, state, {
        [registry]: {
          isFetching: false,
          markdownData: !isEmpty(action.response.result.data) &&
          action.response.result.data[0].description,
          // htmlData: action.response.result.htmlData,
        },
      })
    case ActionTypes.GET_HARBOR_IMAGEINFO_FAILURE:
      return Object.assign({}, state, {
        [registry]: {
          isFetching: false,
        },
      })
    default:
      return state
  }
}

export default function harborRegistry(state = {
  projects: {},
}, action) {
  return {
    systeminfo: systeminfo(state.systeminfo, action),
    projects: projects(state.projects, action),
    projectLogs: projectLogs(state.projectLogs, action),
    allProject: allProject(state.allProject, action),
    imageTags: repositoriesTags(state.imageTags, action),
    imageTagConfig: repositoriesTagConfigInfo(state.imageTagConfig, action),
    detail: detail(state.detail, action),
    repos: repos(state.repos, action),
    members: members(state.members, action),
    updateConfigurations: updateConfigurations(state.updateConfiguration, action),
    configurations: getConfigurations(state.configurations, action),
    imageUpdate: imageUpdate(state.imageUpdate, action),
    imageUpdateLogs: imageUpdateLogs(state.imageUpdateLogs, action),
    targets: targets(state.targets, action),
    rules: rules(state.rules, action),
    imageBasicInfo: imageBasicInfo(state.imageBasicInfo, action),
    currentRuleTask: getCurrentRuleTask(state.currentRuleTask, action)
  }
}
