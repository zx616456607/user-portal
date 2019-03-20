/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * modal of Create Dns Record
 *
 * v0.1 - 2018-07-10
 * @author lvjunfeng
 */

import React from 'react'
import { connect } from 'react-redux'
import { Modal, Form, Input, Select, Row, Col, Icon } from 'antd'
import './style/index.less'
import * as dnsRecordActions from '../../actions/dnsRecord'
import Notification from '../../../src/components/Notification'
import { validateK8sResourceForServiceName } from '../../../src/common/naming_validation'
import { isIP } from '@tenx-ui/utils/lib/IP/isIP'

const notification = new Notification()
const FormItem = Form.Item
const Option = Select.Option
const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 17 },
}
const moreItemLayout = {
  wrapperCol: {
    sm: { span: 17, offset: 5 },
  },
}
let uuid = 1

class DnsModal extends React.Component {

  componentDidMount() {
    setTimeout(() => {
      document.getElementById('recordName').focus()
    }, 50)
  }

  remove = k => {
    const { form } = this.props
    // can use data-binding to get
    const keys = form.getFieldValue('keys')
    if (keys.length === 1) {
      return
    }
    // can use data-binding to set
    form.setFieldsValue({
      keys: keys.filter(key => key !== k),
    })
  }

  add = () => {
    const { form } = this.props
    // can use data-binding to get
    const keys = form.getFieldValue('keys')
    const nextKeys = keys.concat(uuid)
    uuid++
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      keys: nextKeys,
    })
    setTimeout(() => {
      document.getElementById(`name${uuid - 1}`).focus()
    }, 50)
  }

  handleOk = () => {
    // e.preventDefault()
    const { cluster, createServiceDns, handleCreate, loadData } = this.props
    this.props.form.validateFields((err, values) => {
      if (err) {
        return
      }
      const { recordName, address, port } = values
      const body = {
        metadata: {
          name: recordName, // 名称
          labels: {
            'system/endpoint-type': address, // 类型
          },
        },
      }
      if (address === 'IP') {
        const arr = []
        values.keys.map(item => {
          return arr.push(values[`name${item}`])
        })
        const str = JSON.stringify(arr)
        body.metadata.annotations = {
          'system/endpoint-ips': str,
          'system/endpoint-ip-port': port || '80',
        }
        body.spec = { // 这个 spec 字段就是写死的这个结构，固定的值
          clusterIP: 'None',
          type: 'ClusterIP',
        }
      } else {
        body.spec = {
          type: 'ExternalName',
          externalName: values.hostName,
        }
      }
      notification.spin('创建中...')
      createServiceDns(cluster, body, {
        success: {
          func: () => {
            notification.close()
            notification.success('新建 DNS 记录成功')
            handleCreate()
            loadData()
          },
          isAsync: true,
        },
        failed: {
          func: error => {
            const { message, statusCode } = error
            notification.close()
            if (statusCode === 412) {
              return
            }
            notification.warn('新建 DNS 记录失败', message.message)
          },
        },
      })
    })
  }

  handleSelect = val => {
    const { setFieldsValue } = this.props.form
    setFieldsValue({ address: val })
    if (val === 'IP') {
      uuid = 1
      setFieldsValue({ keys: [ 0 ] })
    } else {
      uuid = 0
      setFieldsValue({ keys: [] })
    }
  }

  checkDNSName = (rule, value, callback) => {
    if (!value) {
      return callback()
    }
    if (value.length < 3 || value.length > 60) {
      return callback('名称应在3-60位之间')
    }
    const reg = /^[a-z]{1}/
    if (!reg.test(value)) {
      return callback('请以小写字母开头')
    }
    const checkReg = /[a-z0-9]$/
    if (!checkReg.test(value)) {
      return callback('请以小写字母或者数字结尾')
    }
    if (!validateK8sResourceForServiceName(value)) {
      return callback('名称由字母、数字、中划线组成')
    }
    this.props.listData.forEach(item => {
      if (item.name === value) {
        return callback('该 DNS 记录已存在，请修改名称')
      }
    })
    callback()
  }

  checkoutIP = (rule, value, callback) => {
    if (!value) {
      return callback()
    }
    if (!isIP(value)) {
      return callback('请填写正确的 IP 地址')
    }
    callback()
  }

  render() {
    const { visible, handleCreate, form } = this.props
    const { getFieldProps, getFieldValue } = form
    getFieldProps('keys', { initialValue: [ 0 ] })
    const keys = getFieldValue('keys')
    const formItems = keys.map((k, index) => {
      return (
        <Form.Item
          { ...(index === 0 ? formItemLayout : moreItemLayout) }
          label={ index === 0 ? '目标 IP 地址' : '' }
          style={{ marginBottom: 12 }}
          key={k}>
          <Input
            placeholder="例如： 1.2.3.4"
            {...getFieldProps(`name${k}`, {
              rules: [{
                required: true,
                whitespace: true,
                message: '请输入 IP 地址',
              }, {
                validator: this.checkoutIP,
              }],
            })}
            style={{ width: 280, marginRight: 8 }}
          />
          {
            keys.length > 1 ?
              <Icon type="delete" onClick={() => this.remove(k)} />
              : null
          }
        </Form.Item>
      )
    })
    return <Modal
      wrapClassName="addDnsModal"
      title="添加 DNS 记录"
      visible={visible}
      onOk={this.handleOk}
      // confirmLoading={this.state.confirmLoading}
      onCancel={handleCreate}
    >
      <div>
        <FormItem
          {...formItemLayout}
          label="名称"
        >
          <Input
            placeholder="请输入记录名称"
            style={{ width: 280 }}
            { ...getFieldProps('recordName', { rules: [{
              required: true,
              message: '请输入记录名称',
            }, {
              validator: this.checkDNSName,
            }] }) }
          />
        </FormItem>

        <FormItem
          {...formItemLayout}
          label="解析到"
        >
          <Select
            style={{ width: 280 }}
            { ...getFieldProps('address', {
              rules: [{
                required: true,
              }],
              initialValue: 'IP',
            })}
            onChange={this.handleSelect}
          >
            <Option value="IP">外部 IP 地址</Option>
            <Option value="name">外部主机名</Option>
          </Select>
        </FormItem>
        {
          getFieldValue('address') === 'IP' ?
            <div>
              { formItems }
              <Row>
                <Col span={5}></Col>
                <Col span={6} onClick={this.add} style={{ color: '#2db7f5', cursor: 'pointer' }}>
                  <Icon type="plus-circle-o" style={{ marginRight: 5, marginBottom: 24 }} />
                  添加 IP 地址
                </Col>
              </Row>
              <FormItem
                {...formItemLayout}
                label="服务端口"
              >
                <Input
                  placeholder="填写服务端口 (如不填写默认 80)"
                  style={{ width: 280 }}
                  { ...getFieldProps('port')}
                />
              </FormItem>
            </div>
            :
            <FormItem
              {...formItemLayout}
              label="外部主机名"
            >
              <Input
                placeholder="例如 example.com"
                style={{ width: 280 }}
                { ...getFieldProps('hostName', {
                  rules: [{
                    required: true,
                    message: '请填写外部主机名',
                  }],
                }) }
              />
            </FormItem>
        }
      </div>
    </Modal>
  }
}

const mapStateToProps = ({ entities: { current } }) => ({
  cluster: current.cluster.clusterID,
})

export default connect(mapStateToProps, {
  createServiceDns: dnsRecordActions.createServiceDns,
})(Form.create()(DnsModal))
