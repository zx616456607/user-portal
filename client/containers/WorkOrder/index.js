/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */
/**
 * work order
 *
 * v0.1 - 2018-11-05
 * @author rensiwei
 */
import React from 'react'
import { browserHistory } from 'react-router'
import SystemNoticeList from './SystemNotice'
import MyOrderList from './MyOrder'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { Tabs, Card } from 'antd'
import Title from '../../../src/components/Title'
import './style/index.less'
const TabPane = Tabs.TabPane

const DEFAULT_TAB = 'my-order'
class WorkOrder extends React.Component {
  onTabChange = activeKey => {
    const { location } = this.props
    const pathname = location.pathname
    if (pathname.indexOf(activeKey) > -1) return
    browserHistory.push({
      pathname: '/work-order/' + activeKey,
    })
  }
  componentDidMount() {}
  render() {
    const { children, location, location: { pathname } } = this.props
    let title = ''
    const activeKey = (pathname.indexOf('my-order') > -1 ||
    pathname.indexOf('/work-order/create') > -1) ?
      (() => {
        title = '我的工单'
        return DEFAULT_TAB
      })()
      :
      (() => {
        title = '系统公告'
        return 'system-notice'
      })()
    const isDetail = !pathname.endsWith('my-order') && !pathname.endsWith('system-notice')
    return <QueueAnim className="workOrderWrapper">
      {
        isDetail ?
          children
          :
          <Card>
            <Title title={title} />
            <Tabs activeKey={activeKey} onChange={this.onTabChange}>
              <TabPane tab="我的工单" key="my-order">
                <MyOrderList location={location} />
              </TabPane>
              <TabPane tab="系统公告" key="system-notice">
                <SystemNoticeList location={location} />
              </TabPane>
            </Tabs>
          </Card>
      }
    </QueueAnim>
  }
}

const mapStateToProps = state => {
  const { loginUser = {} } = state.entities
  return {
    user: loginUser.info,
  }
}

export default connect(mapStateToProps, {
})(WorkOrder)
