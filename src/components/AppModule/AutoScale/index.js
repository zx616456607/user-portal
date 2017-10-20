/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AutoScaleList
 *
 * v0.1 - 2017-09-19
 * @author zhangxuan
 */

import React from 'react'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { Button, Table, Menu, Dropdown, Icon, Modal } from 'antd'
import {
  loadAutoScaleList, deleteAutoScale, updateAutoScale,
  updateAutoScaleStatus
} from '../../../actions/services'
import './style/index.less'
import CommonSearchInput from '../../CommonSearchInput'
import AutoScaleModal from './AutoScaleModal'
import classNames from 'classnames'
import Notification from '../../Notification'

class AutoScale extends React.Component {
  constructor() {
    super()
    this.state = {
      scaleModal: false,
      scaleList: [],
      currentPage: 1,
      searchValue: '',
      tableLoading: false,
      selectedRowKeys: [],
      existServices: []
    }
  }
  componentWillMount() {
    const { clusterID } = this.props
    this.loadData(clusterID, 1)
  }
  componentWillReceiveProps(nextProps) {
    const { clusterID: newClusterID, spaceName: newSpaceName } = nextProps
    const { clusterID: oldClusterID, spaceName: oldSpaceName } = this.props
    if (newClusterID !== oldClusterID) {
      this.loadData(newClusterID, 1)
    }
  }
  loadData = (clusterID, page, name) => {
    const { loadAutoScaleList } = this.props
    let query = {
      page: page,
      size: 10
    }
    if (name) {
      query = Object.assign(query, { serviceName: name })
    }
    this.setState({
      tableLoading: true
    })
    loadAutoScaleList(clusterID, query, {
      success: {
        func: res => {
          let scaleList = res.data
          scaleList = Object.values(scaleList)
          let existServices = []
          scaleList.forEach(item => {
            item = Object.assign(item, { key: item.metadata.name })
            existServices.push(item.metadata.name)
          })
          this.setState({
            scaleList,
            totalCount: res.totalCount,
            tableLoading: false,
            existServices,
          })
        },
        isAsync: true
      },
      failed: {
        func: () => {
          this.setState({
            scaleList: [],
            totalCount: 0,
            tableLoading: false,
            existServices: []
          })
        }
      }
    })
  }
  handleButtonClick = (e, record) => {
    e.stopPropagation()
    const { strategyName } = record.metadata.labels
    const { metadata, spec } = record
    const serviceName = metadata.name
    const alert_strategy = metadata.annotations.alertStrategy
    const alert_group = metadata.annotations.alertgroupId
    const { status } = metadata.annotations
    const { maxReplicas: max, minReplicas: min, metrics } = spec
    let memory
    let cpu
    metrics.forEach(item => {
      if (item.resource.name === 'memory') {
        memory = item.resource.targetAverageUtilization
      } else if (item.resource.name === 'cpu') {
        cpu = item.resource.targetAverageUtilization
      }
    })
    const scaleDetail = {
      serviceName,
      strategyName,
      alert_strategy,
      alert_group,
      memory,
      cpu,
      max,
      min,
      type: status === 'RUN' ? 1 : 0
    }
    this.setState({
      scaleModal: true,
      scaleDetail,
      create: true,
      reuse: true
    })
  }
  handleMenuClick = (e, record) => {
    const { clusterID, updateAutoScale } = this.props
    const { strategyName } = record.metadata.labels
    const notify = new Notification()
    const { metadata, spec } = record
    const serviceName = metadata.name
    const alert_strategy = metadata.annotations.alertStrategy
    const alert_group = metadata.annotations.alertgroupId
    const { status } = metadata.annotations
    const { maxReplicas: max, minReplicas: min, metrics } = spec
    let memory
    let cpu
    metrics.forEach(item => {
      if (item.resource.name === 'memory') {
        memory = item.resource.targetAverageUtilization
      } else if (item.resource.name === 'cpu') {
        cpu = item.resource.targetAverageUtilization
      }
    })
    const body = {
      scale_strategy_name: strategyName,
      alert_strategy,
      alert_group,
      memory,
      cpu,
      max,
      min,
    }
    if (e.key === 'delete') {
      this.setState({
        selectedRowKeys: [serviceName],
        deleteModal: true
      })
    } else if (e.key === 'start' || e.key === 'stop') {
      let opt = Object.assign(body, {type: e.key === 'start' ? 1 : 0, operationType: 'update'})
      const mesSpin = e.key === 'start' ? '启用中' : '停用中'
      notify.spin(mesSpin)
      updateAutoScale(clusterID, serviceName, opt, {
        success: {
          func: () => {
            const mesSuc = e.key === 'start' ? '启用成功' : '停用成功'
            notify.close()
            notify.success(mesSuc)
            this.loadData(clusterID, 1)
          },
          isAsync: true
        },
        failed: {
          func: () => {
            const mesErr = e.key === 'start' ? '启用失败' : '停用失败'
            notify.close()
            notify.error(mesErr)
          }
        }
      })
    } else if (e.key === 'edit') {
      let scaleDetail = Object.assign(body, { type: status === 'RUN' ? 1 : 0, }, { serviceName })
      this.setState({
        scaleModal: true,
        scaleDetail,
      })
    }
  }
  emailSendType = type => {
    switch (type) {
      case 'SendEmailWhenScale':
        return '伸缩时发送邮件'
      break
      case 'SendEmailWhenScaleUp':
        return '扩展时发送邮件'
      break
      case 'SendEmailWHenScaleDown':
        return '收缩时发送邮件'
      case 'SendNoEmail':
        return '不发送邮件'
      break
    }
  }
  formatMetrics = record => {
    let str = ''
    record && record.length && record.forEach(item => {
      if (item.resource.name === 'memory') {
        str += `内存 ${item.resource.targetAverageUtilization}%;`
      } else if (item.resource.name === 'cpu') {
        str += `CPU ${item.resource.targetAverageUtilization}%`
      }
    })
    return str
  }
  scaleStatus = text => {
    return <div className={classNames('status',{'successStatus': text === 'RUN', 'errorStatus': text === 'STOP'})}><i/>{text === 'RUN' ? '开启' : '关闭'}</div>
  }
  tableFilter = (pagination, filters, sorter) => {
    const { clusterID } = this.props
    this.setState({
      currentPage: pagination.current
    })
    this.loadData(clusterID, pagination.current)
  }
  onRowClick = record => {
    const { selectedRowKeys } = this.state
    const name = record.metadata.name
    let newKeys = selectedRowKeys.slice(0)
    let flag = false
    for(let i = 0, l = newKeys.length; i < l; i++) {
      if (newKeys[i] === name) {
        flag = true
        newKeys.splice(i, 1)
        break
      }
    }
    if (!flag) {
      newKeys.push(name)
    }
    this.setState({
      selectedRowKeys: newKeys
    })
  }
  confirmDelete = () => {
    const { deleteAutoScale, clusterID } = this.props
    const { selectedRowKeys } = this.state
    if (!selectedRowKeys.length) {
      return
    }
    this.setState({
      deleteBtnLoading: true
    })
    let notify = new Notification()
    notify.spin('删除中...')
    deleteAutoScale(clusterID, selectedRowKeys.join(','), {
      success: {
        func: () => {
          notify.close()
          notify.success('删除成功')
          this.setState({
            selectedRowKeys: [],
            deleteModal: false,
            deleteBtnLoading: false
          })
          this.loadData(clusterID, 1)
        },
        isAsync:true
      },
      failed: {
        success: {
          func: () => {
            this.setState({
              selectedRowKeys: [],
              deleteModal: false,
              deleteBtnLoading: false
            })
            notify.close()
            notify.error('删除失败')
          }
        }
      }
    })
  }
  cancelDelete = () => {
    this.setState({
      deleteModal: false
    })
  }
  batchUpdateStatus = type => {
    const { selectedRowKeys } = this.state
    const { updateAutoScaleStatus, clusterID } = this.props
    if (!selectedRowKeys.length) {
      return
    }
    let notify = new Notification()
    notify.spin('操作中...')
    let map = {}
    selectedRowKeys.forEach(item => {
      map = Object.assign(map, { [item.split(',')[1]]: item.split(',')[0] })
    })
    let body = { services: selectedRowKeys, type: type === 'stop' ? 0 : 1 }
    updateAutoScaleStatus(clusterID, body, {
      success: {
        func: () => {
          notify.close()
          notify.success('操作成功')
          this.setState({
            selectedRowKeys: []
          })
          this.loadData(clusterID, 1)
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notify.close()
          notify.error('操作失败')
          this.setState({
            selectedRowKeys: []
          })
        }
      }
    })
  }
  demo = () => {
    Modal.info({
      title: 'Demo示例说明',
      content: (
        <div>
          <p>例如，现在有5个实例，内存利用率之和为400%，阈值为80%，此时不扩展不收缩；</p>
          <p>如果利用率上升1个百分点401%/5=80.2%>80%，触发扩展一个实例，容器变为6个；</p>
          <p>如果在6个容器的基础上利用率下降2个百分点，399%/（6-1）=79.8%，就会触发收缩一个实例；</p>
        </div>
      )
    })
  }
  renderFooter = () => {
    const { deleteBtnLoading } = this.state
    return[
      <Button size="large" key="cancel" onClick={this.cancelDelete}>取消</Button>,
      <Button loading={deleteBtnLoading} type="primary" size="large" key="confirm" onClick={this.confirmDelete}>确认</Button>
    ]
  }
  render() {
    const {
      scaleModal, scaleList, currentPage, totalCount,
      searchValue, tableLoading, selectedRowKeys, scaleDetail,
      create, reuse, deleteModal, existServices
    } = this.state
    const {
      clusterID
    } = this.props
    const columns = [{
      title: '策略名称',
      dataIndex: 'metadata.labels.strategyName',
      width: '10%',
    }, {
      title: '服务名称',
      dataIndex: 'metadata.name',
      width: '10%',
    }, {
      title: '开启状态',
      dataIndex: 'metadata.annotations.status',
      width: '10%',
      render: text => <div>{this.scaleStatus(text)}</div>
    }, {
      title: '阈值',
      dataIndex: 'spec.metrics',
      width: '15%',
      render: (text) => <div>{this.formatMetrics(text)}</div>
    }, {
      title: '最小实例数',
      dataIndex: 'spec.minReplicas',
      width: '8%',
    }, {
      title: '最大实例数',
      dataIndex: 'spec.maxReplicas',
      width: '8%',
    }, {
      title: '发送邮件',
      dataIndex: 'metadata.annotations.alertStrategy',
      width: '14%',
      render: text => <div>{this.emailSendType(text)}</div>
    }, {
      title: '告警通知组',
      dataIndex: 'metadata.annotations.alertgroupName',
      width: '10%',
      render: text => text ? text : '-'
    }, {
      title: '操作',
      width: '15%',
      render: record => {
        const menu = (
          <Menu onClick={(e) => this.handleMenuClick(e, record)}>
            <Menu.Item key="start"><i className='fa fa-play' /> 启用</Menu.Item>
            <Menu.Item key="stop"><i className='fa fa-stop' /> 停用</Menu.Item>
            <Menu.Item key="edit"><Icon type="file-text" /> 修改</Menu.Item>
            <Menu.Item key="delete"><i className='fa fa-trash-o' /> 删除</Menu.Item>
          </Menu>
        );
        return(
          <Dropdown.Button onClick={(e) => this.handleButtonClick(e, record)} overlay={menu} type="ghost">
            <Icon type="copy" /> 克隆
          </Dropdown.Button>
        )
      }
    }];
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys) => this.setState({selectedRowKeys})
    };
    const pagination = {
      simple: true,
      total: totalCount,
      defaultPageSize: 10,
      defaultCurrent: 1,
      current: currentPage,
    }
    const btns = (
      <Menu className="autoScaleBtnMenu">
        <Menu.Item key="start" disabled={selectedRowKeys.length ? false: true}>
          <span onClick={() => this.batchUpdateStatus('start')}><i className='fa fa-play' /> 启用</span>
        </Menu.Item>
        <Menu.Item key="stop" disabled={selectedRowKeys.length ? false: true}>
          <span onClick={() => this.batchUpdateStatus('stop')}><i className='fa fa-stop' /> 停用</span>
        </Menu.Item>
        <Menu.Item key="delete" disabled={selectedRowKeys.length ? false: true}>
          <span onClick={() => selectedRowKeys.length && this.setState({deleteModal: true})}><i className='fa fa-trash-o' /> 删除</span>
        </Menu.Item>
      </Menu>
    )
    return(
      <QueueAnim>
        <div className="AutoScale" key="AutoScale">
          <div className="alertRow">
            伸缩策略规定了自动伸缩触发条件，任意指标超过阈值都会触发扩展，所有指标都满足n-1个实例平均值低于阈值才会触发收缩，数据与k8s共通，可以在本平台或k8s管理伸缩策略
          </div>
          <div className="btnGroup">
            <Button type="primary" size="large" onClick={() => this.setState({scaleModal: true, create: true})}><i className="fa fa-plus" /> 创建自动伸缩策略</Button>
            <Button size="large" onClick={() => this.loadData(clusterID, 1)}><i className='fa fa-refresh' /> 刷 新</Button>
            <Dropdown
              overlay={btns} trigger={['click']}>
              <Button className="autoScaleDrop" size="large" >
                更多操作 <i className="fa fa-caret-down Arrow"/>
              </Button>
            </Dropdown>
            <Button size="large" className="startBtn" disabled={selectedRowKeys.length ? false: true} onClick={() => this.batchUpdateStatus('start')}><i className='fa fa-play' /> 启 用</Button>
            <Button size="large" className="stopBtn" disabled={selectedRowKeys.length ? false: true} onClick={() => this.batchUpdateStatus('stop')}><i className='fa fa-stop' /> 停 用</Button>
            <Button size="large" className="deleteBtn" disabled={selectedRowKeys.length ? false: true} onClick={() => selectedRowKeys.length && this.setState({deleteModal: true})}><i className='fa fa-trash-o' /> 删 除</Button>
            <CommonSearchInput
              placeholder="请输入策略名或服务名搜索"
              size="large"
              style={{width: '200px'}}
              value={searchValue}
              onSearch={(value) => this.loadData(clusterID, 1,value)}/>
            <Button size="large" onClick={this.demo}><Icon type="question-circle-o" />Demo</Button>
            <span className="pull-right totalCount">共计 {totalCount} 条</span>
          </div>
          <Modal
            title="删除策略"
            visible={deleteModal}
            onCancel={this.cancelDelete}
            onOk={this.confirmDelete}
            className="autoScaleDeleteModal"
            footer={this.renderFooter()}
          >
            <div className="deleteHint"><i className="fa fa-exclamation-triangle"/>删除策略后无法被找回，是否确认删除？</div>
          </Modal>
          <Table
            className="autoScaleTable"
            loading={tableLoading}
            pagination={pagination}
            rowSelection={rowSelection}
            columns={columns}
            rowKey={record => record.key}
            onRowClick={this.onRowClick}
            onChange={this.tableFilter}
            dataSource={scaleList} />
          <AutoScaleModal
            visible={scaleModal}
            create={create}
            reuse={reuse}
            scaleDetail={scaleDetail}
            existServices={existServices}
            scope={this}/>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const { cluster, space } = state.entities.current
  const { clusterID } = cluster
  const { spaceName } = space
  return {
    clusterID,
    spaceName
  }
}

export default connect(mapStateToProps, {
  loadAutoScaleList,
  deleteAutoScale,
  updateAutoScale,
  updateAutoScaleStatus
})(AutoScale)
