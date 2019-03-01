/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  CostCenter
 *
 * v0.1 - 2016/11/30
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { browserHistory } from 'react-router'
import { connect } from 'react-redux'
import { Tabs, } from 'antd'
import cloneDeep from 'lodash/cloneDeep'
import CostRecord from './CostRecord'
import RechargeRecord from './RechargeRecord'
import Title from '../../Title'
import { loadUserList } from '../../../actions/user'
import { ROLE_SYS_ADMIN } from '../../../../constants'
import QueueAnim from 'rc-queue-anim'

const mode = require('../../../../configs/model').mode
const standard = require('../../../../configs/constants').STANDARD_MODE
const TabPane = Tabs.TabPane
const DEFAULT_TAB = 'consumptions'

class CostCenter extends Component {
  constructor(props) {
    super(props)
    this.onTabClick = this.onTabClick.bind(this)
    this.state = {
      activeTabKey: props.pathname === '/account/costCenter/payments' ? 'payments' : DEFAULT_TAB,
      allUsers: [],
    }
    this.isSysAdmin = props.loginUser.role == ROLE_SYS_ADMIN
  }

  componentDidMount() {
    this.isSysAdmin && this.props.loadUserList({ size: 0, sort: 'a,userName', }, {
      success: {
        func: res => {
          this.setState({ allUsers: cloneDeep(res.users || []) })
        }
      }
    })
  }

  onTabClick(activeTabKey) {
    if (activeTabKey === this.state.activeTabKey) {
      return
    }
    const { pathname } = this.props
    /*if (activeTabKey === DEFAULT_TAB) {
      activeTabKey = ''
    }*/
    this.setState({
      activeTabKey,
    })
    browserHistory.push({
      pathname: '/account/costCenter/' + activeTabKey,
    })
  }

  // For tab select
  componentWillReceiveProps(nextProps) {
    let { hash } = nextProps
    if (hash === this.props.hash) {
      return
    }
    if (!hash) {
      hash = DEFAULT_TAB
    }
    this.setState({
      activeTabKey: hash
    })
  }

  render() {
    const { activeTabKey, allUsers } = this.state
    return (
      <QueueAnim>
      <div id='CostCenter' key='CostCenter_cost' style={{padding: '20px'}}>
        <Title title="费用中心" />
        <Tabs
          defaultActiveKey={DEFAULT_TAB}
          onTabClick={this.onTabClick}
          activeKey={activeTabKey}
          >
          <TabPane tab="消费记录" key="consumptions">
            <CostRecord standard={mode === standard} allUsers={allUsers} isSysAdmin={this.isSysAdmin} />
          </TabPane>
          <TabPane tab="充值记录" key="payments">
            <RechargeRecord standard={mode === standard} allUsers={allUsers} isSysAdmin={this.isSysAdmin} />
          </TabPane>
        </Tabs>
      </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const { hash, pathname } = props.location
  const { loginUser } = state.entities
  return {
    hash,
    pathname,
    loginUser: loginUser.info,
  }
}

export default connect(mapStateToProps, {
  loadUserList,
})(CostCenter)