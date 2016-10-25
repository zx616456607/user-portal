/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Memory metrics
 *
 * v0.1 - 2016-10-25
 * @author ZhaoXueYu
 */

import React, { Component, PropTypes } from 'react'
import ReactEcharts from 'echarts-for-react'
import { TEST_MONITOR_OPTION } from '../../constants'

class Memory extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <ReactEcharts option={TEST_MONITOR_OPTION}/>
    )
  }
}

Memory.propTypes = {
  //
}

export default Memory