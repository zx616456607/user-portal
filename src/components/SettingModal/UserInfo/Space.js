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
import { loadUserDetail, loadUserAppInfo, loadUserTeamspaceList } from '../../../actions/user'

let PersonalSpace = React.createClass ({
  getInitialState(){
    return {
      
    }
  },
  render: function () {
   let { appCount, serviceCount, containerCount } = this.props
    return (
      <div>
        <Row className="contentTop">
          <Col span={4}>
            <svg className="infSvg" style={{marginRight:8}}>
              <use xlinkHref="#settingapp" />
            </svg>
            <span className="infSvgTxt">应用</span>
          </Col>
          <Col span={4}>
            <svg className="infSvg" style={{marginRight:8}}>
              <use xlinkHref="#settingservice" />
            </svg>
            <span className="infSvgTxt">服务</span>
          </Col>
          <Col span={4}>
            <svg className="infSvg" style={{marginRight:8}}>
              <use xlinkHref="#settingcontainer" />
            </svg>
            <span className="infSvgTxt">容器</span>
          </Col>
        </Row>
        <Row className="contentList firstItem">
          <Col span={4}> {appCount} </Col>
          <Col span={4}> {serviceCount} </Col>
          <Col span={4}> {containerCount} </Col>
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
      console.log('teamspace',teamspace);
      if (firstRow) {
        className = "contentList firstItem"
        firstRow = false
      } else {
        className = "contentList"
      }
      return (<Row className={className} key={teamspace.spaceName}>
          <Col span={4}>{teamspace.spaceName}</Col>
          <Col span={7}>{teamspace.teamName}</Col>
          <Col span={2}>{teamspace.appCount}</Col>
          <Col span={2}>{teamspace.serviceCount}</Col>
          <Col span={2}>{teamspace.containerCount}</Col>
          <Col span={3}>{teamspace.balance}</Col>
          <Col span={4}>
            <Button type="primary">进入空间</Button>
          </Col>
        </Row>)
    })
    return (
      <div>
        <Row className="contentTop">
          <Col span={4}>
            <svg className="infSvg" style={{marginRight:8}}>
              <use xlinkHref="#settingname" />
            </svg>
            <span className="infSvgTxt">名称</span>
          </Col>
          <Col span={7}>
            <svg className="infSvg" style={{marginRight:8}}>
              <use xlinkHref="#settingownteam" />
            </svg>
            <span className="infSvgTxt">所属团队</span>
          </Col>
          <Col span={2}>
            <svg className="infSvg" style={{marginRight:8}}>
              <use xlinkHref="#settingapp" />
            </svg>
            <span className="infSvgTxt">应用</span>
          </Col>
          <Col span={2}>
            <svg className="infSvg" style={{marginRight:8}}>
              <use xlinkHref="#settingservice" />
            </svg>
            <span className="infSvgTxt">服务</span>
          </Col>
          <Col span={2}>
            <svg className="infSvg" style={{marginRight:8}}>
              <use xlinkHref="#settingcontainer" />
            </svg>
            <span className="infSvgTxt">容器</span>
          </Col>
          <Col span={3}>
            <svg className="infSvg" style={{marginRight:8}}>
              <use xlinkHref="#settingbalance" />
            </svg>
            <span className="infSvgTxt">余额</span>
          </Col>
          <Col span={4}>
            <svg className="infSvg" style={{marginRight:8}}>
              <use xlinkHref="#settingopt" />
            </svg>
            <span className="infSvgTxt">操作</span>
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
    this.props.loadUserAppInfo("default")
    this.props.loadUserTeamspaceList("default", null)
  }

  render(){
    return (
      <div id='Space'>
        <Row className="spaceWrap">
          <div className="spaceTitle">
            <svg className="infSvg" style={{marginRight:8,color:'black'}}>
              <use xlinkHref="#settingperspace" />
            </svg>
            <span className="infSvgTxt">
              {this.props.userName}的个人空间
            </span>
          </div>
          <div className="spaceContent">
            <PersonalSpace appCount={this.props.appCount} serviceCount={this.props.serviceCount} containerCount={this.props.containerCount}/>
          </div>
        </Row>
        <Row className="spaceWrap">
          <div className="spaceTitle">
            <svg className="infSvg" style={{marginRight:8}}>
              <use xlinkHref="#settingteamspace" />
            </svg>
            <span className="infSvgTxt">
              {this.props.userName}的团队空间
            </span>
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
  let appCount = 0
  let serviceCount = 0
  let containerCount = 0
  const {userDetail, teamspaces, userAppInfo} = state.user
  console.log('state',state);
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

  if (userAppInfo.result && userAppInfo.result.data) {
    appCount = userAppInfo.result.data.appCount
    serviceCount = userAppInfo.result.data.serviceCount
    containerCount = userAppInfo.result.data.containerCount
  }

  return {
    userName,
    teamspaces: teamspacesData,
    total,
    size,
    appCount,
    serviceCount,
    containerCount,
  }
}

export default connect(mapStateToProp, {
  loadUserTeamspaceList,
  loadUserDetail,
  loadUserAppInfo,
})(Space)