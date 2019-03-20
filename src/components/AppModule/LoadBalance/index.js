/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Load balance page
 *
 * v0.1 - 2018-01-12
 * @author zhangxuan
 */

import React from 'react'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
import { Button, Table, Icon, Pagination, Popover, Modal, Menu, Dropdown, Tooltip } from 'antd'
import QueueAnim from 'rc-queue-anim'
import SearchInput from '../../CommonSearchInput'
import Notification from '../../Notification'
import Title from '../../Title'
import { getLBList, deleteLB } from '../../../actions/load_balance'
import { calcuDate } from "../../../common/tools";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../../../constants'
import ServiceStatus from '../../TenxStatus/ServiceStatus'
import ResourceBanner from '../../TenantManage/ResourceBanner/index'
import './style/index.less'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import TimeHover from '@tenx-ui/time-hover/lib'
import Ellipsis from '@tenx-ui/ellipsis/lib'

const notify = new Notification()

class LoadBalance extends React.Component {
  state = {
    page: DEFAULT_PAGE
  }

  componentWillMount() {
    this.loadLBList()
  }

  loadLBList = () => {
    const { clusterID, getLBList } = this.props
    const { page, name, sort } = this.state
    const query = {
      page: page || DEFAULT_PAGE,
      size: DEFAULT_PAGE_SIZE
    }
    if (name) {
      Object.assign(query, { name })
    }
    if (sort) {
      Object.assign(query, {
        creationTime: sort.substring(0, 1)
      })
    }
    getLBList(clusterID, query)
  }

  handlePage = page => {
    this.setState({
      page
    }, this.loadLBList)
  }

  handleSearch = name => {
    this.setState({
      name
    }, this.loadLBList)
  }

  tableChange = (pagination, filters, sorter) => {
    this.setState({
      sort: sorter && sorter.order,
    }, this.loadLBList)
  }

  refreshData = () => {
    this.setState({
      page: 1,
      name: '',
      sort: ''
    }, this.loadLBList)
  }
  deleteLoadBalance = name => {
    const { deleteLB, clusterID } = this.props
  }
  openBalanceModal = () => {
    browserHistory.push('/net-management/appLoadBalance/createLoadBalance')
  }

  handleVisibleChange = (visible, row) => {
    this.setState({
      [`popoverVisible${row.key}`]: visible
    })
  }

  showDeleteModal = delArr => {
    if (!delArr || !delArr.length) {
      notify.warn('请选择要删除的负载均衡器')
      return
    }
    this.setState({
      deleteModal: true
    })
  }

  cancelDelModal = () => {
    this.setState({
      deleteModal: false
    })
  }

  confirmDelModal = () => {
    const { currentBalance } = this.state
    const { deleteLB, clusterID } = this.props
    let notify = new Notification()
    this.setState({
      delConfirmLoading: true
    })
    const { agentType } = getDeepValue(currentBalance, ['metadata', 'labels'])
    notify.spin('删除中')
    let name = currentBalance.metadata.name
    let displayName = currentBalance.metadata.annotations.displayName
    deleteLB(clusterID, name, displayName, agentType, {
      success: {
        func: () => {
          notify.close()
          notify.success('删除成功')
          this.loadLBList()
          this.setState({
            deleteModal: false,
            delConfirmLoading: false,
            currentBalance: null
          })
        },
        isAsync: true
      },
      failed: {
        func: res => {
          notify.close()
          this.setState({
            delConfirmLoading: false
          })
          notify.warn('删除失败', res.message.message || res.message)
        }
      }
    })
  }

  handleButtonClick = record => {
    browserHistory.push(`/app_manage/load_balance/balance_config?name=${record.metadata.name}&displayName=${record.metadata.annotations.displayName}`)
  }

  handleMenuClick = (e, row) => {
    switch (e.key) {
      case 'edit':
        this.setState({
          currentBalance: row,
        })
        browserHistory.push(`/net-management/appLoadBalance/editLoadBalance?name=${row.metadata.name}&displayName=${row.metadata.annotations.displayName}`)
        break
      case 'delete':
        this.setState({
          currentBalance: row
        })
        this.showDeleteModal([row.key])
        break
      default:
        break
    }
  }

  renderLBStatus = LB => {
    return <ServiceStatus service={LB} smart={true}/>
  }
  render() {
    const { deleteModal, delConfirmLoading, currentBalance, page, name } = this.state
    const { loadBalanceList, total, isFetching } = this.props
    // const rowSelection = {
    //   onChange(selectedRowKeys, selectedRows) {
    //     console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    //   },
    //   onSelect(record, selected, selectedRows) {
    //     console.log(record, selected, selectedRows);
    //   },
    //   onSelectAll(selected, selectedRows, changeRows) {
    //     console.log(selected, selectedRows, changeRows);
    //   },
    // };
    const pagination = {
      simple: true,
      total,
      current: page,
      pageSize: DEFAULT_PAGE_SIZE,
      onChange: this.handlePage
    }
    const columns = [{
      title: '名称 / 备注名',
      dataIndex: 'metadata.annotations.displayName',
      width: '15%',
      render: (text, record) =>
        <Link to={`/app_manage/load_balance/balance_config?name=${record.metadata.name}&displayName=${record.metadata.annotations.displayName}`}>
          <div>{record.metadata.labels.ingressLb}</div>
          {text}
          </Link>
    }, {
      title: '状态',
      dataIndex: 'status',
      width: '10%',
      render: (text, record) => this.renderLBStatus(record)
    }, {
      title: '地址',
      width: '10%',
      dataIndex: 'metadata.annotations.allocatedIP',
      render: (text, record) => {
        const agent = record.metadata.labels.agentType
        if (agent === 'HAInside') {
          return <Link to={`/workloads/Deployment/${record.metadata.name}`}>{record.metadata.name}</Link>
        }
        if (text) return <Ellipsis tooltip={text}>
          <span>{text}</span>
        </Ellipsis>
      }
    }, {
      title: '代理方式',
      dataIndex: 'metadata.labels.agentType',
      width: '10%',
      render: (text, record) => {
        const prompt = <div>
          <p>集群{text === 'HAInside' ? '内' : '外'} (高可用)</p>
          <p>实例数: {record.spec.replicas}</p>
        </div>
        switch (text) {
          case 'inside':
            return '集群内'
          case 'outside':
            return '集群外'
          case 'HAInside':
            return <Tooltip placement="top" title={prompt}>
              <span>集群内 <a>(高可用)</a></span>
            </Tooltip>
          case 'HAOutside':
            return <Tooltip placement="top" title={prompt}>
              <span>集群外 <a>(高可用)</a></span>
            </Tooltip>
          default :
            return '--'
        }
      }
    }, {
      title: '监听器数量',
      width: '10%',
      dataIndex: 'metadata.annotations.ingressCount'
    }, {
      title: '监听服务数量',
      width: '10%',
      dataIndex: 'metadata.annotations.ingressServiceCount'
    }, {
      title: '创建时间',
      width: '15%',
      dataIndex: 'metadata.creationTimestamp',
      sorter: (a, b) => a.metadata.creationTimestamp.length - b.metadata.creationTimestamp.length,
      render: text => <TimeHover time={text} />
    }, {
      title: '操作',
      width: '20%',
      render: (text, row) => {
        const menu = (
          <Menu onClick={e => this.handleMenuClick(e, row)}
                style={{ width: 80 }}
          >
            <Menu.Item key="edit">修改</Menu.Item>
            <Menu.Item key="delete">删除</Menu.Item>
          </Menu>
        );
        return (
          <Dropdown.Button onClick={() => this.handleButtonClick(row)} overlay={menu} type="ghost">
            配置
          </Dropdown.Button>
        )
      }
    }];
    return (
      <QueueAnim className="loadBalance layout-content">
        <Title title="负载均衡"/>
        {/* {
          <LoadBalanceModal
            currentBalance={currentBalance}
            closeModal=
            callback={this.loadLBList}
          />
        } */}
        <Modal
          title="删除负载均衡器"
          visible={deleteModal}
          onCancel={this.cancelDelModal}
          onOk={this.confirmDelModal}
          confirmLoading={delConfirmLoading}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" aria-hidden="true"/>
            删除后将失去负载均衡器内的所有监听，并且基于该负载均衡创建的QPS弹性伸缩策略会失效，是否确定删除？
          </div>
        </Modal>
        <ResourceBanner key={'resourceBanner'} resourceType={["insideloadbalance", "outsideloadbalance"]}/>
        <div className="layout-content-btns" key="layout-content-btns">
          <Button type="primary" size="large" onClick={this.openBalanceModal}><i className="fa fa-plus" /> 创建负载均衡</Button>
          <Button type="ghost" size="large" onClick={this.refreshData}><i className='fa fa-refresh' /> 刷 新</Button>
          {/*<Button type="ghost" size="large" icon="delete" onClick={() => this.showDeleteModal([1,2,3])}>删除</Button>*/}
          <SearchInput
            placeholder="请输入备注名搜索"
            size="large"
            value={name}
            onSearch={this.handleSearch}
            style={{ marginLeft: 0 }}
          />
          {
            total ?
            <div className="page-box">
              <span className="total">共计 {total} 条</span>
              <Pagination {...pagination}/>
            </div> : null
          }
        </div>
        <Table
          key="loadBalanceTable"
          className="loadBalanceTable reset_antd_table_header"
          // rowSelection={rowSelection}
          columns={columns}
          dataSource={loadBalanceList}
          pagination={false}
          loading={isFetching}
          onChange={this.tableChange}
          rowKey={record => record.metadata.name}
        />
      </QueueAnim>
    )
  }
}

function mapStateToProps(state) {
  const { entities, loadBalance } = state
  const { clusterID } = entities.current.cluster
  const { loadBalanceList } = loadBalance
  const { data, total, isFetching } = loadBalanceList || { data: [], total: 0 }
  return {
    clusterID,
    isFetching,
    total,
    loadBalanceList: data
  }
}

export default connect(mapStateToProps, {
  getLBList,
  deleteLB
})(LoadBalance)
