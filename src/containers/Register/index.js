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


class Register extends Component{
  constructor(props){
    super(props)
    this.handlePageChange = this.handlePageChange.bind(this)

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
  componentWillMount(){
    

  }
  render(){
    const {email} = this.props
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
        email ?
        <SuccessRegister email={email}/> :
        <QueueAnim component="div"
                  type={this.state.person?['left']:['right']}
                  ease={['easeOutQuart', 'easeInOutQuart']}
                  key='register'>
            {this.state.registerPageShow ? registerPage : null}
            {this.state.registerShow ? register : null}
        </QueueAnim>
    )
  }
}
function mapStateToProps (state,props) {
  console.log('props',props)
  let {email} = props.location.query
  return {
    email,
  }
}
Register = connect(mapStateToProps, {
  
})(Register)

export default Register