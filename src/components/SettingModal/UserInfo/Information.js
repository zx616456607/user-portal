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
import { Row, Col, Card, Button, Input, Icon } from 'antd'
import './style/Information.less'

export default class Information extends Component{
  constructor(props){
    super(props)
    this.handleRevise = this.handleRevise.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.state = {
      revisePass: false,
      password: 'password'
    }
  }
  handleRevise(){
    this.setState({
      revisePass: true
    })
  }
  handleSubmit(){
    this.setState({
      revisePass: false
    })
  }
  handleCancel(){
    this.setState({
      revisePass: false
    })
  }
  handleChange(){
    console.log('change',this.state.password);
    if(this.state.password === 'text'){
      this.setState({
        password: 'password'
      })
    } else {
      this.setState({
        password: 'text'
      })
    }
  }
  render(){
    const { revisePass, password } = this.state
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
            {
              revisePass ?
                <div>
                  <Row>
                    <Input type={password} className="passInt"/>
                    <Icon type="eye" onClick={this.handleChange}
                          className={password === 'text' ? 'passIcon':''}/>
                  </Row>
                  <Row>
                    <Input type='text' className="passInt"/>
                  </Row>
                  <Row>
                    <Button type="ghost" onClick={this.handleSubmit} style={{backgroundColor: '#efefef'}}>取消</Button>
                    &nbsp;&nbsp;&nbsp;
                    <Button type="primary" onClick={this.handleCancel}>确定</Button>
                  </Row>
                </div> :
                <Button type="primary" onClick={this.handleRevise}>修改密码</Button>
            }
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