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
import './style/Space.less'
import { connect } from 'react-redux'
import { loadUserDetail, loadUserTeamspaceList } from '../../../actions/user'

let PersonalSpace = React.createClass ({
  getInitialState(){
    return {
      
    }
  },
  render: function () {
    return (
      <div>
        <Row className="contentTop">
          <Col span={4}>
            <i className="fa fa-cube"/>
            应用
          </Col>
          <Col span={4}>
            <i className="fa fa-cube"/>
            服务
          </Col>
          <Col span={4}>
            <i className="fa fa-cube"/>
            容器
          </Col>
        </Row>
        <Row className="contentList firstItem">
          <Col span={4}>32</Col>
          <Col span={4}>32</Col>
          <Col span={4}>32</Col>
        </Row>
      </div>
    )
  }
})
let TeamSpace = React.createClass({
  getInitialState(){
    return {
      
    }
  },
  render: function () {
    let firstRow = true
    let className = ""
    let items = this.props.teamspaces.map((teamspace) => {
      if (firstRow) {
        className = "contentList firstItem"
        firstRow = false
      } else {
        className = "contentList"
      }
      return (<Row className={className} key={teamspace.spaceName}>
          <Col span={3}>{teamspace.spaceName}</Col>
          <Col span={5}>{teamspace.teamID}</Col>
          <Col span={3}>6</Col>
          <Col span={2}>1000</Col>
          <Col span={4}>2002</Col>
          <Col span={3}>2002</Col>
          <Col span={4}>
            <Button type="primary">进入空间</Button>
          </Col>
        </Row>)
    })
    return (
      <div>
        <Row className="contentTop">
          <Col span={4}>
            <i className="fa fa-cube"/>
            名称
          </Col>
          <Col span={5}>
            <i className="fa fa-cube"/>
            所属团队
          </Col>
          <Col span={2}>
            <i className="fa fa-cube"/>
            应用
          </Col>
          <Col span={2}>
            <i className="fa fa-cube"/>
            服务
          </Col>
          <Col span={4}>
            <i className="fa fa-cube"/>
            容器
          </Col>
          <Col span={3}>
            <i className="fa fa-cube"/>
            余额
          </Col>
          <Col span={4}>
            <i className="fa fa-cube"/>
            操作
          </Col>
        </Row>
        {items}
      </div>
    )
  }
})

class Space extends Component{
  constructor(props){
    super(props)
    this.state = {
      
    }
  }
  
  componentDidMount() {
    this.props.loadUserDetail("default")
    this.props.loadUserTeamspaceList("default", null)
  }

  render(){
    return (
      <div id='Space'>
        <Row className="spaceWrap">
          <div className="spaceTitle">
            <i className="fa fa-cube"/>
            {this.props.userName}的个人空间
          </div>
          <div className="spaceContent">
            <PersonalSpace />
          </div>
        </Row>
        <Row className="spaceWrap">
          <div className="spaceTitle">
            <i className="fa fa-cube"/>
            {this.props.userName}的团队空间
          </div>
          <div className="spaceContent">
            <TeamSpace teamspaces={this.props.teamspaces}/>
          </div>
        </Row>
      </div>
    )
  }
}

function mapStateToProp(state) {
  let teamspacesData = []
  let total = 0
  let size = 0
  let userName = ''
  const {userDetail, teamspaces} = state.user
  if (teamspaces.result) {
    if (teamspaces.result.teamspaces) {
      teamspacesData = teamspaces.result.teamspaces
    }
    if (teamspaces.result.total) {
      total = teamspaces.result.total
    }
    if (teamspaces.result.count) {
      size = teamspaces.result.size
    }
  }

  if (userDetail.result && userDetail.result.data && 
      userDetail.result.data.userName) {
    userName = userDetail.result.data.userName
  }

  return {
    userName,
    teamspaces: teamspacesData,
    total,
    size
  }
}

export default connect(mapStateToProp, {
  loadUserTeamspaceList,
  loadUserDetail,
})(Space)