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
import { Radio } from 'antd'
import './style/TimeControl.less'

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

class TimeControl extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { onChange } = this.props
    return (
      <div id="TimeControl">
        <RadioGroup defaultValue="1" size="large" onChange={onChange}>
          <RadioButton value="1">1小时</RadioButton>
          <RadioButton value="6">6小时</RadioButton>
          <RadioButton value="24">1天</RadioButton>
          <RadioButton value="168">1周</RadioButton>
          <RadioButton value="672">1月</RadioButton>
        </RadioGroup>
      </div>
    )
  }
}

TimeControl.propTypes = {
  onChange: PropTypes.func.isRequired,
}

export default TimeControl