/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Load balance monitor table
 *
 * v0.1 - 2018-01-16
 * @author zhangxuan
 */

import React from 'react'
import { Table, Button, Pagination, Row, Col, Tooltip, Modal } from 'antd'

import './style/MonitorTable.less'

export default class MonitorTable extends React.Component {
  state = {
    
  }
  
  showDelModal = row => {
    this.setState({
      currentMonitor: row,
      deleteModal: true
    })
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
  
  expandedRender = row => {
    if (!row.children || !row.children.length) {
      return
    }
    return (
      <div>
        <Row className="expandedRow">
          <Col span={6}>后端服务</Col>
          <Col span={6}>服务端口</Col>
          <Col span={6}>权重</Col>
        </Row>
        {
          row.children.map(item => 
            <Row className="expandedRow">
              <Col span={6}>{item.serviceName}</Col>
              <Col span={6}>{item.port}</Col>
              <Col span={6}>{item.weight}</Col>
            </Row>
          )
        }
      </div>
    )
  }
  
  render() {
    const { deleteModal, delConfirmLoading } = this.state
    const { togglePart } = this.props
    const columns = [
      {title: '协议', dataIndex: 'agreement', width: '25%', key: 'agreement'}, 
      {title: '监听端口', dataIndex: 'monitorPort', width: '25%', key: 'monitorPort'},
      {title: '域名', dataIndex: 'domain', width: '25%', key: 'domain'},
      {
        title: '操作',
        width: '25%',
        key: 'operate',
        render: (text, row) =>
          <div>
            <Button type="primary" className="editBtn" onClick={() => togglePart(false, row)}>编辑</Button>
            <Button type="ghost" onClick={() => this.showDelModal(row)}>删除</Button>
          </div>
      }
    ]
    const data = []
    for (let i = 0; i < 3; i ++) {
      data.push({
        key: i,
        agreement: 'HTTP',
        monitorPort: `808${i}`,
        domain: '-',
        children: [{
          key: `1${i}`,
          serviceName: `service-0${i}`,
          port: 3280,
          weight: 49
        }]
      })
    }
    return (
      <div className="monitorTable layout-content">
        <Modal
          title="删除负载均衡器"
          visible={deleteModal}
          onCancel={this.cancelDelModal}
          onOk={this.confirmDelModal}
          confirmLoading={delConfirmLoading}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" aria-hidden="true"/>
            确定删除该监听？
          </div>
        </Modal>
        <div className="layout-content-btns">
          <Tooltip
            title="最多支持100条"
          >
            <Button type="primary" size="large" icon="plus" onClick={() => togglePart(false, null)}>创建监听</Button>
          </Tooltip>
          <div className="page-box">
            <span className="total">共计 3 条</span>
            <Pagination
              simple
            />
          </div>
        </div>
        <Table
          className="reset_antd_table_header"
          columns={columns}
          dataSource={data}
          expandedRowRender={row => this.expandedRender(row)}
          pagination={false}
        />
      </div>
    )
  }
}