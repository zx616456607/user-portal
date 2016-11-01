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
    return (
      <div>
        <Row className="contentTop">
          <Col span={4}>
            <i className="fa fa-cube"/>
            名称
          </Col>
          <Col span={4}>
            <i className="fa fa-cube"/>
            所属团队
          </Col>
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
          <Col span={4}>
            <i className="fa fa-cube"/>
            操作
          </Col>
        </Row>
        <Row className="contentList firstItem">
          <Col span={4}>CRM联合项目</Col>
          <Col span={4}>奔驰开发1组</Col>
          <Col span={4}>6</Col>
          <Col span={4}>1000</Col>
          <Col span={4}>2002</Col>
          <Col span={4}>
            <Button type="primary">进入空间</Button>
          </Col>
        </Row>
        <Row className="contentList">
          <Col span={4}>H5活动小分队</Col>
          <Col span={4}>民生前端军团</Col>
          <Col span={4}>6</Col>
          <Col span={4}>1000</Col>
          <Col span={4}>2002</Col>
          <Col span={4}>
            <Button type="primary">进入空间</Button>
          </Col>
        </Row>
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
    return (
      <div id='Space'>
        <Row className="spaceWrap">
          <div className="spaceTitle">
            <i className="fa fa-cube"/>
            pupu的个人空间
          </div>
          <div className="spaceContent">
            <PersonalSpace />
          </div>
        </Row>
        <Row className="spaceWrap">
          <div className="spaceTitle">
            <i className="fa fa-cube"/>
            pupu的团队空间
          </div>
          <div className="spaceContent">
            <TeamSpace />
          </div>
        </Row>
      </div>
    )
  }
}