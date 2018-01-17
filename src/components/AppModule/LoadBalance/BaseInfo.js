/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Load balance config base info
 *
 * v0.1 - 2018-01-15
 * @author zhangxuan
 */

import React from 'react'
import { Card, Icon, Input, Form, Tooltip, Row, Col } from 'antd'

import './style/BaseInfo.less'
import loadBalanceIcon from '../../../assets/img/appmanage/loadBalance.png'

const FormItem = Form.Item

class BaseInfo extends React.Component {
  state = {
    
  }
  
  nameCheck = (rules, value, callback) => {
    if (!value) {
      return callback('请输入负载均衡器名称')
    }
    callback()
  }
  
  editName = () => {
    this.setState({
      nameEdit: true
    })
  }
  
  cancelEditName = () => {
    this.setState({
      nameEdit: false
    })
  }
  
  saveName = () => {
    this.setState({
      nameEdit: false
    })
  }
  
  editDesc = () => {
    this.setState({
      descEdit: true
    })
  }
  
  cancelEditDesc = () => {
    this.setState({
      descEdit: false
    })
  }
  
  saveDesc = () => {
    this.setState({
      descEdit: false
    })
  }
  
  render() {
    const { nameEdit, descEdit } = this.state
    const { form } = this.props
    const { getFieldProps, getFieldError, isFieldValidating } = form
    
    const nameProps = getFieldProps('name', {
      rules: [{
        validator: this.nameCheck
      }],
      initialValue: ''
    })
    
    const descProps = getFieldProps('description', {
      initialValue: ''
    })
    
    return (
      <Card className="baseInfo">
        <img className="balanceIcon" src={loadBalanceIcon} />
        <div className="baseInfoRightPart">
          <div className="balanceNameBox">
            <span className="nameLabel">
              负载均衡器名称：
            </span>
            <div className="balanceName">
              {
                nameEdit ?
                  <FormItem
                    hasFeedback
                    help={isFieldValidating('name') ? '校验中...' : (getFieldError('name') || []).join(', ')}
                  >
                    <Input {...nameProps} style={{ width: 170 }}/>
                  </FormItem>
                  :
                  <span>hahaha123</span>
              }
              {
                nameEdit ?
                  [
                    <Tooltip title="取消">
                      <i key="cancelName" className="cancel anticon anticon-minus-circle-o pointer" onClick={this.cancelEditName} />
                    </Tooltip>,
                    <Tooltip title="保存">
                      <i key="saveName" className="confirm anticon anticon-save pointer" onClick={this.saveName} />
                    </Tooltip>
                  ] :
                  <Tooltip title="编辑">
                    <i key="editName" className="edit anticon anticon-edit pointer" onClick={this.editName} />
                  </Tooltip>
              }
            </div>
          </div>
          <Row style={{ marginBottom: 15 }}>
            <Col span={10}>
              地址IP：<span className="successColor">192.168.0.1</span>
            </Col>
            <Col span={14}>
              创建时间：2016-08-10 23:12:12
            </Col>
          </Row>
          <Row style={{ marginBottom: 15 }}>
            <Col span={10}>
              监听类型：HTTP/HTTPS
            </Col>
            <Col span={14}>
              配置：xx-xx 核  xx-xx MB 内存
            </Col>
          </Row>
          <div className="balanceDescBox">
            <span className="nameLabel">
              备注：
            </span>
            <div className="balanceName">
              {
                descEdit ?
                  <FormItem>
                    <Input type="textarea" {...descProps} style={{ width: 250 }}/>
                  </FormItem>
                  :
                  <span>hahaha123</span>
              }
              {
                descEdit ?
                  [
                    <Tooltip title="取消">
                      <i key="cancelName" className="cancel anticon anticon-minus-circle-o pointer" onClick={this.cancelEditDesc} />
                    </Tooltip>,
                    <Tooltip title="保存">
                      <i key="saveName" className="confirm anticon anticon-save pointer" onClick={this.saveDesc} />
                    </Tooltip>
                  ] :
                  <Tooltip title="编辑">
                    <i key="editName" className="edit anticon anticon-edit pointer" onClick={this.editDesc} />
                  </Tooltip>
              }
            </div>
          </div>
        </div>
      </Card>
    )
  }
}

export default Form.create()(BaseInfo)