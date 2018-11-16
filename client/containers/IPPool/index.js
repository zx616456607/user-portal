
/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/* IPPoolConfig module for Cluster Network
 *
 * v0.1 - 2018-11-8
 * @author lvjunfeng
 */

import React from 'react'
import { connect } from 'react-redux'
import { Card, Table, Button, Modal, Form, Input } from 'antd'
import Notification from '../../../src/components/Notification'
import './style/index.less'
import * as IPPoolActions from '../../actions/ipPool'
import isCidr from 'is-cidr'
// import ipRangeCheck from 'ip-range-check'
import { getDeepValue } from '../../util/util'

const FormItem = Form.Item
const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 16 },
}
const notification = new Notification()

class ConfigIPPool extends React.Component {

  state = {
    createVisible: false,
    enterLoading: false,
    deleteVisible: false,
    deletePool: undefined,
  }

  componentDidMount() {
    this.loadList()
  }

  loadList = () => { // cluster的Tab有bug，需要在onchange中添加设置
    // cluster 选中的cluster Tab
    const { getIPPoolList, cluster: { clusterID } } = this.props
    const query = {
      version: 'v1',
    }
    getIPPoolList(clusterID, query)
  }

  dealWith = value => {
    const isIPV4 = isCidr.v4(value)
    const mask = value.split('/')[1]
    if (isIPV4) {
      return <span>{Math.pow(2, 32 - mask)}</span>
    }
    const isIPV6 = isCidr.v6(value)
    if (isIPV6) {
      return <span>{Math.pow(2, 128 - mask)}</span>
    }
  }

  changeCreateVisible = () => {
    this.setState({
      createVisible: !this.state.createVisible,
    })
  }

  toggleEnterLoading = () => {
    this.setState({
      enterLoading: !this.state.enterLoading,
    })
  }

  handleOk = () => {
    const { createIPPool, form: { validateFields }, cluster: { clusterID } } = this.props
    validateFields((err, values) => {
      if (err) return
      const { ipSegment, name } = values
      const body = {
        cidr: ipSegment,
        name,
        version: 'v1',
      }
      this.toggleEnterLoading()
      notification.spin('创建中...')
      createIPPool(clusterID, body, {
        success: {
          func: () => {
            notification.close()
            notification.success('创建地址池成功')
            this.toggleEnterLoading()
            this.changeCreateVisible()
            this.loadList()
          },
          isAsync: true,
        },
        failed: {
          func: error => {
            notification.close()
            const { statusCode } = error
            if (statusCode !== 401) {
              notification.warn('创建地址池失败')
              this.toggleEnterLoading()
            }
          },
        },
      })
    })
  }

  checkCidr = async (rule, value, callback) => {
    if (!value) return callback()
    if (!isCidr(value)) {
      return callback('请填写正确的 IP 网段')
    }
    const { getIPPoolExist, cluster: { clusterID } } = this.props
    const query = {
      version: 'v1',
      cidr: value,
    }
    const res = await getIPPoolExist(clusterID, query)
    const result = res.response.result
    if (result.statusCode === 200 && result.data.isPoolExist) {
      return callback('该 IP 网段已存在, 请重新填写')
    }
    callback()
    // `填写的子域应属于以下网段之一，
    //   10.0.0.0/8， 172.16.0.0/12，192.168.0.0/16，
    //   fd00::/8，`
  }

  confirmDelete = async () => {
    const { getIPPoolInUse, deleteIPPool, cluster: { clusterID } } = this.props
    const query = {
      cidr: this.state.deletePool,
    }
    this.toggleEnterLoading()
    const res = await getIPPoolInUse(clusterID, query)
    const inUse = getDeepValue(res, [ 'response', 'result', 'data', 'inUse' ]) || false
    if (inUse) {
      this.toggleEnterLoading()
      this.toggleDeleteVisible()
      return notification.warn('正在使用中，不可删除')
    }
    const delQuery = {
      version: 'v1',
      cidr: this.state.deletePool,
    }
    notification.spin('删除中...')
    deleteIPPool(clusterID, delQuery, {
      success: {
        func: () => {
          notification.close()
          notification.success('删除地址池成功')
          this.toggleEnterLoading()
          this.toggleDeleteVisible()
          this.loadList()
        },
        isAsync: true,
      },
      failed: {
        func: error => {
          notification.close()
          const { statusCode } = error
          if (statusCode !== 401) {
            notification.warn('删除地址池失败')
            this.toggleEnterLoading()
          }
        },
      },
    })
  }

  toggleDeleteVisible = row => {
    this.setState({
      deleteVisible: !this.state.deleteVisible,
      deletePool: row && row.cidr || '',
    })
  }

  checkName = (rule, value, callback) => {
    if (!value) return callback()
    const ln = value.length
    if (ln < 3 || ln > 63) {
      return callback('名称长度 3-63 位')
    }
    const reg = /^[a-z0-9\.-]*$/
    if (!reg.test(value)) return callback('名称为字母数字中划线组合')
    callback()
  }

  render() {
    const { createVisible, enterLoading, deleteVisible, deletePool } = this.state
    const { listData, isFetching, form } = this.props
    const { getFieldProps } = form
    const columns = [
      {
        title: '地址池名称',
        key: 'name',
        dataIndex: 'name',
        width: '25%',
      }, {
        title: 'IP 段',
        key: 'cidr',
        dataIndex: 'cidr',
        width: '25%',
      }, {
        title: 'IP 数',
        key: 'number',
        dataIndex: 'number',
        width: '25%',
        render: (text, row) => this.dealWith(row && row.cidr),
      }, {
        title: '操作',
        key: 'operate',
        dataIndex: 'name',
        width: '25%',
        render: (text, row) => <Button onClick={() => this.toggleDeleteVisible(row)}>删除</Button>,
      },
    ]
    return <div id="IPPoolConfig">
      {
        createVisible ?
          <Modal
            title="添加地址池"
            visible={createVisible}
            onOk={this.handleOk}
            confirmLoading={enterLoading}
            onCancel={this.changeCreateVisible}
            className="addIPPoolConfig"
          >
            <div style={{ paddingTop: 10 }}>
              <FormItem
                {...formItemLayout}
                label="地址池名称"
              >
                <Input
                  placeholder="请输入地址池名称"
                  { ...getFieldProps('name', { rules: [{
                    required: true,
                    message: '请输入地址池名称',
                  }, {
                    validator: this.checkName,
                  }] }) }
                />
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="IP 网段"
                className="netSegnment"
              >
                <Input
                  placeholder="请输入 IP 网段"
                  { ...getFieldProps('ipSegment', { rules: [{
                    required: true,
                    message: '请输入 IP 网段',
                  }, {
                    validator: this.checkCidr,
                  }] }) }
                />
              </FormItem>
            </div>
          </Modal>
          : null
      }
      <Modal
        title="删除操作"
        visible={deleteVisible}
        onOk={this.confirmDelete}
        confirmLoading={enterLoading}
        onCancel={this.toggleDeleteVisible}
      >
        <div className="deleteRow">
          <i className="fa fa-exclamation-triangle"/>
          确认删除该地址池 ( ip 段为 {deletePool} ) ？
        </div>
      </Modal>
      <Card>
        <div className="headerTitle">IP 地址池配置</div>
        <div className="operatorIP">
          <Button
            type="primary"
            onClick={this.changeCreateVisible}
          >
            添加地址池
          </Button>
          <Button
            type="ghost"
            onClick={this.loadList}
          >
            刷新
          </Button>
        </div>
        <Table
          className="reset_antd_table_header"
          columns={columns}
          dataSource={listData}
          pagination={false}
          loading={isFetching}
        />
      </Card>
    </div>
  }
}

const mapStateToProps = ({
  ipPool: { getIPPoolList },
}) => ({
  isFetching: getIPPoolList.isFetching,
  listData: getIPPoolList.data || [],
})

export default connect(mapStateToProps, {
  getIPPoolList: IPPoolActions.getIPPoolList,
  createIPPool: IPPoolActions.createIPPool,
  deleteIPPool: IPPoolActions.deleteIPPool,
  getIPPoolExist: IPPoolActions.getIPPoolExist,
  getIPPoolInUse: IPPoolActions.getIPPoolInUse,
})(Form.create()(ConfigIPPool))
