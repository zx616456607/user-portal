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
import { Modal,Alert,Icon,Button,Row,Col,Input,Tag,Select } from 'antd'
import TagsInput from 'react-tagsinput'
import 'react-tagsinput/react-tagsinput.css'
import {EMAIL_REG_EXP} from '../../../constants'


const Option = Select.Option;
let valuesArr = []

export default class InviteNewMemberModal extends Component{
  constructor(props){
    super(props)
    this.handleOk = this.handleOk.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleTagsChange = this.handleTagsChange.bind(this)
    this.handleChangeInput = this.handleChangeInput.bind(this)
    this.renderInput = this.renderInput.bind(this)
    this.renderTag = this.renderTag.bind(this)

    this.state = {
      valueArr: [],
      disabled: false,
      tags: [],
      rightTags: [],
    }
  }
  handleOk() {
    const { closeInviteModal, teamID } = this.props
    const { tags } = this.state
    let passTags = [] //正确的邮件
    
    passTags=tags.filter((item) => {
      return EMAIL_REG_EXP.test(item)
    })
    // 发送邀请
    if (passTags.length > 0) {
      this.props.sendInvitation(teamID ,passTags)
    }
    closeInviteModal() //关闭弹窗
  }
  handleCancel() {
    const { closeInviteModal } = this.props
    closeInviteModal()
  }
  
  handleTagsChange (value){
    this.setState({
      tags:value
    })
  }
  handleChangeInput(tag) {
    this.setState({tag})
  }
 
  renderTag (props) {
    let {tag, key, disabled, onRemove, classNameRemove, getTagDisplayValue, ...other} = props
    let {rightTags} = this.state
    console.log('tag',tag)
    console.log('getTagDisplayValue',getTagDisplayValue)
    if (tag.indexOf(';') !== -1) {
      console.log('in')
      tag.split(';').map((tag) => {
        tag.trim()
        if (!EMAIL_REG_EXP.test(tag)) {
          return (
            <span key={key} {...other} className="react-tagsinput-tag errTags">
              {getTagDisplayValue(tag)}
              {!disabled &&
                <a className={classNameRemove} onClick={(e) => onRemove(key)} >
                </a>
              }
            </span>
          )
        } else {
          return (
            <span key={key} {...other}>
              {getTagDisplayValue(tag)}
              {!disabled &&
              <a className={classNameRemove} onClick={(e) => onRemove(key)}>
              </a>
              }
            </span>
          )
        }
      })
    }
    if (!EMAIL_REG_EXP.test(tag)) {
        return (
          <span key={key} {...other} className="react-tagsinput-tag errTags">
            {getTagDisplayValue(tag)}
            {!disabled &&
              <a className={classNameRemove} onClick={(e) => onRemove(key)} >
              </a>
            }
          </span>
        )
      } else {
        return (
          <span key={key} {...other}>
            {getTagDisplayValue(tag)}
            {!disabled &&
            <a className={classNameRemove} onClick={(e) => onRemove(key)}>
            </a>
            }
          </span>
        )
      }
  }
  renderInput (props) {
    let {onChange, value, addTag,...other} = props
    return (
      <input type='text' onChange={onChange} value={value} onPaste={() => { console.log('onPause') }} {...other} />
    )
  }
  render(){
    const { visible } = this.props
    const { valueArr, disabled } = this.state

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
        <div className='inviteModal'>
          <Row className='inviteTitle'>
            <Col span={12}>
              邮箱邀请
            </Col>
            <Col className="inviteCount" span={12}>
              还可添加20人
            </Col>
          </Row>
          <TagsInput value={this.state.tags}
                     onChange={this.handleTagsChange}
                     renderTag={this.renderTag}
                     renderInput={this.renderInput}
                     inputProps={{className: 'react-tagsinput-input', placeholder: ''}}
          />
        </div>
      </Modal>
    )
  }
}