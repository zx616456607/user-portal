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
import { ROLE_SYS_ADMIN, ROLE_PLATFORM_ADMIN, ROLE_BASE_ADMIN } from '../../../constants'
import MyOrderList from './MyOrder'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { Tabs, Card } from 'antd'
import Title from '../../../src/components/Title'
import './style/index.less'
const TabPane = Tabs.TabPane

const DEFAULT_TAB = 'my-order'
const DEFAULT_TAB1 = 'system-notice'
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
    const { children, location, location: { pathname }, user } = this.props
    const isAdmin = user.role === ROLE_SYS_ADMIN ||
      user.role === ROLE_PLATFORM_ADMIN ||
      user.role === ROLE_BASE_ADMIN
    const title1 = isAdmin ? '工单汇总' : '我的工单'
    const title2 = '系统公告'
    let title = ''
    const activeKey = (pathname.indexOf(DEFAULT_TAB) > -1 ||
    pathname.indexOf('/work-order/create') > -1) ?
      (() => {
        title = title1
        return DEFAULT_TAB
      })()
      :
      (() => {
        title = title2
        return DEFAULT_TAB1
      })()
    const isDetail = !pathname.endsWith(DEFAULT_TAB) && !pathname.endsWith(DEFAULT_TAB1)
    return <QueueAnim className="workOrderWrapper">
      {
        isDetail ?
          children
          :
          <Card>
            <Title title={title} />
            <Tabs activeKey={activeKey} onChange={this.onTabChange}>
              <TabPane tab={title1} key="my-order">
                <MyOrderList location={location} />
              </TabPane>
              <TabPane tab={title2} key="system-notice">
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
