/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/12/20
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Card, QueueAnim, Button } from 'antd'
import './style/Register.less'
import { connect } from 'react-redux'
import Person from './Person'
import Company from './Company'
import AccountType from './AccountType'
import SuccessRegister from './SuccessRegister'
import ResetPassWord from './ResetPassWord'


class Register extends Component{
  constructor(props){
    super(props)
    this.handlePageChange = this.handlePageChange.bind(this)
    this.renderRegisterPage = this.renderRegisterPage.bind(this)

    this.state = {
      registerPageShow: true,
      registerShow: false,
      person: true,
    }
  }
  handlePageChange(person) {
    this.setState({
      registerPageShow: !this.state.registerPageShow,
      registerShow: !this.state.registerShow,
    })
    if (person !== undefined) {
      this.setState({
        person,
      })
    }
  }
  renderRegisterPage(email,reset,register,registerPage){
    const { registerPageShow, registerShow } = this.state
    if (email && !reset) {
      return (
        <SuccessRegister email={email} />
      )
    }
    if (reset) {
      return (
        <ResetPassWord email={email}/>
      )
    }
    return (
      <QueueAnim component="div"
                  type={this.state.person?['left']:['right']}
                  ease={['easeOutQuart', 'easeInOutQuart']}
                  key='register'>
        {registerPageShow ? registerPage : null}
        {registerShow ? register : null}
      </QueueAnim>
    )
  }
  componentWillMount(){
    

  }
  render(){
    const {email, resetpassword} = this.props
    let register = (
      <div key='b' id='RegisterPage'>
        <div className='register' style={{width:'40%'}}>
          <Card className="registerForm" bordered={false}>
            <div className='backToPage' onClick={this.handlePageChange}>&lt;&lt;&nbsp;&nbsp;&nbsp;重选注册账户类型</div>
            {
              this.state.person ?
              <Person />:
              <Company />
            }
          </Card>
        </div>
      </div>
    )
    let registerPage = (
      <div key='a' id='RegisterPage'>
        <div className='register' style={{padding:0}}>
          <Card className="registerForm" bordered={false} style={{margin:'30px 50px 0'}}>
            <AccountType onChange={this.handlePageChange} />
          </Card>
          <div className="accountFooter">
            *&nbsp;个人帐户可以升级到企业帐户，但是企业帐户不可降级为个人帐户<br/>
            *&nbsp;注册并完成认证后方可享受以上测试金及支持服务
          </div>
        </div>
      </div>
    )

    return (
      this.renderRegisterPage(email,resetpassword,register,registerPage)
    )
  }
}
function mapStateToProps (state,props) {
  console.log('props',props)
  let {email, resetpassword} = props.location.query
  return {
    email,
    resetpassword,
  }
}
Register = connect(mapStateToProps, {
  
})(Register)

export default Register