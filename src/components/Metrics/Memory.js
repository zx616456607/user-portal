/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Memory metrics
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
  //due to the memory counts > 6, this grid would be display wrong
  let initHeight = 300 + ((count - 4)/2)*25;
  return initHeight + 'px';
}

class Memory extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const option = new EchartsOption('内存')
    const { memory, scope } = this.props
    const { isFetching, data } = memory
    const { switchMemory, freshTime, MemoryLoading, currentStart, currentMemoryStart } = scope.state
    let timeText = switchMemory ? '10秒钟' : freshTime
    option.addYAxis('value', {
      formatter: '{value} M'
    })
    option.setToolTipUnit(' M')
    let minValue = 'dataMin'
    data&&data.map((item) => {
      let dataArr = []
      const metrics = Array.isArray(item.metrics)
        ? item.metrics
        : []
      metrics.map((metric) => {
        // metric.value || floatValue  only one
        dataArr.push([
          Date.parse(metric.timestamp),
          Math.floor((metric.floatValue || metric.value) / 1024 / 1024 * 10) /10
        ])
      })
      if (switchMemory) {
        if (Date.parse(item.metrics && item.metrics.length && item.metrics[0].timestamp) > Date.parse(currentMemoryStart)) {
          minValue = Date.parse(currentMemoryStart)
        }
      } else {
        if (Date.parse(item.metrics && item.metrics.length && item.metrics[0].timestamp) > Date.parse(currentStart)) {
          minValue = Date.parse(currentStart)
        }
      }
      option.addSeries(dataArr, '内存')
    })
    option.setXAxisMinAndMax(minValue)
    option.setGirdForDataCommon(data&&data.length)
    return (
      <div className="chartBox">
        <span className="freshTime">
          {`时间间隔：${timeText}`}
        </span>
        <Tooltip title="实时开关">
          <Switch className="chartSwitch" onChange={checked => scope.switchChange(checked, 'Memory')} checkedChildren="开" unCheckedChildren="关"/>
        </Tooltip>
        <ReactEcharts
          style={{ height: formatGrid(data&&data.length) }}
          notMerge={true}
          option={option}
          showLoading={MemoryLoading}
        />
      </div>
    )
  }
}

Memory.propTypes = {
  memory: PropTypes.object.isRequired,
}

Memory.defaultProps = {
  memory: {
    isFetching: false,
    data: []
  }
}

export default Memory