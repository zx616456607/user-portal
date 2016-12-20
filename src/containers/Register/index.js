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
import { Card } from 'antd'
import './style/Register.less'
import Person from './Person'
import Company from './Company'

export default class Register extends Component{
  constructor(props){
    super(props)
    this.state = {
      
    }
  }
  render(){
    const person = true 
    return (
      <div id="RegisterPage">
        <div className='register'>
          <Card className="registerForm" bordered={false}>
            <div>
              
            </div>
            {
              person ?
              <Person />:
              <Company />
            }
          </Card>
        </div>
      </div>
    )
  }
}