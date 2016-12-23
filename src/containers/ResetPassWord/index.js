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

let ResetPassWord = React.createClass({
  getInitialState(){
    return{
      resetSuccess: false,
    }
  },
  renderResetForm () {
    let { email, rpw } = this.props
    if (rpw === '2') {
      return (
        <CommitReset email={email} />
      )
    }
    return (
      <SpendResetEmail email={email} rpw={rpw} />
    )
  },
  render(){
    return (
      <div id='RegisterPage'>
        <div className='register'>
          <div id='SuccessRegister'>
          {
            this.state.resetSuccess ?
              <div>success</div> :
              this.renderResetForm()
          }
          </div>
        </div>
      </div>
    )
  }
})

function mapStateToProps (state,props) {
  let {email, rpw} = props.location.query
  return{
    email,
    rpw,
  }
}

ResetPassWord = connect(mapStateToProps,{
  
})

export default ResetPassWord