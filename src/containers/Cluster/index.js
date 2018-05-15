/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Cluster component
 *
 * v0.1 - 2017-1-22
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import SecondSider from '../../components/SecondSider'
import { browserHistory } from 'react-router'
// import IntlExp from '../../components/IntlExp'
import QueueAnim from 'rc-queue-anim'
import './style/cluster.less'

let menuList = [
  {
    url: '/cluster',
    name: '集群管理'
  },
  {
    url: '/cluster/cluster_autoscale',
    name: '集群伸缩策略'
  },
  {
    url: '/cluster/monitor',
    name: '系统服务监控',
    onClick: () => {
      try {
        browserHistory.push('/cluster/monitor')
        if (window.monitorPortalHistory) {
          window.monitorPortalHistory.push('/cluster/monitor')
        }
      } catch (error) {
        //
      }
    }
  }
]
export default class Cluster extends Component {
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
      <div id='Cluster'>
        <QueueAnim
          className='CICDSiderAnimate'
          key='CICDSiderAnimate'
          type='left'
          >
          {/* <div className={ this.state.clusterSiderStyle == 'normal' ? 'ClusterContent CommonSecondContent' : 'hiddenContent ClusterContent CommonSecondContent' } key='cicdSider'>
            <SecondSider menuList={menuList} scope={scope} />
          </div> */}
          <div className={ this.state.containerSiderStyle == 'normal' ?  'imageMenu CommonSecondMenu' : 'hiddenMenu imageMenu CommonSecondMenu'} key='imageSider'>
            <SecondSider menuList={menuList} scope={scope} />
          </div>
        </QueueAnim>
        <div className={ this.state.containerSiderStyle == 'normal' ? 'ClusterContent CommonSecondContent' : 'hiddenContent ClusterContent CommonSecondContent' } >
          {children}
        </div>
      </div>
    )
  }
}

Cluster.propTypes = {
  // Injected by React Router
  children: PropTypes.node
}