/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Network metrics
 *
 * v0.1 - 2017-8-3
 * @author Zhangcz
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

class Disk extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { diskReadIo, diskWriteIo, events, scope, isService, intl: { formatMessage } } = this.props
    const option = new EchartsOption(formatMessage(intlMsg.disk), (diskReadIo.data || []).length * 2)
    const { switchDisk, freshTime, DiskLoading, currentStart, currentDiskStart } = scope.state
    let timeText = switchDisk ? formatMessage(intlMsg.min1) : freshTime
    option.setToolTipUnit(' KB/s')
    option.setServiceFlag(!!isService)
    let minValue = 'dataMin'
    let isDataEmpty = false
    if (isEmpty(diskWriteIo.data) && isEmpty(diskReadIo.data)) {
      isDataEmpty = true
    }
    diskReadIo.data && diskReadIo.data.map((item) => {
      let dataArr = []
      const metrics = item && Array.isArray(item.metrics)
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
      if (switchDisk) {
        if (Date.parse(item.metrics && item.metrics.length && item.metrics[0].timestamp) > Date.parse(currentDiskStart)) {
          minValue = Date.parse(currentDiskStart)
        }
      } else {
        if (Date.parse(item.metrics && item.metrics.length && item.metrics[0].timestamp) > Date.parse(currentStart)) {
          minValue = Date.parse(currentStart)
        }
      }
      option.addSeries(dataArr, `${item.containerName} ${formatMessage(intlMsg.read)}`)
    })
    diskWriteIo.data && diskWriteIo.data.map((item) => {
      let dataArr = []
      const metrics = item && Array.isArray(item.metrics)
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
      option.addSeries(dataArr, `${item.containerName} ${formatMessage(intlMsg.write)}`)
    })
    isDataEmpty ? option.addYAxis('value', {formatter: '{value} KB/s'}, 0, 1000) : option.addYAxis('value', {formatter: '{value} KB/s'})
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
          style={{ height: formatGrid(diskReadIo.data && diskReadIo.data.length + diskWriteIo.data.length) }}
          notMerge={true}
          option={option}
          showLoading={DiskLoading}
        />
      </div>
    )
  }
}

Disk.propTypes = {
  diskReadIo: PropTypes.object.isRequired,
  diskWriteIo: PropTypes.object.isRequired,
}

Disk.defaultProps = {
  diskReadIo: {
    isFetching: false,
    data: []
  },
  diskWriteIo: {
    isFetching: false,
    data: []
  }
}

export default injectIntl(Disk, {
  withRef: true,
})
