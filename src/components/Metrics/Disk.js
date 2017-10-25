/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Network metrics
 *
 * v0.1 - 2017-8-3
 * @author Zhangcz
 */

import React, { Component, PropTypes } from 'react'
import ReactEcharts from 'echarts-for-react'
import EchartsOption from './EchartsOption'
import { Row, Col, Switch } from 'antd'

function formatGrid(count) {
  //this fucntion for format grid css
  //due to the network counts > 6, this grid would be display wrong
  let initHeight = 300 + ((count - 4)/2)*25;
  return initHeight + 'px';
}

class Disk extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const option = new EchartsOption('磁盘')
    const { diskReadIo, diskWriteIo, events, scope } = this.props
    let timeText = scope.state.switchDisk ? '5秒钟' : scope.state.freshTime
    option.addYAxis('value', {
      formatter: '{value} KB/s'
    })
    diskReadIo.data && diskReadIo.data.map((item) => {
      let timeData = []
      let values = []
      const metrics = item && Array.isArray(item.metrics)
        ? item.metrics
        : []
      metrics.map((metric) => {
        timeData.push(metric.timestamp)
        // metric.value || floatValue  only one
        values.push(Math.ceil((metric.floatValue || metric.value) / 1024 * 100) /100)
      })
      option.setXAxisData(timeData)
      option.addSeries(values, `${item.containerName} 读取`)
    })
    diskWriteIo.data && diskWriteIo.data.map((item) => {
      let timeData = []
      let values = []
      const metrics = item && Array.isArray(item.metrics)
        ? item.metrics
        : []
      metrics.map((metric) => {
        timeData.push(metric.timestamp)
        // metric.value || metric.floatValue  only one
        values.push(Math.ceil((metric.floatValue || metric.value) / 1024 * 100) /100)
      })
      option.setXAxisData(timeData)
      option.addSeries(values, `${item.containerName} 写入`)
    })
    option.setGirdForDataNetWork(diskReadIo.data && diskReadIo.data.length + diskWriteIo.data.length, events)
    return (
      <div className="chartBox">
        <span className="freshTime">
          {`时间间隔：${timeText}`}
        </span>
        <Switch className="chartSwitch" onChange={checked => scope.switchChange(checked, 'Network')} checkedChildren="开" unCheckedChildren="关"/>
        <ReactEcharts
          style={{ height: formatGrid(diskReadIo.data && diskReadIo.data.length + diskWriteIo.data.length) }}
          notMerge={true}
          option={option}
          showLoading={diskReadIo.isFetching || diskWriteIo.isFetching}
        />
      </div>
    )
  }
}

Disk.propTypes = {
  diskReadIo: PropTypes.object.isRequired,
  diskWriteIo: PropTypes.object.isRequired,
}

Disk.defaultProps = {
  diskReadIo: {
    isFetching: false,
    data: []
  },
  diskWriteIo: {
    isFetching: false,
    data: []
  }
}

export default Disk