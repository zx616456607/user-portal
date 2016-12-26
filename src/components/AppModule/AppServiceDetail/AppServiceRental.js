/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppService rental component
 *
 * v0.1 - 2016-12-22
 * @author Baiyu
 */
import React, { Component, PropTypes } from 'react'
import { Card, Icon } from 'antd'
import { connect } from 'react-redux'
import { calcuDate } from '../../../common/tools.js'
import './style/AppServiceDetailInfo.less'

class AppServiceRental extends Component {
  constructor(props) {
    super(props);
  }
  formetCpuMemory(memory) {
    if(Boolean(memory)) {
      let newMemory = parseInt(memory.replace('Mi','').replace('Gi'))
      switch(newMemory) {
        case 1:
          return '1CPU（共享）/256M';
        case 2:
          return '1CPU（共享）/512M';
        case 4:
          return '1CPU/1G';
        case 8:
          return '1CPU/2G';
        case 16:
          return '1CPU/4G';
        case 32:
          return '2CPU/8G';
        case 256:
          return '1CPU（共享）/256M';
        case 512:
          return '1CPU（共享）/512M';
      }
    } else {
      return '-';
    }
  }
  formetPrice(size) {
    const { resourcePrice } = this.props
    switch(size) {
      case '256Mi':
        return resourcePrice['1x'] /100
      case '512Mi':
        return resourcePrice['2x'] /100
      case '1GB':
        return resourcePrice['4x'] /100
      case '2GB':
        return resourcePrice['8x'] /100
      case '4GB':
        return resourcePrice['16x'] /100
      case '8Gb':
        return resourcePrice['32x'] /100
      default:
        return resourcePrice['1x'] /100;
    }
  }
  render() {
    const { serviceDetail } = this.props
    const detaContainer = this.props.serviceDetail.spec.template.spec.containers[0]
    const dataRow = this.props.serviceDetail.spec.template.spec.containers.map((list, index)=> {
        return(
          <tr key={index}>
            <td>{this.props.serviceName}</td>
            <td>{this.formetCpuMemory(list.resources.requests.memory)}</td>
            <td>{serviceDetail.spec.replicas}</td>
            <td>{this.formetPrice(list.resources.requests.memory) }元/小时</td>
          </tr>
        )
    })
    return (
      <Card id="AppServiceDetailInfo">
        <div className="info">
          <span className="titleSpan">租赁信息</span>
          {/*<div className="starts">
            <p><Icon type="clock-circle-o" /> 开始计费：2016.12.12. 15：50</p>
            <p><Icon type="clock-circle-o" /> 停止计费：2016.12.22. 15：50</p>
            
          </div>
          */}
          <div className="dataBox" style={{padding:'0 25px'}}>
            <div className="priceCount">合计价格：<span className="unit">￥{this.formetPrice(detaContainer.resources.requests.memory) * (serviceDetail.spec.replicas) }/小时</span></div>
            <table className="table">
              <thead>
                <tr>
                  <th>名称</th>
                  <th>计算（CPU/内存）</th>
                  <th>数量</th>
                  <th>价格</th>
                </tr>
              </thead>
              <tbody>
                { dataRow }
              </tbody>
            </table>
          </div>
        </div>
        
      </Card>
    )
  }
}

AppServiceRental.propTypes = {

}

function mapStateToProps(state) {
   const { cluster } = state.entities.current
   return {
     resourcePrice: cluster.resourcePrice
   }
}

export default connect(mapStateToProps)(AppServiceRental)