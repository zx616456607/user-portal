/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Request Qps
 *
 * v0.1 - 2018-12-19
 * @author lvjunfeng
 */

import React, { PropTypes } from 'react'
import ReactEcharts from 'echarts-for-react'
import EchartsOption from './EchartsOption'
import { Tooltip, Switch } from 'antd'
import isEmpty from 'lodash/isEmpty'
import { injectIntl } from 'react-intl'
import intlMsg from './Intl'

function formatGrid(count) {
  //this fucntion for format grid css
  //due to the memory counts > 6, this grid would be display wrong
  let initHeight = 300 + ((count - 4)/2)*25;
  return initHeight + 'px';
}

class QPS extends React.Component {

  render() {
    const option = new EchartsOption('QPS')
    const { qps, scope, hideInstantBtn, isService, intl: { formatMessage } } = this.props
    const { isFetching, data } = qps
    const { switchQps, QpsLoading, freshTime, currentStart, currentQpsStart } = scope.state
    let timeText = switchQps ? formatMessage(intlMsg.min1) : freshTime
    option.addYAxis('value', {
      formatter: '{value} reqps'
    })
    option.setToolTipUnit(' reqps')
    option.setServiceFlag(!!isService)
    let minValue = 'dataMin'
    let isDataEmpty = false
    if (isEmpty(data)) {
      isDataEmpty = true
    }
    data && data.length && data.map((item) => {
      let timeData = []
      let values = []
      let dataArr = []
      const metrics = item && Array.isArray(item.metrics)
        ? item.metrics
        : []
      isDataEmpty = !isEmpty(metrics) ? false : true
      metrics.map((metric) => {
        timeData.push(metric.timestamp)
        // metric.value || floatValue  only one
        values.push(Math.floor((metric.floatValue || metric.value) * 10) /10)
        dataArr.push([
          Date.parse(metric.timestamp),
          Math.floor((metric.floatValue || metric.value) * 10) /10
        ])
      })
      if (switchQps) {
        if (Date.parse(item.metrics && item.metrics.length && item.metrics[0].timestamp) > Date.parse(currentQpsStart)) {
          minValue = Date.parse(currentQpsStart)
        }
      } else {
        if (Date.parse(item.metrics && item.metrics.length && item.metrics[0].timestamp) > Date.parse(currentStart)) {
          minValue = Date.parse(currentStart)
        }
      }
      option.addSeries(dataArr, item.containerName)
    })
    // 数据为空时，给图表添加默认横纵轴范围
    isDataEmpty ?
      option.addYAxis('value', {formatter: '{value} reqps'}, 0, 1) :
      option.addYAxis('value', {formatter: '{value} reqps'})
    isDataEmpty ?
      option.setXAxisMinAndMax(isDataEmpty ? Date.parse(currentStart) : minValue, Date.parse(new Date())) :
      option.setXAxisMinAndMax(minValue)
    
    return (
      <div className="chartBox">
        <span className="freshTime">
          {`${formatMessage(intlMsg.timeSpace)}：${timeText}`}
        </span>
        {
          !hideInstantBtn &&
          <Tooltip title={formatMessage(intlMsg.realTimeSwitch)}>
            <Switch
              className="chartSwitch"
              onChange={checked => scope.switchChange(checked, 'Qps')}
              checkedChildren={formatMessage(intlMsg.on)}
              unCheckedChildren={formatMessage(intlMsg.off)}/>
          </Tooltip>
        }
        <ReactEcharts
          style={{ height: formatGrid(data && data.length) }}
          notMerge={true}
          option={option}
          showLoading={QpsLoading}
        />
      </div>
    )
  }
}

QPS.propTypes = {
  qps: PropTypes.object.isRequired,
}

QPS.defaultProps = {
  qps: {
    isFetching: false,
    data: []
  }
}

export default injectIntl(QPS, {
  withRef: true,
})
