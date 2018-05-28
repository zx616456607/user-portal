/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CICD component
 *
 * v0.1 - 2016-10-18
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import SecondSider from '../../components/SecondSider'
import IntlExp from '../../components/IntlExp'
import QueueAnim from 'rc-queue-anim'
import { browserHistory } from 'react-router'
import './style/CICD.less'
import { NEED_BUILD_IMAGE } from '../../constants'

let menuList = [
  {
    url: '/ci_cd',
    name: '代码仓库'
  }
]

if (NEED_BUILD_IMAGE) {
  menuList.push({
    url: '/ci_cd/build_image',
    name: '构建镜像'
  })
}

menuList = menuList.concat(
  {
    url: '/ci_cd/pipelines',
    name: '流水线',
    onClick: () => {
      try {
        browserHistory.push('/ci_cd/pipelines')
        if (window.devFlowPortalHistory) {
          window.devFlowPortalHistory.push('/devops/pipelines')
        }
      } catch (error) {
        //
      }
    }
  },
  {
    url: '/ci_cd/docker_file',
    name: 'Dockerfile'
  },
  {
    url: '/ci_cd/cached_volumes',
    name: '缓存卷',
    onClick: () => {
      try {
        browserHistory.push('/ci_cd/cached_volumes')
        if (window.devFlowPortalHistory) {
          window.devFlowPortalHistory.push('/devops/volumes/rbd')
        }
      } catch (error) {
        //
      }
    }
  },
  {
    url: '/ci_cd/thirdparty',
    name: '第三方工具',
    onClick: () => {
      try {
        browserHistory.push('/ci_cd/thirdparty')
        if (window.devFlowPortalHistory) {
          window.devFlowPortalHistory.push('/devops/thirdparty')
        }
      } catch (error) {
        //
      }
    }
  }
)



export default class CICD extends Component {
  constructor(props) {
    super(props);
    this.state = {
      containerSiderStyle: 'normal'
    }
  }

  render() {
    const { children } = this.props
    const scope = this
    return (
      <div id='CICD'>
        <QueueAnim
          className='CICDSiderAnimate'
          key='CICDSiderAnimate'
          type='left'
          >
          <div className={ this.state.containerSiderStyle == 'normal' ? 'CICDMenu CommonSecondMenu' : 'hiddenMenu CICDMenu CommonSecondMenu'} key='cicdSider'>
            <SecondSider menuList={menuList} scope={scope} />
          </div>
        </QueueAnim>
        <div className={ this.state.containerSiderStyle == 'normal' ? 'CICDContent CommonSecondContent' : 'hiddenContent CICDContent CommonSecondContent' } >
          {children}
        </div>
      </div>
    )
  }
}

CICD.propTypes = {
  // Injected by React Router
  children: PropTypes.node
}