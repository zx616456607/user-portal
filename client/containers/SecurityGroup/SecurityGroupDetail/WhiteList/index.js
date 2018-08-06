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
import { parseNetworkPolicy } from '../../../../../kubernetes/objects/securityGroup'

class DetailWhiteList extends React.Component {
  render() {
    const { type, current } = this.props
    const isIngress = type === 'ingress' && true || false
    const result = parseNetworkPolicy(current)
    const { egress, ingress } = result
    const detailArr = isIngress ? ingress : egress
    const isolateObj = detailArr && detailArr.map((item, k) => {
      switch (item.type) {
        case 'cidr':
          return <div className="lineRow" key={k}>
            <div className="lineColType">CIDR</div>
            <div className="lineColLocal">{item.cidr}</div>
            除去
            <div className="lineColServer">{item.except || '无'} </div>
          </div>
        case 'service':
          return <div className="lineRow" key={k}>
            <div className="lineColType">服务名称</div>
            <div className="lineColLocal">{item.serviceName}</div>
          </div>
        case 'haproxy':
          return <div className="lineRow" key={k}>
            <div className="lineColType">集群网络出口</div>
            {/* <div className="lineColLocal">{item.haproxy}</div>
            <div className="lineColServer">{item.except || '无'} </div> */}
          </div>
        case 'ingress':
          return <div className="lineRow" key={k}>
            <div className="lineColType">应用负载均衡</div>
            <div className="lineColLocal">{item.ingressId}</div>
          </div>
        case 'namespace':
          return <div className="lineRow" key={k}>
            <div className="lineColType">命名空间</div>
            <div className="lineColLocal">{item.namespace}</div>
          </div>
        default:
          return null
      }
    })
    return (
      <div id="whiteList" >
        <div className="listLeft">
          <p>{ isIngress ? 'ingress 来源' : 'egress 目标' } 白名单</p>
          <p>（{ isIngress ? '入站' : '出站' }）</p>
        </div>
        <div className="listRight">
          { isolateObj || <div className="lineRow" key={type}>无</div> }
        </div>
      </div>
    )
  }
}

export default DetailWhiteList
