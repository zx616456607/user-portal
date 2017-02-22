/* Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppServiceDetailInfo component
 *
 * v0.1 - 2016-09-27
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Card, Spin } from 'antd'
//import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import './style/AppServiceDetailInfo.less'
import { formatDate, cpuFormat, memoryFormat } from '../../../common/tools'
import { ENTERPRISE_MODE } from '../../../../configs/constants'
import { mode } from '../../../../configs/model'

const enterpriseFlag = ENTERPRISE_MODE == mode

export default class AppServiceDetailInfo extends Component {
  constructor(props) {
    super(props)
  }
  getEnvList(service) {
    if(!service) {
      return <div></div>
    }
    const containers = service.spec.template.spec.containers
    const ele = []
    containers.forEach(container => {
      if(container.env) {
        container.env.forEach(env => {
          ele.push(
            <div className="dataBox" key={env.name}>
               <div className="commonTitle">
                 {env.name}
               </div>
               <div className="commonValue">
                {env.value}
               </div>
            </div>
          )
        })
      }
    })
    return ele
  }
  render() {
    const { isFetching, serviceDetail } = this.props
    if (isFetching || !serviceDetail.metadata) {
      return ( <div className="loadingBox">
          <Spin size="large" />
        </div>
      )
    }
    return (
      <Card id="AppServiceDetailInfo">
        <div className="info commonBox">
          <span className="titleSpan">基本信息</span>
          <div className="titleBox">
            <div className="commonTitle">
              名称
          </div>
            <div className="commonTitle">
              镜像名称
          </div>
            <div className="commonTitle">
              创建时间
          </div>
            <div style={{ clear: 'both' }}></div>
          </div>
          <div className="dataBox">
            <div className="commonTitle">
              {serviceDetail.metadata.name}
            </div>
            <div className="commonTitle">
              {serviceDetail.images.join(', ') || '-'}
            </div>
            <div className="commonTitle">
              {formatDate(serviceDetail.metadata.creationTimestamp || '')}
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>
        </div>
        <div className="compose commonBox">
          <span className="titleSpan">资源配置</span>
          <div className="titleBox">
            <div className="commonTitle">
              CPU
          </div>
            <div className="commonTitle">
              内存
          </div>
            <div className="commonTitle">
              系统盘
          </div>
            <div style={{ clear: 'both' }}></div>
          </div>
          <div className="dataBox">
            <div className="commonTitle">
              { cpuFormat(serviceDetail.spec.template.spec.containers[0].resources.requests.memory, serviceDetail.spec.template.spec.containers[0].resources) || '-'}
            </div>
            <div className="commonTitle">
              { memoryFormat(serviceDetail.spec.template.spec.containers[0].resources)}
            </div>
            <div className="commonTitle">
              10G
          </div>
            <div style={{ clear: 'both' }}></div>
          </div>
        </div>
        <div className="environment commonBox">
          <span className="titleSpan">环境变量</span>
          <div className="titleBox">
            <div className="commonTitle">
              变量名
            </div>
            <div className="commonValue">
              变量值
            </div>
          </div>
          {this.getEnvList(serviceDetail)}
        </div>
      </Card>
    )
  }
}

AppServiceDetailInfo.propTypes = {
  //
}
