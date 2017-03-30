/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * MirrorLayered component
 *
 * v0.1 - 2017-3-22
 * @author ZhangChengZheng
 */
import React, { Component } from 'react'
import { Card, Spin, Icon, Select, Tabs, Button, Steps, Checkbox, Input, Table, Tooltip } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import './style/MirrorLayered.less'

const Step = Steps.Step

class MirrorLayered extends Component {
  constructor(props){
    super(props)
    this.testContent = this.testContent.bind(this)
  }

  testContent(){
    const {mirrorLayeredinfo} = this.props
    const mirrorLayeredStep = mirrorLayeredinfo.map((item, index) =>{
      return (
        <Step title={null} description={ <div className='safetytabitem'>
          <Tooltip title={item.iD}>
            <div className='safetytabitemleft'>{item.iD}</div>
          </Tooltip>
          <span className='safetytabitemtitle'>{item.command.action}</span>
          <div className='safetytabitemdescription'>
            {item.command.parameters}
          </div>
        </div> } className='safetycontentmianitem' key={index}/>
      )
    })
    return mirrorLayeredStep
  }

  render(){
    return (
      <div id='MirrorLayered'>
        <Steps direction="vertical" current={2} className='safetycontentmian'>
          {this.testContent()}
        </Steps>
      </div>
    )
  }
}

export default (injectIntl(MirrorLayered, {
  withRef: true,
}));