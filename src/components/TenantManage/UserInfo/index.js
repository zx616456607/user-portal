/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2017/6/26
 * @author XuLongcheng
 */
import React, { Component } from 'react'
import { Row, Col, Card, Button, } from 'antd'
import { Link } from 'react-router'
import './style/UserInfo.less'
import Information from './Information'
import PersonalResource from './PersonalResource'
import { connect } from 'react-redux'
import { ROLE_USER, ROLE_TEAM_ADMIN, ROLE_SYS_ADMIN } from '../../../../constants'
import { loadUserDetail, loadUserList, updateUser, loadUserAppInfo } from '../../../actions/user'
import Title from '../../Title'
import UserProjectsAndTeams from './UserProjectsAndTeams'
import QueueAnim from 'rc-queue-anim'

class UserInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }
  componentWillMount() {
    const { userID, loadUserDetail, loadUserAppInfo } = this.props
    loadUserDetail(userID ? userID : 'default')
    loadUserAppInfo(userID ? userID : 'default')
  }
  componentWillReceiveProps(nextProps) {
    const { userID, loadUserDetail, loadUserAppInfo } = nextProps
    if (this.props.userID != userID) {
      loadUserDetail(userID ? userID : 'default')
      loadUserAppInfo(userID ? userID : 'default')
    }
  }
  render() {
    const { userID, userDetail, appCount, serviceCount, containerCount, editPass, loginUser, location } = this.props
    const href = window.location.href;
    let memberFlag = false;
    if(href.indexOf('tenant_manage/user') > -1) {
      memberFlag = true;
    }
    return (
      <QueueAnim>
      <div id="UserInfos" key='UserInfos'>

        <Title title={userID ? '成员管理' : '我的帐户'} />
        <Row className="content">
          {
            userID && (
              <Link className="back goback" to="/tenant_manage/user">
                <span className="backjia"></span>
                <span className="btn-back">返回</span>
              </Link>
            )
          }
          <Row className="title">
            <Col>{ memberFlag ? userDetail.userName+'成员信息' : '我的信息'}</Col>
          </Row>
        </Row>

        <Row className="content">
          <Card>
            <Information userID={userID} userDetail={userDetail} editPass={editPass} location={this.props.location}/>
          </Card>
        </Row>

        {/* <Row className="content">
          <Card>
            <PersonalResource userDetail={userDetail}
              appCount={appCount}
              serviceCount={serviceCount}
              containerCount={containerCount}
            />
          </Card>
        </Row> */}
        <Row className="content">
          <Card>
            <UserProjectsAndTeams location={location} loginUser={loginUser} userDetail={userDetail} userId={userID || loginUser.userID} />
          </Card>
        </Row>
      </div>
      </QueueAnim>
    )
  }
}
function mapStateToProp(state, props) {
  let { user_id } = props.params
  let editPass = false
  if (user_id === 'editPass') {
    editPass = true
    user_id = ''
  }
  let spaceTotal = 0
  let spaceSize = 0
  let appCount = 0
  let serviceCount = 0
  let containerCount = 0
  let userDetailData = {
    displayName: '',
    role: 0,
    phone: '',
    email: '',
    balance: 0,
    userID: '',
    userName: '',
  }
  const {userDetail, userAppInfo} = state.user
  if (userDetail.result && userDetail.result.data) {
    userDetailData = userDetail.result.data
  }
  if (userAppInfo.result && userAppInfo.result.data) {
    appCount = userAppInfo.result.data.appCount
    serviceCount = userAppInfo.result.data.serviceCount
    containerCount = userAppInfo.result.data.containerCount
  }
  return {
    loginUser: state.entities.loginUser.info,
    userDetail: userDetailData,
    userID: user_id,
    spaceTotal,
    spaceSize,
    appCount,
    serviceCount,
    containerCount,
    editPass,
  }
}

export default connect(mapStateToProp, {
  loadUserDetail,
  updateUser,
  loadUserAppInfo,
  loadUserList,
})(UserInfo)