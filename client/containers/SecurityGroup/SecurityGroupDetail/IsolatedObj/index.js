/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * Isolated object
 *
 * v0.1 - 2018-07-25
 * @author lvjunfeng
 */

import React from 'react'
import './style/index.less'

class IsolatedObj extends React.Component {
  render() {
    const { current } = this.props
    const serviceList = current && current.spec.podSelector.matchExpressions[0].values || []
    const isolatedService = serviceList.map(item => {
      return <div key={item}>{item}</div>
    })
    return (
      <div className="isolateCont" >
        { isolatedService }
      </div>
    )
  }
}
export default IsolatedObj
