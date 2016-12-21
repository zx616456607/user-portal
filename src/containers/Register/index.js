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
  
  render(){
    let register = (
      <div key='b'>
        <div className='backToPage' onClick={this.handlePageChange}>&lt;&lt;&nbsp;&nbsp;&nbsp;重选注册账户类型</div>
        {
          this.state.person ?
          <Person />:
          <Company />
        }
      </div>
    )
    let registerPage = (
      <div key='a'>
        <AccountType onChange={this.handlePageChange} />
      </div>
    )

    return (
      <div id='RegisterPage'>
        <div className='register'>
          <Card className="registerForm" bordered={false}>
            <QueueAnim component="div"
                       type={this.state.person?['left']:['right']}
                       ease={['easeOutQuart', 'easeInOutQuart']}
                       key='register'>
              {this.state.registerPageShow ? registerPage : null}
              {this.state.registerShow ? register : null}
            </QueueAnim>
          </Card>
        </div>
      </div>
    )
  }
}
function mapStateToProps (state,props) {
  return {

  }
}
Register = connect(mapStateToProps, {
  
})(Register)

export default Register