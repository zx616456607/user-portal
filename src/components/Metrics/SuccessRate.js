/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Request SuccessRate
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

class SuccessRate extends React.Component {

  render() {
    const { succRate, scope, hideInstantBtn, isService, intl: { formatMessage } } = this.props
    const { isFetching, data } = succRate
    const option = new EchartsOption('请求成功率', (data || []).length)
    const { switchSuccRate, succRateLoading, currentSuccRateStart,
      freshTime, currentStart,  } = scope.state
    let timeText = switchSuccRate ? formatMessage(intlMsg.min1) : freshTime
    option.addYAxis('value', {
      formatter: '{value} %'
    })
    option.setToolTipUnit(' %')
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
      if (switchSuccRate) {
        if (Date.parse(item.metrics && item.metrics.length && item.metrics[0].timestamp) > Date.parse(currentSuccRateStart)) {
          minValue = Date.parse(currentSuccRateStart)
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
      option.addYAxis('value', {formatter: '{value} %'}, 0, 100) :
      option.addYAxis('value', {formatter: '{value} %'})
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
              onChange={checked => scope.switchChange(checked, 'SuccRate')}
              checkedChildren={formatMessage(intlMsg.on)}
              unCheckedChildren={formatMessage(intlMsg.off)}
            />
          </Tooltip>
        }
        <ReactEcharts
          style={{ height: formatGrid(data && data.length) }}
          notMerge={true}
          option={option}
          showLoading={succRateLoading}
        />
      </div>
    )
  }
}

SuccessRate.propTypes = {
  succRate: PropTypes.object.isRequired,
}

SuccessRate.defaultProps = {
  succRate: {
    isFetching: false,
    data: []
  }
}

export default injectIntl(SuccessRate, {
  withRef: true,
})
