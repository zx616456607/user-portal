/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * Status handle
 *
 * v0.1 - 2016-11-24
 * @author Zhangpc
*/
/*{
  cluster: "cce1c71ea85a5638b22c15d86c1f61df",
  type: "app",
  name: ["nginx"]
}*/
import merge from 'lodash/merge'
const MAX_SEND_MSG_INTERVAL = 50

export function addWatch(type, cluster, ws, data = []) {
  switch (type) {
    case 'pod':
      return addPodWatch(cluster, ws, data)
    case 'deployment':
      return addDeploymentWatch(cluster, ws, data)
    case 'app':
      return addAppWatch(cluster, ws, data)
    default:
      return
  }
}

export function addPodWatch(cluster, props, pods = []) {
  let name = []
  pods.filter(pod => {
    if (name.indexOf(pod.metadata.labels.name) < 0) {
      name.push(pod.metadata.labels.name)
    }
  })
  if (name.length < 1) {
    return
  }
  let config = {
    type: 'pod',
    cluster,
    name
  }
  _addWatch(props, config)
}

export function addDeploymentWatch(cluster, props, deployments = []) {
  let name = []
  console.log(`deployments--------------------------`)
  console.log(deployments)
  deployments.filter(deployment => {
    if (name.indexOf(deployment.metadata.name) < 0) {
      name.push(deployment.metadata.name)
    }
  })
  if (name.length < 1) {
    return
  }
  let config = {
    type: 'deployment',
    cluster,
    name
  }
  _addWatch(props, config)
}

export function addAppWatch(cluster, props, apps = []) {
  let name = []
  apps.filter(app => {
    if (name.indexOf(app.name) < 0) {
      name.push(app.name)
    }
  })
  if (name.length < 1) {
    return
  }
  let config = {
    type: 'app',
    cluster,
    name
  }
  _addWatch(props, config)
}

export function handleOnMessage(props, response) {
  try {
    const { type, data, watchType } = response
    const { reduxState, updateContainerList, updateAppList } = props
    const { entities, containers, apps } = reduxState
    const cluster = entities.current.cluster.clusterID
    if (watchType === 'pod') {
      let { containerList } = containers.containerItems[cluster]
      updateContainerList(cluster, _changeListByWatch(containerList, response))
    } else if (watchType === 'app') {
      let { appList } = apps.appItems[cluster]
      updateAppList(cluster, _changeAppListByWatch(appList, response))
    }
  } catch (err) {
    console.error('handleOnMessage err:', err)
  }
}


export function removeWatch(type, cluster, ws) {
  switch (type) {
    case 'pod':
      return removePodWatch(cluster, ws)
    case 'deployment':
      return removeDeploymentWatch(cluster, ws)
    case 'app':
      return removeAppWatch(cluster, ws)
    default:
      return
  }
}

export function removePodWatch(cluster, ws) {
  let config = {
    type: 'pod',
    cluster,
    code: 'CLOSED'
  }
  ws.send(JSON.stringify(config))
}

export function removeDeploymentWatch(cluster, ws) {
  let config = {
    type: 'deployment',
    cluster,
    code: 'CLOSED'
  }
  ws.send(JSON.stringify(config))
}

export function removeAppWatch(cluster, ws) {
  let config = {
    type: 'app',
    cluster,
    code: 'CLOSED'
  }
  ws.send(JSON.stringify(config))
}

function _addWatch(props, config) {
  let times = 0
  // Websocket may be not open, so try interval
  let sendMsgInterval = setInterval(() => {
    times++
    let { statusWatchWs } = props
    if (statusWatchWs) {
      statusWatchWs.send(JSON.stringify(config))
      clearInterval(sendMsgInterval)
    }
    if (times > MAX_SEND_MSG_INTERVAL) {
      clearInterval(sendMsgInterval)
    }
  }, 1000)
}

function _changeListByWatch(list, response) {
  let result = []
  let exist = false
  const { type, data } = response
  list.map(item => {
    if (item.metadata.name === data.metadata.name) {
      exist = true
      switch (type) {
        case 'ADDED':
        case 'MODIFIED':
          delete item.status
          delete item.checked
          result.push(merge({}, item, data))
        case 'DELETED':
        // do noting here
        case 'ERROR':
        // @TODO
      }
    } else {
      result.push(item)
    }
  })
  if (!exist) {
    result.unshift(data)
  }
  return result
}

function _changeAppListByWatch(apps, response) {
  const { name, type } = response
  if (type === 'ADDED') {
    return apps
  }
  let result = []
  let exist = false
  apps.map(app => {
    if (app.name === name) {
      app.services = _changeListByWatch(app.services, response)
      delete app.checked
    }
  })
  console.log(`apps---------------------------handled`)
  console.log(apps)
  return apps
}