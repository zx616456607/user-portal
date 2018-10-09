/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * SecurityGroupDetail Header
 *
 * v0.1 - 2018-07-25
 * @author lvjunfeng
 */

import React from 'react'
import './style/index.less'
import { connect } from 'react-redux'
import { Icon, Button } from 'antd'
import { formatDate } from '../../../../../src/common/tools'
import { browserHistory } from 'react-router'
import detailImg from '../../../../assets/img/SecurityGroup/detailHeader.png'

class DetailHeader extends React.Component {
  render() {
    const { loadData, current } = this.props
    const metadataName = current && current.metadata.name
    const name = current && current.metadata && current.metadata.annotations['policy-name']
    const time = current && current.metadata.creationTimestamp
    return (
      <div className="securityGroupDetailHeader" key="header">
        <div className="left">
          <div className="imgBox">
            <img src={detailImg} alt="详情" />
          </div>
          <div className="nameNStatus">
            <div className="name">安全组名称: { name }</div>
            <div className="status">
              <div style={{ marginRight: 8 }}>创建时间: </div>
              <div>{ formatDate(time) }</div>
            </div>
          </div>
        </div>
        <div className="right">
          <Button
            type="ghost"
            onClick={loadData}>
            <i className="fa fa-refresh" style={{ marginRight: 5 }}/>
            刷新
          </Button>
          <Button
            type="primary"
            onClick={() => browserHistory.push(`/app_manage/security_group/edit/${metadataName}`)}
          >
            <Icon type="edit" style={{ marginRight: 5 }}/>
            修改
          </Button>
        </div>
      </div>
    )
  }
}
export default connect()(DetailHeader)
