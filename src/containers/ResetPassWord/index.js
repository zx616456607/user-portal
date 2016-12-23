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
import { Button, Form, Input } from 'antd'
import { connect } from 'react-redux'
import CommitReset from './CommitReset'
import SpendResetEmail from './SpendResetEmail'
import './style/ResetPassWord.less'

class ResetPassWord extends Component {
  constructor (props) {
    super(props)
    this.renderResetForm = this.renderResetForm.bind(this)
    this.state = {
    }
  }
  renderResetForm () {
    let { email, code } = this.props
    if (code) {
      return (
        <CommitReset email={email} code={code}/>
      )
    }
    return (
      <SpendResetEmail email={email} />
    )
  }
  render(){
    return (
      <div id='RegisterPage'>
        <div className='register'>
          <div id='SuccessRegister'>
          {
            this.renderResetForm()
          }
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps (state,props) {
  let { email, code, password } = props.location.query
  return {
    email,
    code,
    password,
  }
}
ResetPassWord = connect(mapStateToProps, {

})(ResetPassWord)

export default ResetPassWord