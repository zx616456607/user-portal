/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Tcp metrics
 *
 * v0.1 - 2017-12-13
 * @author zhangxuan
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

class Tcp extends Component {
  constructor(props) {
    super(props)
  }
  
  render() {
    const option = new EchartsOption('TCP')
    const { tcpListen, tcpEst, tcpClose, tcpTime, events, scope } = this.props
    const { switchDisk, freshTime, DiskLoading, currentStart, currentDiskStart } = scope.state
    let timeText = switchDisk ? '10秒钟' : freshTime
    option.setToolTipUnit(' 个')
    let minValue = 'dataMin'
    let isDataEmpty = false
    tcpListen.data && tcpListen.data.map((item) => {
      let dataArr = []
      const metrics = item && Array.isArray(item.metrics)
        ? item.metrics
        : []
      isDataEmpty = metrics.length ? false : true
      metrics.map((metric) => {
        // metric.value || floatValue  only one
        dataArr.push([
          Date.parse(metric.timestamp),
          metric.floatValue || metric.value
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
      option.addSeries(dataArr, `listen`)
    })
    tcpEst.data && tcpEst.data.map((item) => {
      let dataArr = []
      const metrics = item && Array.isArray(item.metrics)
        ? item.metrics
        : []
      metrics.map((metric) => {
        // metric.value || metric.floatValue  only one
        dataArr.push([
          Date.parse(metric.timestamp),
          metric.floatValue || metric.value
        ])
      })
      option.addSeries(dataArr, `established`)
    })
    tcpClose.data && tcpClose.data.map((item) => {
      let dataArr = []
      const metrics = item && Array.isArray(item.metrics)
        ? item.metrics
        : []
      metrics.map((metric) => {
        // metric.value || metric.floatValue  only one
        dataArr.push([
          Date.parse(metric.timestamp),
          metric.floatValue || metric.value
        ])
      })
      option.addSeries(dataArr, `close_wait`)
    })
    tcpTime.data && tcpTime.data.map((item) => {
      let dataArr = []
      const metrics = item && Array.isArray(item.metrics)
        ? item.metrics
        : []
      metrics.map((metric) => {
        // metric.value || metric.floatValue  only one
        dataArr.push([
          Date.parse(metric.timestamp),
          metric.floatValue || metric.value
        ])
      })
      option.addSeries(dataArr, `time_wait`)
    })
    isDataEmpty ? option.addYAxis('value', {formatter: '{value} 个'}, 0, 1000) : option.addYAxis('value', {formatter: '{value} 个'})
    isDataEmpty ? option.setXAxisMinAndMax(isDataEmpty ? Date.parse(currentStart) : minValue, Date.parse(new Date())) :
      option.setXAxisMinAndMax(minValue)
    
    option.setGirdForDataNetWork(tcpListen.data && tcpListen.data.length + tcpEst.data.length, events)
    return (
      <div className="chartBox">
        <span className="freshTime">
          {`时间间隔：${timeText}`}
        </span>
        {/*<Tooltip title="实时开关">*/}
        {/*<Switch className="chartSwitch" onChange={checked => scope.switchChange(checked, 'Disk')} checkedChildren="开" unCheckedChildren="关"/>*/}
        {/*</Tooltip>*/}
        <ReactEcharts
          style={{ height: formatGrid(tcpListen.data && tcpListen.data.length + tcpEst.data.length) }}
          notMerge={true}
          option={option}
          showLoading={DiskLoading}
        />
      </div>
    )
  }
}

Tcp.propTypes = {
  tcpListen: PropTypes.object.isRequired,
  tcpEst: PropTypes.object.isRequired,
}

Tcp.defaultProps = {
  tcpListen: {
    isFetching: false,
    data: []
  },
  tcpEst: {
    isFetching: false,
    data: []
  }
}

export default Tcp