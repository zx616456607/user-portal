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
import { calcuDate } from '../../../common/tools.js'
import './style/AppServiceDetailInfo.less'

class AppServiceRental extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Card id="AppServiceDetailInfo">
        <div className="info">
          <span className="titleSpan">租赁信息</span>
          <div className="starts">
            <p><Icon type="clock-circle-o" /> 开始计费：2016.12.12. 15：50</p>
            <p><Icon type="clock-circle-o" /> 停止计费：2016.12.22. 15：50</p>
            
          </div>
          <div className="dataBox" style={{padding:'0 25px'}}>
            <div className="priceCount">合计价格：<span className="unit">￥60/小时</span></div>
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
                <tr>
                  <td>swd-20</td>
                  <td>2G/6G</td>
                  <td>2</td>
                  <td>50元/小时</td>
                </tr>
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


export default AppServiceRental