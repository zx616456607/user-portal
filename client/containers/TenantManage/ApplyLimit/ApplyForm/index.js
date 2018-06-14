/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * index.js page
 *
 * @author zhangtao
 * @date Wednesday June 13th 2018
 */
import * as React from 'react'
import { Form, Button, Select, Modal, Input, Card, Row, Col, Icon, Alert, InputNumber,
  Tooltip } from 'antd'
import './style/index.less'
const Option = Select.Option
// const OptGroup = Select.OptGroup

const createForm = Form.create
const FormItem = Form.Item

// 表单格式
const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 11 },
}
const formItemLayoutLarge = {
  labelCol: { span: 3 },
  wrapperCol: { span: 21 },
}
// 表单验证定制函数
const rulesFormat = message => {
  const rule = [{
    required: true,
    whitespace: true,
    message,
  }]
  return rule
}

const setFormItem = ({ getFieldProps, getFieldValue, removeFunction }) => {
  getFieldProps('keys', {
    initialValue: [ 0 ],
  })
  const formItem = getFieldValue('keys').map(k => {
    return (
      <Row type="flex">
        <Col span={6}>
          <div className="resource-wrap">
            <FormItem key={k} >
              <Select {...getFieldProps(`{resource${k}}`, { rules: rulesFormat('请选择资源') })}
                placeholder="请选择资源"
              >
                <Option value="CPU">CPU(核)</Option>
                <Option value="Storage">内存(GB)</Option>
                <Option value="Application">应用(个)</Option>
                <Option value="Service">服务(个)</Option>
                <Option value="Sql">关系型数据库(个)</Option>
                <Option value="Tenxflow">Tenxflow</Option>
              </Select>
            </FormItem>
          </div>
        </Col>
        <Col span={6}>
          <div className="resource-wrap">
            <FormItem key={k}>
              <Select {...getFieldProps(`{aggregate${k}}`, { rules: rulesFormat('请选择集群') })}
                placeholder="请选择集群"
              >
                <Option value="devAggregate">开发集群</Option>
                <Option value="Allaggregate">项目全局资源</Option>
              </Select>
            </FormItem>
          </div>
        </Col>
        <Col span={4}>
          <div className="resource-wrap useNum">1</div>
        </Col>
        <Col span={6}>
          <div className="resource-wrap applyNum">
            <FormItem key={k}>
              <Tooltip title="配额数量不小于xx">
                <InputNumber {...getFieldProps(`{number${k}}`, { rules: rulesFormat('请填写数量') })}
                  placeholder="请填写数量"
                />
              </Tooltip>
            </FormItem>
          </div>
        </Col>
        <Col span={2}>
          <div className="resource-wrap useNum">
            <Icon onClick={() => removeFunction(k)} type="delete" />
          </div>
        </Col>
      </Row>
    )
  })
  return formItem
}
class ApplyForm extends React.Component {
  state = {
    applayLoading: false, // 申请loading状态
  }
  uuid = 0 // id号
  remove = k => {
    const { form } = this.props
    let keys = form.getFieldValue('keys')
    keys = keys.filter(key => {
      return key !== k
    })
    form.setFieldsValue({
      keys,
    })
  }
  add = () => {
    this.uuid++
    const { form } = this.props
    let keys = form.getFieldValue('keys')
    keys = keys.concat(this.uuid)
    form.setFieldsValue({
      keys,
    })
  }
  handleSubmit = () => {
    this.props.form.validateFields(errors => {
      if (errors) {
        // console.log(errors)
      }
    })
  }
  render() {
    const { applayLoading } = this.state
    const { applayVisable, setApplayVisable } = this.props
    const { getFieldProps, getFieldValue } = this.props.form
    const removeFunction = this.remove
    // console.log('remove', this.remove)
    getFieldProps('keys', {
      initialValue: [ 0 ],
    })
    return (
      <Modal
        visible = {applayVisable}
        title="申请提高项目资源配额"
        onCancel={ setApplayVisable }
        footer={[
          <Button key="back" type="ghost" size="large" onClick={setApplayVisable}>取消</Button>,
          <Button key="submit" type="primary" size="large" loading={applayLoading}
            onClick={this.handleSubmit}>
              申 请
          </Button>,
        ]}
        width="700"
      >
        <Form horizontal form={this.props.form}>
          <FormItem
            {...formItemLayout}
            label="项目"
          >
            <Select {...getFieldProps('item', { rules: rulesFormat('请选择要申请配额的项目') })}
              placeholder="选择申请配额的项目">
              <Option value="项目1">项目1</Option>
              <Option value="项目2">项目2</Option>
              <Option value="项目3">项目3</Option>
              <Option value="项目4">项目4</Option>
            </Select>
          </FormItem>
          <FormItem
            {...formItemLayoutLarge}
            label="申请原因"
          >
            <Input {...getFieldProps('applyReason', { rules: rulesFormat('请填写申请原因') })}
              placeholder="必填" type="textarea" rows={4} />
          </FormItem>
          <Card
            title={
              <Row type="flex">
                <Col span={6}><span className="cardItem">资源</span></Col>
                <Col span={6}><span className="cardItem">选择集群</span></Col>
                <Col span={6}><span className="cardItem">已使用</span></Col>
                <Col span={6}><span className="cardItem">配额</span></Col>
              </Row>
            }
          >
            {setFormItem({ getFieldProps, getFieldValue, removeFunction })}
          </Card>
          <div className="addBtn" onClick={this.add}>
            <Icon type="plus-circle-o"/><span>添加申请</span>
          </div>
          <Alert message="配额数量不得小于已使用配额数量" type="error" showIcon />
        </Form>
      </Modal>
    )
  }
}

export default createForm()(ApplyForm)
