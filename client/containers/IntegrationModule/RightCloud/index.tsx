/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Right cloud
 *
 * @author zhangxuan
 * @date 2018-11-20
 */
import React from 'react'
import PropTypes from 'prop-types'
import QueueAnim from 'rc-queue-anim'
import { browserHistory } from 'react-router'
import { Tabs } from 'antd'
import ReturnButton from '@tenx-ui/return-button/lib'
import '@tenx-ui/return-button/assets/index.css'
import './style/index.less'

const TabPane = Tabs.TabPane;

const tabMenus = [{
  tab: '主机管理',
  key: 'host',
}, {
  tab: '云环境',
  key: 'env',
}]

class RightCloud extends React.PureComponent {
  constructor(props) {
    const { pathname } = props.location
    this.state = {
      activeKey: pathname.includes('env') ? 'env' : 'host',
    }
  }

  back = () => {
    browserHistory.push('/cluster/integration')
  }

  tabChange = tab => {
    this.setState({
      activeKey: tab,
    })
    browserHistory.push(`/cluster/integration/rightCloud/${tab}`)
  }

  render() {
    const { activeKey } = this.state
    const { children } = this.props
    return (
      <QueueAnim className={'layout-content right-cloud'}>
        <div key={'header'} className={'layout-content-btns'}>
          <ReturnButton onClick={this.back}>返回集成中心</ReturnButton>
          <span className="first-title">混合云管控系统集成</span>
        </div>
        <div key={'body'} className={'layout-content-body'}>
          <Tabs onChange={this.tabChange} activeKey={activeKey}>
            {
              tabMenus.map(item =>
                <TabPane tab={item.tab} key={item.key}/>,
              )
            }
          </Tabs>
          {children}
        </div>
      </QueueAnim>
    )
  }
}

export default RightCloud
