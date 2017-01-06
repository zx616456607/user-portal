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
import './style/AccountType.less'
import registerPerAccountPNG from '../../assets/img/registerPerAccount.png'
import registerComAccountPNG from '../../assets/img/registerComAccount.png'

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
        <div className="accountInf" style={{paddingRight:'40px',borderRight:'1px dashed #d5d5d5'}}>
          <div className="accountImg">
            <img src={registerPerAccountPNG} alt="registerPerAccount"/>
          </div>
          <div className="accountTitle">
            <div className="line"></div>
            <div className="accountText">个人帐户</div>
            <div className="line"></div>
          </div>
          <ul className="accountList accountListR">
            <li>可使用 时速云TenxCloud 容器服务</li>
            <li>可使用 时速云TenxCloud 持续集成、自动部署服务</li>
            <li>可使用 时速云TenxCloud 数据库与缓存产品服务</li>
            <li>个人开发者级别的资源配额</li>
            <li>认证后 时速云TenxCloud 体验金￥5</li>
          </ul>
          <Button onClick={() => this.handlePageChange(true)} className="personBtn">注册个人帐户</Button>
        </div>
        <div className="accountInf" style={{paddingLeft:'40px'}}>
          <div className="accountImg">
            <img src={registerComAccountPNG} alt="registerPerAccount"/>
          </div>
          <div className="accountTitle">
            <div className="line"></div>
            <div className="accountText">企业帐户</div>
            <div className="line"></div>
          </div>
          <ul className="accountList accountListL">
            <li>可使用 时速云TenxCloud 容器服务</li>
            <li>可使用 时速云TenxCloud 持续集成、自动部署服务</li>
            <li>可使用 时速云TenxCloud 数据库与缓存产品服务</li>
            <li>企业生产级别的资源配额</li>
            <li>认证后 时速云TenxCloud 体验金￥50</li>
          </ul>
          <div>
            <Button onClick={() => this.handlePageChange(false)} className="companyBtn">注册企业帐户</Button>
          </div>
        </div>
      </div>
    )
  }
}