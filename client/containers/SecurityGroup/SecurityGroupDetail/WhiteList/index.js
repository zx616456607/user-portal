/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * Detail WhiteList
 *
 * v0.1 - 2018-07-26
 * @author lvjunfeng
 */
import React from 'react'
import './style/index.less'

class DetailWhiteList extends React.Component {
  render() {
    const isIngress = this.props.type === 'ingress' && true || false
    const isolateObj = [{ type: 'CIDR', name: '3.3.3.3', server: 'aaa,bbb' },
      { type: 'CIDR', name: '3.3.3.3', server: 'aaa,bbb' }].map((item, k) => {
      return <div className="lineRow" key={k}>
        <div className="lineColType">{item.type}</div>
        <div className="lineColLocal">{item.name}</div>
        <div className="lineColServer">{item.server}</div>
      </div>
    })
    return (
      <div id="whiteList" >
        <div className="listLeft">
          <p>{ isIngress ? 'ingress 来源' : 'egress 目标' } 白名单</p>
          <p>（{ isIngress ? '入站' : '出站' }）</p>
        </div>
        <div className="listRight">
          { isolateObj }
        </div>
      </div>
    )
  }
}

export default DetailWhiteList
