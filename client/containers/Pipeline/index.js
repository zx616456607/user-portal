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
import { toQuerystring } from '../../../src/common/tools'
import { loadApiInfo } from '../../../src/actions/open_api'
import './style/index.less'

const HEADER_HEIGHT = 60
// replace hash when build, for clear cache
const hash = process.env.DEVOPS_PORTAL_HASH

class Pipeline extends React.Component {
  state = {
    windowHeight: window.innerHeight,
  }

  componentWillMount() {
    window.pipelineIframeCallBack = (action, data) => {
      switch (action) {
        case 'redirect':
          browserHistory.push(data.pathname)
          break;
        case 'devFlowPortalHistory':
          window.devFlowPortalHistory = data
          break;
        default:
          break;
      }
    }
  }

  componentDidMount() {
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

  render(){
    const { project, onbehalfuser, token, username, location } = this.props
    const query = Object.assign(
      {},
      location.query,
      { token, username, project, onbehalfuser, hash }
    )
    const { windowHeight } = this.state
    const style = {
      height: windowHeight - HEADER_HEIGHT,
    }
    if (!token) {
      return <div className="loading">
        <Spin size="large" />
      </div>
    }
    return <div className="pipeline" style={style}>
      <iframe id="pipeline" src={`/devops?${toQuerystring(query)}`}  />
    </div>
  }
}

const mapStateToProps = state => {
  const { space = {} } = state.entities.current
  let onbehalfuser
  // sys admin check user personal space
  if (space.userName) {
    onbehalfuser = space.userName
    space.namespace = 'default'
  }
  let project
  if (space.namespace !== 'default') {
    project = space.namespace
  }

  const { username, token } = state.openApi.result || {}

  return {
    onbehalfuser,
    project,
    username,
    token,
  }
}

export default connect(mapStateToProps, {
  loadApiInfo,
})(Pipeline)
