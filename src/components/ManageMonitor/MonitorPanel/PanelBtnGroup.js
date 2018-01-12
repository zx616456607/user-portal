/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Monitor panel btn group
 *
 * 2017-12-19
 * @author zhangxuan
 */

import React, { PropTypes } from 'react'
import { Button, DatePicker, Radio } from 'antd'
import './style/PanelBtnGroup.less'
import { UPDATE_INTERVAL } from '../../../constants'
import { formatDate } from "../../../common/tools"

const { RangePicker } = DatePicker
const RadioButton = Radio.Button
const RadioGroup = Radio.Group
const btnArr = [{
  key: 'oneHour',
  text: '近1小时',
}, {
  key: 'sixHour',
  text: '6小时',
}, {
  key: 'yesterday',
  text: '24小时',
}, {
  key: 'sevenDays',
  text: '7天',
}, {
  key: 'oneMonth',
  text: '30天',
}]

export default class PanelBtnGroup extends React.Component {
  static propTypes = {
    // 时间范围
    value: PropTypes.array,
    // 获取选中的时间范围
    onChange: PropTypes.func,
  }
  constructor() {
    super()
    this.toggleTimePicker = this.toggleTimePicker.bind(this)
    this.rangePickerChange = this.rangePickerChange.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.refreshMetric = this.refreshMetric.bind(this)
    this.state = {
      value: [],
      isRangeTime: false,
      currentRadio: 'oneHour',
    }
  }
  componentDidMount() {
    const { value } = this.props
    this.setDefaultTime(value)
  }
  componentWillReceiveProps(nextProps) {
    /**
     * 设置时间范围
     *
     */
    const { value } = nextProps
    if (value && (value[0] !== this.props.value[0] || value[1] !== this.props.value[1])) {
      this.setState({
        value,
      })
    }
  }
  componentWillUnmount() {
    clearInterval(this.timeInterval)
  }
  setDefaultTime(value) {
    const time = 'oneHour'
    value = this.getTimeArr(time)
    this.changeTimeInterval(time)
    this.rangePickerChange(value)
  }
  getTimeArr(time) {
    const now = Date.parse(new Date())
    let startTime
    if (time === 'oneHour') {
      startTime = now - (60 * 60 * 1000)
    } else if (time === 'sixHour') {
      startTime = now - (6 * 60 * 60 * 1000)
    } else if (time === 'yesterday') {
      startTime = now - (24 * 60 * 60 * 1000)
    } else if (time === 'sevenDays') {
      startTime = now - (7 * 24 * 60 * 60 * 1000)
    } else {
      startTime = now - (30 * 24 * 60 * 60 * 1000)
    }
    return [ formatDate(startTime), formatDate(now) ]
  }
  rangePickerChange(value) {
    const { onChange } = this.props
    this.setState({ value })
    /**
     * getTimeRange 获取时间范围
     *
     * @param {array} [开始时间，结束时间]
     */
    if (onChange) {
      onChange(value)
    }
  }
  handleClick(e) {
    const time = e.target.value
    const value = this.getTimeArr(time)
    this.setState({
      currentRadio: time,
    })
    this.rangePickerChange(value)
    this.changeTimeInterval(time)
  }
  changeTimeInterval(time) {
    clearInterval(this.timeInterval)
    let value = this.getTimeArr(time)
    this.timeInterval = setInterval(() => {
      value = this.getTimeArr(time)
      this.rangePickerChange(value)
    }, UPDATE_INTERVAL)
  }
  toggleTimePicker() {
    const { isRangeTime } = this.state
    if (!isRangeTime) {
      clearInterval(this.timeInterval)
      this.setState({
        currentRadio: null,
      })
    }
    this.setState({ isRangeTime: !isRangeTime })
  }
  
  refreshMetric() {
    const { getChartList, activeKey, clusterID } = this.props
    getChartList(clusterID, {
      panel_id: activeKey
    })
  }
  render() {
    const { value, isRangeTime, currentRadio } = this.state
    const { currentPanel, openModal, openChartModal } = this.props
    return (
      <div className="monitor-timepicker">
        <Button className="addChartBtn" size="large" type="primary" icon="plus" onClick={() => openChartModal(currentPanel.iD, null)}>添加图表</Button>
        <Button size="large" type="ghost" onClick={this.refreshMetric}><i className='fa fa-refresh' /> 刷新</Button>
        <div className="right-part">
          <Button
            className="type-change-btn"
            type="ghost"
            onClick={this.toggleTimePicker}
            icon="calendar"
            size="large"
          >
            自定义日期
          </Button>
          {
            isRangeTime ?
              <RangePicker
                key="timePicker"
                size="large"
                showTime={{ format: 'HH:mm' }}
                format="yyyy-MM-dd HH:mm"
                placeholder={[ '开始日期', '结束日期' ]}
                value={value}
                onChange={this.rangePickerChange}
              />
              :
              <RadioGroup
                size="large"
                onChange={this.handleClick}
                value={currentRadio}
              >
                {
                  btnArr.map(item => (
                    <RadioButton key={item.key} value={item.key}>{item.text}</RadioButton>
                  ))
                }
              </RadioGroup>
          }
          <Button className="setting" type="ghost" size="large" icon="setting" onClick={() => openModal(currentPanel)}/>
        </div>
      </div>
    )
  }
}
