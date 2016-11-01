/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/10/31
 * @author ZhaoXueYu
 */
import React, {Component} from 'react'
import { Row, Col, Card, Button, } from 'antd'
import './style/UserInfo.less'
import Information from './Information'
import Space from './Space'
import Team from './Team'

export default class UserInfo extends Component {
  constructor(props){
    super(props)
    this.state = {
      
    }
  }
  render(){
    return (
      <div id="UserInfo">
        <Row className="title">
          <Col>信息</Col>
        </Row>
        <Row className="content">
          <Card>
            <Information />
          </Card>
        </Row>
        <Row className="title">
          <Col>空间</Col>
        </Row>
        <Row className="content">
          <Card>
            <Space />
          </Card>
        </Row>
        <Row className="title">
          <Col>团队</Col>
        </Row>
        <Row className="content">
          <Card>
            <Team />
          </Card>
        </Row>
      </div>
    )
  }
}