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
import './style/CICD.less'

const menuList = [
  {
    url: '/ci_cd',
    name: '代码仓库'
  },
  {
    url: '/ci_cd/tenx_flow',
    name: 'TenxFlow'
  },
  {
    url: '/ci_cd/docker_file',
    name: 'Dockerfile'
  }
]

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