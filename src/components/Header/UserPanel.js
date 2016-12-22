/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * User panel component
 *
 * v0.1 - 2016-12-22
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import { Icon, Popover, Button } from 'antd'
import { Link, browserHistory } from 'react-router'
import "./style/UserPanel.less"

const standard = require('../../../configs/constants').STANDARD_MODE
const mode = require('../../../configs/model').mode

/**
 * User panel in the upper right corner
 *
 * @class UserPanel
 * @extends {Component}
 */
class UserPanel extends Component {
  constructor(props) {
    super(props)
    this.handleVisibleChange = this.handleVisibleChange.bind(this)
    this.renderMenuItems = this.renderMenuItems.bind(this)
    this.getTitle = this.getTitle.bind(this)
    this.getContent = this.getContent.bind(this)
    this.state = {
      visible: false,
    }
  }

  handleVisibleChange() {
    const { visible } = this.state
    this.setState({
      visible: !visible
    })
  }

  getTitle() {
    const { loginUser } = this.props
    const { userName, email, avatar } = loginUser
    return (
      <div className='logTitle'>
        <div className='logAvatar'>
          {
            mode === standard
            ? (<img alt={userName} src={avatar} />)
            : userName.substr(0, 1).toUpperCase()
          }
        </div>
        <div className="loginText">
          <div className="text">
            <p className="userName">{userName}</p>
            <p className="email">{email || '...'}</p>
          </div>
        </div>
        <div className='loginTag'>个人</div>
      </div>
    )
  }

  renderMenuItems(menu, index) {
    return (
      <td key={`menu${index}`}>
        <Link to={menu.to} onClick={this.handleVisibleChange}>
          <svg className='logMenuSvg'>
            <use xlinkHref={menu.svgHref} />
          </svg>
          <div>{menu.text}</div>
        </Link>
      </td>
    )
  }

  getContent() {
    const { loginUser } = this.props
    let { balance } = loginUser
    if (balance !== undefined) {
      balance = (balance / 100).toFixed(2)
    }
    let menuItems = [
      {
        to: '/account',
        svgHref: '#logaccountinf',
        text: '帐户信息',
      },
      {
        to: '/account/cost',
        svgHref: '#logcostrecord',
        text: '消费记录',
      },
      {
        to: '/account/user/editPass',
        svgHref: '#logchangepass',
        text: '修改密码',
      },
      {
        to: '/account',
        svgHref: '#logteam',
        text: '我的团队',
      },
    ]
    if (mode === standard) {
      menuItems = [
        {
          to: '/account',
          svgHref: '#logaccountinf',
          text: '我的账户',
        },
        {
          to: '/account/cost',
          svgHref: '#logcostrecord',
          text: '消费记录',
        },
        {
          to: '/account#edit_pass',
          svgHref: '#logchangepass',
          text: '修改密码',
        },
        {
          to: '/account/team',
          svgHref: '#logteam',
          text: '我的团队',
        },
      ]
    }
    return (
      <div className='logMenu'>
        <div className='rechangeInf'>
          <div className='balance'>
            <p>帐户余额 &nbsp;:</p>
            <p>
              <span className="number">{balance || '-'}</span>
              <span className="unit">T币</span>
            </p>
          </div>
          {
            mode === standard &&
            <Button className="payButton" onClick={() => browserHistory.push('/account/balance/payment')}>
              立即充值
            </Button>
          }
        </div>
        <table className='navTab'>
          <tbody>
            <tr>
              {menuItems.slice(0, 2).map(this.renderMenuItems)}
            </tr>
            <tr>
              {menuItems.slice(2).map(this.renderMenuItems)}
            </tr>
          </tbody>
        </table>
        <div className='logCancle'>
          <a href='/logout'>
            <Icon type="poweroff" className='logCancleIcon' />
            注销登录
          </a>
        </div>
      </div>
    )
  }

  render() {
    const { loginUser } = this.props
    const { visible } = this.state
    const rotate = visible ? 'rotate180' : 'rotate0'
    return (
      <Popover
        title={this.getTitle()}
        content={this.getContent()}
        overlayClassName='UserPanel'
        placement="bottomRight"
        arrowPointAtCenter={true}
        trigger='click'
        visible={this.state.visible}
        onVisibleChange={this.handleVisibleChange}
        >
        <div className='userBtn'>
          {loginUser.userName}
          <Icon type="down" className={rotate} />
        </div>
      </Popover>
    )
  }
}

UserPanel.propTypes = {
  loginUser: PropTypes.object.isRequired,
}

export default UserPanel