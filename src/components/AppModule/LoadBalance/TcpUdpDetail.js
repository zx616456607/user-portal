/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Tcp and udp monitor detail
 *
 * @author zhangxuan
 * @date 2018-08-02
 */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Form, InputNumber, Select, Card } from 'antd'
import DetailFooter from './DetailFooter'
import { sleep } from "../../../common/tools";

const FormItem = Form.Item
const Option = Select.Option

class TcpUdpDetail extends React.PureComponent{
  static propTypes = {
    type: PropTypes.oneOf(['TCP', 'UDP']).isRequired,
    togglePart: PropTypes.func,
  }

  state = {}

  goBack = () => {
    const { togglePart, type } = this.props
    togglePart(true, null, type)
  }

  handelConfirm = async () => {
    this.setState({
      confirmLoading: true,
    })
    await sleep(200)
    this.setState({
      confirmLoading: false,
    })
    this.goBack()
  }

  containerPortCheck = (rules, value, callback) => {
    if (value.length > 1) {
      return callback('容器端口不支持多选')
    }
    callback()
  }
  render() {
    const { confirmLoading } = this.state
    const { form ,currentIngress, type } = this.props
    const { getFieldProps } = form
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 6 }
    }
    const monitorPortProps = getFieldProps('monitorPort', {
      rules: [
        {
          required: true,
          message: '监听端口不能为空',
        }
      ],
      initialValue: currentIngress ? currentIngress.monitorPort : '',
    })
    const serviceProps = getFieldProps('service', {
      rules: [
        {
          required: true,
          message: '请选择服务',
        }
      ],
      initialValue: currentIngress ? currentIngress.serviceName : '',
    })
    const containerPortProps = getFieldProps('containerPort', {
      rules: [
        {
          required: true,
          message: '容器端口不能为空',
        }, {
          validator: this.containerPortCheck,
        }
      ],
      initialValue: currentIngress ? [currentIngress.port] : [],
    })
    return (
      <Card
        title={currentIngress ? `编辑 ${type} 监听` : `创建 ${type} 监听`}
      >
        <Form form={form}>
          <FormItem
            label="监听端口"
            {...formItemLayout}
          >
            <InputNumber style={{ width: '100%' }} min={1} max={65535} placeholder="1-65535" {...monitorPortProps}/>
          </FormItem>
          <FormItem
            label="后端服务"
            {...formItemLayout}
          >
            <Select
              placeholder="请选择服务"
              {...serviceProps}
            >
              <Option key="service1">service1</Option>
              <Option key="service2">service2</Option>
            </Select>
          </FormItem>
          <FormItem
            label="容器端口"
            {...formItemLayout}
          >
            <Select
              tags
              placeholder="请输入容器端口"
              {...containerPortProps}
            >
              <Option key="port1">80</Option>
              <Option key="port2">90</Option>
            </Select>
          </FormItem>
        </Form>
        <DetailFooter
          onCancel={this.goBack}
          onOk={this.handelConfirm}
          loading={confirmLoading}
        />
      </Card>
    )
  }
}

TcpUdpDetail = Form.create()(TcpUdpDetail)

export default connect()(TcpUdpDetail)
