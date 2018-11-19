/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */
/**
 * net-management
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
import * as openApiActions from '../../../src/actions/open_api'
import SecondSider from '../../../src/components/SecondSider'
import Title from '../../../src/components/Title'
import './style/index.less'

const HEADER_HEIGHT = 60
// replace hash when build, for clear cache

const menus = [
  {
    url: '/net-management/Service',
    name: 'discover',
    onClick: () => {
      try {
        browserHistory.push('/net-management/Service')
        if (window.appStackPortalHistory) {
          window.appStackPortalHistory.replace('/Service')
        }
      } catch (error) {
        //
      }
    },
  },
  {
    url: '/net-management/appLoadBalance',
    name: 'loadBalance',
    onClick: () => {
      try {
        browserHistory.push('/net-management/appLoadBalance')
        // if (window.appStackPortalHistory) {
        //   window.appStackPortalHistory.replace('/net-management/largeScaleTrain')
        // }
      } catch (error) {
        //
      }
    },
  },
  {
    url: '/net-management/dnsRecord',
    name: 'dnsRecord',
    onClick: () => {
      try {
        browserHistory.push('/net-management/dnsRecord')
      } catch (error) {
        //
      }
    },
  },
  {
    url: '/net-management/securityGroup',
    name: 'securityGroup',
    onClick: () => {
      try {
        browserHistory.push('/net-management/securityGroup')
      } catch (error) {
        //
      }
    },
  },
]

class NetManagement extends React.Component {
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
      token, location: { pathname, query: _query },
      children,
    } = this.props
    const locationQuery = cloneDeep(_query)
    let title
    let redirect = locationQuery.redirect
    delete locationQuery.redirect
    if (!redirect) {
      if (pathname === '/net-management/Service') {
        title = '服务发现'
        redirect = '/Service'
      }
    }
    const { windowHeight, containerSiderStyle } = this.state
    const style = {
      height: windowHeight - HEADER_HEIGHT,
    }
    if (pathname === '/net-management/Service') {
      style.overflowY = 'hidden'
    }
    if (!token) {
      return <div className="loading">
        <Title title={title} />
        <Spin size="large" />
      </div>
    }
    const scope = this

    return <div id="NetManagement" style={style}>
      <QueueAnim
        className="NetManagementSiderAnimate"
        key="NetManagementSiderAnimate"
        type="left"
      >
        <div
          className={
            containerSiderStyle === 'normal'
              ? 'NetManagementMenu CommonSecondMenu'
              : 'hiddenMenu NetManagementMenu CommonSecondMenu'
          }
          key="cicdSider"
        >
          <SecondSider menuList={menus} scope={scope} />
        </div>
      </QueueAnim>
      <div
        className={
          containerSiderStyle === 'normal'
            ? 'NetManagementContent CommonSecondContent'
            : 'hiddenContent NetManagementContent CommonSecondContent'
        }
      >
        <Title title={title} />
        {
          children
        }
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
})(NetManagement)
