/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */
/**
 * pipeline
 *
 * v0.1 - 2018-05-15
 * @author zhangpc
 */
import React from 'react'
import { connect } from 'react-redux'
import { Spin } from 'antd'
import { browserHistory } from 'react-router'
import { toQuerystring } from '../../../src/common/tools'
import * as openApiActions from '../../../src/actions/open_api'
import Title from '../../../src/components/Title'
import './style/index.less'

const HEADER_HEIGHT = 60
// replace hash when build, for clear cache
const hash = process.env.DEVOPS_PORTAL_HASH

class Monitor extends React.Component {
  state = {
    windowHeight: window.innerHeight,
  }

  componentDidMount() {
    window.monitorIframeCallBack = (action, data) => {
      switch (action) {
        case 'redirect':
          browserHistory.push(data.pathname)
          break
        case 'monitorPortalHistory':
          window.monitorPortalHistory = data
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

  render() {
    const {
      project, onbehalfuser, onbehalfuserid, token,
      username, location: { pathname, query: locationQuery },
    } = this.props
    let redirect
    let title = '系统服务监控'
    if (pathname === '/cluster/backup') {
      redirect = '/backup'
      title = '平台数据备份'
    }
    const query = Object.assign(
      { redirect },
      locationQuery,
      {
        token, username, project, onbehalfuser, onbehalfuserid, hash,
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
    return <div className="monitor" style={style}>
      <Title title={title} />

      <iframe title="监控与备份" id="monitor" src={`/monitor?${toQuerystring(query)}`} />
    </div>
  }
}

const mapStateToProps = state => {
  const { space = {} } = state.entities.current
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
  }
}

export default connect(mapStateToProps, {
  loadApiInfo: openApiActions.loadApiInfo,
})(Monitor)
