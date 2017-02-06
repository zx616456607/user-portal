/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Footer of overview
 *
 * v0.1 - 2017-02-06
 * @author Zhangpc
 */

import React, { Component } from 'react'

class Footer extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { TENX_PORTAL_VERSION } = window
    return (
      <div style={{textAlign: 'center', color: "#979797", height: '30px', lineHeight: '30px'}}>
        {TENX_PORTAL_VERSION}
      </div>
    )
  }
}
export default Footer