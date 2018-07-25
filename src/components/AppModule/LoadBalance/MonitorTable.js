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
import { Table, Button, Pagination, Row, Col, Tabs, Tooltip, Modal } from 'antd'
import isEqual from 'lodash/isEqual'
import Notification from '../../Notification'
import { connect } from 'react-redux'
import { loadServiceDetail } from '../../../actions/services'
import './style/MonitorTable.less'
import AppServiceEvent from '../AppServiceDetail/AppServiceEvent'
const TabPane = Tabs.TabPane
class MonitorTable extends React.Component {
  state = {
    current: 1,
  }
  componentDidMount() {
    const { current } = this.state
    const { lbDetail, loadServiceDetail } = this.props
    const { ingress } = lbDetail || { ingress: [] }
    this.setState({
      copyIngress: ingress.slice((current - 1) * 5, current * 5)
    })
  }
  componentWillReceiveProps(nextProps) {
    const { current } = this.state
    const { lbDetail: oldLB } = this.props
    const { lbDetail: newLB } = nextProps
    const { ingress: oldIngress } = oldLB || { ingress: [] }
    const { ingress: newIngress } = newLB || { ingress: [] }
    if (!isEqual(oldIngress, newIngress)) {
      this.setState({
        copyIngress: newIngress.slice((current - 1) * 5, current * 5)
      })
    }
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
    deleteIngress(clusterID, name, currentIngress.name, currentIngress.displayName, {
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
    const isRoundRobin = row.lbAlgorithm !== 'ip_hash'

    return (
      <div>
        <Row className="expandedRow">
          <Col span={5}>后端服务</Col>
          <Col span={5}>服务端口</Col>
          {
            isRoundRobin &&
            <Col span={5}>权重</Col>
          }
        </Row>
        {
          row.items.map(item =>
            <Row className="expandedRow" key={item.serviceName}>
              <Col span={5}>{item.serviceName}</Col>
              <Col span={5}>{item.servicePort}</Col>
              {
                isRoundRobin &&
                <Col span={5}>{item.weight}</Col>
              }
            </Row>
          )
        }
      </div>
    )
  }

  handlePage = current => {
    const { lbDetail } = this.props
    const { ingress } = lbDetail
    this.setState({
      current,
      copyIngress: ingress.slice((current - 1) * 5, current * 5)
    })
  }
  render() {
    const { deleteModal, delConfirmLoading, copyIngress, current } = this.state
    const { togglePart, lbDetail } = this.props
    const { ingress } = lbDetail || { ingress: [] }
    const pagination = {
      simple: true,
      total: ingress && ingress.length || 0,
      pageSize: 5,
      current,
      onChange: this.handlePage
    }
    const columns = [
      {
        title: '监听器名称',
        dataIndex: 'displayName',
        width: '15%'
      },
      {
        title: '协议',
        width: '15%',
        render: () => 'http'
      },
      {
        title: '监听端口',
        width: '15%',
        render: () => 80
      },
      {
        title: '服务位置',
        dataIndex: 'host',
        width: '20%',
        render: (text, record) => record.host + record.path
      },
      {
        title: '访问路径',
        dataIndex: 'context',
        width: '20%',
      },
      {
        title: '操作',
        width: '15%',
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
            删除监听器会导致对应服务基于 QPS 的弹性伸缩策略失效，是否确定删除？
          </div>
        </Modal>
        <Tabs>
          <TabPane tab="监听器" key="0">
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
                    <Pagination {...pagination}/>
                  </div> : null
              }
            </div>
            <Table
              className="reset_antd_table_header"
              columns={columns}
              dataSource={copyIngress}
              expandedRowRender={row => this.expandedRender(row)}
              rowKey={row => row.name}
              pagination={false}
            />

          </TabPane>
          <TabPane tab="事件" key="1">
            <AppServiceEvent serviceName={this.props.name} cluster={this.props.clusterID} type={'replicaset'} serviceDetailmodalShow={true}/>
          </TabPane>
        </Tabs>
      </div>
    )
  }
}
function mapStateToProps(state, props) {
  const { lbDetail, clusterID } = props
  const name = lbDetail && lbDetail.deployment.metadata.name
  return {
    clusterID,
    name
  }

  return state
}
export default connect(mapStateToProps, {
  loadServiceDetail,
})(MonitorTable)
