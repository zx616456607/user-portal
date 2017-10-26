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
import { Row, Col, Switch } from 'antd'

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
    let timeText = scope.state.switchMemory ? '5秒钟' : scope.state.freshTime
    option.addYAxis('value', {
      formatter: '{value} M'
    })
    data&&data.map((item) => {
      let timeData = []
      let values = []
      const metrics = Array.isArray(item.metrics)
        ? item.metrics
        : []
      metrics.map((metric) => {
        timeData.push(metric.timestamp)
        // metric.value || floatValue  only one
        values.push(Math.floor((metric.floatValue || metric.value) / 1024 / 1024 * 10) /10)
      })
      option.setXAxisData(timeData)
      option.addSeries(values, item.containerName)
    })
    option.setGirdForDataCommon(data&&data.length)
    return (
      <div className="chartBox">
        <span className="freshTime">
          {`时间间隔：${timeText}`}
        </span>
        <Switch className="chartSwitch" onChange={checked => scope.switchChange(checked, 'Memory')} checkedChildren="开" unCheckedChildren="关"/>
        <ReactEcharts
          style={{ height: formatGrid(data&&data.length) }}
          notMerge={true}
          option={option}
          // showLoading={isFetching}
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