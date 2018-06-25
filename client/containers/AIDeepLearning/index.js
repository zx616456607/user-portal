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
import { toQuerystring } from '../../../src/common/tools'
import { loadApiInfo } from '../../../src/actions/open_api'
import SecondSider from '../../../src/components/SecondSider'
import Title from '../../../src/components/Title'
import './style/index.less'

const HEADER_HEIGHT = 60
// replace hash when build, for clear cache
const hash = process.env.DEVOPS_PORTAL_HASH

const menus = [
  {
    url: '/ai-deep-learning/notebook',
    name: 'Notebook',
    onClick: () => {
      try {
        browserHistory.push('/ai-deep-learning/notebook')
        if (window.devFlowPortalHistory) {
          window.devFlowPortalHistory.push('/ai-deep-learning/notebook')
        }
      } catch (error) {
        //
      }
    },
  },
  {
    url: '/ai-deep-learning/large-scale-train',
    name: '大规模训练',
    onClick: () => {
      try {
        browserHistory.push('/ai-deep-learning/large-scale-train')
        if (window.devFlowPortalHistory) {
          window.devFlowPortalHistory.push('/ai-deep-learning/largeScaleTrain')
        }
      } catch (error) {
        //
      }
    },
  },
  {
    url: '/ai-deep-learning/data-set',
    name: '数据集',
    onClick: () => {
      try {
        browserHistory.push('/ai-deep-learning/data-set')
        if (window.devFlowPortalHistory) {
          window.devFlowPortalHistory.push('/ai-deep-learning/dataSet')
        }
      } catch (error) {
        //
      }
    },
  },
  {
    url: '/ai-deep-learning/model-set',
    name: '模型集',
    onClick: () => {
      try {
        browserHistory.push('/ai-deep-learning/model-set')
        if (window.devFlowPortalHistory) {
          window.devFlowPortalHistory.push('/ai-deep-learning/modelSet')
        }
      } catch (error) {
        //
      }
    },
  },
  {
    url: '/ai-deep-learning/ai-model-service',
    name: 'AI 模型服务',
  },
]

class AIDeepLearning extends React.Component {
  state = {
    windowHeight: window.innerHeight,
    containerSiderStyle: 'normal',
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
      children,
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
    const { windowHeight, containerSiderStyle } = this.state
    const style = {
      height: windowHeight - HEADER_HEIGHT,
    }
    if (!token) {
      return <div className="loading">
        <Title title="流水线" />
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
        <Title title="流水线" />
        {
          pathname === '/ai-deep-learning/ai-model-service'
            ? children
            : <iframe title="流水线" id="pipeline" src={`/ai?${toQuerystring(query)}`} />
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
  loadApiInfo,
})(AIDeepLearning)
