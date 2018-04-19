/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * Permission overview
 *
 * v0.1 - 2018-04-19
 * @author zhangxuan
 */

import React from 'react'
import { connect } from 'react-redux'
import { Table, Collapse, Button, Row, Col, Popover } from 'antd'
import CheckboxTree from 'react-checkbox-tree';
import { loadAppList } from '../../../../actions/app_manage'
import './style/PermissionOverview.less'
import PermissionTree from './PermissionTree'

const Panel = Collapse.Panel;

class PermissionOverview extends React.Component{

  componentDidMount() {
    const { clusterID, loadAppList } = this.props
    loadAppList(clusterID, { page: 1, size: 10 })
  }

  getPanelHeader = (title) => {
    let titleCn = "";
    switch(title){
      case "application":
        titleCn = "应用";
        break;
      case "configuration":
        titleCn = "配置";
        break;
      case "container":
        titleCn = "容器";
        break;
      case "service":
        titleCn = "服务";
        break;
      case "volume":
        titleCn = "存储";
        break;
    }
    return (
      <div className="headerBox">
        <Row className="configBoxHeader" key="header">
          <Col span={4} className="headerLeft" key="left">
            <div className="line"></div>
            <span className="title">{titleCn}</span>
          </Col>
          <Col span={20} key="right">
            <div className="desc"></div>
          </Col>
        </Row>
      </div>
    )
  }

  renderPermissionModal = (type, value, record) => {

    return(
      <PermissionTree
        {...{type, value, record}}
      />
    )
  }

  renderOverview = () => {
    const { permissionOverview, openPermissionModal } = this.props
    const { application, service, container, volume, configuration } = permissionOverview
    const overviewList = []
    for(let [key, value] of Object.entries(permissionOverview)) {
      const permissionCount = value.acls && value.acls.resourceList ? value.acls.resourceList.length : 0
      const columns = [{
          title: '服务名称',
          dataIndex: 'name',
          width: 100,
        },
        {
          title: '授权操作',
          width: 100,
          render: (_, record) => {
            return (
              <div>
                <a className="">删除授权</a>
                <Popover placement="right" trigger="click" content={this.renderPermissionModal(key, value, record)}>
                  <a className="rightA">管理权限（{permissionCount}）</a>
                </Popover>
                </div>
            )
          },
        }]
      if (key !== 'isFetching') {
        overviewList.push(
          <Collapse key={key}>
            <Panel header={this.getPanelHeader(key)}>
              <div className='btnContainer'>
                <Button type="primary" size="large" icon="plus" onClick={() => openPermissionModal(key)}>编辑权限</Button>
              </div>
              <div className='reset_antd_table_header'>
                <Table columns={columns} dataSource={value.acls.resourceList} />
              </div>
            </Panel>
          </Collapse>
        )
      }
    }
    return overviewList
  }

  render() {
    return(
      <div>{this.renderOverview()}</div>
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
    appList,
    permissionOverview
  }
}

export default connect(mapStateToProps,{
  loadAppList
})(PermissionOverview)