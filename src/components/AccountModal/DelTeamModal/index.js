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
import { Modal,Alert,Icon,Button,Row,Col,Input } from 'antd'

let balanceMessage = (
  <Row className="tip delTip">
    <Col span={2} className='tipIcon'>
      <Icon type="exclamation-circle" />
    </Col>
    <Col className="tipText" span={22}>
      Tip: &nbsp;请注意 , &nbsp;当前团队仍有欠款未结清, 请充值当前团队账户后再<br/>尝试解散团队!
    </Col>
  </Row>
)
let delMessage = (
  <div>
    <Row className="tip delTip">
      <Col span={2} className='tipIcon'>
        <Icon type="exclamation-circle" />
      </Col>
      <Col className="tipText" span={22}>
        Tip：请注意，点击确认后“研发Team”团队将会被解散
      </Col>
    </Row>
    <Row className="tip" style={{marginTop: '30px'}}>
      <Col span={2} className='tipIcon'>
        <Icon type="exclamation-circle" />
      </Col>
      <Col className="tipText" span={22}>
        团队内的应用、存储、数据库均将被清空
      </Col>
    </Row>
    <Row className="tip">
      <Col span={2} className='tipIcon'>
        <Icon type="exclamation-circle" />
      </Col>
      <Col className="tipText" span={22}>
        团队余额将退回至“chiquan（创建者）“账户，稍后请查收个人账户的充值记录【来源显示：时速云（注：团队解散退款）】
      </Col>
    </Row>
  </div>
  
)
export default class DelTeamModal extends Component{
  constructor(props){
    super(props)
    this.handleOk = this.handleOk.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.renderFooter = this.renderFooter.bind(this)
    this.state = {
      
    }
  }
  handleOk() {
    const { closeDelTeamModal } = this.props
    closeDelTeamModal()
  }
  handleCancel() {
    const { closeDelTeamModal } = this.props
    closeDelTeamModal()
  }
  renderFooter (balance) {
    if(balance === 0){
      return [
        <Button key="back" type="ghost" size="large" onClick={this.handleCancel}>取消</Button>,
        <Button key="submit" type="primary" size="large" onClick={this.handleOk} className="delBtn" >
          确定
        </Button>,
      ]
    }
    return [
      <Button key="back" type="ghost" size="large" onClick={this.handleCancel}>知道了</Button>,
      <Button key="submit" type="primary" size="large" onClick={this.handleOk}>
        去充值
      </Button>,
    ]
  }
  render(){
    const { visible } = this.props
    const balance = 0
    return (
      <Modal
        wrapClassName="DelTeamModal"
        title="确认解散"
        visible={visible}
        onOK={this.handleOk}
        onCancel={this.handleCancel}
        footer={ this.renderFooter(balance) }
      >
        <Alert message={balance === 0 ? delMessage : balanceMessage} type="warning"/>
        <Row className="confirm">
          <Col span={2} className='confirmIcon'>
            <Icon type="question-circle-o" />
          </Col>
          <Col className="confirmText" span={22}>
            请确认是否解散团队
            <Input placeholder="输入团队名称" className="confirmInt"/>
          </Col>
        </Row>
      </Modal>
    )
  }
}