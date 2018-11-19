/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * AppStackIframe.js page
 *
 * @author zhangtao
 * @date Tuesday November 13th 2018
 */
import * as React from 'react'
import cloneDeep from 'lodash/cloneDeep'
import { toQuerystring } from '../../../src/common/tools'
import { connect } from 'react-redux'
import './style/AppStackIframe.less'
import { getDeepValue } from '../../util/util'

const hash = process.env.DEVOPS_PORTAL_HASH
function AppStackIframe(props) {
  const { project, onbehalfuser, onbehalfuserid, token, cluster, watchToken,
    username, location: { pathname, query: _query } } = props
  const locationQuery = cloneDeep(_query)
  let redirect = locationQuery.redirect
  delete locationQuery.redirect
  if (!redirect) {
    if (pathname === '/app-stack/StatefulSet') {
      redirect = '/StatefulSet'
    } else if (pathname === '/app-stack/Job') {
      redirect = '/Job'
    } else if (pathname === '/app-stack/CronJob') {
      redirect = '/CronJob'
    } else if (pathname === '/app-stack/createWorkLoad/' ||
      pathname === '/cluster/createWorkLoad/') {
      redirect = '/createWorkLoad/'
    } else if (pathname === '/app-stack/Deployment') {
      redirect = '/Deployment'
    } else if (pathname === '/app-stack/Pod') {
      redirect = '/Pod'
    } else if (pathname === '/net-management/Service') {
      redirect = '/Service'
    } else if (pathname === '/app-stack/Design') {
      redirect = '/app-stack'
    }
  }
  const query = Object.assign(
    {},
    {
      token, username, project, onbehalfuser, onbehalfuserid, cluster, hash, watchToken,
    },
    locationQuery
  )
  return (<iframe title="工作负载" id="AppStack" src={`/app-stack/index.html?hash=${hash}#${redirect}?${toQuerystring(query)}`} />)
}
const mapStateToProps = state => {
  const { space = {}, cluster = {} } = state.entities.current
  let onbehalfuser
  let onbehalfuserid
  // sys admin check user personal space
  if (space.userName) {
    onbehalfuser = space.userName
    onbehalfuserid = space.userID
    space.namespace = 'default'
  }
  let project
  if (space.namespace !== 'default') {
    project = space.namespace
  }

  const { username, token } = state.openApi.result || {}

  return {
    onbehalfuser,
    onbehalfuserid,
    project,
    cluster: cluster.clusterID,
    username,
    token,
    watchToken: encodeURIComponent(
      getDeepValue(state, [ 'entities', 'loginUser', 'info', 'watchToken' ])
    ),
  }
}
export default connect(mapStateToProps)(AppStackIframe)
