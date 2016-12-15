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
import { Button, Form, Input, Card, Tooltip, message, Alert, Col, Row, Modal } from 'antd'
import { connect } from 'react-redux'
import { USERNAME_REG_EXP, EMAIL_REG_EXP } from '../../../constants'
import NotLogUser from './NotLogUser'
import LogInUser from './LogInUser'
import { getInvitationInfo, joinTeam } from '../../actions/team'
import { login } from '../../actions/entities'

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
    const { email,teamName,code,isUser, login, joinTeam, invitationStatus } = this.props
    let state = 2
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
              <LogInUser email={email} login={login} joinTeam={joinTeam} code={code} invitationStatus={invitationStatus}/>:
              <NotLogUser email={email} joinTeam={joinTeam} code={code} invitationStatus={invitationStatus} />
            }
            {
              isUser ?
              <div className="formTip" style={{textAlign:'right'}}>
                <a href="https://console.tenxcloud.com/reset" target="_blank" style={{color:'#4691d2'}}>忘记密码</a>
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
        <Modal
        wrapClassName='cancelInvite'
        visible={state === 1}
        width='350px'
        closable={false}
        >
          <div>
            <div className='cancelInviteText'>
              无法加入团队 , xxx已取消邀请
            </div>
            <Button className='cancelInviteBtn' type='primary'>知道了</Button>
          </div>
        </Modal>
      </div>
    )
  }
})

function mapStateToProps(state, props) {
  const { code } = props.location.query
  const {invitationInfo} = state.team
  let teamName = ''
  let email = ''
  let isUser = true
  let invitationStatus = 0
  if (!invitationInfo.isFetching && invitationInfo.result && invitationInfo.result.data.data) {
    teamName = invitationInfo.result.data.data.teamName
    email = invitationInfo.result.data.data.email
    isUser = invitationInfo.result.data.data.isUser
    invitationStatus = invitationInfo.result.data.data.status
  }

  return {
    code,
    teamName,
    email,
    isUser,
    invitationStatus,
  }
}

Invite = connect(mapStateToProps, {
  getInvitationInfo,
  login,
  joinTeam,
})(Invite)

export default Invite
