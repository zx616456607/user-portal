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
import { Breadcrumb } from 'antd'
import SecondSider from '../../components/SecondSider'
import IntlExp from '../../components/IntlExp'
import QueueAnim from 'rc-queue-anim'
import './style/account.less'

const standard = require('../../../configs/constants').STANDARD_MODE
const mode = require('../../../configs/model').mode
let menuList = []
if (mode === standard) {
  menuList = [
    {
      url: '/account',
      name: '我的账户'
    },
    {
      url: '/account/team',
      name: '我的团队'
    },
    {
      url: '/account/balance',
      name: '账户余额'
    },
    {
      url: '/account/cost',
      name: '费用中心'
    }
  ]
} else {
  menuList = [
    {
      url: '/account',
      name: '我的账户'
    },
    {
      url: '/account/member',
      name: '成员管理'
    },
    {
      url: '/account/team',
      name: '团队管理'
    },
    {
      url: '/account/cost',
      name: '费用中心'
    }
  ]
}


export default class Account extends Component {
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