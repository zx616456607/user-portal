/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Tcp and udp monitor table
 *
 * @author zhangxuan
 * @date 2018-08-01
 */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Table, Button, Pagination, Modal } from 'antd'
import * as lbActions from '../../../actions/load_balance'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import Notification from '../../Notification'

const PAGE_SIZE = 5

const notify = new Notification()

const mapStateToProps = (state, props) => {
  const { type } = props
  const lowerType = type.toLowerCase()
  const ingressData = getDeepValue(state, ['loadBalance', 'tcpUdpIngress', lowerType])
  return {
    ingressData,
  }
}

@connect(mapStateToProps, {
  getTcpUdpIngress: lbActions.getTcpUdpIngress,
  deleteTcpUdpIngress: lbActions.deleteTcpUdpIngress,
})

export default class TcpUdpTable extends React.PureComponent{
  static propTypes = {
    type: PropTypes.oneOf(['TCP', 'UDP']).isRequired,
    clusterID: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    lbDetail: PropTypes.object.isRequired,
  }

  state = {
    current: 1,
    copyIngress: [],
  }

  componentDidMount() {
    this.loadIngressList()
  }

  componentWillReceiveProps(nextProps) {
    const { type } = nextProps
    if (type !== this.props.type) {
      this.loadIngressList(nextProps)
    }
  }

  loadIngressList = async props => {
    const { current } = this.state
    const { getTcpUdpIngress, type, clusterID, name } = props || this.props
    const lowerType = type.toLowerCase()
    await getTcpUdpIngress(clusterID, name, lowerType)
    const { ingressData } = this.props
    this.setState({
      copyIngress: ingressData.data.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
    })
  }

  handlePage = current => {
    const { ingressData } = this.props
    this.setState({
      current,
      copyIngress: ingressData.data.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
    })
  }

  handleDelete = row => {
    this.setState({
      deleteRow: row,
      deleteVisible: true,
    })
  }

  cancelDelete = () => {
    this.setState({
      deleteVisible: false,
    })
  }

  confirmDelete = async () => {
    const { deleteTcpUdpIngress, clusterID, name, type, location, lbDetail } = this.props
    const { deleteRow } = this.state
    const { displayName } = location.query
    const { agentType } = getDeepValue(lbDetail.deployment, ['metadata', 'labels'])
    this.setState({
      confirmLoading: true,
    })
    notify.spin('删除中...')
    const lowerType = type.toLowerCase()
    const { exportPort } = deleteRow
    const result = await deleteTcpUdpIngress(clusterID, name, lowerType, exportPort, displayName, agentType)
    if (result.error) {
      notify.close()
      notify.warn('删除失败')
      this.setState({
        confirmLoading: false,
      })
      return
    }
    notify.close()
    notify.success('删除成功')
    await this.loadIngressList()
    this.setState({
      confirmLoading: false,
      deleteVisible: false,
    })
  }

  render() {
    const { current, copyIngress, deleteVisible, confirmLoading } = this.state
    const { type, togglePart, ingressData } = this.props
    const { data, isFetching } = ingressData || { data: [] }
    const pagination = {
      simple: true,
      total: data.length,
      pageSize: PAGE_SIZE,
      current,
      onChange: this.handlePage
    }
    const columns = [
      {
        title: '监听端口',
        dataIndex: 'exportPort',
        width: '25%',
      },
      {
        title: '后端服务',
        dataIndex: 'serviceName',
        width: '25%',
      },
      {
        title: '服务端口',
        dataIndex: 'servicePort',
        width: '25%',
      },
      {
        title: '操作',
        width: '25%',
        render: (text, row) =>
          <div>
            <Button type="primary" className="editBtn" onClick={() => togglePart(false, row, type)}>编辑</Button>
            <Button type="ghost" onClick={() => this.handleDelete(row)}>删除</Button>
          </div>
      }
    ]
    return (
      <div>
        <Modal
          title={`删除监听`}
          visible={deleteVisible}
          confirmLoading={confirmLoading}
          onCancel={this.cancelDelete}
          onOk={this.confirmDelete}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" aria-hidden="true"/>
            删除监听，将会导致原有转发失败，是否删除？
          </div>
        </Modal>
        <div className="layout-content-btns">
          <Button type="primary" size="large" icon="plus" onClick={() => togglePart(false, null, type)}>
            {`创建 ${type} 监听`}
          </Button>
          {
            data.length ?
              <div className="page-box">
                <span className="total">共计 {data.length} 条</span>
                <Pagination {...pagination}/>
              </div>
              : null
          }
        </div>
        <Table
          className="reset_antd_table_header"
          columns={columns}
          dataSource={copyIngress}
          pagination={false}
          loading={isFetching}
        />
      </div>
    )
  }
}
