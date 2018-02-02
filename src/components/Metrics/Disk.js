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
import { Tooltip, Switch } from 'antd'

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
    const { switchDisk, freshTime, DiskLoading, currentStart, currentDiskStart } = scope.state
    let timeText = switchDisk ? '10秒钟' : freshTime
    option.setToolTipUnit(' KB/s')
    let minValue = 'dataMin'
    let isDataEmpty = false
    diskReadIo.data && diskReadIo.data.map((item) => {
      let dataArr = []
      const metrics = item && Array.isArray(item.metrics)
        ? item.metrics
        : []
      isDataEmpty = metrics.length ? false : true
      metrics.map((metric) => {
        // metric.value || floatValue  only one
        dataArr.push([
          Date.parse(metric.timestamp),
          Math.ceil((metric.floatValue || metric.value) / 1024 * 100) /100
        ])
      })
      if (switchDisk) {
        if (Date.parse(item.metrics && item.metrics.length && item.metrics[0].timestamp) > Date.parse(currentDiskStart)) {
          minValue = Date.parse(currentDiskStart)
        }
      } else {
        if (Date.parse(item.metrics && item.metrics.length && item.metrics[0].timestamp) > Date.parse(currentStart)) {
          minValue = Date.parse(currentStart)
        }
      }
      option.addSeries(dataArr, `${item.containerName} 读取`)
    })
    diskWriteIo.data && diskWriteIo.data.map((item) => {
      let dataArr = []
      const metrics = item && Array.isArray(item.metrics)
        ? item.metrics
        : []
      metrics.map((metric) => {
        // metric.value || metric.floatValue  only one
        dataArr.push([
          Date.parse(metric.timestamp),
          Math.ceil((metric.floatValue || metric.value) / 1024 * 100) /100
        ])
      })
      option.addSeries(dataArr, `${item.containerName} 写入`)
    })
    isDataEmpty ? option.addYAxis('value', {formatter: '{value} KB/s'}, 0, 1000) : option.addYAxis('value', {formatter: '{value} KB/s'})
    isDataEmpty ? option.setXAxisMinAndMax(isDataEmpty ? Date.parse(currentStart) : minValue, Date.parse(new Date())) :
      option.setXAxisMinAndMax(minValue)
    
    option.setGirdForDataNetWork(diskReadIo.data && diskReadIo.data.length + diskWriteIo.data.length, events)
    return (
      <div className="chartBox">
        <span className="freshTime">
          {`时间间隔：${timeText}`}
        </span>
        {/*<Tooltip title="实时开关">*/}
          {/*<Switch className="chartSwitch" onChange={checked => scope.switchChange(checked, 'Disk')} checkedChildren="开" unCheckedChildren="关"/>*/}
        {/*</Tooltip>*/}
        <ReactEcharts
          style={{ height: formatGrid(diskReadIo.data && diskReadIo.data.length + diskWriteIo.data.length) }}
          notMerge={true}
          option={option}
          showLoading={DiskLoading}
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