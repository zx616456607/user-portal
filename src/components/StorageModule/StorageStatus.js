/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 *  Storage list
 * 
 * v0.1 - 2016-09-22
 * @author BaiYu
 */

import React, { Component, PropTypes } from 'react'
import { Tabs,Card, Menu, Progress ,Button, Icon, Col} from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'

const messages = defineMessages({
  app: {
    id: "StorageBind.bind.app",
    defaultMessage: "应用"
  }
})

class StorageStatus extends Component {
  constructor(props) {
    super(props)
  }
  render(){
    const {formatMessage} = this.props.intl
    return (
      <div className="action-btns">
        <Button type="primary"><Icon type="cloud-upload-o" />上传文件</Button>
        <span className="margin"></span>
        <Button type="ghost"><Icon type="cloud-download-o" />导出文件</Button>
        <div className="status-box">
          <div className="status-list"> 
            <span className="status-icon success"><Icon type="cloud-upload-o" /></span>
            <div className="status-content">
              <div style={{clear:'both'}}>
              <span className="pull-left">上传：absconig (1.01MB)</span>
              <span className="pull-right">2016-09-22 12:15</span>
              </div>
              <div className="ant-col-8 ">
                <Progress percent={50} status="active" showInfo={false} />
              </div>
              <div className="ant-col-4">文件上传中</div>
            </div>

          </div>
        </div>
      </div>
    )
  }
}


StorageStatus.propTypes = {
  intl: PropTypes.object.isRequired
}
  
export default injectIntl(StorageStatus, {
  withRef: true,
})