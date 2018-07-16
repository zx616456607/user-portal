import React, { Component } from 'react'
import QueueAnim from 'rc-queue-anim'
import { Row, Col, Button, Input, Form, Popover } from 'antd'
import { TwitterPicker } from 'react-color'

const FormItem = Form.Item
const formItemLayout = {
  labelCol: {
    span: 4
  },
  wrapperCol: {
    span: 20
  }
}
const colors = [
  '#872ED8', '#AE64F4', '#4067FF', '#548CFE', '#2DB8F4',
  '#2BCFE5', '#00D183', '#27E09A', '#54C41A', '#83D167',
  '#FCBB00', '#F9B659', '#FF6A00', '#FF8A67', '#F5232B',
  '#F95561', '#EC3195', '#FB7F9E', '#687689', '#AABAC4',
]
class Editor extends Component {
  onOk = () => {
    const { form: { validateFields } } = this.props
    validateFields((error, values) => {
      if(error){
        return
      }
      this.props.onOk(values)
    })
  }
  handleColorChange = ({ hex: color }) => {
    const { form: { setFieldsValue } } = this.props
    setFieldsValue({
      color,
    })
  }
  checkName = (rules, value, _cb) => {
    if(!value){
      _cb(new Error("请输入标签名称"))
      return
    }
    _cb()
  }
  checkColor = (rules, value, _cb) => {
    if(!value){
      !!_cb && _cb(new Error("请输入或选择标签颜色"))
      return false
    }
    if(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)){
      !!_cb && _cb()
      return true
    }
    else {
      !!_cb && _cb(new Error("请输入正确的颜色"))
    }
  }
  checkDesc = (rules, value, _cb) => {
    _cb()
  }
  render() {
    const { current, onOk, onCancel, form } = this.props
    const { tag, color, desc } = current
    const { getFieldProps, getFieldValue } = form

    const colorInputVal = getFieldValue("color")
    const picker = <TwitterPicker
        style={{ width: 205, }}
        colors={colors}
        color={colorInputVal}
        triangle="hide"
        onChangeComplete={this.handleColorChange} />
    return (
      <QueueAnim>
        <Form key="form" className="editor">
          <Row>
            <Col span={6}>
              <FormItem {...formItemLayout} label="标签名称">
                <Input {
                  ...getFieldProps('tag', {
                    rules: [{
                      validator: this.checkName,
                    }],
                    initialValue: tag,
                  })
                } />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label="颜色">
                <div className="colorBox"
                  style={{ backgroundColor: colorInputVal }}
                ></div>
                <Popover overlayClassName="labelmodule_picker" placement="bottom" content={picker} trigger="click">
                  <Input
                    className="colorInput"
                    {
                    ...getFieldProps('color', {
                      rules: [{
                        validator: this.checkColor,
                      }],
                      trigger: ['onChange'],
                      initialValue: color,
                    })
                  } />
                </Popover>
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label="描述">
                <Input {
                  ...getFieldProps('desc', {
                    rules: [{
                      validator: this.checkDesc,
                    }],
                    initialValue: desc,
                  })
                } />
              </FormItem>
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