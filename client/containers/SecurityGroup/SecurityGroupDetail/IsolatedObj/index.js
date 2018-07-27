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
import { connect } from 'react-redux'
// import { Icon, Button } from 'antd'

class IsolatedObj extends React.Component {
  render() {
    // const { pipelineInfo, createTime } = this.props
    return (
      <div className="isolateCont" >
        <div>123</div>
        <div>456</div>
        <div>789</div>
        <div>0.0</div>
        <div>www</div>
        <div>www</div>
        <div>www</div>
        <div>ww</div>
        <div>ww</div>
        <div>www</div>
        <div>www</div>
        <div>www</div>
        <div>ww</div>
        <div>ww</div>
      </div>
    )
  }
}
// const mapStateToProps = ({ largeScaleTrain: { resObj } }) => (
//   {
//     createTime: resObj && resObj.metadata.creationTimestamp || '',
//   }
// )
export default connect()(IsolatedObj)
