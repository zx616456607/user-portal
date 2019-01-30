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
import cloneDeep from 'lodash/cloneDeep'
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
    let redirect = locationQuery.redirect
    delete locationQuery.redirect
    if (!redirect) {
      redirect = '/cluster/monitor'
      switch (pathname) {
        case '/cluster/backup':
          redirect = '/backup'
          break
        case '/cluster/alarmSetting':
          redirect = '/alarmSetting'
          break
        case '/cluster/alarmRecord':
          redirect = '/alarmRecord'
          break
        default:
          break
      }
    }
    let title = '系统服务监控'
    switch (pathname) {
      case '/cluster/backup':
        title = '平台数据备份'
        break
      case '/cluster/alarmSetting':
        title = '告警设置'
        break
      case '/cluster/alarmRecord':
        title = '告警记录'
        break
      default:
        break
    }

    const query = Object.assign(
      {},
      locationQuery,
      {
        token, username, project, onbehalfuser, onbehalfuserid, cluster,
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

      <iframe allowFullScreen title="监控与备份" id="monitor" src={`/monitor/index.html?hash=${hash}#${redirect}?${toQuerystring(query)}`} />
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
    username,
    token,
    cluster: cluster.clusterID,
  }
}

export default connect(mapStateToProps, {
  loadApiInfo: openApiActions.loadApiInfo,
})(Monitor)
