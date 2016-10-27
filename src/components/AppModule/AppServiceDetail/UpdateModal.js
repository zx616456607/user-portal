/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/10/26
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import './style/UpdateModal.less'
import { Button, Card, Menu, Icon, Tooltip, Row, Col, Select, InputNumber, Alert, Switch } from 'antd'
const Option = Select.Option
export default class UpdataModal extends Component {
  constructor(props){
    super(props)
    this.switchBtn = this.switchBtn.bind(this)
    this.setUpdateTime = this.setUpdateTime.bind(this)
    this.setAloneUpdateTime = this.setAloneUpdateTime.bind(this)
    this.state={
      alone: false,
      updateTimeArr: [],
      updateTime:0
    }
  }
  switchBtn(checked){
    this.setState({
      alone: checked
    })
  }
  setUpdateTime(e){
    this.setState({
      updateTime: e.target.value
    })
  }
  setAloneUpdateTime(e,index){
    console.log('inputValue',e.target.value);
    console.log(index);
    const arr = this.state.updateTimeArr
    arr[index] = e.target.value
    console.log(this.state.updateTimeArr);
    console.log(arr);
  }
  render(){
    const { serviceList,checkedServiceList } = this.props
    const { updateTime } = this.state
    console.log('serviceList',serviceList);
    console.log('checkedServiceList',checkedServiceList);
    const containers = checkedServiceList[0].spec.template.spec.containers
    console.log('containers',containers);
    if(containers.length === 1){
      return (
        <div id="UpdataModal">
          <Row className="serviceName">
            <Col className="itemTitle" span={4} style={{textAlign: 'right'}}>服务名称</Col>
            <Col className="itemBody" span={20}>
              { checkedServiceList[0].metadata.name }
            </Col>
          </Row>
          <Row className="updateItem">
            <Col className="itemTitle" span={4} style={{textAlign: 'right'}} />
            <Col className="itemBody" span={20}>
              <Select defaultValue="default" dropdownMatchSelectWidth>
                <Option value="default">
                  请选择目标版本
                </Option>
                <Option value="1">
                  1
                </Option>
                <Option value="2">
                  2
                </Option>
                <Option value="3">
                  3
                </Option>
              </Select>
              <InputNumber placeholder="更新间隔时间2~60s"/>
            </Col>
          </Row>
        </div>
      )
    } else {
      return (
        <div id="UpdataModal">
          <Alert message="提示: 检测到您的服务实例为k8s多容器 (Pod内多个容器) 实例,选择灰度升级时请确认下列服务实例中要升级的容器" type="info" />
          <Row className="serviceName">
            <Col className="itemTitle" span={4} style={{textAlign: 'right'}}>服务名称</Col>
            <Col className="itemBody" span={20}>
              { checkedServiceList[0].metadata.name }
              <div className="switchUpdateTime">
                <Switch defaultChecked={false} onChange={this.switchBtn} />
              <div className="switchTip">
                {this.state.alone ? '独立更新间隔':'统一更新间隔'}
                <i className="anticon anticon-question-circle-o" style={{marginLeft:'10px'}}/>
              </div>
              </div>
            </Col>
          </Row>
          {containers.map((item,index) => {
            return (
              <Row className="updateItem">
                <Col className="itemTitle" span={4} style={{textAlign: 'right'}}>
                  { item.name }
                </Col>
                <Col className="itemBody" span={20}>
                  <div style={{height: '30px'}}>{ item.image }</div>
                  <Select defaultValue="default">
                    <Option value="default">
                      请选择目标版本
                    </Option>
                    <Option value="1">
                      1
                    </Option>
                    <Option value="2">
                      2
                    </Option>
                    <Option value="3">
                      3
                    </Option>
                  </Select>
                  {
                    this.state.alone ? <InputNumber placeholder="更新间隔时间2~60s"
                                             onChange={(e,index) => this.setAloneUpdateTime(e,index)}/>
                    : <InputNumber placeholder="更新间隔时间2~60s"
                             value={updateTime}
                            onChange={this.setUpdateTime}/>}
                </Col>
              </Row>
            )
          })}
        </div>
      )
    }
  }
}
