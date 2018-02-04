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
import { formatDate } from "../../../common/tools";
import ServiceStatus from '../../TenxStatus/ServiceStatus'
import './style/index.less'

const notify = new Notification()

class LoadBalance extends React.Component {
  state = {
    loadBalanceVisible: false
  }
  
  componentWillMount() {
    this.loadLBList()
  }
  
  loadLBList = () => {
    const { clusterID, getLBList } = this.props
    getLBList(clusterID)
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
  
  handleButtonClick = () => {
    browserHistory.push(`/app_manage/load_balance/balance_config`)
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
    const { loadBalanceVisible, deleteModal, delConfirmLoading, currentBalance } = this.state
    const { loadBalanceList, isFetching } = this.props
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
      render: () => 80
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
      render: text => formatDate(text)
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
          <Dropdown.Button onClick={this.handleButtonClick} overlay={menu} type="ghost">
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
          <Button type="ghost" size="large" onClick={this.loadLBList}><i className='fa fa-refresh' /> 刷新</Button>
          {/*<Button type="ghost" size="large" icon="delete" onClick={() => this.showDeleteModal([1,2,3])}>删除</Button>*/}
          <SearchInput
            placeholder="请输入关键词搜索"
            size="large"
          />
          {
            loadBalanceList && loadBalanceList.length ?
            <div className="page-box">
              <span className="total">共计 {loadBalanceList && loadBalanceList.length} 条</span>
              <Pagination
                simple
                total={loadBalanceList && loadBalanceList.length}
              />
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
        />
      </QueueAnim>
    )
  }
}

function mapStateToProps(state) {
  const { entities, loadBalance } = state
  const { clusterID } = entities.current.cluster
  const { loadBalanceList } = loadBalance
  const { data, isFetching } = loadBalanceList || { data: [] }
  return {
    clusterID,
    isFetching,
    loadBalanceList: data
  }
}

export default connect(mapStateToProps, {
  getLBList,
  deleteLB
})(LoadBalance)