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
import { Button, Table, Icon, Pagination, Popover, Modal, Menu, Dropdown } from 'antd'
import QueueAnim from 'rc-queue-anim'
import SearchInput from '../../CommonSearchInput'
import LoadBalanceModal from './LoadBalanceModal'
import Notification from '../../Notification'
import Title from '../../Title'
import { getLBList, deleteLB } from '../../../actions/load_balance'
import { calcuDate } from "../../../common/tools";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../../../constants'
import ServiceStatus from '../../TenxStatus/ServiceStatus'
import './style/index.less'

const notify = new Notification()

class LoadBalance extends React.Component {
  state = {
    loadBalanceVisible: false,
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
    this.setState({
      loadBalanceVisible: true
    })
  }

  closeBalanceModal = () => {
    this.setState({
      currentBalance: null,
      loadBalanceVisible: false
    })
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
    notify.spin('删除中')
    let name = currentBalance.metadata.name
    let displayName = currentBalance.metadata.annotations.displayName
    deleteLB(clusterID, name, displayName, {
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
          loadBalanceVisible: true
        })
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
    const { loadBalanceVisible, deleteModal, delConfirmLoading, currentBalance, page, name } = this.state
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
      title: '名称',
      dataIndex: 'metadata.annotations.displayName',
      width: '15%',
      render: (text, record) =>
        <Link to={`/app_manage/load_balance/balance_config?name=${record.metadata.name}&displayName=${record.metadata.annotations.displayName}`}>{text}</Link>
    }, {
      title: '状态',
      dataIndex: 'status',
      width: '10%',
      render: (text, record) => this.renderLBStatus(record)
    }, {
      title: '地址',
      width: '10%',
      dataIndex: 'metadata.annotations.allocatedIP',
    }, {
      title: '监听端口',
      dataIndex: 'port',
      width: '10%',
      render: () => 'http: 80'
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
      render: text => calcuDate(text)
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
        {
          loadBalanceVisible &&
          <LoadBalanceModal
            visible={loadBalanceVisible}
            currentBalance={currentBalance}
            closeModal={this.closeBalanceModal}
            callback={this.loadLBList}
          />
        }
        <Modal
          title="删除负载均衡器"
          visible={deleteModal}
          onCancel={this.cancelDelModal}
          onOk={this.confirmDelModal}
          confirmLoading={delConfirmLoading}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" aria-hidden="true"/>
            删除后将失去负载均衡器内的所有监听
          </div>
        </Modal>
        <div className="layout-content-btns" key="layout-content-btns">
          <Button type="primary" size="large" onClick={this.openBalanceModal}><i className="fa fa-plus" /> 创建负载均衡</Button>
          <Button type="ghost" size="large" onClick={this.refreshData}><i className='fa fa-refresh' /> 刷 新</Button>
          {/*<Button type="ghost" size="large" icon="delete" onClick={() => this.showDeleteModal([1,2,3])}>删除</Button>*/}
          <SearchInput
            placeholder="请输入关键词搜索"
            size="large"
            value={name}
            onSearch={this.handleSearch}
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