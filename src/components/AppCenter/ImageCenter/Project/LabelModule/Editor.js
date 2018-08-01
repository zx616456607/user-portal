import React, { Component } from 'react'
import QueueAnim from 'rc-queue-anim'
import { Row, Col, Button, Input, Form, Popover } from 'antd'
import { TwitterPicker } from 'react-color'
import NotificationHandler from '../../../../../components/Notification'

const notification = new NotificationHandler()
let isSet = false
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
        if(error.color){
          notification.warn("请选择或输入正确的标签颜色")
        }
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
    if(value.length > 128){
      _cb(new Error("名称长度不能超过128个字符"))
      return
    }
    _cb()
  }
  checkColor = (rules, value, _cb) => {
    if(!value){
      !!_cb && _cb(new Error("请输入或选择标签颜色"))
      // notification.warn("请输入或选择标签颜色")
      return
    }
    if(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)){
      !!_cb && _cb()
      return
    }
    else {
      !!_cb && _cb(new Error("请输入正确的颜色"))
    }
  }
  checkDesc = (rules, value, _cb) => {
    if(!value){
      _cb(new Error("请输入描述"))
      return false
    }
    _cb()
  }
  componentWillReceiveProps(next){
    if(!!next.current.id && !!this.props.current.id && next.current.id !== this.props.current.id){
      isSet = false
    }
    if (!!next.current.id && !isSet){
      isSet = true
      const { form: { setFieldsValue } } = this.props
      setFieldsValue({
        color: next.current.color,
        description: next.current.description,
        name: next.current.name,
      })
      // setTimeout(() => {
      //   isSet = false
      // }, 1000)
    }
  }
  render() {
    const { current, onCancel, form } = this.props
    const { name, color, description } = current
    const { getFieldProps, getFieldValue } = form
    const colorInputVal = getFieldValue("color") || current.color || ""
    const picker = <TwitterPicker
        style={{ width: 205, }}
        colors={colors}
        color={colorInputVal}
        triangle="hide"
        onChangeComplete={this.handleColorChange} />
    return (
      <QueueAnim>
        {/*<div>
          {
            current.id ?
              "编辑, id: " + current.id
              :
              "新增"
          }
        </div>*/}
        <Form key="form" className="editor">
          <Row>
            <Col span={6}>
              <FormItem {...formItemLayout} label="标签名称">
                <Input {
                  ...getFieldProps('name', {
                    rules: [{
                      validator: this.checkName,
                    }],
                    initialValue: name,
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
                  ...getFieldProps('description', {
                    rules: [{
                      validator: this.checkDesc,
                    }],
                    initialValue: description,
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