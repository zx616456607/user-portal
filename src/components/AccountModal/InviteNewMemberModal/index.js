/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  InviteNewMemberModal
 *
 * v0.1 - 2016/12/12
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Modal,Alert,Icon,Button,Row,Col,Input,Tag } from 'antd'

export default class ExitTeamModal extends Component{
  constructor(props){
    super(props)
    this.handleOk = this.handleOk.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleOnKeyDown = this.handleOnKeyDown.bind(this)
    this.state = {
      valueArr: [],
      disabled: false,
    }
  }
  handleOk() {
    const { closeInviteModal } = this.props
    closeInviteModal()
  }
  handleCancel() {
    const { closeInviteModal } = this.props
    closeInviteModal()
  }
  handleOnKeyDown (e) {
    console.log('inviteInt',this.refs.inviteInt)
    let value = e.target.innerHTML
    console.log('value',value)
    let valueArr = []
    var filter  = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
    console.log('keyCode ',e.keyCode)
    if (e.keyCode === 186) {
      valueArr = value.split(';')
      
      console.log('valueArr',valueArr)
      valueArr.map((item,index) => {
        if(filter.test(item)) {
          valueArr.push(
            <Tag closable key={index}>{item}</Tag>
          )
          return
        } else {

          /*valueArr.push(
            <Tag closable key={index} color='red'>{item}</Tag>
          )*/
          this.setState({
            disabled: true
          })
        }
      })

      this.setState({
        valueArr: valueArr
      })
    }
  }
  render(){
    const { visible } = this.props
    const { valueArr,disabled } = this.state
    let newMembers = (
      <div>
        
      </div>
    )
    return (
      <Modal title='邀请新成员'
             visible={ visible }
             onOk={this.handleOk}
             onCancel={this.handleCancel}
             wrapClassName="InviteNewMemberModal"
             footer={[
               <Button key="back" type="ghost" size="large" onClick={this.handleCancel}>取消</Button>,
               <Button key="submit" type="primary" size="large" onClick={this.handleOk} className="delBtn" disabled={disabled}>
                 发送邀请
               </Button>,
             ]}
      >
        <Row className='inviteTitle'>
          <Col span={12}>
            邮箱邀请
          </Col>
          <Col className="inviteCount" span={12}>
            还可添加20人
          </Col>
        </Row>
        <div
          placeholder='可输入多个邮箱地址, 邮箱之间用分号" ; "分隔, 每次最多添加20个 .'
          className='inviteInt ant-select-selection ant-select-selection--multiple'
          onKeyDown={this.handleOnKeyDown}
          contentEditable={true}
          ref='inviteInt'
        >
          {
            valueArr.map((item,index) => {
              return (item)
            })
          }
        </div>
      </Modal>
    )
  }
}