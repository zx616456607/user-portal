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
import { Icon } from 'antd'
// import { calcuDate } from '../../../common/tools.js'
import './style/StorageRental.less'

class StorageRental extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="StorageRental">
        <div className="info">
          <span className="titleSpan">租赁信息 </span>
          <div className="starts">
            <p><Icon type="clock-circle-o" /> 开始计费：2016.12.12. 15：50</p>
            <p><Icon type="clock-circle-o" /> 停止计费：2016.12.22. 15：50</p>
            
          </div>
          <div className="dataBox">
            <p><Icon type="pay-circle-o" /> 价格：<span className="unit">123元</span>/（GB*小时）</p>
            <p><Icon type="hdd" /> 大小：<span className="unit">200M</span></p>
          </div>
          <div className="dataBox">
            <div className="priceCount">合计：<span className="unit">60/小时</span><span>(含￥125元/月)</span></div>
          </div>
        </div>
        
      </div>
    )
  }
}

StorageRental.propTypes = {

}


export default StorageRental