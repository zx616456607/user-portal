/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Cluster list component
 *
 * v0.1 - 2017-1-22
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Modal, Tabs, Icon, Menu, Button, Card, Form, Input, Alert, Tooltip, Spin, } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import './style/clusterList.less'
import ClusterTabList from './clusterTabList.js'
import findIndex from 'lodash/findIndex'
import NotificationHandler from '../../common/notification_handler'
import { browserHistory } from 'react-router'
import { ROLE_SYS_ADMIN } from '../../../constants'

const TabPane = Tabs.TabPane;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

class ClusterList extends Component {
  constructor(props) {
    super(props)
    this.checkIsAdmin = this.checkIsAdmin.bind(this)
    this.state = {
      //
    }
  }

  checkIsAdmin() {
    const { loginUser } = this.props
    const { role } = loginUser
    return role === ROLE_SYS_ADMIN
  }

  componentDidMount() {
    document.title = '基础设施 | 时速云'
    const { loginUser } = this.props
    const { role } = loginUser
    if (!this.checkIsAdmin()) {
      browserHistory.push('/')
    }
  }


  render() {
    if (!this.checkIsAdmin()) {
      return (
        <div className="loadingBox">
          <Spin size="large" />
        </div>
      )
    }
    const { formatMessage } = this.props.intl;
    const otherImageHead = this.state.otherImageHead || [];
    const scope = this;
    let ImageTabList = [];
    ImageTabList.push(<TabPane tab='默认集群' key='1'><ClusterTabList /></TabPane>)
    return (
      <QueueAnim className='ClusterBox'
        type='right'
        >
        <div id='ClusterContent' key='ClusterContent'>
          <Tabs
            key='ClusterTabs'
            defaultActiveKey='1'
            tabBarExtraContent={
              <Tooltip title="企业版 Lite 只支持一个集群，联邦集群等功能，请使用 Pro 版。" placement="topLeft">
                <Button className='addBtn' key='addBtn' size='large' type='primary' onClick={this.addImageTab}>
                  <Icon type='plus' />&nbsp;
                    <span>添加集群</span>
                </Button>
              </Tooltip>
            }
            >
            {ImageTabList}
          </Tabs>
        </div>
      </QueueAnim>
    )
  }
}

ClusterList.propTypes = {
  intl: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
  const { entities } = state
  const { loginUser } = entities
  return {
    loginUser: loginUser.info,
  }
}


export default connect(mapStateToProps, {
  //
})(injectIntl(ClusterList, {
  withRef: true,
}))