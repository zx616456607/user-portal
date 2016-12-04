/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/10/31
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Card, Button, } from 'antd'
import './style/UserInfo.less'
import Information from './Information'
import Space from './Space'
import Team from './Team'
import { connect } from 'react-redux'
import { loadUserDetail, loadUserList, updateUser, loadUserAppInfo, loadUserTeamspaceDetailList, loadUserTeamList } from '../../../actions/user'

class UserInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }
  componentWillMount() {
    const { userID, loadUserDetail, loadUserAppInfo, loadUserTeamspaceDetailList, loadUserTeamList } = this.props
    loadUserDetail(userID ? userID : 'default')
    loadUserAppInfo(userID ? userID : 'default')
    loadUserTeamspaceDetailList(userID ? userID : 'default', null)
    loadUserTeamList(userID ? userID : 'default', null)
  }
  render() {
    const { userDetail, appCount, serviceCount, containerCount, teamspaces, teams } = this.props
    return (
      <div id="UserInfo">
        <Row className="title">
          <Col>信息</Col>
        </Row>
        <Row className="content">
          <Card>
            <Information userDetail={userDetail} />
          </Card>
        </Row>
        <Row className="title">
          <Col>空间</Col>
        </Row>
        <Row className="content">
          <Card>
            <Space userDetail={userDetail}
              appCount={appCount}
              serviceCount={serviceCount}
              containerCount={containerCount}
              teamspaces={teamspaces} />
          </Card>
        </Row>
        <Row className="title">
          <Col>团队</Col>
        </Row>
        <Row className="content">
          <Card>
            <Team userDetail={userDetail}
              teams={teams} />
          </Card>
        </Row>
      </div>
    )
  }
}
function mapStateToProp(state, props) {
  const { user_id } = props.params
  let teamspacesData = []
  let spaceTotal = 0
  let spaceSize = 0
  let teamsData = 0
  let teamsTotal = 0
  let teamsSize = 0
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
  const {userDetail, teamspaceDetails, userAppInfo, teams} = state.user
  if (userDetail.result && userDetail.result.data) {
    userDetailData = userDetail.result.data
  }
  if (teamspaceDetails.result) {
    if (teamspaceDetails.result.teamspaces) {
      teamspacesData = teamspaceDetails.result.teamspaces
    }
    if (teamspaceDetails.result.total) {
      spaceTotal = teamspaceDetails.result.total
    }
    if (teamspaceDetails.result.count) {
      spaceSize = teamspaceDetails.result.size
    }
  }
  if (userAppInfo.result && userAppInfo.result.data) {
    appCount = userAppInfo.result.data.appCount
    serviceCount = userAppInfo.result.data.serviceCount
    containerCount = userAppInfo.result.data.containerCount
  }
  if (teams.result) {
    if (teams.result.teams) {
      teamsData = teams.result.teams
    }
    if (teams.result.total) {
      teamsTotal = teams.result.total
    }
    if (teams.result.count) {
      teamsSize = teams.result.size
    }
  }
  return {
    userDetail: userDetailData,
    userID: user_id,
    teamspaces: teamspacesData,
    spaceTotal,
    spaceSize,
    teams: teamsData,
    teamsSize,
    teamsTotal,
    appCount,
    serviceCount,
    containerCount,
  }
}

export default connect(mapStateToProp, {
  loadUserDetail,
  updateUser,
  loadUserTeamspaceDetailList,
  loadUserAppInfo,
  loadUserList,
  loadUserTeamList,
})(UserInfo)