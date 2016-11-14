/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/14
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Tooltip, } from 'antd'
import './style/TipSvcDomain.less'

export default class TipSvcDomain extends Component{
  constructor(props){
    super(props)
    this.state = {
      
    }
  }
  render(){
    const { svcDomain } = this.props
    if(svcDomain.length > 0){
      return (
        <div id='TipSvcDomain'>
          <a target="_blank" href={svcDomain[0]}>{svcDomain[0]}</a>
        </div>
      )
    } else if (svcDomain.length == 0) {
      return (
        <span>-</span>
      )
    }
  }
}