import React from 'react'
import { Modal, Form, Input, Select, Row, Col, Icon } from 'antd'
import './style/index.less'

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
  state = {

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
  }

  handleOk = () => {
    // e.preventDefault()
    // this.props.form.validateFields((err, values) => {
    //   if (!err) {
    //     console.log('Received values of form: ', values)
    //   }
    // })
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
      title="添加 DNS 记录"
      visible={visible}
      onOk={this.handleOk}
      confirmLoading={this.state.confirmLoading}
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
            { ...getFieldProps('name', { rules: [{
              required: true,
              message: '请输入记录名称',
            }] }) }
          />
        </FormItem>

        <FormItem
          {...formItemLayout}
          label="解析到"
        >
          <Select
            style={{ width: 280 }}
            placeholder="请输入记录名称"
            { ...getFieldProps('address', {
              rules: [{
                required: true,
                message: '请选择记录名称',
              }],
              initialValue: 'IP',
            })}
          >
            <Option value="IP">外部 IP 地址</Option>
            <Option value="hostName">外部主机名</Option>
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
            </div>
            : <FormItem
              {...formItemLayout}
              label="外部主机名"
            >
              <Input
                placeholder="例如 example.com"
                style={{ width: 280 }}
                { ...getFieldProps('hostName') }
              />
            </FormItem>
        }
        <FormItem
          {...formItemLayout}
          label="服务端口"
        >
          <Input
            placeholder="填写服务端口 (如不填写默认 80)"
            style={{ width: 280 }}
            { ...getFieldProps('port') }
          />
        </FormItem>
      </div>
    </Modal>
  }
}

export default Form.create()(DnsModal)
