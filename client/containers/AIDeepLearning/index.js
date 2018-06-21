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
import { toQuerystring } from '../../../src/common/tools'
import { loadApiInfo } from '../../../src/actions/open_api'
import Title from '../../../src/components/Title'
import './style/index.less'

const HEADER_HEIGHT = 60
// replace hash when build, for clear cache
const hash = process.env.DEVOPS_PORTAL_HASH

class AIDeepLearning extends React.Component {
  state = {
    windowHeight: window.innerHeight,
  }

  componentWillMount() {
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

  render() {
    const {
      project, onbehalfuser, onbehalfuserid, token, cluster,
      username, location: { pathname, query: locationQuery },
    } = this.props
    let redirect
    if (pathname === '/ai-deep-learning/notebook') {
      redirect = '/ai-deep-learning/notebook'
    } else if (pathname === '/ai-deep-learning/large-scale-train') {
      redirect = '/ai-deep-learning/largeScaleTrain'
    } else if (pathname === '/ai-deep-learning/data-set') {
      redirect = '/ai-deep-learning/dataSet'
    } else if (pathname === '/ai-deep-learning/model-set') {
      redirect = '/ai-deep-learning/modelSet'
    } else {
      redirect = '/ai-deep-learning/notebook'
    }
    const query = Object.assign(
      { redirect },
      locationQuery,
      {
        token, username, project, onbehalfuser, onbehalfuserid, cluster, hash,
      }
    )
    const { windowHeight } = this.state
    const style = {
      height: windowHeight - HEADER_HEIGHT,
    }
    if (!token) {
      return <div className="loading">
        <Title title="流水线" />
        <Spin size="large" />
      </div>
    }
    return <div className="pipeline" style={style}>
      <Title title="流水线" />
      <iframe title="流水线" id="pipeline" src={`/ai?${toQuerystring(query)}`} />
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
  loadApiInfo,
})(AIDeepLearning)
