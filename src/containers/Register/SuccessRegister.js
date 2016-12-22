/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  SuccessRegister
 *
 * v0.1 - 2016/12/22
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Card, Button } from 'antd'
import { connect } from 'react-redux'
import { EMAIL_HASH } from '../../constants'


let SuccessRegister = React.createClass({
  getInitialState(){
    return {
      toEmail: '',//邮箱识别
    }
  },
  //邮箱识别
  getEmail (url) {
    if (url.match('@')) {
      let addr = url.split('@')[1]
      for (let j in EMAIL_HASH) {
        this.setState({
          toEmail: EMAIL_HASH[addr]
        })
        return
      }
    }
    return false
  },
  
  render(){
    const {email} = this.props

    return (
      <div id='RegisterPage'>
        <div className='register' style={{width:'40%'}}>
          <div id='SuccessRegister'>
            <div className='successTitle'>
              注册成功
            </div>
            <ul className='successInf'>
              <li>您注册的邮箱是&nbsp;:&nbsp;{email}</li>
              <li>我们已经给您的邮箱发送了一封验证邮件&nbsp;,&nbsp;请登录您的注册邮箱完成用户验证</li>
            </ul>
            <Button className='successBtn' onClick={() => this.getEmail(email)}>
              <a href={this.state.toEmail} target='_blank'>
                登录邮箱查收验证邮件
              </a>
            </Button>
            <div className='successTip'>
              <span>没有收到邮件?</span>
              <span style={{color:'#2db7f5'}}>请点击重新发送</span>
            </div>
          </div>
        </div>
      </div>
    )
  }
})
export default SuccessRegister