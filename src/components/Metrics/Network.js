/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Network metrics
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
  //due to the network counts > 6, this grid would be display wrong
  let initHeight = 300 + ((count - 4)/2)*25;
  return initHeight + 'px';
}

class Network extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { networkReceived, networkTransmitted ,events, scope, hideInstantBtn, isService, intl: { formatMessage } } = this.props
    const option = new EchartsOption(formatMessage(intlMsg.network), (networkReceived.data || []).length)
    const { switchNetwork, freshTime, NetworkLoading, currentStart, currentNetworkStart } = scope.state
    let timeText = switchNetwork ? formatMessage(intlMsg.min1) : freshTime
    option.addYAxis('value', {
      formatter: '{value} KB/s'
    })
    option.setToolTipUnit(' KB/s')
    option.setServiceFlag(!!isService)
    let minValue = 'dataMin'
    let isDataEmpty = false
    if (isEmpty(networkReceived.data) && isEmpty(networkTransmitted.data)) {
      isDataEmpty = true
    }
    networkReceived.data && networkReceived.data.map((item) => {
      let dataArr = []
      const metrics = Array.isArray(item.metrics)
                      ? item.metrics
                      : []
      isDataEmpty = !isEmpty(metrics) ? false : true
      metrics.map((metric) => {
        // metric.value || floatValue  only one
        dataArr.push([
          Date.parse(metric.timestamp),
          Math.ceil((metric.floatValue || metric.value) / 1024 * 100) /100
        ])
      })
      if (switchNetwork) {
        if (Date.parse(item.metrics && item.metrics.length && item.metrics[0].timestamp) > Date.parse(currentNetworkStart)) {
          minValue = Date.parse(currentNetworkStart)
        }
      } else {
        if (Date.parse(item.metrics && item.metrics.length && item.metrics[0].timestamp) > Date.parse(currentStart)) {
          minValue = Date.parse(currentStart)
        }
      }
      option.addSeries(dataArr, `${item.containerName} ${formatMessage(intlMsg.download)}`)
    })
    networkTransmitted.data&&networkTransmitted.data.map((item) => {
      let dataArr = []
      const metrics = Array.isArray(item.metrics)
                      ? item.metrics
                      : []
      isDataEmpty = isDataEmpty && isEmpty(metrics)
      metrics.map((metric) => {
        // metric.value || metric.floatValue  only one
        dataArr.push([
          Date.parse(metric.timestamp),
          Math.ceil((metric.floatValue || metric.value) / 1024 * 100) /100
        ])
      })
      option.addSeries(dataArr, `${item.containerName} ${formatMessage(intlMsg.upload)}`)
    })
    isDataEmpty ? option.addYAxis('value', {formatter: '{value} KB/s'}, 0, 1000) : option.addYAxis('value', {formatter: '{value} KB/s'})
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
            <Switch className="chartSwitch" onChange={checked => scope.switchChange(checked, 'Network')} checkedChildren={formatMessage(intlMsg.on)} unCheckedChildren={formatMessage(intlMsg.off)}/>
          </Tooltip>
        }
        <ReactEcharts
          style={{ height: formatGrid(networkTransmitted.data && networkTransmitted.data.length + networkReceived.data && networkReceived.data.length) }}
          notMerge={true}
          option={option}
          showLoading={NetworkLoading}
        />
      </div>
    )
  }
}

Network.propTypes = {
  networkReceived: PropTypes.object.isRequired,
  networkTransmitted: PropTypes.object.isRequired,
}

Network.defaultProps = {
  networkReceived: {
    isFetching: false,
    data: []
  },
  networkTransmitted: {
    isFetching: false,
    data: []
  }
}

export default injectIntl(Network, {
  withRef: true,
})
