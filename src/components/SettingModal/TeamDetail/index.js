/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/4
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Alert, Card, Icon, Button, Table, } from 'antd'
import './style/TeamDetail.less'
import { Link } from 'react-router'

export default class TeamDetail extends Component{
  constructor(props){
    super(props)
    this.state = {
      
    }
  }
  render(){
    return (
      <div id='TeamDetail'>
        <Row>
          <Link className="back">返回</Link>
        </Row>
        <Row>
          研发Team
        </Row>
        <Row>
          余额: 5998 T币
        </Row>
        <Row>
          <Alert message="这里展示了该团队在用的集群列表,资源配置是超级管理员在企业版后台,分配到该团队所用的计算等资源,以下集群对该团队的团队空间有效."/>
          <Row>
            <Col span="8">
              <Card title="Card title">Card content</Card>
            </Col>
            <Col span="8">
              <Card title="Card title">Card content</Card>
            </Col>
            <Col span="8">
              <Card title="Card title">Card content</Card>
            </Col>
          </Row>
        </Row>
        <Row>
          <Col span={13}>
            <Row>
              <Col span={6}>
                <Icon type="user" />
                成员数(3)
              </Col>
              <Col span={6}>
                <Button icon="plus" className="addBtn">添加新成员</Button>
              </Col>
            </Row>
            <Row>
            </Row>
          </Col>
          <Col span={11}>
            <Row>
              <Col span={6}>
                <Icon type="user" />
                团队空间 (2)
              </Col>
              <Col span={6}>
                <Button icon="plus" className="addBtn">创建新空间</Button>
              </Col>
            </Row>
            <Row>
            </Row>
          </Col>
        </Row>
      </div>
    )
  }
}