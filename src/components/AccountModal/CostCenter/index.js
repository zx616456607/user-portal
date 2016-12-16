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
import CostRecord from './CostRecord'
import RechargeRecord from './RechargeRecord'
const mode = require('../../../../configs/model').mode
const standard = require('../../../../configs/constants').STANDARD_MODE

const TabPane = Tabs.TabPane;

export default class CostCenter extends Component{
  constructor(props){
    super(props)
    this.state = {
      
    }
  }
  componentWillMount() {
    document.title = '费用中心 | 时速云'
  }
  render(){
    return (
      <div id='CostCenter'>
        <Tabs defaultActiveKey="1">
          <TabPane tab="消费记录" key="1">
            <CostRecord standard={mode === standard}/>
          </TabPane>
          <TabPane tab="充值记录" key="2">
            <RechargeRecord standard={mode === standard}/>
          </TabPane>
        </Tabs>
      </div>
    )
  }
}