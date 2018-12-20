/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 * ClusterSysServiceManage Container
 *
 * @author Songsz
 * @date 2018-12-20
 *
*/

import React from 'react'
import { browserHistory, withRouter } from 'react-router'

@withRouter
class ClusterSysServiceManageDetail extends React.PureComponent {
  render() {
    return (
      <div onClick={() => browserHistory.replace(`/cluster?clusterID=${this.props.location.query.clusterID}&from=sysServiceManageDetail`)}>
        detail
      </div>
    )
  }
}

export default ClusterSysServiceManageDetail
