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
import { Tooltip, Switch } from 'antd'

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
    const { switchCpu, freshTime, CpuLoading, currentStart, currentCpuStart } = scope.state
    let timeText = switchCpu ? '10秒钟' : freshTime
    option.addYAxis('value', {
      formatter: '{value} %'
    })
    option.setToolTipUnit(' %')
    let minValue = 'dataMin'
    data&&data.map((item) => {
      let timeData = []
      let values = []
      let dataArr = []
      item.metrics.map((metric) => {
        timeData.push(metric.timestamp)
        // metric.value || floatValue  only one
        values.push(Math.floor((metric.floatValue || metric.value) * 10) /10)
        dataArr.push([
          Date.parse(metric.timestamp),
          Math.floor((metric.floatValue || metric.value) * 10) /10
        ])
      })
      if (switchCpu) {
        if (Date.parse(item.metrics && item.metrics.length && item.metrics[0].timestamp) > Date.parse(currentCpuStart)) {
          minValue = Date.parse(currentCpuStart)
        }
      } else {
        if (Date.parse(item.metrics && item.metrics.length && item.metrics[0].timestamp) > Date.parse(currentStart)) {
          minValue = Date.parse(currentStart)
        }
      }
      option.addSeries(dataArr, item.containerName)
    })
    option.setXAxisMin(minValue)
    option.setGirdForDataCommon(data&&data.length)
    return (
      <div className="chartBox">
        <span className="freshTime">
          {`时间间隔：${timeText}`}
        </span>
        <Tooltip title="实时开关">
          <Switch className="chartSwitch" onChange={checked => scope.switchChange(checked, 'Cpu')} checkedChildren="开" unCheckedChildren="关"/>
        </Tooltip>
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