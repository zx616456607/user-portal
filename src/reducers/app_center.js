/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for app center
 *
 * v0.1 - 2016-10-10
 * @author Zhangpc
 */

import * as ActionTypes from '../actions/app_center'
import merge from 'lodash/merge'
import reducerFactory from './factory'
import cloneDeep from 'lodash/cloneDeep'
import remove from 'lodash/remove'
import findIndex from 'lodash/findIndex'

function privateImages(state = {}, action) {
  const registry = action.registry
  const defaultState = {
    [registry]: {
      isFetching: false,
      registry,
      imageList: []
    }
  }
  switch (action.type) {
    case ActionTypes.IMAGE_PRIVATE_LIST_REQUEST:
      return merge({}, defaultState, state, {
        [registry]: { isFetching: true }
      })
    case ActionTypes.IMAGE_PRIVATE_LIST_SUCCESS:
      return Object.assign({}, state, {
        [registry]: {
          isFetching: false,
          registry,
          server: action.response.result.server,
          imageList: action.response.result.data || []
        }
      })
    case ActionTypes.IMAGE_PRIVATE_LIST_FAILURE:
      return merge({}, defaultState, state, {
        [registry]: { isFetching: false }
      })
    case ActionTypes.IMAGE_SEARCH_PRIVATE: {
      const { imageName, registry } = action.condition
      const list = cloneDeep(state)
      let imageList = list[registry].imageList
      let imageListBak = list[registry].imageListBak
      if (!imageListBak) {
        list[registry].imageListBak = imageList
        imageListBak = imageList
      }
      if (!imageName) {
        list[registry].imageListBak = imageListBak
        list[registry].imageList = imageListBak
        return list
      }
      const result = []
      imageListBak.forEach(item => {
        if (item.name.indexOf(imageName) >= 0) {
          result.push(item)
        }
      })
      list[registry].imageList = result
      return list
    }
    case ActionTypes.DELETE_PRIVATE_IMAGE_SUCCESS: {
      const delState = cloneDeep(state)
      const registry = action.registry
      const imageList = delState[registry].imageList
      const dIndex = findIndex(imageList, list => {
        return list.name === action.image
      })
      delState[registry].imageList.splice(dIndex, 1)
      return delState

    }
    default:
      return state
  }
}

function publicImages(state = {}, action) {
  const registry = action.registry
  const defaultState = {
    [registry]: {
      isFetching: false,
      registry,
      imageList: []
    }
  }
  switch (action.type) {
    case ActionTypes.IMAGE_PUBLIC_LIST_REQUEST:
      return merge({}, defaultState, state, {
        [registry]: { isFetching: true }
      })
    case ActionTypes.IMAGE_PUBLIC_LIST_SUCCESS: {
      const bakList = cloneDeep(action.response.result.data)
      let imageList = action.response.result.data || []
      if (action.serverType) {
        imageList = bakList.filter(list => {
          if (/^tenxcloud/.test(list.name)) {
            return true
          }
          return false
        })
      }
      return {
        [registry]: {
          isFetching: false,
          registry,
          server: action.response.result.server,
          imageList,
          bakList
        }
      }
    }
    case ActionTypes.IMAGE_PUBLIC_LIST_FAILURE:
      return merge({}, defaultState, state, {
        [registry]: { isFetching: false }
      })
    // server type default tenxcloud
    case ActionTypes.IMAGE_PUBLIC_TYPE: {
      const typeState = cloneDeep(state)
      const bakList = typeState[action.registry].bakList
      let imageListOs = []
      if (bakList.length > 0) {
        imageListOs = bakList.filter(list => {
          if (/^tenxcloud/.test(list.name)) {
            return true
          }
          return false
        })
      }
      const imageList = cloneDeep(imageListOs)
      const temp = []
      if (action.server == 'all') {
        typeState[action.registry].imageList = imageListOs
        return typeState
      }
      if (action.server == 'hub') {
        imageListOs = bakList.filter(list => {
          if (!/^tenxcloud/.test(list.name)) {
            return true
          }
          return false
        })
        typeState[action.registry].imageList = imageListOs
        return typeState
      }
      imageList.forEach(list => {
        if (list.category == action.server) {
          temp.push(list)
        }
      })
      typeState[action.registry].imageList = temp
      return typeState
    }
    default:
      return state
  }
}

function registryNamespaces(state = {}, action) {
  const { id, type } = action
  switch (type) {
    case ActionTypes.GET_DOCKER_REGISTRY_NAMESPACES_REQUEST:
      return merge({}, state, {
        [id]: {
          isFetching: true,
        },
      })
    case ActionTypes.GET_DOCKER_REGISTRY_NAMESPACES_SUCCESS:
      return merge({}, state, {
        [id]: {
          isFetching: false,
          list: action.response.result.namespaces,
        },
      })
    case ActionTypes.GET_DOCKER_REGISTRY_NAMESPACES_FAILURE:
      return merge({}, state, {
        [id]: {
          isFetching: false,
        },
      })
    default:
      break;
  }
}

function otherImages(state = {}, action) {
  const defaultState = {
    isFetching: false,
    bak: [],
    bakImageList: [],
    imageRow: {}
  }
  switch (action.type) {
    case ActionTypes.IMAGE_OTHER_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.IMAGE_OTHER_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        server: action.response.result.server,
        imageRow: action.response.result.data || []
      })
    case ActionTypes.IMAGE_OTHER_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    case ActionTypes.GET_OTHER_LIST_REQUEST:
    case ActionTypes.SEARCH_DOCKERHUB_REPOS_REQUEST:
      return merge({}, defaultState, state, {
        [action.id]: {
          isFetching: true
        }
      })
    case ActionTypes.GET_OTHER_LIST_SUCCESS:
      return Object.assign({}, defaultState, state, {
        [action.id]: {
          isFetching: false,
          imageList: action.response.result.results || [],
          bak: action.response.result.results
        }
      })
    case ActionTypes.SEARCH_DOCKERHUB_REPOS_SUCCESS:
      action.response.result.results &&
      action.response.result.results.forEach(image => {
        if (image.name.indexOf('/') < 0) {
          image.name = `library/${image.name}`
        }
      })
      return Object.assign({}, defaultState, state, {
        [action.id]: {
          isFetching: false,
          total: action.response.result.count,
          imageList: action.response.result.results || [],
        }
      })
    case ActionTypes.GET_OTHER_LIST_FAILURE:
    case ActionTypes.SEARCH_DOCKERHUB_REPOS_FAILURE:
      return merge({}, defaultState, state, {
        [action.id]:{isFetching: false}
      })
    case ActionTypes.DELETE_OTHER_IMAGE_REQUEST:
      return merge({}, state, {
        isFetching: true
      })
    case ActionTypes.DELETE_OTHER_IMAGE_SUCCESS:
      const oldState = cloneDeep(state)
      const Id = action.id
      const imageList = oldState.imageRow
      for (let i = 0; i < imageList.length; i++) {
        if (imageList[i].id == Id) {
          imageList.splice(i, 1)
        }
      }
      oldState.isFetching = false
      return oldState
    case ActionTypes.DELETE_OTHER_IMAGE_FAILURE:
      return merge({}, state, {
        isFetching: false
      })
    case ActionTypes.SEARCH_OTHER_LIST_REQUEST:
      const imageName = action.image
      const newState = cloneDeep(state)
      if (imageName == '') {
        newState[action.id].imageList = newState[action.id].bak
        return newState
      }
      const temp = state[action.id].bak.filter(image => {
        const search = new RegExp(imageName)
        if (search.test(image.name)) {
          return true
        }
        return false
      })
      newState[action.id].imageList = temp
      return newState
    default:
      return state
  }
}


function getAppCenterBindUser(state = {}, action) {
  switch (action.type) {
    case ActionTypes.GET_ENTERPRISE_APP_CENTER_BIND_REQUEST:
      return merge({}, state, {
        isFetching: true
      })
    case ActionTypes.GET_ENTERPRISE_APP_CENTER_BIND_SUCCESS:
      return merge({}, state, {
        isFetching: false,
        configured: action.response.result.configured
      })
    case ActionTypes.GET_ENTERPRISE_APP_CENTER_BIND_FAILURE:
      return merge({}, state, {
        isFetching: false
      })
    default:
      return state
  }
}

function wrapTemplate(state = {}, action) {
  switch (action.type) {
    case ActionTypes.GET_REGISTRY_TEMPLATE_REQUEST:
      return merge({}, state, {
        isFetching: true,
      })
    case ActionTypes.GET_REGISTRY_TEMPLATE_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        ...action.response.result,
      })
    case ActionTypes.GET_REGISTRY_TEMPLATE_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
      })
    default:
      return state;
  }
}

export function images(state = { publicImages: {} }, action) {
  return {
    privateImages: privateImages(state.privateImages, action),
    publicImages: publicImages(state.publicImages, action),
    fockImages: fockImagesList(state.fockImages, action),
    otherImages: otherImages(state.otherImages, action),
    registryNamespaces: registryNamespaces(state.registryNamespaces, action),
    imagesInfo: imagesInfo(state.imagesInfo, action),
    stackCenter: stackList(state.stackCenter, action),
    createStack: createStack(state.createStack, action),
    mirrorSafetyLayerinfo: mirrorSafetyLayerinfo(state.mirrorSafetyLayerinfo, action),
    mirrorSafetyScan: mirrorSafetyScan(state.mirrorSafetyScan, action),
    mirrorSafetyLyinsinfo: mirrorSafetyLyinsinfo(state.mirrorSafetyLyinsinfo, action),
    mirrorSafetyClairinfo: mirrorSafetyClairinfo(state.mirrorSafetyClairinfo, action),
    mirrorSafetyScanStatus: mirrorSafetyScanStatus(state.mirrorSafetyScanStatus, action),
    getAppCenterBindUser: getAppCenterBindUser(state.getAppCenterBindUser, action),
    AppCenterBindUser: reducerFactory({
      REQUEST: ActionTypes.POST_ENTERPRISE_APP_CENTER_BIND_REQUEST,
      SUCCESS: ActionTypes.POST_ENTERPRISE_APP_CENTER_BIND_SUCCESS,
      FAILURE: ActionTypes.POST_ENTERPRISE_APP_CENTER_BIND_FAILURE
    }, state.AppCenterBindUser, action),
    deleteAppCenterBindUser: reducerFactory({
      REQUEST: ActionTypes.DEL_ENTERPRISE_APP_CENTER_BIND_REQUEST,
      SUCCESS: ActionTypes.DEL_ENTERPRISE_APP_CENTER_BIND_SUCCESS,
      FAILURE: ActionTypes.DEL_ENTERPRISE_APP_CENTER_BIND_FAILURE
    }, state.deleteAppCenterBindUser, action),
    wrapList: reducerFactory({
      REQUEST: ActionTypes.GET_WRAP_MANAGE_LIST_REQUEST,
      SUCCESS: ActionTypes.GET_WRAP_MANAGE_LIST_SUCCESS,
      FAILURE: ActionTypes.GET_WRAP_MANAGE_LIST_FAILURE,
    }, state.wrapList, action,{overwrite: true}),
    wrapPublishList: reducerFactory({
      REQUEST: ActionTypes.GET_WRAP_PUBLISH_LIST_REQUEST,
      SUCCESS: ActionTypes.GET_WRAP_PUBLISH_LIST_SUCCESS,
      FAILURE: ActionTypes.GET_WRAP_PUBLISH_LIST_FAILURE,
    }, state.wrapPublishList, action, {overwrite: true}),
    wrapStoreList: reducerFactory({
      REQUEST: ActionTypes.GET_WRAP_STORE_LIST_REQUEST,
      SUCCESS: ActionTypes.GET_WRAP_STORE_LIST_SUCCESS,
      FAILURE: ActionTypes.GET_WRAP_STORE_LIST_FAILURE,
    }, state.wrapStoreList, action, {overwrite: true}),
    wrapStoreHotList: reducerFactory({
      REQUEST: ActionTypes.GET_WRAP_STORE_HOT_LIST_REQUEST,
      SUCCESS: ActionTypes.GET_WRAP_STORE_HOT_LIST_SUCCESS,
      FAILURE: ActionTypes.GET_WRAP_STORE_HOT_LIST_FAILURE,
    }, state.wrapStoreHotList, action, {overwrite: true}),
    wrapGroupList: reducerFactory({
      REQUEST: ActionTypes.GET_WRAP_GROUP_LIST_REQUEST,
      SUCCESS: ActionTypes.GET_WRAP_GROUP_LIST_SUCCESS,
      FAILURE: ActionTypes.GET_WRAP_GROUP_LIST_FAILURE,
    }, state.wrapGroupList, action, {overwrite: true}),
    wrapGroupDetailList: reducerFactory({
      REQUEST: ActionTypes.GET_WRAP_GROUP_DETAIL_LIST_REQUEST,
      SUCCESS: ActionTypes.GET_WRAP_GROUP_DETAIL_LIST_SUCCESS,
      FAILURE: ActionTypes.GET_WRAP_GROUP_DETAIL_LIST_FALIURE,
    }, state.wrapGroupDetailList, action, {overwrite: true}),
    wrapDetail: wrapDetail(state.wrapDetail, action),
    wrapTemplate: wrapTemplate(state.wrapTemplate, action)
    // deleteStack: deleteStack(state.deleteStack, action)
  }
}
//get image detail tag
function imageTag(state = {}, action) {
  const { registry, fullName } = action
  const defaultState = {
    [registry]: {
      [fullName]: {
        isFetching: false,
        registry,
        imageList: [],
      }
    }
  }

  switch (action.type) {
    case ActionTypes.IMAGE_GET_DETAILTAG_REQUEST:
      return merge({}, defaultState, state, {
        [registry]: {
          [fullName]: {
            isFetching: true
          }
        }
      })
    case ActionTypes.IMAGE_GET_DETAILTAG_SUCCESS:
      const LATEST = 'latest'
      let data = merge([], Array.reverse(action.response.result.data))
      const latestTagIndex = data.indexOf(LATEST)
      if (latestTagIndex > 0) {
        data.splice(latestTagIndex,1)
        data.unshift(LATEST)
      }
      return Object.assign({}, state, {
        [registry]: {
          [fullName]: {
            isFetching: false,
            registry: registry,
            server: action.response.result.server,
            tag: data,
          }
        }
      })
    case ActionTypes.IMAGE_GET_DETAILTAG_FAILURE:
      return merge({}, defaultState, state, {
        [registry]: {
          [fullName]: {
            isFetching: false
          }
        }
      })
    default:
      return state
  }
}

export function getImageTag(state = { publicImages: {} }, action) {
  return {
    imageTag: imageTag(state.imageTag, action),
    otherImageTag: getOtherImageTag(state.otherImageTag, action)
  }
}

//get iamge detail tag config
function imageTagConfig(state = {}, action) {
  const registry = action.registry
  const defaultState = {
    [registry]: {
      isFetching: false,
      registry,
      sizeInfo: {}
    }
  }

  switch (action.type) {
    case ActionTypes.IMAGE_GET_DETAILTAGCONFIG_REQUEST:
      return merge({}, defaultState, state, {
        [registry]: { isFetching: true }
      })
    case ActionTypes.IMAGE_GET_DETAILTAGCONFIG_SUCCESS:
      // return Object.assign({}, state, {
      return merge({}, state, {
        [registry]: {
          isFetching: false,
          registry: registry,
          server: action.response.result.server,
          configList: {
            tag: action.response.result.tag || [],
            [action.tag]: action.response.result.data || []
          },
        }
      })
    case ActionTypes.IMAGE_GET_DETAILTAGCONFIG_FAILURE:
      return merge({}, defaultState, state, {
        [registry]: {
          isFetching: false,
          configList: {
            [action.tag]: null
          }
        }
      })
    default:
      return state
  }
}

export function getImageTagConfig(state = { publicImages: {} }, action) {
  return {
    imageTagConfig: imageTagConfig(state.imageTagConfig, action),
    otherTagConfig: getOtherImageTagConfig(state.otherTagConfig, action)
  }
}

function imagesInfo(state = {}, action) {
  const registry = action.registry
  const defaultState = {
    [registry]: {
      isFetching: false,
      registry,
      imageInfo: { dockerfile: '' }
    }
  }
  switch (action.type) {
    case ActionTypes.GET_IMAGEINFO_REQUEST:
      return merge({}, defaultState, state, {
        [registry]: { isFetching: true }
      })
    case ActionTypes.GET_IMAGEINFO_SUCCESS:
      return Object.assign({}, state, {
        [registry]: {
          isFetching: false,
          registry: registry,
          imageInfo: action.response.result.data || null
        }
      })
    case ActionTypes.GET_IMAGEINFO_FAILURE:
      return merge({}, defaultState, state, {
        [registry]: { isFetching: false }
      })
    // 设置收藏 与否
    case ActionTypes.SET_IMAGE_STORE_REQUEST:
      return merge({}, defaultState, state, {
        [registry]: { isFetching: false }
      })

    case ActionTypes.SET_IMAGE_STORE_SUCCESS:
      const oldimageInfo = cloneDeep(state)
      if (action.isFavourite != undefined) {
        oldimageInfo[registry].imageInfo.isFavourite = action.isFavourite
      }
      if (action.isPrivate != undefined) {
        oldimageInfo[registry].imageInfo.isPrivate = action.isPrivate
      }
      return oldimageInfo
    case ActionTypes.SET_IMAGE_STORE_FAILURE:
      return merge({}, defaultState, state, {
        [registry]: { isFetching: false }
      })
    case ActionTypes.GET_CHECK_IMAGE_SUCCESS: {
      return Object.assign({}, state, {
        [registry]: {
          isFetching: false,
          registry: registry,
          server: action.response.result.server,
          imageInfo: action.response.result.data || null
        }
      })
    }
    default:
      return state
  }
}
//  get other image tag
function getOtherImageTag(state = {}, action) {
  const defaultState = {
    isFetching: false,
    imageTag: ''
  }
  const { fullname } = action
  switch (action.type) {
    case ActionTypes.GET_OTHER_IMAGE_TAGS_REQUEST:
      return merge({}, defaultState, state, {
        [fullname]: {
          isFetching: true,
          imageTag: null,
        }
      })
    case ActionTypes.GET_OTHER_IMAGE_TAGS_SUCCESS:
      const LATEST = 'latest'
      let data = action.response.result.tags
      let full = action.response.result.full
      const latestTagIndex = data.indexOf(LATEST)
      if (latestTagIndex > 0) {
        data.splice(latestTagIndex,1)
        data.unshift(LATEST)
        const temp = full.splice(latestTagIndex,1)
        full = [].concat(temp, full)
      }
      return Object.assign({}, state, {
        [fullname]: {
          isFetching: false,
          imageTag: data || null,
          tagWithOS: full.map(item => {
            return {
              name: item.name,
              os: item.images && item.images[0] ? item.images[0].os : '',
              arch: item.images && item.images[0] ? item.images[0].architecture : '',
            }
          }),
        },
      })
    case ActionTypes.GET_OTHER_IMAGE_TAGS_FAILURE:
      return merge({}, defaultState, state, {
        [fullname]: {
          isFetching: false,
        }
      })
    default:
      return state
  }
}
// other registry tags config
function getOtherImageTagConfig(state = {}, action) {
  const registry = action.registry
  const defaultState = {
    isFetching: false,
    configList: {},
    sizeInfo: '',
  }

  switch (action.type) {
    case ActionTypes.GET_OTHER_TAG_CONFIG_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_OTHER_TAG_CONFIG_SUCCESS:
      return Object.assign({}, defaultState, state, {
        isFetching: false,
        tag: action.tag || [],
        configList: action.response.result.configInfo || {},
        sizeInfo: action.response.result.sizeInfo,
      })
    case ActionTypes.GET_OTHER_TAG_CONFIG_FAILURE:
      return merge({}, defaultState, {
        isFetching: false
      })
    default:
      return state
  }
}

//    --------------------  我的收藏  -----------
function fockImagesList(state = {}, action) {
  const registry = action.registry
  const defaultState = {
    [registry]: {
      isFetching: false,
      registry,
      imageList: []
    }
  }

  switch (action.type) {
    case ActionTypes.GET_IMAGE_FOCK_REQUEST:
      return merge({}, defaultState, state, {
        [registry]: { isFetching: true }
      })
    case ActionTypes.GET_IMAGE_FOCK_SUCCESS:
      return merge({}, {
        [registry]: {
          isFetching: false,
          registry: registry,
          server: action.response.result.server,
          imageList: action.response.result.data || []
        }
      })
    case ActionTypes.GET_IMAGE_FOCK_FAILURE:
      return merge({}, defaultState, state, {
        [registry]: { isFetching: false }
      })
    case ActionTypes.IMAGE_SEARCH_FAVORITE: {
      const { imageName, registry } = action.condition
      const list = cloneDeep(state)
      let imageList = list[registry].imageList
      let imageListBak = list[registry].imageListBak
      if (!imageListBak) {
        list[registry].imageListBak = imageList
        imageListBak = imageList
      }
      if (!imageName) {
        list[registry].imageListBak = imageListBak
        list[registry].imageList = imageListBak
        return list
      }
      const result = []
      imageListBak.forEach(item => {
        if (item.name.indexOf(imageName) >= 0) {
          result.push(item)
        }
      })
      list[registry].imageList = result
      return list
    }
    default:
      return state
  }
}
// ----------------------      编排中心          -----------
function stackList(state = {}, action) {
  const registry = action.registry
  const defaultState = {
    [registry]: {
      isFetching: false,
      myStackList: {templates:[]},
      stackList: [],
      appStoreList: [],
      prvbak: {templates:[]},
      pukbak: {templates:[]}
    }
  }
  switch (action.type) {
    case ActionTypes.GET_PRIVATE_STACK_REQUEST:
      return merge({}, state, defaultState, {
        [registry]: { isFetching: true }
      })
    case ActionTypes.GET_PRIVATE_STACK_SUCCESS:
      return Object.assign({}, state, {
        [registry]: {
          isFetching: false,
          registry,
          stackList: state[registry].stackList,
          myStackList: action.response.result.data.data || [],
          prvbak: cloneDeep(action.response.result.data.data),
          pukbak: cloneDeep(state[registry].stackList)
        }
      })
    case ActionTypes.GET_PRIVATE_STACK_FAILURE:
      return merge({}, defaultState, state, {
        [registry]: { isFetching: false }
      })

    case ActionTypes.GET_PUBLIC_STACK_REQUEST:
      return merge({}, defaultState, state, {
        [registry]: { isFetching: true }
      })
    case ActionTypes.GET_PUBLIC_STACK_SUCCESS:
      return Object.assign({}, state, {
        [registry]: {
          isFetching: false,
          myStackList: state[registry].myStackList,
          stackList: action.response.result.data.data || [],
          pukbak: cloneDeep(action.response.result.data.data),
          prvbak: cloneDeep(state[registry].myStackList)
        }
      })
    case ActionTypes.GET_PUBLIC_STACK_FAILURE:
      return merge({}, defaultState, state, {
        [registry]: { isFetching: false }
      })
    // ----------------------- search template -------------
    case ActionTypes.SEARCH_PUBLIC_STACK_LIST: {
      const publicState = cloneDeep(state)
      if (action.imageName == '') {
        publicState[registry].stackList = cloneDeep(publicState[registry].pukbak)
        return publicState
      }
      const template = publicState[registry].pukbak.templates.filter(list => {
        const search = new RegExp(action.imageName)
        if (search.test(list.name)) {
          return true
        }
        return false
      })
      publicState[registry].stackList.templates = template
      return publicState
    }
    case ActionTypes.SEARCH_PRIVATE_STACK_LIST: {
      const privateState = cloneDeep(state)
      if (action.imageName == '') {
        privateState[registry].myStackList = cloneDeep(privateState[registry].prvbak)
        return privateState
      }
      const template = privateState[registry].prvbak.templates.filter(list => {
        const search = new RegExp(action.imageName)
        if (search.test(list.name)) {
          return true
        }
        return false
      })
      privateState[registry].myStackList.templates = template
      return privateState
    }
    // ---------------------- delete template     ---------
    case ActionTypes.DELETE_PRIVATE_STACK_REQUEST:
      return merge({}, state, {
        [registry]: { isFetching: false }
      })
    case ActionTypes.DELETE_PRIVATE_STACK_SUCCESS:
      const oldStack = cloneDeep(state)
      const Registry = action.registry
      const list = oldStack[Registry]
      let ids = remove(list.myStackList.templates, item => {
        return item.id == action.id
      })
      return oldStack
    case ActionTypes.DELETE_PRIVATE_STACK_FAILURE:
      return merge({}, state, {
        [registry]: { isFetching: false }
      })
    // -------------         update          ----- -
    case ActionTypes.UPDATE_PRIVATE_STACK_SUCCESS:
      const updateStack = cloneDeep(state)
      const registry2 = action.registry
      const stacks = updateStack[registry2]
      let ins = findIndex(stacks.myStackList.templates, item => {
        return item.id == action.id
      })
      stacks.myStackList[ins].isPublic = action.obj.is_public
      stacks.myStackList[ins].name = action.obj.name
      stacks.myStackList[ins].content = action.obj.content
      stacks.myStackList[ins].description = action.obj.description
      return Object.assign({}, {
        [registry]: stacks
      })
    case ActionTypes.UPDATE_PRIVATE_STACK_FAILURE:
      return merge({}, state, {
        [registry]: { isFetching: false }
      })
    case ActionTypes.GET_APP_STORE_LIST_REQUEST: {
      return merge({}, state, {
        [registry]: { isFetching: false }
      })
    }
    case ActionTypes.GET_APP_STORE_LIST_SUCCESS: {
      const result = action.response.result.data.data || []
      const imageList = []
      const temp = {}
      for (let a in result) {
        let key = result[a].category
        if (!temp[key]) {
          temp[key] = { imageList: [], title: key }
          temp[key].imageList.push(result[a])
        } else {
          temp[key].imageList.push(result[a])
        }
      }
      const resultArray = Object.getOwnPropertyNames(temp).map(item => {
        return temp[item]
      })
      return Object.assign({}, state, {
        [registry]: {
          isFetching: false,
          appStoreList: resultArray
        }
      })
    }
    case ActionTypes.GET_APP_STORE_LIST_FAILURE: {
      return merge({}, state, {
        [registry]: {
          isFetching: false,
          appStoreList: false
        }
      })
    }
    default:
      return state
  }
}

function createStack(state = {}, action) {
  switch (action.type) {
    case ActionTypes.CREATE_STACK_REQUEST:
      return merge({}, state, {
        isFetching: true
      })
    case ActionTypes.CREATE_STACK_SUCCESS:
      return merge({}, state, {
        isFetching: false
      })
    case ActionTypes.CREATE_STACK_FAILURE:
      return merge({}, state, {
        isFetching: false
      })
    default:
      return state
  }
}

function mirrorSafetyLayerinfo(state = {}, action) {
  switch (action.type) {
    case ActionTypes.GET_IMAGE_MIRRORSAFETY_LAYERINFO_REQUEST:
      return merge({}, state, {
        isFetching: true,
        [action.imageName]: {
          [action.tag]:{
            isFetching: true
          }
        }
      })
    case ActionTypes.GET_IMAGE_MIRRORSAFETY_LAYERINFO_SUCCESS:
      return merge({}, state, {
        isFetching: false,
        [action.imageName]: {
          [action.tag]:{
            isFetching: false,
            result:action.response.result.info.layers
          }
        }
      })
    case ActionTypes.GET_IMAGE_MIRRORSAFETY_LAYERINFO_FAILURE:
      return merge({}, state, {
        isFetching: false
      })
    default:
      return state
  }
}

function mirrorSafetyScanStatus(state = {}, action) {
  switch (action.type) {
    case ActionTypes.GET_IMAGE_MIRRORSAFETY_SCANSTATUS_REQUEST:
      return merge({}, state, {
        isFetching: true,
        [action.imageName]: {
          [action.tag]:{
            isFetching: true
          }
        }
      })
    case ActionTypes.GET_IMAGE_MIRRORSAFETY_SCANSTATUS_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        [action.imageName]: {
          [action.tag]:{
            isFetching: false,
            result:action.response.result
          }
        }
      })
    case ActionTypes.GET_IMAGE_MIRRORSAFETY_SCANSTATUS_FAILURE:
      return merge({}, state, {
        isFetching: false,
      })
    default:
      return state
  }
}

function mirrorSafetyScan(state = {}, action) {
  switch (action.type) {
    case ActionTypes.GET_IMAGE_MIRRORSAFETY_SCAN_REQUEST:
      return merge({}, state, {
        isFetching: true,
        [action.imageName]: {
          [action.tag]:{
            isFetching: true,
          }
        }
      })
    case ActionTypes.GET_IMAGE_MIRRORSAFETY_SCAN_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        [action.imageName]: {
          [action.tag]:{
            isFetching: false,
            result:action.response
          }
        }
      })
    case ActionTypes.GET_IMAGE_MIRRORSAFETY_SCAN_FAILURE:
      return merge({}, state, {
        isFetching: false,
      })
    default:
      return state
  }
}

function mirrorSafetyLyinsinfo(state = {}, action) {
  switch (action.type) {
    case ActionTypes.GET_IMAGE_MIRRORSAFETY_LYINSINFO_REQUEST:
      return merge({}, state, {
        isFetching: true,
        [action.imageName]: {
          [action.tag]:{
            isFetching: true,
          }
        }
      })
    case ActionTypes.GET_IMAGE_MIRRORSAFETY_LYINSINFO_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        [action.imageName]: {
          [action.tag]:{
            isFetching: false,
            result:action.response.result
          }
        }
      })
    case ActionTypes.GET_IMAGE_MIRRORSAFETY_LYINSINFO_FAILURE:
      return merge({}, state, {
        isFetching: false,
      })
    default:
      return state
  }
}

function mirrorSafetyClairinfo(state = {}, action) {
  switch (action.type) {
    case ActionTypes.GET_IMAGE_MIRRORSAFETY_CLAIRINFO_REQUEST:
      return merge({}, state, {
        isFetching: true,
        [action.imageName]: {
          isFetching: true,
        }
      })
    case ActionTypes.GET_IMAGE_MIRRORSAFETY_CLAIRINFO_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        [action.imageName]: {
          [action.tag]: {
            isFetching: false,
            result:action.response.result
          }
        }
      })
    case ActionTypes.GET_IMAGE_MIRRORSAFETY_CLAIRINFO_FAILURE:
      return merge({}, state, {
        isFetching: false,
      })
    default:
      return state
  }
}

function wrapDetail(state = {}, action) {
  switch (action.type) {
    case ActionTypes.WRAP_DETAIL_REQUEST:
      return merge({}, state, {
        isFetching: true,
      })
    case ActionTypes.WRAP_DETAIL_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        result: action.response.result
      })
    case ActionTypes.WRAP_DETAIL_FAILURE:
      return merge({}, state, {
        isFetching: false
      })
    default:
      return state
  }
}