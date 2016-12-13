/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * User info - Standard
 *
 * v0.1 - 2016-12-13
 * @author Bai Yu
 */
import React, { Component, PropTypes } from 'react'
import {Button, Tabs, Icon} from 'antd'
import { connect } from 'react-redux'
import Authentication from './Authentication'
import './style/UserInfo.less'
const TabPane = Tabs.TabPane;

class BaseInfo extends Component {
  constructor(props) {
    super(props)
  }

  render () {
    return (
      <div className="baseInfo">
        <div className="topBox">
          <div  className="userimage">
            <img src="/img/standard/avatars.png"/>
          </div>
          <div className="topbar userBtn">
            <p>Hi, 换个吊炸天的头像吧！</p>
            <Button type="primary">更换头像</Button>
          </div>
          <div className="to-recharge">
            <p className="money">105元</p>
            <p className="money-desc">我的账户余额</p>
            <Button type="primary">去充值</Button>
          </div>
        </div>
        <div className="myInfo">
          <div className="hand">个人信息</div>
          <ul className="info-list">
            <li>
              <span className="key">用户名</span>
              <span>china </span><Button className="btn-auth">点击认证</Button>
            </li>
            <li>
              <span className="key">企业名称</span>
              <Button className="btn-auth">点击认证</Button> &nbsp;
              <Icon type="question-circle-o" />
            </li>
            <li>
              <span className="key">邮箱</span>
              <span className="value">pupu@tenxcloud.com</span>
              <Button>修改邮箱</Button>
            </li>
            <li>
              <span className="key">密码</span>
              <span className="value">已设置</span>
              <Button type="primary">修改密码</Button>
            </li>
            <li>
              <span className="key">手机</span>
              <span className="value">13520251666</span>
              <Button type="primary">修改手机</Button>
            </li>
          </ul>
        </div>

        <div className="wechatBox">
          <div className="hand">
            <span className="title">登录授权</span>
            <span className="other">第三方</span>
          </div>
          <div className="send-tu">
            <div className="backcolor">
              <i className="fa fa-wechat"></i>
            </div>
            <Button className="btn-success">立即绑定</Button>
          </div>
        </div>
          
      </div>
    )
  }
}


class UserInfo extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div id="public-userinfo">
        <Tabs defaultActiveKey="1">
          <TabPane tab="基本信息" key="1"><BaseInfo /></TabPane>
          <TabPane tab="认证信息" key="2"><Authentication /></TabPane>
        </Tabs>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  return props
}

export default connect(mapStateToProps, {
  //
})(UserInfo)
