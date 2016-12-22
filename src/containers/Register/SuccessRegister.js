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
import { Card, Button} from 'antd'
import { connect } from 'react-redux'
import Link from 'react-router'

const hash={   
  'qq.com': 'http://mail.qq.com',   
  'gmail.com': 'http://mail.google.com',   
  'sina.com': 'http://mail.sina.com.cn',   
  '163.com': 'http://mail.163.com',   
  '126.com': 'http://mail.126.com',   
  'yeah.net': 'http://www.yeah.net/',   
  'sohu.com': 'http://mail.sohu.com/',   
  'tom.com': 'http://mail.tom.com/',   
  'sogou.com': 'http://mail.sogou.com/',   
  '139.com': 'http://mail.10086.cn/',   
  'hotmail.com': 'http://www.hotmail.com',   
  'live.com': 'http://login.live.com/',   
  'live.cn': 'http://login.live.cn/',   
  'live.com.cn': 'http://login.live.com.cn',   
  '189.com': 'http://webmail16.189.cn/webmail/',   
  'yahoo.com.cn': 'http://mail.cn.yahoo.com/',   
  'yahoo.cn': 'http://mail.cn.yahoo.com/',   
  'eyou.com': 'http://www.eyou.com/',   
  '21cn.com': 'http://mail.21cn.com/',   
  '188.com': 'http://www.188.com/',   
  'foxmail.coom': 'http://www.foxmail.com'   
}

export default class SuccessRegister extends Component {
  constructor(props){
    super(props)
    this.getEmail = this.getEmail.bind(this)

    this.state = {
      toEmail: '',
    }
  }
  getEmail (url) {
    if (url.match('@')) {
      let addr = url.split('@')[1]
      for (let j in hash) {
        this.setState({
          toEmail: hash[addr]
        })
        return
      }
    }
    return false
  }
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
}