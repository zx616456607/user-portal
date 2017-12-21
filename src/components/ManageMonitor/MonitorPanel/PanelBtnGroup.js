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
import { Button, DatePicker, Radio, Icon } from 'antd'
import moment from 'moment'
import './style/PanelBtnGroup.less'

const { RangePicker } = DatePicker
const RadioButton = Radio.Button
const RadioGroup = Radio.Group
const btnArr = [{
  key: 'fiveMin',
  text: '近1小时',
}, {
  key: 'threeHour',
  text: '6小时',
}, {
  key: 'today',
  text: '24小时',
}, {
  key: 'yesterday',
  text: '7天',
}, {
  key: 'beforeYes',
  text: '30天',
}]

export default class ApmTimePicker extends React.Component {
  static propTypes = {
    // 时间范围
    value: PropTypes.array,
    // 获取选中的时间范围
    onChange: PropTypes.func,
    // 回调
    onOk: PropTypes.func.isRequired,
  }
  constructor(props) {
    super(props)
    this.toggleTimePicker = this.toggleTimePicker.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onOk = this.onOk.bind(this)
    this.state = {
      value: [],
      isRangeTime: false,
      currentRadio: 'fiveMin',
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
    const time = 'fiveMin'
    if (value && value.length === 2) {
      this.setState({
        isRangeTime: true,
      })
    } else {
      value = this.getTimeArr(time)
      this.changeTimeInterval(time)
    }
    this.onChange(value)
  }
  onOk() {
    const { onOk } = this.props
    /**
     * loadData 点击刷新时的回调
     *
     */
    if (onOk) {
      onOk()
    }
  }
  getTimeArr(time) {
    const now = Date.parse(new Date())
    let startTime
    if (time === 'fiveMin') {
      startTime = now - (5 * 60 * 1000)
    } else if (time === 'threeHour') {
      startTime = now - (3 * 60 * 60 * 1000)
    } else if (time === 'today') {
      startTime = new Date(new Date().setHours(0, 0, 0, 0))
    } else if (time === 'yesterday') {
      startTime = new Date(new Date(new Date()
        .setDate(new Date().getDate() - 1))
        .setHours(0, 0, 0, 0))
        .valueOf()
    } else if (time === 'beforeYes') {
      startTime = new Date(new Date().setDate(new Date().getDate() - 2))
        .setHours(0, 0, 0, 0)
      startTime = new Date(startTime).valueOf()
    }
    return [ moment(startTime), moment(now) ]
  }
  onChange(value) {
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
  handleClick(time) {
    const value = this.getTimeArr(time)
    this.setState({
      currentRadio: time,
    })
    this.onChange(value)
    setTimeout(this.onOk, 0)
    this.changeTimeInterval(time)
  }
  changeTimeInterval(time) {
    clearInterval(this.timeInterval)
    let value = this.getTimeArr(time)
    this.timeInterval = setInterval(() => {
      value = this.getTimeArr(time)
      this.onChange(value)
    }, 1000)
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
  render() {
    const { value, isRangeTime, currentRadio } = this.state
    const { currentPanel, btnGroupFunc } = this.props
    const { openModal, openChartModal } = btnGroupFunc
    return (
      <div className="monitor-timepicker">
        <Button className="addChartBtn" size="large" type="primary" icon="plus" onClick={() => openChartModal(null)}>添加图标</Button>
        <Button size="large" type="ghost"><i className='fa fa-refresh' /> 刷新</Button>
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
                format="YYYY-MM-DD HH:mm"
                placeholder={[ '开始日期', '结束日期' ]}
                value={value}
                onChange={this.onChange}
                onOk={this.onOk}
              />
              :
              <RadioGroup
                size="large"
                onChange={e => this.handleClick(e.target.value)}
                value={currentRadio}
              >
                {
                  btnArr.map(item => (
                    <RadioButton size="large" key={item.key} value={item.key}>{item.text}</RadioButton>
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
