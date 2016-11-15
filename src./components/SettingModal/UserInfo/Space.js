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

export default class Space extends Component{
  constructor(props){
    super(props)
    this.state = {
      
    }
  }
  render(){
    const {userDetail, appCount, serviceCount, containerCount, teamspaces} = this.props
    return (
      <div id='Space'>
        <Row className="spaceWrap">
          <div className="spaceTitle">
            <svg className="infSvg" style={{marginRight:8,color:'black'}}>
              <use xlinkHref="#settingperspace" />
            </svg>
            <span className="infSvgTxt">
              {userDetail.userName}的个人空间
            </span>
          </div>
          <div className="spaceContent">
            <PersonalSpace appCount={appCount}
                           serviceCount={serviceCount}
                           containerCount={containerCount}/>
          </div>
        </Row>
        <Row className="spaceWrap">
          <div className="spaceTitle">
            <svg className="infSvg" style={{marginRight:8}}>
              <use xlinkHref="#settingteamspace" />
            </svg>
            <span className="infSvgTxt">
              {userDetail.userName}的团队空间
            </span>
          </div>
          <div className="spaceContent">
            <TeamSpace teamspaces={teamspaces}/>
          </div>
        </Row>
      </div>
    )
  }
}