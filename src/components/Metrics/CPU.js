/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * CPU metrics
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

class CPU extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const option = new EchartsOption('CPU')
    const { cpu, scope } = this.props
    const { isFetching, data } = cpu
    const { switchCpu, freshTime, CpuLoading } = scope.state
    let timeText = switchCpu ? '5秒钟' : freshTime
    option.addYAxis('value', {
      formatter: '{value} %'
    })
    data&&data.map((item) => {
      let timeData = []
      let values = []
      item.metrics.map((metric) => {
        timeData.push(metric.timestamp)
        // metric.value || floatValue  only one
        values.push(Math.floor((metric.floatValue || metric.value) * 10) /10)
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
        <Switch className="chartSwitch" onChange={checked => scope.switchChange(checked, 'Cpu')} checkedChildren="开" unCheckedChildren="关"/>  
        <ReactEcharts
          style={{ height: formatGrid(data&&data.length) }}
          notMerge={true}
          option={option}
          showLoading={CpuLoading}
        />
      </div>
    )
  }
}

CPU.propTypes = {
  cpu: PropTypes.object.isRequired,
}

CPU.defaultProps = {
  cpu: {
    isFetching: false,
    data: []
  }
}

export default CPU