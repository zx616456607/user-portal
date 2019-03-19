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
import isEmpty from 'lodash/isEmpty'
import { injectIntl } from 'react-intl'
import intlMsg from './Intl'

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
    const { tcpListen, tcpEst, tcpClose, tcpTime, events, scope, isService, intl: { formatMessage } } = this.props
    const { switchDisk, freshTime, DiskLoading, currentStart, currentDiskStart } = scope.state
    let timeText = switchDisk ? formatMessage(intlMsg.min1) : freshTime
    const option = new EchartsOption('TCP', (tcpListen.data || []).length)
    option.setToolTipUnit(` ${formatMessage(intlMsg.a)}`)
    option.setServiceFlag(!!isService)
    let minValue = 'dataMin'
    let isDataEmpty = false
    if (isEmpty(tcpListen.data) && isEmpty(tcpEst.data) && isEmpty(tcpClose.data) && isEmpty(tcpTime.data)) {
      isDataEmpty = true
    }
    tcpListen.data && tcpListen.data.map((item) => {
      let dataArr = []
      const metrics = item && Array.isArray(item.metrics)
        ? item.metrics
        : []
      isDataEmpty = !isEmpty(metrics) ? false : true
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
      isDataEmpty = isDataEmpty && isEmpty(metrics)
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
      isDataEmpty = isDataEmpty && isEmpty(metrics)
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
      isDataEmpty = isDataEmpty && isEmpty(metrics)
      metrics.map((metric) => {
        // metric.value || metric.floatValue  only one
        dataArr.push([
          Date.parse(metric.timestamp),
          metric.floatValue || metric.value
        ])
      })
      option.addSeries(dataArr, `time_wait`)
    })
    isDataEmpty ? option.addYAxis('value', {formatter: `{value} ${formatMessage(intlMsg.a)}`}, 0, 1000) : option.addYAxis('value', {formatter: `{value} ${formatMessage(intlMsg.a)}`})
    isDataEmpty ? option.setXAxisMinAndMax(isDataEmpty ? Date.parse(currentStart) : minValue, Date.parse(new Date())) :
      option.setXAxisMinAndMax(minValue)

    return (
      <div className="chartBox">
        <span className="freshTime">
          {`${formatMessage(intlMsg.timeSpace)}：${timeText}`}
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

export default injectIntl(Tcp, {
  withRef: true,
})
