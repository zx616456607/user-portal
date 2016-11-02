/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/2
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Icon, } from 'antd'
import './style/API.less'


export default class API extends Component{
  constructor(props){
    super(props)
    this.handleHidToken = this.handleHidToken.bind(this)
    this.state = {
      hidToken: 'password'
    }
  }
  handleHidToken(){
    const { hidToken } = this.state
    if(hidToken === 'password'){
      this.setState({
        hidToken: 'text'
      })
    } else {
      this.setState({
        hidToken: 'password'
      })
    }
  }
  render(){
    const tokenValue = 'jgokzgfitsewtmbpxsbhtggabvrnktepuzohnssqjnsirtot'
    const { hidToken } = this.state
    return (
      <div id='API'>
        <Row className="APITitle">时速云开放 API</Row>
        <Row className="APIInfo">以下是用于访问 TenxCloud 开放 API 的 token 信息及相关文档</Row>
        <table className="APITable">
          <tr>
            <td className="tableTitle">用户名</td>
            <td>zhaoxueyu</td>
          </tr>
          <tr>
            <td className="tableTitle">
              <span style={{marginRight: 10}}>Token</span>
              <Icon type="eye" onClick={this.handleHidToken}
                    className={hidToken === 'text'? 'hidToken' : ''}/>
            </td>
            <td>
              <input type={hidToken} value={tokenValue} className="tokenInt" disabled/>
            </td>
          </tr>
          <tr>
            <td className="tableTitle">API 文档</td>
            <td>
              <a href="###">打开文档</a>
            </td>
          </tr>
        </table>
      </div>
    )
  }
}
