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
import { FormattedMessage } from 'react-intl'
import intlMsg from './Intl'
const RadioGroup = Radio.Group;

class TimeControl extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { onChange, setInterval, intervalStatus, style } = this.props
    return (
      <div id="TimeControl" style={style}>
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
          <Radio prefixCls="ant-radio-button" value="1"><FormattedMessage {...intlMsg.last1Hour}/></Radio>
          <Radio prefixCls="ant-radio-button" value="6"><FormattedMessage {...intlMsg.last6Hour}/></Radio>
          <Radio prefixCls="ant-radio-button" value="24"><FormattedMessage {...intlMsg.last24Hour}/></Radio>
          <Radio prefixCls="ant-radio-button" value="168"><FormattedMessage {...intlMsg.last7Day}/></Radio>
          <Radio prefixCls="ant-radio-button" value="720"><FormattedMessage {...intlMsg.last30Day}/></Radio>
        </RadioGroup>
      </div>
    )
  }
}

TimeControl.propTypes = {
  onChange: PropTypes.func.isRequired,
}

export default TimeControl
