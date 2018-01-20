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

import './style/index.less'

const notify = new Notification()

class LoadBalance extends React.Component {
  state = {
    loadBalanceVisible: false
  }
  
  componentWillMount() {
    
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
  
  renderService = (text, row) => {
    const content = (
      <div>{text}</div>
    )
    return (
      <div>{text}
        <Popover content={content} trigger="click" placement="right"
                 visible={this.state[`popoverVisible${row.key}`]}
                 onVisibleChange={(visible) => this.handleVisibleChange(visible, row)}
        >
          <Icon className="pointer" type={this.state[`popoverVisible${row.key}`] ? "minus-square" : "plus-square"} style={{ marginLeft: 10 }}/>
        </Popover>
      </div>
    )
  }
  
  cancelDelModal = () => {
    this.setState({
      deleteModal: false
    })
  }
  
  confirmDelModal = () => {
    this.setState({
      delConfirmLoading: true
    })
    this.setState({
      deleteModal: false,
      delConfirmLoading: false
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
        this.showDeleteModal([row.key])
        break
      default:
        break
    }
  }
  
  render() {
    const { loadBalanceVisible, deleteModal, delConfirmLoading } = this.state
    const rowSelection = {
      onChange(selectedRowKeys, selectedRows) {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      },
      onSelect(record, selected, selectedRows) {
        console.log(record, selected, selectedRows);
      },
      onSelectAll(selected, selectedRows, changeRows) {
        console.log(selected, selectedRows, changeRows);
      },
    };
    const columns = [{
      title: '名称',
      dataIndex: 'name',
      render: text => <Link to={`/app_manage/load_balance/balance_config?name=${text}`}>{text}</Link>
    }, {
      title: '状态',
      dataIndex: 'status',
    }, {
      title: '住址',
      dataIndex: 'address',
    }, {
      title: '监听端口',
      dataIndex: 'port'
    }, {
      title: '后端监听服务',
      dataIndex: 'server',
      render: (text, row) => this.renderService(text, row)
    }, {
      title: '创建时间',
      dataIndex: 'creationTime'
    }, {
      title: '操作',
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
    const data = []
    for (let i = 0; i < 3; i ++ ) {
      data.push({
        key: i,
        name: `${i}mao`,
        status: `1${i}`,
        address: `00${i}`,
        port: `tpc:800${i}`,
        server: `service:900${i}`,
        creationTime: `2018-01-1${i} 12:00:00`,
      })
    }
    return (
      <QueueAnim className="loadBalance layout-content">
        <Title title="负载均衡"/>
        {
          loadBalanceVisible &&
          <LoadBalanceModal
            visible={loadBalanceVisible}
            closeModal={this.closeBalanceModal}
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
          <Button type="primary" size="large" icon="plus" onClick={this.openBalanceModal}>创建负载均衡</Button>
          <Button type="ghost" size="large"><i className='fa fa-refresh' /> 刷新</Button>
          <Button type="ghost" size="large" icon="delete" onClick={() => this.showDeleteModal([1,2,3])}>删除</Button>
          <SearchInput
            placeholder="请输入关键词搜索"
            size="large"
          />
          <div className="page-box">
            <span className="total">共计 3 条</span>
            <Pagination
              simple
            />
          </div>
        </div>
        <Table 
          key="loadBalanceTable"
          className="loadBalanceTable reset_antd_table_header"
          rowSelection={rowSelection} 
          columns={columns}
          dataSource={data}
          pagination={false}
        />
      </QueueAnim>
    )
  }
}

function mapStateToProps(state) {
  return {
    
  }
}

export default connect(mapStateToProps, {
  
})(LoadBalance)