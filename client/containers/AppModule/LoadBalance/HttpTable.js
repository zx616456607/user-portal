/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Load balance http table
 *
 * v0.1 - 2018-12-29
 * @author zhangxuan
 */

import React from 'react'
import { connect } from 'react-redux'
import { Tooltip, Button, Pagination, Table, Row, Col, Modal } from 'antd'
import isEmpty from 'lodash/isEmpty'
import { upperInitial } from '../../../../src/common/tools'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import Notification from '../../../../src/components/Notification'
import * as LoadBalanceActions from '../../../../src/actions/load_balance'
import { DEFAULT_PAGE } from '../../../../constants'

const notify = new Notification()

const mapStateToProps = ({
  loadBalance: { httpIngress: { data, isFetching } },
}, props) => {
  const { lbDetail, clusterID } = props
  const name = lbDetail && lbDetail.deployment.metadata.name
  return {
    clusterID,
    ingress: data,
    httpLoading: isFetching,
    name,
  }
}
@connect(mapStateToProps, {
  deleteIngress: LoadBalanceActions.deleteIngress,
  getHttpIngress: LoadBalanceActions.getHttpIngress,
})
export default class HttpTable extends React.PureComponent {

  state = {
    current: DEFAULT_PAGE,
    copyIngress: [],
  }

  componentDidMount() {
    this.loadHttpIngressData()
  }

  loadHttpIngressData = async () => {
    const { current } = this.state
    const { name, getHttpIngress, clusterID } = this.props
    await getHttpIngress(clusterID, name)
    const { ingress } = this.props
    this.setState({
      copyIngress: ingress.slice((current - 1) * 5, current * 5),
    })
  }

  showDelModal = row => {
    this.setState({
      currentIngress: row,
      deleteModal: true,
    })
  }

  cancelDelModal = () => {
    this.setState({
      deleteModal: false,
    })
  }

  confirmDelModal = () => {
    const { deleteIngress, clusterID, location, lbDetail } = this.props
    const { name, displayName } = location.query
    const { currentIngress } = this.state
    const { agentType } = getDeepValue(lbDetail.deployment, [ 'metadata', 'labels' ])
    this.setState({
      delConfirmLoading: true,
    })
    notify.spin('删除中')
    deleteIngress(clusterID, name, currentIngress.name,
      currentIngress.displayName, displayName, agentType, {
        success: {
          func: () => {
            notify.close()
            notify.success('删除成功')
            this.loadHttpIngressData(clusterID, name)
            this.setState({
              deleteModal: false,
              delConfirmLoading: false,
            })
          },
          isAsync: true,
        },
        failed: {
          func: res => {
            notify.close()
            notify.warn('删除失败', res.message.message || res.message)
            this.setState({
              delConfirmLoading: false,
            })
          },
        },
      })
  }

  handlePage = current => {
    this.setState({
      current,
      copyIngress: this.props.ingress.slice((current - 1) * 5, current * 5),
    })
  }

  renderIngressRules = (item, row) => {
    const { serviceName, servicePort } = item
    const { shunts } = row
    if (isEmpty(shunts)) {
      return '-'
    }
    const rulesObj = {}
    shunts.forEach(rule => {
      const { type, name, regex, value, serviceInfos } = rule
      serviceInfos.forEach(svc => {
        const { name: svcName, port } = svc
        if (svcName === serviceName && servicePort === +port) {
          if (!rulesObj[type]) {
            Object.assign(rulesObj, {
              [type]: [{
                name,
                regex,
                value,
              }],
            })
          } else {
            rulesObj[type].push({
              name,
              regex,
              value,
            })
          }
        }
      })
    })
    const ruleList = []
    for (const [ key, value ] of Object.entries(rulesObj)) {
      value.forEach(_rule => {
        const { name, value: ruleValue, regex } = _rule
        ruleList.push(<div className="ruleList">
          {upperInitial(key)}：
          <Tooltip title="匹配建"><span>「{name}」</span></Tooltip>
          {regex ? ' 正则匹配 ' : ' 完全匹配 '}
          <Tooltip title="匹配值"><span>「{ruleValue}」</span></Tooltip>
        </div>)
      })
    }
    return ruleList
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
          <Col span={5}>规则</Col>
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
              <Col span={5}>{this.renderIngressRules(item, row)}</Col>
            </Row>
          )
        }
      </div>
    )
  }

  render() {
    const { current, copyIngress, deleteModal, delConfirmLoading } = this.state
    const { togglePart, ingress, httpLoading } = this.props
    const pagination = {
      simple: true,
      total: ingress && ingress.length || 0,
      pageSize: 5,
      current,
      onChange: this.handlePage,
    }
    const columns = [
      {
        title: '监听器名称',
        dataIndex: 'displayName',
        width: '15%',
      },
      {
        title: '协议',
        width: '15%',
        render: () => 'http',
      },
      {
        title: '监听端口',
        width: '15%',
        render: () => 80,
      },
      {
        title: '服务位置',
        dataIndex: 'host',
        width: '20%',
        render: (text, record) => record.host + record.path,
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
            <Button type="primary" className="editBtn" onClick={() => togglePart(false, row, 'HTTP')}>编辑</Button>
            <Button type="ghost" onClick={() => this.showDelModal(row)}>删除</Button>
          </div>,
      },
    ]
    return (
      <div>
        <Modal
          title="删除监听"
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
        <div className="layout-content-btns">
          <Tooltip
            title="最多支持100条"
          >
            <Button type="primary" size="large" icon="plus" onClick={() => togglePart(false, null, 'HTTP')}>创建 HTTP
              监听</Button>
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
          loading={httpLoading}
        />
      </div>
    )
  }
}
