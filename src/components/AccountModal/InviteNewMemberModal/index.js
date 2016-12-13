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



const Option = Select.Option;
let valuesArr = []
let filter  = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/

export default class ExitTeamModal extends Component{
  constructor(props){
    super(props)
    this.handleOk = this.handleOk.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleOnChange = this.handleOnChange.bind(this)
    this.handleTagsChange = this.handleTagsChange.bind(this)
    this.handleChangeInput = this.handleChangeInput.bind(this)
    this.renderInput = this.renderInput.bind(this)
    this.renderTag = this.renderTag.bind(this)
    this.defaultPasteSplit = this.defaultPasteSplit.bind(this)
    this.state = {
      valueArr: [],
      disabled: false,
      tags: [],
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
  /*handleOnKeyDown (value) {
    console.log('keyDowm',value)
    
    if (value.charAt(value.length - 1) === ';') {
      console.log('value',value)
      valuesArr = value.split(';')
      valuesArr.length -= 1
      console.log('valuesArr',valuesArr)
      valueArr.map((item,index) => {
        if(filter.test(item)) {
          valueArr.push(
            <Tag closable key={index}>{item}</Tag>
          )
          return
        } else {
          valueArr.push(
            <Tag closable key={index} color='red'>{item}</Tag>
          )
          this.setState({
            disabled: true
          })
        }
      })
      
      this.setState({
        valueArr: valuesArr
      })
    }
  }*/
  handleOnChange (e) {
    let valueArr = []
    console.log('vaule',e.target)
    console.log('refs',this.refs)
    console.log('text-----',this.refs.inviteInt.innerHTML)
    let values = this.refs.inviteInt.innerHTML
    
    valueArr = values.split(';')
    console.log('valueArr',valueArr);
    valueArr.length -= 1
    valueArr.map((item,index) => {
      if(filter.test(item)){
        console.log('item',item);
      
      } else {
        console.log('err item',item);
        valuesArr.push(
          <Tag closable color="red" key={index}>{item}</Tag>
        )
        this.setState({
          valueArr: valuesArr
        })
      }
    })
  }
  handleChange (value) {
    let vaules = []
    let {valueArr} = this.state
    console.log('ChangeValue',value)
    value.map((item,index) => {
      if (filter.test(item)) {
        vaules.push(
          <Tag className='normal'>{value}</Tag>
        )
      } else {
         vaules.push(
          <Tag className='normal' closable color='red'>{value}</Tag>
        )
      }
    })
    this.setState({
      valueArr: vaules
    })
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
    /*if(tag.indexOf(';')>0){
      console.log('tag',tag.split(';'))
      
    }*/
    if (!filter.test(tag)) {
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
          <a className={classNameRemove} onClick={(e) => onRemove(key)} >
          </a>
          }
        </span>
      )
    }
  }
  renderInput (props) {
    let {onChange, value, addTag, ...other} = props
    return (
      <input type='text' onChange={onChange} value={value} {...other} />
    )
  }
  defaultPasteSplit (data) {
    console.log('data',data);
    return data.split(';').map(d => d.trim())
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
        <div className='inviteModal'>
          <Row className='inviteTitle'>
            <Col span={12}>
              邮箱邀请
            </Col>
            <Col className="inviteCount" span={12}>
              还可添加20人
            </Col>
          </Row>
          {/*<Select
            className='inviteInt'
            placeholder='可输入多个邮箱地址, 邮箱之间用分号" ; "分隔, 每次最多添加20个 .'
            onSearch={this.handleOnKeyDown}
            onChange={this.handleChange}
            value={valueArr}
            tags
            style={{ width: '100%' }}
            getPopupContainer={() => document.getElementsByClassName('inviteModal')[0]}
          >
          </Select>
          <div
            contentEditable={true}
            className='inviteInt'
            onKeyUp={this.handleOnChange}
            ref='inviteInt'
          >
            {
              valueArr
            }
          </div>*/}
          <TagsInput value={this.state.tags}
                     onChange={this.handleTagsChange}
                     renderTag={this.renderTag}
                     renderInput={this.renderInput}
                     inputProps={{className: 'react-tagsinput-input', placeholder: ''}}
                     pasteSplit={this.defaultPasteSplit}
          />
        </div>
      </Modal>
    )
  }
}