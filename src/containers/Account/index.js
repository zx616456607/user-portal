/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/10/31
 * @author ZhaoXueYu
 */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Breadcrumb } from 'antd'
import SecondSider from '../../components/SecondSider'
import IntlExp from '../../components/IntlExp'
import QueueAnim from 'rc-queue-anim'
import './style/account.less'
import { ROLE_USER, ROLE_TEAM_ADMIN, ROLE_SYS_ADMIN } from '../../../constants'

import { SHOW_BILLING } from '../../constants'
const standard = require('../../../configs/constants').STANDARD_MODE
const mode = require('../../../configs/model').mode
let menuList = []

const menuList_standard = [
  {
    url: '/account',
    name: '我的帐户'
  },
  {
    url: '/account/teams',
    name: '我的团队'
  },
  {
    url: '/account/balance',
    name: '充值/续费'
  },
  {
    url: '/account/costCenter#consumptions',
    name: '消费记录'
  },
  {
    url: '/account/costCenter#payments',
    name: '充值记录'
  },
  {
    url: '/account/API',
    name: '开放 API'
  },
  {
    url: '/account/version',
    name: '版本'
  }
]

const menuList_enterprise_admin = [
  {
    url: '/account',
    name: 'myAccount'
  },
  {
    url: '/account/costCenter#consumptions',
    name: 'consumptions'
  },
  {
    url: '/account/costCenter#payments',
    name: 'payments'
  },
  {
    url: '/account/noticeGroup',
    name: 'noticeGroup'
  },
]

const menuList_enterprise_sys_admin = []

const menuList_enterprise_user = [
  {
    url: '/account',
    name: 'myAccount'
  },
  {
    url: '/account/costCenter#consumptions',
    name: 'consumptions'
  },
  {
    url: '/account/costCenter#payments',
    name: 'payments'
  },
  {
    url: '/account/noticeGroup',
    name: 'noticeGroup'
  },
]


class Account extends Component {
  constructor(props) {
    super(props)
    this.state = {
      containerSiderStyle: 'normal'
    }
  }

  render() {
    const { children, role, billingEnabled } = this.props
    const scope = this
    let menuList = menuList_standard
    if (mode != standard) {
      if (role == ROLE_TEAM_ADMIN) {
        menuList = menuList_enterprise_admin
      } else if (role == ROLE_SYS_ADMIN) {
        menuList = menuList_enterprise_admin.concat(menuList_enterprise_sys_admin)
      } else {
        menuList = menuList_enterprise_user
      }
    }
    if (!billingEnabled) {
      menuList.splice(1, 2)
    }
    return (
      <div id="Account">
        <QueueAnim
          className="accountAnimate"
          key="accountAnimate"
          type="left"
          >
          <div className={this.state.containerSiderStyle == 'normal' ? 'accountMenu CommonSecondMenu' : 'hiddenMenu accountMenu CommonSecondMenu'} key='accountSider'>
            <SecondSider menuList={menuList} scope={scope} />
          </div>
        </QueueAnim>
        <div className={this.state.containerSiderStyle == 'normal' ? 'accountContent CommonSecondContent' : 'hiddenContent accountContent CommonSecondContent'} >
          {children}
        </div>
      </div>
    )
  }
}

Account.propTypes = {
  // Injected by React Router
  children: PropTypes.node
}

function mapStateToProp(state) {
  let role = ROLE_USER
  const {entities} = state
  if (entities && entities.loginUser && entities.loginUser.info && entities.loginUser.info) {
    role = entities.loginUser.info.role
  }
  const { billingConfig } = entities.loginUser.info
  const { enabled: billingEnabled } = billingConfig
  return {
    role,
    billingEnabled
  }
}

export default connect(mapStateToProp, {
})(Account)