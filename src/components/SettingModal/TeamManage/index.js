/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/1
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Alert, Button, Icon, } from 'antd'
import './style/TeamManage.less'
import SearchInput from '../../SearchInput'

export default class TeamManage extends Component {
  constructor(props){
    super(props)
    this.state = {
      
    }
  }
  render(){
    const searchIntOption = {
      placeholder: '搜索',
      // width: '280px',
    }
    return (
      <div id="TeamManage">
        <Alert message="团队, 由若干个成员组成的一个集体, 可等效于公司的部门、项目组、或子公司，
        包含『团队空间』这一逻辑隔离层， 以实现对应您企业内部各个不同项目， 或者不同逻辑组在云平台上操作对象的隔离， 团队管理员可见对应团队的所有空间的应用等对象。"
               type="info"/>
        <Row className="teamOption">
          <Button icon="plus">
            创建团队
          </Button>
          <Button>
            <Icon type="picture" />
            查看成员&团队图例
          </Button>
          <SearchInput />
        </Row>
      </div>
    )
  }
}