
/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/* IPPoolConfig module for Cluster Network (calico)
 *
 * v0.1 - 2018-11-8
 * @author lvjunfeng
 */

import React from 'react'
import { connect } from 'react-redux'
import { Card, Table, Button, Modal, Form, Input, Tooltip, Icon } from 'antd'
import Notification from '../../../src/components/Notification'
import './style/index.less'
import * as IPPoolActions from '../../actions/ipPool'
import * as podAction from '../../../src/actions/app_manage'
import isCidr from '@tenx-ui/utils/lib/IP/isCidr'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'

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
    netSegment: undefined, // 默认网段 标识使用
  }

  componentDidMount() {
    this.loadList()
  }

  loadList = () => {
    const { getIPPoolList, cluster: { clusterID }, getPodNetworkSegment } = this.props
    const query = {
      version: 'v1',
    }
    getIPPoolList(clusterID, query)
    getPodNetworkSegment(clusterID, {
      success: {
        func: res => {
          this.setState({
            netSegment: res.data,
          })
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          const { statusCode } = err
          if (statusCode !== 403) {
            notification.warn('获取集群默认网段失败')
          }
        },
      },
    })
  }

  dealWith = value => {
    const IPtype = isCidr(value)
    const mask = value.split('/')[1]
    if (IPtype === 4) {
      return <span>{Math.pow(2, 32 - mask)}</span>
    } else if (IPtype === 6) {
      return <span>{Math.pow(2, 128 - mask)}</span>
    }
    return <span>'--'</span>
  }

  changeCreateVisible = () => {
    const { createVisible, enterLoading } = this.state
    enterLoading && this.toggleEnterLoading()
    this.setState({
      createVisible: !createVisible,
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
      createIPPool(clusterID, body, {
        success: {
          func: () => {
            notification.close()
            notification.success('创建地址池成功')
            this.state.enterLoading && this.toggleEnterLoading()
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
              this.state.enterLoading && this.toggleEnterLoading()
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
  }

  confirmDelete = async () => {
    const { getIPPoolInUse, deleteIPPool, cluster: { clusterID } } = this.props
    const { deletePool } = this.state
    const query = {
      cidr: deletePool.cidr,
    }
    const res = await getIPPoolInUse(clusterID, query)
    const inUse = getDeepValue(res, [ 'response', 'result', 'data', 'inUse' ]) || false
    if (inUse) {
      this.toggleDeleteVisible()
      return notification.warn('正在使用中，不可删除')
    }
    const delBody = {
      version: 'v1',
      cidr: deletePool.cidr,
      name: deletePool.name,
    }
    this.toggleEnterLoading()
    deleteIPPool(clusterID, delBody, {
      success: {
        func: () => {
          notification.close()
          notification.success('删除地址池成功')
          this.state.enterLoading && this.toggleEnterLoading()
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
            this.state.enterLoading && this.toggleEnterLoading()
          }
        },
      },
    })
  }

  toggleDeleteVisible = row => {
    const { deleteVisible, enterLoading } = this.state
    enterLoading && this.toggleEnterLoading()
    this.setState({
      deleteVisible: !deleteVisible,
      deletePool: row || '',
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
    const { createVisible, enterLoading, deleteVisible, deletePool, netSegment } = this.state
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
        dataIndex: 'operate',
        width: '25%',
        render: (text, row) => {
          const disabled = row.cidr === netSegment
          return <span>
            <Button
              disabled={disabled}
              onClick={() => this.toggleDeleteVisible(row)}
            >
              删除
            </Button>
            {
              disabled ?
                <Tooltip placement="top" title={disabled ? '默认地址池，不可删除' : null}>
                  <Icon type="exclamation-circle" style={{ paddingLeft: 6 }} />
                </Tooltip>
                : null
            }
          </span>
        },
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
              <div className="alertRow">
                请填写有效的私有网段，即：10.0.0.0/[8-24]，172.[16-31].0.0/[12-24]，192.168.0.0/[16-24]
                且不能与集群已使用的网段重复
              </div>
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
          确认删除该地址池 ( ip 段为 { deletePool && deletePool.cidr} ) ？
        </div>
      </Modal>
      <Card>
        <div className="headerTitle">IP 地址池配置( Calico )</div>
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
  getPodNetworkSegment: podAction.getPodNetworkSegment,
})(Form.create()(ConfigIPPool))
