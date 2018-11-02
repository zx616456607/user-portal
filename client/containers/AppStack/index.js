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
import QueueAnim from 'rc-queue-anim'
import { browserHistory } from 'react-router'
import cloneDeep from 'lodash/cloneDeep'
import { toQuerystring } from '../../../src/common/tools'
import * as openApiActions from '../../../src/actions/open_api'
import SecondSider from '../../../src/components/SecondSider'
import Title from '../../../src/components/Title'
import './style/index.less'

const HEADER_HEIGHT = 60
// replace hash when build, for clear cache
const hash = process.env.DEVOPS_PORTAL_HASH

const menus = [
  {
    url: '/app-stack/StatefulSet',
    name: 'StatefulSet',
    onClick: () => {
      try {
        browserHistory.push('/app-stack/StatefulSet')
        if (window.aiPortalHistory) {
          window.aiPortalHistory.replace('/app-stack/StatefulSet')
        }
      } catch (error) {
        //
      }
    },
  },
  {
    url: '/app-stack/Job',
    name: 'Job',
    onClick: () => {
      try {
        browserHistory.push('/app-stack/Job')
        if (window.aiPortalHistory) {
          window.aiPortalHistory.replace('/app-stack/Job')
        }
      } catch (error) {
        //
      }
    },
  },
  {
    url: '/app-stack/CronJob',
    name: 'CronJob',
    onClick: () => {
      try {
        browserHistory.push('/app-stack/CronJob')
        if (window.aiPortalHistory) {
          window.aiPortalHistory.replace('/app-stack/CronJob')
        }
      } catch (error) {
        //
      }
    },
  },
]

class AIDeepLearning extends React.Component {
  state = {
    windowHeight: window.innerHeight,
    containerSiderStyle: 'normal',
  }

  componentDidMount() {
    window.aiIframeCallBack = (action, data) => {
      switch (action) {
        case 'redirect':
          browserHistory.push(data.pathname)
          break
        case 'aiPortalHistory':
          window.aiPortalHistory = data
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
      project, onbehalfuser, onbehalfuserid, token, cluster,
      username, location: { pathname, query: _query },
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
      }
    }
    const query = Object.assign(
      {},
      locationQuery,
      {
        token, username, project, onbehalfuser, onbehalfuserid, cluster, hash,
      }
    )
    const { windowHeight, containerSiderStyle } = this.state
    const style = {
      height: windowHeight - HEADER_HEIGHT,
    }
    if (!token) {
      return <div className="loading">
        <Title title={title} />
        <Spin size="large" />
      </div>
    }
    const scope = this

    return <div id="AIDeepLearning" style={style}>
      <QueueAnim
        className="AIDeepLearningSiderAnimate"
        key="AIDeepLearningSiderAnimate"
        type="left"
      >
        <div
          className={
            containerSiderStyle === 'normal'
              ? 'AIDeepLearningMenu CommonSecondMenu'
              : 'hiddenMenu AIDeepLearningMenu CommonSecondMenu'
          }
          key="cicdSider"
        >
          <SecondSider menuList={menus} scope={scope} />
        </div>
      </QueueAnim>
      <div
        className={
          containerSiderStyle === 'normal'
            ? 'AIDeepLearningContent CommonSecondContent'
            : 'hiddenContent AIDeepLearningContent CommonSecondContent'
        }
      >
        <Title title={title} />
        <iframe title="工作负载" id="pipeline" src={`/app-stack/index.html?hash=${hash}#${redirect}?${toQuerystring(query)}`} />
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
  }
}

export default connect(mapStateToProps, {
  loadApiInfo: openApiActions.loadApiInfo,
})(AIDeepLearning)
