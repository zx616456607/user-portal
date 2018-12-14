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
    url: '/ai-deep-learning/notebook',
    name: 'Notebook',
    onClick: () => {
      try {
        browserHistory.push('/ai-deep-learning/notebook')
        if (window.aiPortalHistory) {
          window.aiPortalHistory.replace('/ai-deep-learning/notebook')
        }
      } catch (error) {
        //
      }
    },
  },
  {
    url: '/ai-deep-learning/large-scale-train',
    name: 'largeScaleTrain',
    onClick: () => {
      try {
        browserHistory.push('/ai-deep-learning/large-scale-train')
        if (window.aiPortalHistory) {
          window.aiPortalHistory.replace('/ai-deep-learning/largeScaleTrain')
        }
      } catch (error) {
        //
      }
    },
  },
  {
    url: '/ai-deep-learning/data-set',
    name: 'dataSet',
    onClick: () => {
      try {
        browserHistory.push('/ai-deep-learning/data-set')
        if (window.aiPortalHistory) {
          window.aiPortalHistory.replace('/ai-deep-learning/dataSet')
        }
      } catch (error) {
        //
      }
    },
  },
  {
    url: '/ai-deep-learning/model-set',
    name: 'modelSet',
    onClick: () => {
      try {
        browserHistory.push('/ai-deep-learning/model-set')
        if (window.aiPortalHistory) {
          window.aiPortalHistory.replace('/ai-deep-learning/modelSet')
        }
      } catch (error) {
        //
      }
    },
  },
  {
    url: '/ai-deep-learning/ai-model-service',
    name: 'aiModelService',
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
      children, aiopsConfig = {},
    } = this.props
    const locationQuery = cloneDeep(_query)
    let title
    let redirect = locationQuery.redirect
    delete locationQuery.redirect
    if (!redirect) {
      if (pathname === '/ai-deep-learning/large-scale-train') {
        title = '大规模训练'
        redirect = '/ai-deep-learning/largeScaleTrain'
      } else if (pathname === '/ai-deep-learning/data-set') {
        title = '数据集'
        redirect = '/ai-deep-learning/dataSet'
      } else if (pathname === '/ai-deep-learning/model-set') {
        title = '模型集'
        redirect = '/ai-deep-learning/modelSet'
      } else {
        title = 'Notebook'
        redirect = '/ai-deep-learning/notebook'
      }
    }
    const query = Object.assign(
      {},
      locationQuery,
      {
        token, username, project, onbehalfuser, onbehalfuserid, cluster, hash,
        protocol: aiopsConfig.protocol, host: aiopsConfig.host, apiVersion: aiopsConfig.apiVersion,
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
        {
          pathname === '/ai-deep-learning/ai-model-service'
            ? children
            : <iframe title="AI 深度学习" id="pipeline" src={`/ai/index.html?hash=${hash}#${redirect}?${toQuerystring(query)}`} />
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
  const { aiopsConfig } = state.entities.loginUser.info
  return {
    onbehalfuser,
    onbehalfuserid,
    project,
    cluster: cluster.clusterID,
    username,
    token,
    aiopsConfig,
  }
}

export default connect(mapStateToProps, {
  loadApiInfo: openApiActions.loadApiInfo,
})(AIDeepLearning)
