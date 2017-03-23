/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * MirrorSafety component
 *
 * v0.1 - 2017-3-14
 * @author ZhangChengZheng
 */
import React, { Component } from 'react'
import { Card, Spin, Icon, Select, Tabs, Button, Steps, Checkbox, Input, Table } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import ReactEcharts from 'echarts-for-react'
import MirrorLayered from './MirrorLayered'
import MirrorSafetyBug from './MirrorSafetyBug'
import SoftwarePackage from './SoftwarePackage'
import BaseScan from './BaseScan'
import './style/MirrorSafety.less'

const TabPane = Tabs.TabPane
const Step = Steps.Step
const Option = Select.Option

class MirrorSafety extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tableextend: false,
      mirrorState: true,
      safetybugState: false,
      softwarePackageState: false,
      basicscanState: false,
      safetybugwidth: '99%',
      softwarepackageWidth: 0
    }
  }

  render() {
    return (
      <div id='mirrorsafety'>
        <div className='safetyselect'>
          <Select className='safetyselectson' placeholder='选择镜像版本，查看安全报告'>
            <Option value='1111'>选择镜像版本，查看安全报告</Option>
            <Option value='2222'>选择镜像版本，查看安全报告</Option>
            <Option value='3333'>选择镜像版本，查看安全报告</Option>
          </Select>
        </div>
        <div className='safetytabcontainer'>
          <div className="safetytabbox">
            <Tabs>
              <TabPane tab={<span><i className="fa fa-database safetytabIcon" aria-hidden="true"></i>镜像分层</span>} key="1">
                <MirrorLayered />
              </TabPane>
              <TabPane tab={<span><i className="fa fa-bug safetytabIcon" aria-hidden="true"></i>漏洞扫描</span>} key="2">
                <MirrorSafetyBug />
              </TabPane>
              <TabPane tab={<span><i className="fa fa-android safetytabIcon" aria-hidden="true"></i>软件包</span>} key="3">
                <SoftwarePackage />
              </TabPane>
              <TabPane tab={<span><i className="fa fa-crosshairs safetytabIcon" aria-hidden="true"></i>基础扫描</span>} key="4">
                <BaseScan />
              </TabPane>
            </Tabs>
          </div>
        </div>
      </div>
    )
  }
}

export default (injectIntl(MirrorSafety, {
  withRef: true,
}));