/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/12/9
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Modal,Alert,Icon,Button } from 'antd'
import './style/DelTeamModal.less'

let balanceMessage = (
  <div>
    <Icon type="exclamation-circle" />
    <div>Tip: 请注意, 当前团队仍有欠款未结清, 请充值当前团队账户后再<br/>尝试解散团队!</div>
  </div>
)

export default class DelTeamModal extends Component{
  constructor(props){
    super(props)
    this.handleOk = this.handleOk.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.state = {
      
    }
  }
  handleOk() {
    
  }
  handleCancel() {
    
  }
  render(){
    const { visible } = this.props
    return (
      <Modal
        title="确认解散"
        visible={visible}
        onOK={this.handleOk}
        onCancel={this.handleCancel}
        footer={[
          <Button key="back" type="ghost" size="large" onClick={this.handleCancel}>知道了</Button>,
          <Button key="submit" type="primary" size="large" loading={this.state.loading} onClick={this.handleOk}>
            去充值
          </Button>,
        ]}
      >
        <Alert message={balanceMessage} />
      </Modal>
    )
  }
}