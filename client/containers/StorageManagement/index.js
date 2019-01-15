/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */
/**
 * storage-management
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
    url: '/storage-management/privateStorage',
    name: 'privateStorage',
    onClick: () => {
      browserHistory.push('/storage-management/privateStorage')
    },
  },
  {
    url: '/storage-management/snapshot',
    name: 'snapshot',
    onClick: () => {
      browserHistory.push('/storage-management/snapshot')
    },
  },
  {
    url: '/storage-management/shareStorage',
    name: 'shareStorage',
    onClick: () => {
      browserHistory.push('/storage-management/shareStorage')
    },
  },
  {
    url: '/storage-management/localStorage',
    name: 'localStorage',
    onClick: () => {
      browserHistory.push('/storage-management/localStorage')
    },
  },
  // {
  //   url: '/storage-management/customStorage',
  //   name: 'customStorage',
  //   onClick: () => {
  //     browserHistory.push('/storage-management/customStorage')
  //   },
  // },
]

class StorageManagement extends React.Component {
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
      project, onbehalfuser, onbehalfuserid, token, cluster,
      username, location: { pathname, query: _query },
      children,
    } = this.props
    const locationQuery = cloneDeep(_query)
    let title
    let redirect = locationQuery.redirect
    delete locationQuery.redirect
    if (!redirect) {
      if (pathname === '/storage-management/Service') {
        title = '服务发现'
        redirect = '/Service'
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

    return <div id="StorageManagement" style={style}>
      <QueueAnim
        className="StorageManagementSiderAnimate"
        key="StorageManagementSiderAnimate"
        type="left"
      >
        <div
          className={
            containerSiderStyle === 'normal'
              ? 'StorageManagementMenu CommonSecondMenu'
              : 'hiddenMenu StorageManagementMenu CommonSecondMenu'
          }
          key="cicdSider"
        >
          <SecondSider menuList={menus} scope={scope} />
        </div>
      </QueueAnim>
      <div
        className={
          containerSiderStyle === 'normal'
            ? 'StorageManagementContent CommonSecondContent'
            : 'hiddenContent StorageManagementContent CommonSecondContent'
        }
      >
        <Title title={title} />
        {
          pathname === '/storage-management/customStorage' ?
            <iframe allowFullScreen title="存储管理" id="pipeline" src={`/app-stack/index.html?hash=${hash}#${redirect}?${toQuerystring(query)}`} />
            : children
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
})(StorageManagement)
