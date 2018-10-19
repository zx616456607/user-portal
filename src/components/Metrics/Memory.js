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
import isEmpty from 'lodash/isEmpty'
import {injectIntl} from "react-intl";
import intlMsg from './Intl'

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
    const { memory, scope, hideInstantBtn, isService, intl: { formatMessage } } = this.props
    const option = new EchartsOption(formatMessage(intlMsg.memory))
    const { isFetching, data } = memory
    const { switchMemory, freshTime, MemoryLoading, currentStart, currentMemoryStart } = scope.state
    let timeText = switchMemory ? formatMessage(intlMsg.min1) : freshTime
    option.addYAxis('value', {
      formatter: '{value} M'
    })
    let isDataEmpty = false
    if (isEmpty(data)) {
      isDataEmpty = true
    }
    option.setToolTipUnit(' M')
    option.setServiceFlag(!!isService)
    let minValue = 'dataMin'
    data&&data.map((item) => {
      let dataArr = []
      const metrics = Array.isArray(item.metrics)
        ? item.metrics
        : []
      isDataEmpty = !isEmpty(metrics) ? false : true
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
      option.addSeries(dataArr, item.containerName)
    })
    isDataEmpty ? option.addYAxis('value', {formatter: '{value} M'}, 0, 100) : option.addYAxis('value', {formatter: '{value} M'})
    isDataEmpty ? option.setXAxisMinAndMax(isDataEmpty ? Date.parse(currentStart) : minValue, Date.parse(new Date())) :
      option.setXAxisMinAndMax(minValue)

    return (
      <div className="chartBox">
        <span className="freshTime">
          {`${formatMessage(intlMsg.timeSpace)}：${timeText}`}
        </span>
        {
          !hideInstantBtn &&
          <Tooltip title={formatMessage(intlMsg.realTimeSwitch)}>
            <Switch className="chartSwitch" onChange={checked => scope.switchChange(checked, 'Memory')} checkedChildren={formatMessage(intlMsg.on)} unCheckedChildren={formatMessage(intlMsg.off)}/>
          </Tooltip>
        }
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

export default injectIntl(Memory, {
  withRef: true,
})
