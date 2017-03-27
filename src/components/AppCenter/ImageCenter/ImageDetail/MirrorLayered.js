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
import { Card, Spin, Icon, Select, Tabs, Button, Steps, Checkbox, Input, Table } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import ReactEcharts from 'echarts-for-react'
import './style/MirrorLayered.less'

const TabPane = Tabs.TabPane
const Step = Steps.Step
const Option = Select.Option

class MirrorLayered extends Component {

  testContent() {
    return (
      <div className='safetytabitem'>
        <div className='safetytabitemleft'>1111111111111111111</div>
        <span className='safetytabitemtitle'>CMD</span>
        <div className='safetytabitemdescription'>
          dsadadadadddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
				</div>
      </div>
    )
  }

  render() {
    return (
      <div id='MirrorLayered'>
        <Steps direction="vertical" current={2} className='safetycontentmian'>
          <Step title={null} description={this.testContent()} className='safetycontentmianitem' />
          <Step title={null} description={this.testContent()} className='safetycontentmianitem' />
          <Step title={null} description={this.testContent()} className='safetycontentmianitem' />
          <Step title={null} description={this.testContent()} className='safetycontentmianitem' />
          <Step title={null} description={this.testContent()} className='safetycontentmianitem' />
          <Step title={null} description={this.testContent()} className='safetycontentmianitem' />
          <Step title={null} description={this.testContent()} className='safetycontentmianitem' />
          <Step title={null} description={this.testContent()} className='safetycontentmianitem' />
        </Steps>
      </div>
    )
  }
}

export default (injectIntl(MirrorLayered, {
  withRef: true,
}));
