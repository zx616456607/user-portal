
/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2019 TenxCloud. All Rights Reserved.
 */

/* IPPoolConfig module for Cluster Network (macvlan)
 *
 * v0.1 - 2019-2-1
 * @author lvjunfeng
 */

import React from 'react'
import { connect } from 'react-redux'
import { Card, Table, Button, Modal, Form, Input, Tooltip, Icon } from 'antd'
import Notification from '../../../../src/components/Notification'
import '../style/index.less'
import * as IPPoolActions from '../../../actions/ipPool'
import isCidr from 'is-cidr'
// import ipRangeCheck from 'ip-range-check'
import DistributeModal from './distributeModal'
import { serviceNameCheck } from '../../../../src/common/naming_validation'
import { IP_REGEX } from '../../../../constants'
import { CidrCollision } from '../../../../kubernetes/ip'

const FormItem = Form.Item
const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
}
const notification = new Notification()

class ConfigIPPool extends React.Component {

  state = {
    createVisible: false,
    enterLoading: false,
    deleteVisible: false,
    currentPool: undefined,
    // netSegment: undefined, // 默认网段 标识使用
    distributeVisible: false,
  }

  componentDidMount() {
    this.loadList()
  }

  loadList = () => {
    const { getMacvlanIPPool, cluster: { clusterID } } = this.props
    getMacvlanIPPool(clusterID)
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
    const { createMacvlanIPPool, form: { validateFields }, cluster: { clusterID } } = this.props
    validateFields((err, values) => {
      if (err) return
      const { ipSegment, name, gateway, adapter } = values
      const body = {
        metadata: {
          name,
          annotations: {
            displayName: '',
          },
        },
        spec: {
          master: adapter,
          gateway,
          cidr: ipSegment,
        },
      }
      this.toggleEnterLoading()
      createMacvlanIPPool(clusterID, body, {
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
            this.state.enterLoading && this.toggleEnterLoading()
            if (statusCode === 400 && error.message && error.message.message === 'cidr collision') {
              const { message, field } = error.message.details.causes[0]
              return notification.warn('创建地址池失败', `与 ${message} 地址池的 ${field} 网段冲突，请重新修改`)
            }
            if (statusCode !== 401) {
              notification.warn('创建地址池失败')
            }
          },
        },
      })
    })
  }

  checkCidr = (rule, value, callback) => {
    if (!value) return callback()
    if (!isCidr(value)) {
      return callback('请填写正确的 IP 网段')
    }
    const { listData } = this.props
    listData.forEach(ele => {
      const cidr = ele.spec.cidr
      if (CidrCollision(value, cidr)) {
        return callback(`该 IP 网段和 ${cidr} 冲突`)
      }
    })
    callback()
  }

  checkIP = (rule, value, callback) => {
    if (!value) return callback()
    if (!IP_REGEX.test(value)) {
      return callback('请填写格式正确的网关')
    }
    /*
    放开网关校验
    const { getFieldValue, validateFields } = this.props.form
    const ipSegment = getFieldValue('ipSegment')
    if (!ipSegment) {
      validateFields([ 'ipSegment' ], { force: true })
      return callback('请先填写起始 IP')
    }
    if (!ipRangeCheck(value, ipSegment)) {
      return callback(`请填写属于 ${ipSegment} 网段的 IP`)
    }
    */
    callback()
  }

  confirmDelete = async () => {
    const { deleteMacvlanIPPool, cluster: { clusterID } } = this.props
    const name = this.state.currentPool.metadata.name
    deleteMacvlanIPPool(clusterID, name, {
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
          const { statusCode, message } = error
          this.state.enterLoading && this.toggleEnterLoading()
          if (statusCode === 400 && message.message === 'ip pool in using') {
            return notification.warn('删除地址池失败', '该地址池正在使用中不可删除')
          }
          if (statusCode !== 401) {
            notification.warn('删除地址池失败')
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
      currentPool: row || '',
    })
  }

  checkName = (rule, value, callback) => {
    if (!value) return callback()
    const ln = value.length
    if (ln < 3 || ln > 63) {
      return callback('名称长度 3-63 位')
    }
    const msg = serviceNameCheck(value, '地址池名称')
    if (msg !== 'success') {
      return callback(msg)
    }
    const { listData } = this.props
    listData.forEach(ele => {
      if (value === ele.metadata.name) {
        return callback('该地址池名称已存在')
      }
    })
    callback()
  }

  toggleDistributeVisible = row => {
    this.setState({
      distributeVisible: !this.state.distributeVisible,
      currentPool: row || '',
    })
  }

  render() {
    const { createVisible, enterLoading, deleteVisible, currentPool,
      distributeVisible } = this.state
    const { listData, isFetching, form, cluster: { clusterID } } = this.props
    const { getFieldProps } = form
    const columns = [
      {
        title: '地址池名称',
        key: 'metadata.name',
        dataIndex: 'metadata.name',
        width: '15%',
      }, {
        title: 'IP 段',
        key: 'spec.cidr',
        dataIndex: 'spec.cidr',
        width: '18%',
      }, {
        title: '网关',
        key: 'spec.gateway',
        dataIndex: 'spec.gateway',
        width: '18%',
      }, {
        title: '网卡',
        key: 'spec.master',
        dataIndex: 'spec.master',
        width: '18%',
      }, {
        title: 'IP 数',
        key: 'ipNum',
        dataIndex: 'ipNum',
        width: '12%',
        render: (text, row) => this.dealWith(row && row.spec && row.spec.cidr),
      }, {
        title: '操作',
        key: 'operate',
        dataIndex: 'operate',
        width: '22%',
        render: (text, row) => {
          const disabled = row.spec.default === true
          return <span>
            <Button
              type="primary"
              style={{ marginRight: 6 }}
              onClick={() => this.toggleDistributeVisible(row)}
            >
              项目分配
            </Button>

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
                输入不属于内部私有地址(Private Address)，若确为可用请继续
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
                label="网段"
              >
                <Input
                  placeholder="请输入网段"
                  { ...getFieldProps('ipSegment', { rules: [{
                    required: true,
                    message: '请输入网段',
                  }, {
                    validator: this.checkCidr,
                  }] }) }
                />
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="网关"
              >
                <Input
                  placeholder="请输入网关"
                  { ...getFieldProps('gateway', { rules: [{
                    required: true,
                    message: '请输入网关',
                  }, {
                    validator: this.checkIP,
                  }] }) }
                />
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="网卡"
              >
                <Input
                  placeholder="请输入网卡"
                  { ...getFieldProps('adapter', { rules: [{
                    required: true,
                    message: '请输入所用的宿主机网卡（默认为 eth0）',
                  }],
                  initialValue: 'eth0' }) }
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
          确认删除该地址池 { currentPool && currentPool.spec && `( ip 段为 ${currentPool.spec.cidr}, 网关为 ${currentPool.spec.gateway})` } ？
        </div>
      </Modal>
      {
        distributeVisible && currentPool ?
          <DistributeModal
            visible={distributeVisible}
            enterLoading={enterLoading}
            toggleDistributeVisible={this.toggleDistributeVisible}
            cluster={clusterID}
            currentPool={currentPool}
          />
          : null
      }
      <Card>
        <div className="headerTitle">IP 地址池配置( Macvlan )</div>
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
  ipPool: { macvlanPools },
}) => ({
  isFetching: macvlanPools.isFetching || false,
  listData: macvlanPools.data || [],
})

export default connect(mapStateToProps, {
  getMacvlanIPPool: IPPoolActions.getMacvlanIPPool,
  createMacvlanIPPool: IPPoolActions.createMacvlanIPPool,
  deleteMacvlanIPPool: IPPoolActions.deleteMacvlanIPPool,
  // getIPPoolExist: IPPoolActions.getIPPoolExist,
  // getIPPoolInUse: IPPoolActions.getIPPoolInUse,
})(Form.create()(ConfigIPPool))
