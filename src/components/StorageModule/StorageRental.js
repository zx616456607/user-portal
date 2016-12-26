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
    const strongSize = this.props.config.storage * this.props.size /1000 /100
    return (
      <div id="StorageRental">
        <div className="info">
          <span className="titleSpan">租赁信息 </span>
          {/*<div className="starts">
            <p><Icon type="clock-circle-o" /> 开始计费：2016.12.12. 15：50</p>
            <p><Icon type="clock-circle-o" /> 停止计费：2016.12.22. 15：50</p>
            
          </div>
          */}
          <div className="dataBox">
            <p><Icon type="pay-circle-o" /> 价格：<span className="unit">{ this.props.config.storage /100}元</span> /（GB*小时）</p>
            <p><Icon type="hdd" /> 大小：<span className="unit">{this.props.size}M</span></p>
          </div>
          <div className="dataBox">
            <div className="priceCount">合计：<span className="blod unit">{(strongSize).toFixed(3)}/小时</span>
            <span className="unit" style={{marginLeft:'15px'}}>(约￥{(strongSize *24*30).toFixed(2)}元/月)</span>
          </div>
          </div>
        </div>
        
      </div>
    )
  }
}

StorageRental.propTypes = {

}


export default StorageRental