/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Kubeproxy config component
 *
 * 2018-03-07
 * @author Zhangpc
 */

import React from 'react'
import { Modal, Button, Form, Input, Select } from 'antd'
import './style/KubeproxyConfig.less'
import { connect } from 'react-redux'
import { getKubeproxy, updateKubeproxy } from '../../../actions/cluster'

const FormItem = Form.Item
const Option = Select.Option
const SCHEDULERS = [
  {
    key: 'default',
    text: '默认调度'
  },
  {
    key: 'rr',
    text: '轮询调度（Round-Robin Scheduling）'
  },
  {
    key: 'wrr',
    text: '加权轮询调度（Weighted Round-Robin Scheduling）'
  },
  {
    key: 'dh',
    text: '目标地址散列调度（Destination Hashing Scheduling）'
  },
  {
    key: 'sh',
    text: '源地址散列调度（Source Hashing Scheduling）'
  },
  {
    key: 'lc',
    text: '最小连接调度（Least-Connection Scheduling）'
  },
  {
    key: 'wlc',
    text: '加权最小连接调度（Weighted Least-Connection Scheduling）'
  },
  {
    key: 'lblc',
    text: '基于本地的最少连接（Locality-Based Least Connections Scheduling）'
  },
  {
    key: 'lblcr',
    text: '带复制的基于局部性最少连接（Locality-Based Least Connections with Replication Scheduling）'
  },
]

class KubeproxyConfig extends React.Component {
  state = {
    isEdit: false,
    confirmModalVisible: false,
    confirmLoading: false,
  }

  componentDidMount() {
    this.loadData()
  }

  loadData = () => {
    const { getKubeproxy, clusterID } = this.props
    getKubeproxy(clusterID, {
      success: {
        func: () => {
          this.setState({
            isEdit: false,
            confirmLoading: false,
            confirmModalVisible: false,
          })
        }
      }
    })
  }

  cancelEdit = () => {
    this.setState({
      isEdit: false,
    })
    this.props.form.resetFields()
  }

  confirmUpdate = () => {
    this.setState({ confirmLoading: true })
    const { clusterID, updateKubeproxy, form } = this.props
    const { kubeproxyMode, scheduler } = form.getFieldsValue()
    const body = {
      enabled: kubeproxyMode === 'IPVS',
      scheduler,
    }
    updateKubeproxy(clusterID, body).then(res => {
      if (res.error) {
        this.setState({ confirmLoading: false })
        return
      }
      this.loadData()
    })
  }

  render() {
    const { form, kubeproxy } = this.props
    const { enabled, scheduler } = kubeproxy
    const { getFieldProps, getFieldValue } = form
    const kubeproxyModeProps = getFieldProps('kubeproxyMode', {
      initialValue: enabled ? 'IPVS' : 'IPTables',
      rules: [
        { required: true, message: '请选择负载均衡模式' },
      ],
    })
    const kubeproxyMode = getFieldValue('kubeproxyMode')
    let schedulerProps
    if (kubeproxyMode === 'IPVS') {
      schedulerProps = getFieldProps('scheduler', {
        initialValue: scheduler || 'default',
        rules: [
          { required: true, message: '请选择调度规则' },
        ],
      })
    }
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 10 }
    }
    const { isEdit, confirmModalVisible } = this.state
    return (
      <div className="kubeproxy-config">
        <div className='header'>
        负载均衡模式（集群内网络）
        </div>
        <div className='body'>
          <div className="btns">
            {
              isEdit
              ? [
                <Button key="cancel" onClick={this.cancelEdit}>取消</Button>,
                <Button
                  key="submit"
                  type="primary"
                  onClick={() => this.setState({ confirmModalVisible: true })}
                >
                保存
                </Button>,
              ]
              : <Button type="primary" onClick={() => this.setState({ isEdit: true })}>
              编辑
              </Button>
            }
          </div>
          <Form>
            <FormItem
              label="负载均衡模式"
              {...formItemLayout}
            >
              <Select disabled={!isEdit} {...kubeproxyModeProps} placeholder="请选择负载均衡模式">
                <Option value="IPVS">IPVS (Beta)</Option>
                <Option value="IPTables">IPTables</Option>
              </Select>
            </FormItem>
            {
              schedulerProps &&
              <FormItem
                label="调度规则"
                {...formItemLayout}
              >
                <Select disabled={!isEdit} {...schedulerProps} placeholder="请选择负载均衡模式">
                  {SCHEDULERS.map(({ key, text }) => <Option key={key}>{text}</Option>)}
                </Select>
              </FormItem>
            }
          </Form>
          <Modal
            title="确认保存更改"
            visible={confirmModalVisible}
            onCancel={() => this.setState({ confirmModalVisible: false })}
            onOk={this.confirmUpdate}
            okText="确认保存"
            confirmLoading={this.state.confirmLoading}
          >
            <div className="deleteRow">
              <i className="fa fa-exclamation-triangle" aria-hidden="true"/>
              <span>
              网络将重启，过程大约 1min
              </span>
            </div>
            <div className="themeColor" style={{marginBottom: '15px'}}>
              <i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}/>
              确认变更集群内网络负载均衡模式？
            </div>
          </Modal>
        </div>
      </div>
    )
  }
}
KubeproxyConfig = Form.create()(KubeproxyConfig)

const mapStateToProps = (state, props) => {
  const { clusterID } = props
  const { kubeproxy } = state.cluster
  return {
    kubeproxy: kubeproxy && kubeproxy[clusterID] && kubeproxy[clusterID].data || {},
  }
}

export default connect(mapStateToProps, {
  getKubeproxy,
  updateKubeproxy,
})(KubeproxyConfig)
