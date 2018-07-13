import React, { Component } from 'react'
import QueueAnim from 'rc-queue-anim'
import { Row, Col, Button, Input, Form } from 'antd'

const FormItem = Form.Item
const formItemLayout = {
  labelCol: {
    span: 4
  },
  wrapperCol: {
    span: 20
  }
}
class Editor extends Component {
  onOk = () => {
    const { form: { validateFields } } = this.props

    this.props.onOk()
  }
  checkName = (value, _cb) => {
    if(!value){
      _cb(new Error("请输入标签名称"))
      return
    }
    _cb()
  }
  checkColor = (value, _cb) => {
    _cb()
  }
  checkDesc = (value, _cb) => {
    _cb()
  }
  render() {
    const { current, onOk, onCancel, form } = this.props
    const { tag, color, desc } = current
    const { getFieldProps } = form
    return (
      <QueueAnim>
        <Form key="form" className="editor">
          <Row>
            <Col span={6}>
              <FormItem {...formItemLayout} label="标签名称"><Input {
                ...getFieldProps('tag', {
                  rules: [{
                    validator: this.checkName,
                  }],
                  initialValue: tag,
                })
              } /></FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label="颜色"><Input {
                ...getFieldProps('color', {
                  rules: [{
                    validator: this.checkColor,
                  }],
                  initialValue: color,
                })
              } /></FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label="描述"><Input {
                ...getFieldProps('desc', {
                  rules: [{
                    validator: this.checkDesc,
                  }],
                  initialValue: desc,
                })
              } /></FormItem>
            </Col>
            <Col className="btnContainer" span={6}>
              <Button type="primary" size="large" onClick={this.onOk}>保存</Button>
              <Button type="ghost" size="large" onClick={onCancel}>取消</Button>
            </Col>
          </Row>
        </Form>
      </QueueAnim>
    )
  }
}
export default Form.create()(Editor)