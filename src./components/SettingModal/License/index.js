/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/10
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Table } from 'antd'
import './style/License.less'

export default class License extends Component{
  constructor(props){
    super(props)
    this.state = {
      
    }
  }
  render(){
    return (
      <div id='License'>
        <Row className="licenseTitle">
          <Col>许可证信息</Col>
        </Row>
        <table className="licenseTable">
          <tbody>
            <tr>
              <td className="tableTitle">许可证有效期:</td>
              <td className="itemContent">永久</td>
            </tr>
            <tr>
              <td className="tableTitle">集群授权个数:</td>
              <td className="itemContent">无限</td>
            </tr>
            <tr>
              <td className="tableTitle">单集群节点授权个数:</td>
              <td className="itemContent">无限</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}
