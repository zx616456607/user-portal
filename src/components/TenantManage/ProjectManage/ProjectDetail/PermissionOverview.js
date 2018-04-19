/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * Permission overview
 *
 * v0.1 - 2018-04-18
 * @author zhangxuan
 */

import React from 'react'
import { connect } from 'react-redux'
import { Table, Collapse } from 'antd'
import { loadAppList } from '../../../../actions/app_manage'

const Panel = Collapse.Panel;

class PermissionOverview extends React.Component{
  componentDidMount() {
    const { clusterID, loadAppList } = this.props
    loadAppList(clusterID, { page: 1, size: 10 })
  }
  render() {
    return(
      <div>overview</div>
    )
  }
}

const mapStateToProps = state => {
  const { entities, apps, role } = state
  const { cluster } = entities.current
  const { clusterID } = cluster
  const { appItems } = apps
  const { appList, isFetching, total } = appItems[clusterID] || { appList: []}
  const { permissionOverview } = role
  return {
    clusterID,
    appList,
    permissionOverview
  }
}

export default connect(mapStateToProps,{
  loadAppList
})(PermissionOverview)