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
import { Table, Collapse, Button, Row, Col, Popover, Modal } from 'antd'
import CheckboxTree from 'react-checkbox-tree';
import intersection from 'lodash/intersection'
import xor from 'lodash/xor'
import isEmpty from 'lodash/isEmpty'
import classNames from 'classnames'
import { loadAppList, loadContainerList } from '../../../../actions/app_manage'
import { loadAllServices } from '../../../../actions/services'
import { loadStorageList } from '../../../../actions/storage'
import { DEFAULT_IMAGE_POOL } from '../../../../constants'
import { loadConfigGroup } from '../../../../actions/configs'
import { getSecrets } from '../../../../actions/secrets'
import { deletePermissionControl, setPermission } from '../../../../actions/permission'
import { wrapManageList } from '../../../../actions/app_center'
import './style/PermissionOverview.less'
import PermissionTree from './PermissionTree'
import Notification from '../../../Notification'

const PRIVATE_QUERY = {
  storagetype: 'ceph',
  srtype: 'private',
}

const SHARE_QUERY = {
  storagetype: 'nfs',
  srtype: 'share',
}

const HOST_QUERY = {
  storagetype: 'host',
  srtype: 'host'
}

let notify = new Notification()

const Panel = Collapse.Panel;

class PermissionOverview extends React.Component{

  state = {}

  componentDidMount() {
    const {
      clusterID, loadAppList, loadAllServices, loadContainerList,
      loadStorageList, loadConfigGroup, getSecrets, project, wrapManageList
    } = this.props
    let storageList = []
    const headers = { project }
    loadAppList(clusterID, { page: 1, size: 100, headers })
    loadAllServices(clusterID, { pageIndex: 1, pageSize: 100, headers })
    loadContainerList(clusterID, { page: 1, size: 100, headers })
    loadConfigGroup(clusterID, headers)
    getSecrets(clusterID, { headers })

    const storageReqArr = [
      loadStorageList(DEFAULT_IMAGE_POOL, clusterID, Object.assign({}, PRIVATE_QUERY, { headers })),
      loadStorageList(DEFAULT_IMAGE_POOL, clusterID, Object.assign({}, SHARE_QUERY, { headers })),
      loadStorageList(DEFAULT_IMAGE_POOL, clusterID, Object.assign({}, HOST_QUERY, { headers }))
    ]
    Promise.all(storageReqArr).then(storageResult => {
      storageResult.forEach(res => {
        if (res.response.result.data) {
          storageList = storageList.concat(res.response.result.data)
        }
      })
      this.setState({
        storageList
      })
    })

    wrapManageList({ from: 0, size: 100, headers })
  }
  getColumnsTitle = (title) => {
    let titleCn;
    switch(title){
      case "application":
        titleCn = "应用";
        break;
      case "configuration":
        titleCn = "普通配置";
        break;
      case "secret":
        titleCn = "加密配置";
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
      case "applicationPackage":
        titleCn = "应用包管理";
        break;
    }
    return titleCn;
  }
  getTitle = (title) => {
    let titleCn;
    switch(title){
      case "application":
        titleCn = "应用";
        break;
      case "configuration":
        titleCn = "服务配置 | 普通配置";
        break;
      case "secret":
        titleCn = "服务配置 | 加密配置";
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
      case "applicationPackage":
        titleCn = "应用包管理";
        break;
    }
    return titleCn;
  }
  getPanelHeader = (title) => {
    let titleCn = this.getTitle(title);
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

  handleConfirm = async (currentPermission, record, oldChecked) => {
    const { deletePermissionControl, setPermission, roleId, clusterID, callback } = this.props
    const { checked } = this.state

    const filterName = record.name

    const diff = xor(checked, oldChecked)
    const add = intersection(checked, diff)
    const del = intersection(oldChecked, diff)

    const deletePermission = currentPermission.filter(item => del.includes(String(item.permissionId)))
    const delIds = deletePermission.map(item => item.id)

    let addBody

    this.setState({
      confirmLoading: true
    })

    notify.spin('操作中')

    if (!isEmpty(add)) {
      addBody = add.map(item => {
        return {
          permissionId: Number(item),
          roleId,
          clusterID,
          filterType: record.isReg ? 'regex' : 'fixed',
          policyType: 'white',
          filter: filterName
        }
      })
    }
    if (!isEmpty(add) && !isEmpty(delIds)) {
      const setArray = [setPermission(addBody), deletePermissionControl(delIds.join(','))]
      const result = await setArray
      result.map(res => {
        if (res.error) {
          notify.close()
          notify.warn('操作失败')
          this.setState({
            confirmLoading: false,
            [`visible-${record.name}`]: false
          })
          return
        }
        notify.close()
        notify.success('操作成功')
      })

      callback && callback()

      this.setState({
        confirmLoading: false,
        [`visible-${record.name}`]: false
      })
    } else if (!isEmpty(add) && isEmpty(delIds)) {
      const result = await setPermission(addBody)
      if (result.error) {
        notify.close()
        notify.warn('操作失败')
        this.setState({
          confirmLoading: false,
          [`visible-${record.name}`]: false
        })
        return
      }

      notify.close()
      notify.success('操作成功')
      callback && callback()

      this.setState({
        confirmLoading: false,
        [`visible-${record.name}`]: false
      })
    } else if (isEmpty(add) && !isEmpty(delIds)) {
      const result = await deletePermissionControl(delIds.join(','))
      if (result.error) {
        notify.close()
        notify.warn('操作失败')
        this.setState({
          confirmLoading: false,
          [`visible-${record.name}`]: false
        })
        return
      }
      notify.close()
      notify.success('操作成功')

      callback && callback()

      this.setState({
        confirmLoading: false,
        [`visible-${record.name}`]: false
      })
    } else {
      this.setState({
        confirmLoading: false,
        [`visible-${record.name}`]: false
      })
    }
  }

  deletePermission = currentPermission => {
    const delIds = currentPermission.map(item => item.id)

    this.setState({
      delIds,
      deleteVisible: true
    })
  }

  deleteConfirm = async () => {
    const { deletePermissionControl, callback } = this.props
    const { delIds } = this.state
    const result = await deletePermissionControl(delIds.join(','))
    this.setState({
      deleteConfirmLoading: true
    })
    if (result.error) {
      this.setState({
        deleteConfirmLoading: false
      })
      notify.warn('删除授权失败')
      return
    }

    callback && callback()
    notify.success('删除授权成功')
    this.setState({
      deleteConfirmLoading: false,
      deleteVisible: false
    })
  }

  renderPermissionModal = (type, value, record) => {
    const { confirmLoading, checked } = this.state
    let currentPermission
    let oldChecked
    if (!record.isReg) {
      currentPermission = value.acls.fixed[record.name]
      oldChecked = currentPermission.map(item => String(item.permissionId))
    } else {
      currentPermission = value.acls.resourceList.filter(item => item.name === record.name)[0].permissionList
      oldChecked = currentPermission.map(item => String(item.permissionId))
    }

    const total = Object.keys(value.operations).length

    return(
      <div className="permissionModal">
        <Row className="permissionHeader" type="flex" align="middle" justify="space-around">
          <Col span={12}>共 {total} 个</Col>
          <Col span={12}>已选 <span className="themeColor">{checked && checked.length}</span> 个</Col>
        </Row>
        {
          this.state[`visible-${record.name}`] &&
          <PermissionTree
            {...{type, value, record}}
            onChange={checked => this.setState({checked})}
          />
        }
        <Row  className="permissionFooter" type="flex" align="middle" justify="space-around">
          <Col span={12}><Button type="ghost" onClick={() => this.setState({[`visible-${record.name}`]: false})}>取消</Button></Col>
          <Col span={12}><Button type="primary" loading={confirmLoading} onClick={() => this.handleConfirm(currentPermission, record, oldChecked)}>保存</Button></Col>
        </Row>
      </div>
    )

  }

  renderOverview = () => {
    const { storageList } = this.state
    const { permissionOverview, openPermissionModal, appList, allServices, containerList, allConfig, pkgs, secretList } = this.props
    const { application, service, container, volume, configuration, applicationPackage, secret } = permissionOverview
    const overviewList = []

    for(let [key, value] of Object.entries(permissionOverview)) {
      if (key === 'isFetching') {
        continue
      }
      let _that = this;
      const columns = [{
        title: _that.getColumnsTitle(key) + "名称",
        dataIndex: 'name',
        width: '50%',
        render: (text, record) =>{
          let existed = true
          switch(key) {
            case 'application':
              existed = appList.some(item => item.name === record.name)
              break;
            case 'service':
              existed = allServices.some(item => item.metadata.name === record.name)
              break;
            case 'volume':
              existed = storageList.some(item => item.name === record.name)
              break;
            case 'container':
              existed = containerList.some(item => item.metadata.name === record.name)
              break;
            case 'configuration':
              existed = allConfig.some(item => item.name === record.name)
              break;
            case 'applicationPackage':
              existed = pkgs.some(item => item.fileName === record.name)
              break;
            case 'secret':
              existed = secretList.some(item => item.name === record.name)
              break;
            default:
              break;
          }
          return (
            record.isReg ? <div><span className="regText" style={{ backgroundColor: '#eef1f6'}}>正则表达式</span>{text}</div>
            :
            <span className={classNames({'deleteLine': !existed})}>{text}</span>
          )
        }

      },
      {
        title: '授权操作',
        width: '50%',
        render: (_, record) => {
          let currentPermission = value.acls.fixed[record.name]
          if (record.isReg) {
            currentPermission = value.acls.resourceList.filter(item => item.name === record.name)[0].permissionList
          }

          return (
            <div>
              <Popover placement="right" trigger="click"
                visible={this.state[`visible-${record.name}`]}
                onVisibleChange={visible => this.setState({[`visible-${record.name}`]: visible})}
                content={this.renderPermissionModal(key, value, record)}>
                <Button type="primary" className="controlBtn">管理权限（{record.permissionList.length || 0}）</Button>
              </Popover>
              <Button type="ghost" onClick={() => this.deletePermission(currentPermission)}>删除授权</Button>
            </div>
          )
        },
      }]
      overviewList.push(
        <Collapse key={key}>
          <Panel header={this.getPanelHeader(key)}>
            <div className='btnContainer'>
              <Button type="primary" size="large" icon="plus" onClick={() => openPermissionModal(key)}>编辑权限</Button>
            </div>
            <div className='reset_antd_table_header'>
              <Table
                className="permissionTable"
                columns={columns}
                dataSource={value.acls.resourceList}
                scroll={{ y: 600 }}
                pagination={false}
              />
            </div>
          </Panel>
        </Collapse>
      )
    }
    return overviewList
  }

  render() {
    const { deleteVisible, deleteConfirmLoading } = this.state

    return(
      <div className="permissionOverview">
        {this.renderOverview()}
        <Modal
          title="删除授权"
          visible={deleteVisible}
          confirmLoading={deleteConfirmLoading}
          onCancel={_ => this.setState({deleteVisible: false})}
          onOk={this.deleteConfirm}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}/>
            该资源将对角色内成员不再可见，确认删除该授权？
          </div>
        </Modal>
      </div>
    )
  }
}

const mapStateToProps = (state, props) => {
  const { entities, apps, role, services, containers, configReducers, secrets, images } = state
  const { clusterID } = props
  const { appItems } = apps
  const { appList } = appItems[clusterID] || { appList: []}
  const { permissionOverview } = role
  const { serviceList } = services
  const { services: allServices } = serviceList
  const { containerItems } = containers
  const { containerList } = containerItems[clusterID] || { containerList: [] }
  const { configGroupList } = configReducers
  const { configGroup } = configGroupList[clusterID] || { configGroup: [] }
  const { list } = secrets
  const { data: secretList } = list[clusterID] || { data: [] }

  const { wrapList } = images
  const { result } = wrapList || { result: {} }
  const { data: pkgData } = result || { data: [] }
  const { pkgs } = pkgData || { pkgs: [] }

  return {
    appList,
    permissionOverview,
    allServices,
    containerList,
    allConfig: configGroup,
    secretList,
    pkgs
  }
}

export default connect(mapStateToProps,{
  loadAppList,
  deletePermissionControl,
  setPermission,
  loadAllServices,
  loadContainerList,
  loadStorageList,
  loadConfigGroup,
  getSecrets,
  wrapManageList
})(PermissionOverview)