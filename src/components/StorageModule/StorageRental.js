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
import { parseAmount } from '../../common/tools.js'
import './style/StorageRental.less'
import { injectIntl, FormattedMessage } from 'react-intl'
import StorageDetailIntl from './StorageDetailIntl'

class StorageRental extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const strongSize = this.props.config.storage * this.props.size /1024
    const storagePrice = parseAmount(this.props.config.storage, 4)
    const hourPrice = parseAmount(strongSize, 4)
    const countPrice = parseAmount(strongSize *24*30, 4)
    return (
      <div id="StorageRental">
        <div className="info">
          <span className="titleSpan"><FormattedMessage {...StorageDetailIntl.LeaseholdInfo}/> </span>
          {/*<div className="starts">
            <p><Icon type="clock-circle-o" /> 开始计费：2016.12.12. 15：50</p>
            <p><Icon type="clock-circle-o" /> 停止计费：2016.12.22. 15：50</p>

          </div>
          */}
          <div className="dataBox">
            <p><Icon type="pay-circle-o" /> <FormattedMessage {...StorageDetailIntl.price}/>：<span className="unit">{ storagePrice.fullAmount }</span> /（GB*<FormattedMessage {...StorageDetailIntl.hour}/>）</p>
            <p><Icon type="hdd" /> <FormattedMessage {...StorageDetailIntl.size}/>：<span className="unit">{this.props.size}Mi</span></p>
          </div>
          <div className="dataBox">
            <div className="priceCount">
              <FormattedMessage {...StorageDetailIntl.count}/>：<span className="unit">{storagePrice.unit == '￥' ? '￥':''}</span><span className="blod unit">{ hourPrice.amount } {storagePrice.unit == '￥' ? '':' T'}/<FormattedMessage {...StorageDetailIntl.hour}/></span>
              <span className="unit" style={{marginLeft:'15px'}}>(<FormattedMessage {...StorageDetailIntl.about}/> { countPrice.fullAmount }/<FormattedMessage {...StorageDetailIntl.month}/>)</span>
            </div>
          </div>
        </div>

      </div>
    )
  }
}

StorageRental.propTypes = {

}


export default injectIntl(StorageRental,{withRef: true})