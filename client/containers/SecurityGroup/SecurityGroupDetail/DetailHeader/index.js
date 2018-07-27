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

class DetailHeader extends React.Component {
  render() {
    const { loadData, current } = this.props
    const name = current && current.metadata.annotations.policyName
    return (
      <div className="container" key="header">
        <div className="left">
          <div className="imgBox">
            <Icon type="check-circle-o" />
          </div>
          <div className="nameNStatus">
            <div className="name">安全组名称: { name }</div>
            <div className="status">
              <div style={{ marginRight: 8 }}>创建时间: </div>
              <div> "formatDate(createTime)"</div>
            </div>
          </div>
        </div>
        <div className="right">
          <Button
            type="primary"
            // onClick={() => browserHistory.push('/app_manage/security_group/create')}
          >
            <Icon type="edit" style={{ marginRight: 5 }}/>
            修改
          </Button>
          <Button
            type="ghost"
            onClick={loadData}>
            <i className="fa fa-refresh" style={{ marginRight: 5 }}/>
            刷新
          </Button>
        </div>
      </div>
    )
  }
}
// const mapStateToProps = ({ largeScaleTrain: { resObj } }) => (
//   {
//     createTime: resObj && resObj.metadata.creationTimestamp || '',
//   }
// )
export default connect()(DetailHeader)
