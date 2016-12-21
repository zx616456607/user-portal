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
import { Button } from 'antd'

export default class AccountType extends Component{
  constructor(props){
    super(props)
    this.handlePageChange = this.handlePageChange.bind(this)
    
    this.state = {
      
    }
  }
  handlePageChange (person) {
    const { onChange } = this.props
    onChange(person)
  }
  
  render(){
    return (
      <div id="AccountType">
        <div className='registerTitle'>请选择注册账户类型</div>
        <div className="account">
          <div className="accountInf" style={{paddingRight:'40px',borderRight:'1px dashed #d5d5d5'}}>
            <div className="accountImg">
              <img src="./img/registerPerAccount.png" alt="registerPerAccount"/>
            </div>
            <div className="accountTitle">
              <div className="line"></div>
              <div className="accountText">个人账户</div>
              <div className="line"></div>
            </div>
            <ul className="accountList accountListR">
              <li>可使用时速云 TenxCloud 所有应用资源</li>
              <li>可使用时速云 TenxFlow 持续集成、自动、部署</li>
              <li>可创建1个3人团队，完成小项目协作（购专业版可提升配额）</li>
              <li>5元 时速云TenxCloud 测试金</li>
            </ul>
            <Button onClick={() => this.handlePageChange(true)} className="personBtn">注册个人账户</Button>
          </div>
          <div className="accountInf" style={{paddingLeft:'40px'}}>
            <div className="accountImg">
              <img src="./img/registerComAccount.png" alt="registerPerAccount"/>
            </div>
            <div className="accountTitle">
              <div className="line"></div>
              <div className="accountText">企业账户</div>
              <div className="line"></div>
            </div>
            <ul className="accountList accountListL">
              <li>可使用时速云 TenxCloud 所有应用资源</li>
              <li>可使用时速云 TenxFlow 持续集成、自动、部署</li>
              <li>可创建1个3人团队，完成小项目协作（购专业版可提升配额）</li>
              <li>50元 时速云TenxCloud 测试金</li>
              <li>免费的点对点销售&工程师跟进支持</li>
            </ul>
            <Button onClick={() => this.handlePageChange(false)} className="companyBtn">注册企业账户</Button>
          </div>
        </div>
      </div>
    )
  }
}