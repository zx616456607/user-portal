/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * User balance - Standard
 *
 * v0.1 - 2016-12-13
 * @author Zhangpc
 */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
import { Icon, Button, Menu, Dropdown } from 'antd'
import './style/balance.less'

class UserBalance extends Component {
  constructor(props) {
    super(props)
    this.state = {
      notAccount: false
    }
  }

  render() {
    const menu = (
      <Menu>
        <Menu.Item>
          <a>研发团队</a>
        </Menu.Item>
        <Menu.Item>
          <a>销售团队</a>
        </Menu.Item>
      </Menu>
    );
    return (
      <div id="UserBalance">
        <div className="myAccount">
          <div className="topRow"><Icon type="user" className="typeIcon" />我的账户</div>
          <div className="moneyRow">
            <div>余额：<span className="money">105元</span></div>
            <div>其中优惠券￥5元，充值金额￥100元 &nbsp;<Icon type="question-circle-o" /></div>
          </div>
          <div className="rechargeRow">
            <Button type="primary" size="large" onClick={() => browserHistory.push('/account/balance/payment')}>立即充值</Button>
          </div>
        </div>

        <div className="myTeam">
          <div className="topRow">
          <Icon type="team" className="typeIcon"/>
          <Dropdown overlay={menu}>
            <span>
              团队账户 <Icon type="down" style={{fontSize:'8px'}} />
            </span>
          </Dropdown>
          </div>
          {this.state.notAccount ?
            <div className="moneyRow">
              <div>余额：<span className="money">105元</span></div>
              <div>其中优惠券￥15元，充值金额￥1000元 &nbsp;<Icon type="question-circle-o" /></div>
            </div>
            :
            <div className="moneyRow text-center">
              <i className="fa fa-users" />
              <div className="notText">您还没有团队账户，可以尝试创建团队</div>
              <Button type="primary">去创建</Button>
            </div>
          }
          {this.state.notAccount ?
          <div className="rechargeRow">
            <Button type="primary" size="large" onClick={() => browserHistory.push('/account/balance/payment')}>立即充值</Button>
          </div>
          :null
          }
        </div>

      </div>
    )
  }
}

function mapStateToProps(state, props) {
  return props
}

export default connect(mapStateToProps, {
  //
})(UserBalance)
