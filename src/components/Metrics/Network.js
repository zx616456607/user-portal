/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Network metrics
 *
 * v0.1 - 2016-10-25
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import ReactEcharts from 'echarts-for-react'
import EchartsOption from './EchartsOption'
import { Tooltip, Switch } from 'antd'

function formatGrid(count) {
  //this fucntion for format grid css
  //due to the network counts > 6, this grid would be display wrong
  let initHeight = 300 + ((count - 4)/2)*25;
  return initHeight + 'px';
}

class Network extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const option = new EchartsOption('网络')
    const { networkReceived, networkTransmitted ,events, scope } = this.props
    const { switchNetwork, freshTime, NetworkLoading, currentStart, currentNetworkStart } = scope.state
    let timeText = switchNetwork ? '10秒钟' : freshTime
    option.addYAxis('value', {
      formatter: '{value} KB/s'
    })
    option.setToolTipUnit(' KB/s')
    let minValue = 'dataMin'
    networkReceived.data && networkReceived.data.map((item) => {
      let dataArr = []
      const metrics = Array.isArray(item.metrics)
                      ? item.metrics
                      : []
      metrics.map((metric) => {
        // metric.value || floatValue  only one
        dataArr.push([
          Date.parse(metric.timestamp),
          Math.ceil((metric.floatValue || metric.value) / 1024 * 100) /100
        ])
      })
      if (switchNetwork) {
        if (Date.parse(item.metrics && item.metrics.length && item.metrics[0].timestamp) > Date.parse(currentNetworkStart)) {
          minValue = Date.parse(currentNetworkStart)
        }
      } else {
        if (Date.parse(item.metrics && item.metrics.length && item.metrics[0].timestamp) > Date.parse(currentStart)) {
          minValue = Date.parse(currentStart)
        }
      }
      option.addSeries(dataArr, `${item.containerName} 下载`)
    })
    networkTransmitted.data&&networkTransmitted.data.map((item) => {
      let dataArr = []
      const metrics = Array.isArray(item.metrics)
                      ? item.metrics
                      : []
      metrics.map((metric) => {
        // metric.value || metric.floatValue  only one
        dataArr.push([
          Date.parse(metric.timestamp),
          Math.ceil((metric.floatValue || metric.value) / 1024 * 100) /100
        ])
      })
      option.addSeries(dataArr, `${item.containerName} 上传`)
    })
    option.setXAxisMin(minValue)
    option.setGirdForDataNetWork(networkTransmitted.data && networkReceived.data.length + networkReceived.data && networkReceived.data.length, events)
    return (
      <div className="chartBox">
        <span className="freshTime">
          {`时间间隔：${timeText}`}
        </span>
        <Tooltip title="实时开关">
          <Switch className="chartSwitch" onChange={checked => scope.switchChange(checked, 'Network')} checkedChildren="开" unCheckedChildren="关"/>
        </Tooltip>
        <ReactEcharts
          style={{ height: formatGrid(networkTransmitted.data && networkTransmitted.data.length + networkReceived.data && networkReceived.data.length) }}
          notMerge={true}
          option={option}
          showLoading={NetworkLoading}
        />
      </div>
    )
  }
}

Network.propTypes = {
  networkReceived: PropTypes.object.isRequired,
  networkTransmitted: PropTypes.object.isRequired,
}

Network.defaultProps = {
  networkReceived: {
    isFetching: false,
    data: []
  },
  networkTransmitted: {
    isFetching: false,
    data: []
  }
}

export default Network