/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */
/**
 * pipeline
 *
 * v0.1 - 2018-03-28
 * @author zhangpc
 */
import React from 'react'
import { connect } from 'react-redux'
import { Spin } from 'antd'
import { browserHistory } from 'react-router'
import cloneDeep from 'lodash/cloneDeep'
import { toQuerystring } from '../../../src/common/tools'
import * as openApiActions from '../../../src/actions/open_api'
import Title from '../../../src/components/Title'
import './style/index.less'

import { HEADER_HEIGHT } from '../../../src/constants'
// replace hash when build, for clear cache
const hash = process.env.DEVOPS_PORTAL_HASH

class Pipeline extends React.Component {
  state = {
    windowHeight: window.innerHeight,
  }

  componentDidMount() {
    window.pipelineIframeCallBack = (action, data) => {
      switch (action) {
        case 'redirect':
          browserHistory.push(data.pathname)
          break
        case 'devFlowPortalHistory':
          window.devFlowPortalHistory = data
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
      project, onbehalfuser, onbehalfuserid, token, billingEnabled, ftpEnabled,
      username, location: { pathname, query: _query }, emailEnabled,
    } = this.props
    const locationQuery = cloneDeep(_query)
    let title = '流水线'
    let redirect = locationQuery.redirect
    delete locationQuery.redirect
    if (!redirect) {
      if (pathname === '/ci_cd/thirdparty') {
        title = '第三方工具'
        redirect = redirect || '/devops/thirdparty'
      } else if (pathname === '/ci_cd/cached_volumes') {
        title = '缓存卷'
        redirect = redirect || '/devops/volumes/rbd'
      } else if (pathname === '/ci_cd/overview') {
        title = 'CI/CD 概览'
        redirect = redirect || '/devops/pandect'
      } else {
        title = '流水线'
        redirect = redirect || '/devops/pipelines'
      }
    }
    const query = Object.assign(
      {},
      locationQuery,
      {
        token, username, project, onbehalfuser,
        onbehalfuserid, billingenabled: billingEnabled ? 1 : 0,
        ftpEnabled: ftpEnabled ? 1 : 0,
        emailEnabled: emailEnabled ? 1 : 0,
      }
    )
    const { windowHeight } = this.state
    const style = {
      height: windowHeight - HEADER_HEIGHT,
    }
    if (!token) {
      return <div className="loading">
        <Title title={title} />
        <Spin size="large" />
      </div>
    }
    return <div className="pipeline" style={style}>
      <Title title={title} />
      <iframe allowFullScreen title="流水线" id="pipeline" src={`/devops/index.html?hash=${hash}#${redirect}?${toQuerystring(query)}`} />
    </div>
  }
}

const mapStateToProps = state => {
  const { space = {} } = state.entities.current
  const { billingConfig, ftpConfig, emailConfiged } = state.entities.loginUser.info
  const { enabled: billingEnabled } = billingConfig
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
    username,
    token,
    billingEnabled,
    ftpEnabled: ftpConfig && ftpConfig.addr,
    emailEnabled: emailConfiged,
  }
}

export default connect(mapStateToProps, {
  loadApiInfo: openApiActions.loadApiInfo,
})(Pipeline)
