/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/12/14
 * @author ZhaoXueYu
 */
import './style/Invite.less'
import React, { PropTypes } from 'react'
import { Button, Form, Input, Card, Tooltip, message, Alert, Col, Row } from 'antd'
import { connect } from 'react-redux'
import { USERNAME_REG_EXP, EMAIL_REG_EXP } from '../../../constants'
import NotLogUser from './NotLogUser'
import LogInUser from './LogInUser'
import { getInvitationInfo } from '../../actions/team'

function noop() {
  return false
}
let Invite = React.createClass({
  getInitialState() {
    return {
      loginResult: {},
    }
  },
  componentWillMount() {
    const {
      getInvitationInfo, code,
    } = this.props
    getInvitationInfo(code)
  },
  render() {
    const { loginResult } = this.state
    const { email,teamName,code } = this.props
    let state = 2
    let isUser = true
    return (
      <div id="InvitePage">
        <div className="Invite">
          <Row>
            <div className="InviteTitle">立即加入</div>
            <div className="Invitetext">
              {
                isUser ?'登录':'注册'
              }
              并加入团队&nbsp;
              <span>{ teamName }</span>
            </div>
          </Row>
          <Card className="loginForm" bordered={false}>
            <div>
              {
                loginResult.error && <Alert message={loginResult.error} type="error" showIcon />
              }
            </div>
            {
              isUser ?
              <LogInUser email={email} />:
              <NotLogUser email={email} />
            }
            {
              isUser ?
              <div className="formTip">*&nbsp;还没有时速云账户?&nbsp;&nbsp;
                <a href="https://www.tenxcloud.com/terms" target="_blank" style={{color:'#4691d2'}}>
                  立即注册
                </a>
                <a href="https://console.tenxcloud.com/reset" target="_blank" style={{color:'#4691d2',float:'right'}}>忘记密码</a>
              </div>:
              <div className="formTip">*&nbsp;注册表示您同意遵守&nbsp;
                <a href="https://www.tenxcloud.com/terms" target="_blank" style={{color:'#4691d2'}}>
                  时速云&nbsp;TenxCloud&nbsp;服务条款
                </a>
              </div>
            }
          </Card>
        </div>
        <div className="footer">
          © 2016 时速云 标准版 v2.0
        </div>
      </div>
    )
  }
})

function mapStateToProps(state, props) {
  const { code } = props.location.query
  const {invitationInfo} = state.team
  let teamName = ''
  let email = ''
  if (!invitationInfo.isFetching && invitationInfo.result && invitationInfo.result.data.data) {
    teamName = invitationInfo.result.data.data.teamName
    email = invitationInfo.result.data.data.email
  }

  return {
    code,
    teamName,
    email,
  }
}

Invite = connect(mapStateToProps, {
  getInvitationInfo,
})(Invite)

export default Invite
