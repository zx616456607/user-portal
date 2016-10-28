/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/10/25
 * @author ZhaoXueYu
 */

import React, { Component, PropTypes } from 'react'
import { Button, Alert, Card, Slider, Row, Col, InputNumber} from 'antd'
import './style/AppAutoExtend.less'
export default class AppAutoExtend extends Component{
  constructor(props){
    super(props)
    this.handleMinExampleNums = this.handleMinExampleNums.bind(this)
    this.state={
      edit:true,
      minExampleNums: 1,
    }
  }
  handleMinExampleNums(value){
    console.log('value1',value);
    this.setState({
      minExampleNums: value,
    })
  }
  render(){
    return (
      <div id="AppAutoExtend">
        <div className="title">
          自动弹性伸缩
          <div className="titleBtn">
            {this.state.edit ?
              <Button type="primary" size="large">编辑</Button> :
              <div>
                <Button type="primary" size="large">保存</Button><Button size="large">取消</Button>
              </div>
            }
          </div>
        </div>
        <Alert message="注: 系统将根据设定的CPU阈值来自动的『扩展,或减少』该服务所冗余的实例数量" type="info" />
        <Card>
          <Row className="cardItem">
            <Col className="itemTitle" span={4} style={{textAlign: 'right'}}>服务名称</Col>
            <Col className="itemBody" span={20}>ngnix-test</Col>
          </Row>
          <Row className="cardItem">
            <Col className="itemTitle" span={4} style={{textAlign: 'right'}}>最小实例数量</Col>
            <Col className="itemBody" span={20}>
              <Row>
                <Col span={12} style={{marginTop: '24px'}}>
                  <Slider defaultValue={30} onChange={ this.handleMinExampleNums } value={this.state.minExampleNums}/>
                </Col>
                <Col span={12}>
                  <InputNumber style={{ marginLeft: '16px' }}
                               value={this.state.minExampleNums} onChange={this.handleMinExampleNums}
                  /> 个
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className="cardItem">
            <Col className="itemTitle" span={4} style={{textAlign: 'right'}}>最大实例数量</Col>
            <Col className="itemBody" span={20}>
              <Row>
                <Col span={12} style={{marginTop: '24px'}}>
                  <Slider defaultValue={30} onChange={ this.handleMinExampleNums } value={this.state.minExampleNums}/>
                </Col>
                <Col span={12}>
                  <InputNumber style={{ marginLeft: '16px' }}
                               value={this.state.minExampleNums} onChange={this.handleMinExampleNums}
                  /> 个
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className="cardItem">
            <Col className="itemTitle" span={4} style={{textAlign: 'right'}}>CPU阈值</Col>
            <Col className="itemBody" span={20}>
              <Row>
                <Col span={12} style={{marginTop: '24px'}}>
                  <Slider defaultValue={30} onChange={ this.handleMinExampleNums } value={this.state.minExampleNums}/>
                </Col>
                <Col span={12}>
                  <InputNumber style={{ marginLeft: '16px' }}
                               value={this.state.minExampleNums} onChange={this.handleMinExampleNums}
                  /> %
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
      </div>
    )
  }
}
