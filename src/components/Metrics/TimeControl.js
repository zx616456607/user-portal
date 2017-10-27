/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * TimeControl for Metrics
 *
 * v0.1 - 2016-10-25
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import { Radio, Button } from 'antd'
import './style/TimeControl.less'

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

class TimeControl extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { onChange, setInterval, intervalStatus } = this.props
    return (
      <div id="TimeControl">
        {
          /*!intervalStatus ? [
            <Button type="ghost" size="large" style={{ marginRight: '7px' }} onClick={setInterval}>
              <span>自动刷新</span>
            </Button>
          ] : [
            <Button type="ghost" size="large" style={{ marginRight: '7px' }} onClick={setInterval}>
              <span><i className='fa fa-stop' style={{ marginRight: '7px' }} />停止</span>
            </Button>
          ]*/
        }
        <RadioGroup defaultValue="1" size="large" onChange={onChange}>
          <RadioButton value="1">最近1小时</RadioButton>
          <RadioButton value="6">最近6小时</RadioButton>
          <RadioButton value="24">最近24小时</RadioButton>
          <RadioButton value="168">最近7天</RadioButton>
          <RadioButton value="672">最近30天</RadioButton>
        </RadioGroup>
      </div>
    )
  }
}

TimeControl.propTypes = {
  onChange: PropTypes.func.isRequired,
}

export default TimeControl