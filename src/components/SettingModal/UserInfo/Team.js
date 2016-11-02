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

let TeamSpace = React.createClass ({
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

export default class Team extends Component{
  constructor(props){
    super(props)
    this.state = {
      
    }
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
            <TeamSpace />
          </div>
        </Row>
      </div>
    )
  }
}