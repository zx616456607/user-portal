/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Calculation tabs component
 *
 * v0.1 - 2017-7-22
 * @author Baiyu
 */

import React,{ Component } from 'react'
import { Tabs, } from 'antd'
import Title from '../../Title'
import Host from '../Host'
import Image from '../Image'
import './style/index.less'
const TabPane = Tabs.TabPane

class Calculation extends Component {
  constructor(props) {
    super()
  }
  render() {
    return (
      <div id="Calculation">
        <Title title="计算" />
        <Tabs defaultActiveKey="host" className="ref-tabs">
          <TabPane tab="云主机" key="host">
            <Host />
          </TabPane>
          <TabPane tab="镜像" key="images">
            <Image />
          </TabPane>
        </Tabs>
      </div>
    )
  }
}

export default Calculation