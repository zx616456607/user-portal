/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *
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
import Top from '../../components/Top'
import LoginBgV3 from '../Login/Enterprise/LoginBgV3'
import { getDeepValue } from '../../../client/util/util'

class ResetPassWord extends Component {
  constructor (props) {
    super(props)
    this.renderResetForm = this.renderResetForm.bind(this)
    this.state = {
    }
  }
  renderResetForm () {
    let { name:email, code, from } = this.props
    if (code) {
      return (
        <CommitReset email={email} code={code} from={from} />
      )
    }
    return (
      <SpendResetEmail email={email} />
    )
  }
  render(){
    return (
      <div id='ResetPassWord'>
        <LoginBgV3>
        <div className="headInfo">
        <Top loginLogo={this.props.info.loginLogo}/>
        </div>
        <div className='reset'>
          <div className='resetContant'>
          {
            this.renderResetForm()
          }
          </div>
        </div>
        </LoginBgV3>
      </div>
    )
  }
}

function mapStateToProps (state,props) {
  let { email, code, from, name } = props.location.query
  const info = getDeepValue(state, ['personalized', 'info', 'result'])
  return {
    email,
    code,
    from,
    name,
    info,
  }
}
ResetPassWord = connect(mapStateToProps, {

})(ResetPassWord)

export default ResetPassWord