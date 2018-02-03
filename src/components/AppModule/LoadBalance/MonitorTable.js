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
import Notification from '../../Notification'
import './style/MonitorTable.less'

export default class MonitorTable extends React.Component {
  state = {
    
  }
  
  showDelModal = row => {
    this.setState({
      currentIngress: row,
      deleteModal: true
    })
  }
  
  cancelDelModal = () => {
    this.setState({
      deleteModal: false
    })
  }
  
  confirmDelModal = () => {
    const { deleteIngress, clusterID, location, getLBDetail } = this.props
    const { name, displayName } = location.query
    const { currentIngress } = this.state
    let notify = new Notification()
    this.setState({
      delConfirmLoading: true
    })
    notify.spin('删除中')
    deleteIngress(clusterID, name, currentIngress.name, displayName, {
      success: {
        func: () => {
          notify.close()
          notify.success('删除成功')
          getLBDetail(clusterID, name, displayName)
          this.setState({
            deleteModal: false,
            delConfirmLoading: false
          })
        },
        isAsync: true
      },
      failed: {
        func: res => {
          notify.close()
          notify.warn('删除失败', res.message.message || res.message)
          this.setState({
            delConfirmLoading: false
          })
        }
      }
    })
  }
  
  expandedRender = row => {
    if (!row.items || !row.items.length) {
      return
    }
    return (
      <div>
        <Row className="expandedRow">
          <Col span={5}>后端服务</Col>
          <Col span={5}>服务端口</Col>
          <Col span={5}>权重</Col>
        </Row>
        {
          row.items.map(item => 
            <Row className="expandedRow" key={item.serviceName}>
              <Col span={5}>{item.serviceName}</Col>
              <Col span={5}>{item.servicePort}</Col>
              <Col span={5}>{item.weight}</Col>
            </Row>
          )
        }
      </div>
    )
  }
  
  render() {
    const { deleteModal, delConfirmLoading } = this.state
    const { togglePart, lbDetail } = this.props
    const { ingress } = lbDetail || { ingress: [] }
    const columns = [
      {
        title: '监听器名称',
        dataIndex: 'displayName',
        width: '20%'
      },
      {
        title: '协议',
        width: '20%',
        render: () => 'http'
      }, 
      {
        title: '监听端口', 
        width: '20%', 
        render: () => 80
      },
      {title: '域名', dataIndex: 'host', width: '20%'},
      {
        title: '操作',
        width: '20%',
        render: (text, row) =>
          <div>
            <Button type="primary" className="editBtn" onClick={() => togglePart(false, row)}>编辑</Button>
            <Button type="ghost" onClick={() => this.showDelModal(row)}>删除</Button>
          </div>
      }
    ]
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
          {
            ingress && ingress.length ?
            <div className="page-box">
              <span className="total">共计 {ingress && ingress.length} 条</span>
              <Pagination
                simple
                total={ingress && ingress.length}
              />
            </div> : null
          }
        </div>
        <Table
          className="reset_antd_table_header"
          columns={columns}
          dataSource={ingress}
          expandedRowRender={row => this.expandedRender(row)}
          rowKey={row => row.name}
          pagination={false}
        />
      </div>
    )
  }
}