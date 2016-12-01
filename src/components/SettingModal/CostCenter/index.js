/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  CostCenter
 *
 * v0.1 - 2016/11/30
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Tabs , } from 'antd'
import './style/CostCenter.less'
import CostRecord from './CostRecord'

const TabPane = Tabs.TabPane;

export default class CostCenter extends Component{
  constructor(props){
    super(props)
    this.state = {
      
    }
  }
  render(){
    return (
      <div id='CostCenter'>
        <Tabs defaultActiveKey="1">
          <TabPane tab="消费记录" key="1">
            <CostRecord />
          </TabPane>
          <TabPane tab="充值记录" key="2">充值记录</TabPane>
        </Tabs>
      </div>
    )
  }
}