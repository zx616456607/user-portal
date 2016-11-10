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
      console.log('teamspace',teamspace);
      if (firstRow) {
        className = "contentList firstItem"
        firstRow = false
      } else {
        className = "contentList"
      }
      return (<Row className={className} key={teamspace.spaceName}>
          <Col span={4}>{teamspace.spaceName}</Col>
          <Col span={7}>{teamspace.teamID}</Col>
          <Col span={2}>{teamspace.balance}</Col>
          <Col span={2}>{teamspace.balance}</Col>
          <Col span={2}>{teamspace.balance}</Col>
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
              <use xlinkHref="#settingownname" />
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
              <use xlinkHref="#settingapp" />
            </svg>
            <span className="infSvgTxt">服务</span>
          </Col>
          <Col span={2}>
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
            <svg className="infSvg" style={{marginRight:8,color:'black'}}>
              <use xlinkHref="#settingperspace" />
            </svg>
            <span className="infSvgTxt">
              {this.props.userName}的个人空间
            </span>
          </div>
          <div className="spaceContent">
            <PersonalSpace />
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
  const {userDetail, teamspaces} = state.user
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