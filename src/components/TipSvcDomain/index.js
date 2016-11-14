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
import { Tooltip, Badge, Timeline } from 'antd'
import './style/TipSvcDomain.less'

let Tip = React.createClass({
  getInitialState(){
    return {
      
    }
  },
  render: function(){
    const { svcDomain } = this.props
    let item = svcDomain.map((item,index) => {
      return (
        <li>{item}</li>
      )
    })
    return (
      <div id='Tip'>
        <ul>
          { item }
        </ul>
      </div>
    )
  }
})

export default class TipSvcDomain extends Component{
  constructor(props){
    super(props)
    this.popTip = this.popTip.bind(this)
    this.state = {
      
    }
  }
  popTip(){
    console.log('POP !');
  }
  render(){
    /*const appDomain = [
      {
        name: 'servce1',
        data: ['10.1.27.1',]
      },
      {
        name: 'servce2',
        data: ['10.1.27.1', '10.1.27.2', '10.1.27.3', '10.1.27.4', '10.1.27.5',]
      },
      {
        name: 'servce3',
        data: ['10.1.27.1', '10.1.27.2', '10.1.27.3', '10.1.27.4', '10.1.27.5',]
      },
    ]*/
    const { appDomain } = this.props
    const svcDomain = ['10.1.27.1', '10.1.27.2', '10.1.27.3', '10.1.27.4', '10.1.27.5',]
    if(svcDomain){
      if(svcDomain.length == 0){
        return (
          <span>-</span>
        )
      } else if (svcDomain.length == 1) {
        return (
          <div id='TipSvcDomain'>
            <a target="_blank" href={svcDomain[0]}>{svcDomain[0]}</a>
          </div>
        )
      } else if (svcDomain.length == 2) {
        return (
          <div>
            <a target="_blank" href={svcDomain[0]}>{svcDomain[0]}</a>
            <a target="_blank" href={svcDomain[1]}>{svcDomain[1]}</a>
          </div>
        )
      } else if (svcDomain.length > 2) {
        return (
          <div>
            <a target="_blank" href={svcDomain[0]}>{svcDomain[0]}</a>
            <Tooltip placement="right" title={ <Tip svcDomain={svcDomain}/> }>
              <Badge count='...' onClick={this.popTip} style={{marginLeft:'5px',lineHeight:'12px'}}/>
            </Tooltip>
          </div>
        )
      } else {
        return (
          <div></div>
        )
      }
    } else if (appDomain) {
      return (
        <div>
          
        </div>
      )
    }
  }
}