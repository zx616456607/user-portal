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
import * as openApiActions from '../../../src/actions/open_api'
import SecondSider from '../../../src/components/SecondSider'
import Title from '../../../src/components/Title'
import './style/index.less'
import { getDeepValue } from '../../util/util'

const HEADER_HEIGHT = 60
// replace hash when build, for clear cache

const menus = [
  {
    url: '/app-stack-pro',
    name: 'appStackPro',
    onClick: () => {
      try {
        browserHistory.push('/app-stack')
        if (window.appStackPortalHistory) {
          window.appStackPortalHistory.replace('/app-stack')
        }
      } catch (error) {
        //
      }
    },
  },
  {
    url: '/app-stack-pro/templates',
    name: 'appStackTemplates',
    onClick: () => {
      try {
        browserHistory.push('/app-stack/templates')
        if (window.appStackPortalHistory) {
          window.appStackPortalHistory.replace('/app-stack/templates')
        }
      } catch (error) {
        //
      }
    },
  },
  {
    url: '/app-stack-pro/designer',
    name: 'appStackDesigner',
    onClick: () => {
      try {
        browserHistory.push('/app-stack/designer')
        if (window.appStackPortalHistory) {
          window.appStackPortalHistory.replace('/app-stack/designer')
        }
      } catch (error) {
        //
      }
    },
  },
]

class AppStackPro extends React.Component {
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
      // @Todo: intl
      if (pathname === '/app-stack-pro') {
        title = '堆栈'
        redirect = '/app-stack'
      } else if (pathname === '/app-stack-pro/templates') {
        title = '堆栈模板'
        redirect = '/app-stack/templates'
      } else if (pathname === '/app-stack-pro/designer') {
        title = '堆栈设计器'
        redirect = '/app-stack/designer'
      }
    }
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

    return <div id="AppStack" style={style}>
      <QueueAnim
        className="AppStackSiderAnimate"
        key="AppStackSiderAnimate"
        type="left"
      >
        <div
          className={
            containerSiderStyle === 'normal'
              ? 'AppStackMenu CommonSecondMenu'
              : 'hiddenMenu AppStackMenu CommonSecondMenu'
          }
          key="cicdSider"
        >
          <SecondSider menuList={menus} scope={scope} />
        </div>
      </QueueAnim>
      <div
        className={
          containerSiderStyle === 'normal'
            ? 'AppStackContent CommonSecondContent'
            : 'hiddenContent AppStackContent CommonSecondContent'
        }
      >
        <Title title={title} />
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
})(AppStackPro)
