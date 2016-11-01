/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/1
 * @author ZhaoXueYu
 */
import React, {Component} from 'react'
import { Row, Col, Card, Button, } from 'antd'
import './style/Information.less'

export default class Information extends Component{
  constructor(props){
    super(props)
    this.state = {
      
    }
  }
  render(){
    return (
      <div id='Information'>
        <Row className="Item">
          <Col span={4}>名称</Col>
          <Col span={20}>puputeng</Col>
        </Row>
        <Row className="Item">
          <Col span={4}>类型</Col>
          <Col span={20}>管理员</Col>
        </Row>
        <Row className="Item">
          <Col span={4}>手机</Col>
          <Col span={20}>11111111111</Col>
        </Row>
        <Row className="Item">
          <Col span={4}>邮箱</Col>
          <Col span={20}>pupu@teng.com</Col>
        </Row>
        <Row className="Item">
          <Col span={4}>修改密码</Col>
          <Col span={20}>
            <Button type="primary">修改密码</Button>
            
          </Col>
        </Row>
        <Row className="Item" style={{border:'none'}}>
          <Col span={4}>余额</Col>
          <Col span={20}>888888T</Col>
        </Row>
      </div>
    )
  }
}