/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Load balance listener
 *
 * v0.1 - 2018-12-29
 * @author zhangxuan
 */

import React from 'react'
import { Radio } from 'antd'
import HttpTable from './HttpTable'
import TcpUdpTable from '../../../../src/components/AppModule/LoadBalance/TcpUdpTable'
import { getDeepValue } from '../../../util/util'
import './style/Listener.less'

const RadioGroup = Radio.Group

export default class Listener extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      radioValue: props.listenerType || 'HTTP',
    }
  }

  radioChange = e => {
    this.setState({
      radioValue: e.target.value,
    })
  }

  renderTable = () => {
    const { radioValue } = this.state
    const {
      togglePart, ingress, httpLoading, location,
      lbDetail, copyIngress, clusterID,
    } = this.props
    const name = lbDetail && lbDetail.deployment.metadata.name
    switch (radioValue) {
      case 'HTTP':
        return <HttpTable
          {...{
            togglePart,
            ingress,
            httpLoading,
            location,
            lbDetail,
            copyIngress,
            clusterID,
          }}
        />
      case 'TCP':
        return <TcpUdpTable
          type={'TCP'}
          {...{
            togglePart,
            clusterID,
            name,
            location,
            lbDetail,
          }}
        />
      case 'UDP':
        return <TcpUdpTable
          type={'UDP'}
          {...{
            togglePart,
            clusterID,
            name,
            location,
            lbDetail,
          }}
        />
      default:
        break
    }
  }
  render() {
    const { radioValue } = this.state
    const { lbDetail } = this.props
    const { deployment } = lbDetail || { deployment: {} }
    const isHAInside = getDeepValue(deployment, [ 'metadata', 'labels', 'agentType' ]) === 'HAInside'
    return (
      <div className="loadbalance-listener">
        <RadioGroup value={radioValue} onChange={this.radioChange}>
          <Radio value={'HTTP'}>HTTP 监听器</Radio>
          <Radio value={'TCP'} disabled={isHAInside}>TCP 监听器</Radio>
          <Radio value={'UDP'} disabled={isHAInside}>UDP 监听器</Radio>
        </RadioGroup>
        {this.renderTable()}
      </div>
    )
  }
}
