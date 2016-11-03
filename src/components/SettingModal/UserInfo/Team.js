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
import { loadUserTeamList } from '../../../actions/user'

let TeamList = React.createClass ({
  getInitialState(){
    return {
      
    }
  },
  render: function () {
    let items = this.props.teams.map((team) => {
      return (
        <Row className="contentList firstItem" key={team.teamID}>
          <Col span={4}>{team.teamName}</Col>
          <Col span={4}>8</Col>
          <Col span={4}>8</Col>
          <Col span={4}>59999 T币</Col>
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
          <Col span={4}>
            <i className="fa fa-cube"/>
            余额
          </Col>
        </Row>
        {items}
        <Row className="contentList firstItem">
          <Col span={4}>奔驰开发1组</Col>
          <Col span={4}>3</Col>
          <Col span={4}>6</Col>
          <Col span={4}>58888 T币</Col>
        </Row>
        <Row className="contentList">
          <Col span={4}>民生前端军团</Col>
          <Col span={4}>3</Col>
          <Col span={4}>6</Col>
          <Col span={4}>58888 T币</Col>
        </Row>
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
    this.props.loadUserTeamList("104", null)
  }

  render(){
    return (
      <div id='Team'>
        <Row className="teamWrap">
          <div className="teamTitle">
            <i className="fa fa-cube"/>
            pupu的团队
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
  let count = 0
  const teams = state.user.teams
  if (teams.result && teams.result.data) {
    if (teams.result.data) {
      teamsData = teams.result.data
    }
    if (teams.result.total) {
      total = teams.result.total
    }
    if (teams.result.count) {
      total = teams.result.count
    }
  }
  return {
    teams: teamsData,
    total,
    count
  }
}

export default connect(mapStateToProp, {
  loadUserTeamList,
})(Team)