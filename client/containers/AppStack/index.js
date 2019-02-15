/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */
/**
 * ai-deep-learning
 *
 * v0.1 - 2018-06-20
 * @author zhangpc
 */
import React from 'react'
import { connect } from 'react-redux'
import { Spin } from 'antd'
import { browserHistory } from 'react-router'
import cloneDeep from 'lodash/cloneDeep'
import * as openApiActions from '../../../src/actions/open_api'
import Title from '../../../src/components/Title'
import './style/index.less'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'

import { HEADER_HEIGHT } from '../../../src/constants'
// replace hash when build, for clear cache

class AppStack extends React.Component {
  state = {
    windowHeight: window.innerHeight,
    containerSiderStyle: 'normal',
  }

  componentDidMount() {
    window.appStackIframeCallBack = (action, data) => {
      switch (action) {
        case 'redirect':
          browserHistory.push(data.pathname)
          break
        case 'appStackPortalHistory':
          window.appStackPortalHistory = data
          break
        default:
          break
      }
    }
    window.addEventListener('resize', this.handleWindowResize)
    const { loadApiInfo } = this.props
    loadApiInfo()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize)
  }

  handleWindowResize = () => {
    this.setState({
      windowHeight: window.innerHeight,
    })
  }
  // componentDidUpdate(prevProps) {
  //   const { location: { pathname: prevPathname, query: { redirect: _prevRedirect } = {} } = {} }
  //    = prevProps
  //   const { location: { pathname, query: { redirect } = {} } = {} } = this.props
  //   if (_prevRedirect !== redirect || prevPathname !== pathname) {
  //     window.history.back()
  //   }
  // }
  render() {
    const {
      token, location: { pathname, query: _query }, children,
    } = this.props
    const locationQuery = cloneDeep(_query)
    let title
    let redirect = locationQuery.redirect
    delete locationQuery.redirect
    if (!redirect) {
      if (pathname === '/app-stack/StatefulSet') {
        title = 'StatefulSet'
        redirect = '/StatefulSet'
      } else if (pathname === '/app-stack/Job') {
        title = 'Job'
        redirect = '/Job'
      } else if (pathname === '/app-stack/CronJob') {
        title = 'CronJob'
        redirect = '/CronJob'
      } else if (pathname === '/app-stack/createWorkLoad/') {
        title = 'createWorkLoad'
        redirect = '/createWorkLoad/'
      } else if (pathname === '/app-stack/Deployment') {
        title = 'Deployment'
        redirect = '/Deployment'
      } else if (pathname === '/app-stack/Pod') {
        title = 'Pod'
        redirect = '/Pod'
      } else if (pathname === '/app-stack/Design') {
        redirect = '/app-stack'
        title = '应用编排设计'
      }
    }
    const { windowHeight } = this.state
    const style = {
      height: windowHeight - HEADER_HEIGHT,
    }
    if (!token) {
      return <div className="loading">
        { title && <Title title={title} /> }
        <Spin size="large" />
      </div>
    }

    return <div id="AppStack" style={style}>
      <div
        className="AppStackContent CommonSecondContent"
      >
        { title && <Title title={title} /> }
        {children}
      </div>
    </div>
  }
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

export default connect(mapStateToProps, {
  loadApiInfo: openApiActions.loadApiInfo,
})(AppStack)
