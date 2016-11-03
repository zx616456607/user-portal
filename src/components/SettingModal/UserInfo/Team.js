/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/1
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Button, } from 'antd'
import './style/Team.less'
import { connect } from 'react-redux'
import { loadUserDetail, loadUserTeamList } from '../../../actions/user'

let TeamList = React.createClass ({
  getInitialState(){
    return {
      
    }
  },
  render: function () {
    let firstRow = true
    let className = ""
    let items = this.props.teams.map((team) => {
      if (firstRow) {
        className = "contentList firstItem"
        firstRow = false
      } else {
        className = "contentList"
      }
      return (
        <Row className={className} key={team.teamID}>
          <Col span={4}>{team.teamName}</Col>
          <Col span={4}>{team.spaceCount}</Col>
          <Col span={4}>{team.clusterCount}</Col>
        </Row>
      )
    })
    return (
      <div>
        <Row className="contentTop">
          <Col span={4}>
            <i className="fa fa-cube"/>
            名称
          </Col>
          <Col span={4}>
            <i className="fa fa-cube"/>
            空间
          </Col>
          <Col span={4}>
            <i className="fa fa-cube"/>
            集群
          </Col>
        </Row>
        {items}
      </div>
    )
  }
})

class Team extends Component{
  constructor(props){
    super(props)
    this.state = {
      
    }
  }

  componentDidMount() {
    this.props.loadUserTeamList("default", null)
    this.props.loadUserDetail("default")
  }

  render(){
    return (
      <div id='Team'>
        <Row className="teamWrap">
          <div className="teamTitle">
            <i className="fa fa-cube"/>
            {this.props.userName}的团队
          </div>
          <div className="teamContent">
            <TeamList teams={this.props.teams}/>
          </div>
        </Row>
      </div>
    )
  }
}

function mapStateToProp(state) {
  let teamsData = []
  let total = 0
  let size = 0
  let userName = ''
  const {userDetail, teams} = state.user
  if (teams.result) {
    if (teams.result.teams) {
      teamsData = teams.result.teams
    }
    if (teams.result.total) {
      total = teams.result.total
    }
    if (teams.result.count) {
      size = teams.result.size
    }
  }

  if (userDetail.result && userDetail.result.data && 
      userDetail.result.data.userName) {
    userName = userDetail.result.data.userName
  }

  return {
    userName,
    teams: teamsData,
    total,
    size
  }
}

export default connect(mapStateToProp, {
  loadUserTeamList,
  loadUserDetail,
})(Team)