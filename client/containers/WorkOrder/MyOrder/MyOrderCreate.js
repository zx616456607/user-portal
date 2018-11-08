/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */
/**
 * my order create
 *
 * v0.1 - 2018-11-06
 * @author rensiwei
 */
import React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import { Form, Card, Input, Button, Row, Col, Select } from 'antd'
import * as workOrderActions from '../../../actions/work_order'
import './style/MyOrderCreate.less'
import NotificationHandler from '../../../../src/components/Notification'
import opts from '../classify'

const notify = new NotificationHandler()

const FormItem = Form.Item

class MyOrderDetail extends React.Component {
  state = {
    btnLoading: false,
  }
  componentDidMount() {}
  returnBack = () => {
    browserHistory.goBack(-1)
  }

  onOk = () => {
    const { form } = this.props
    const { validateFields } = form
    validateFields((err, values) => {
      if (err) return
      this.setState({
        btnLoading: true,
      }, () => {
        const { createWorkOrder } = this.props
        createWorkOrder(values, {
          success: {
            func: res => {
              if (res.statusCode === 200) {
                notify.success('工单提交成功')
                res.data ?
                  browserHistory.push({
                    pathname: '/work-order/my-order/' + res.data.id,
                  })
                  :
                  this.returnBack()
              }
            },
          },
          failed: {
            func: () => {
              notify.warn('工单提交失败')
            },
          },
          finally: {
            func: () => {
              this.setState({
                btnLoading: false,
              })
            },
          },
        })
      })
    })
  }
  checkContent = (rule, value, callback) => {
    // if (!value) return callback(new Error('请输入工单内容'))
    callback()
  }
  checkName = (rule, value, callback) => {
    // if (!value) return callback(new Error('请输入工单名称'))
    callback()
  }
  render() {
    const { btnLoading } = this.state
    const { form, user } = this.props
    const { getFieldProps } = form
    const options = opts.map(item => <Select.Option key={item.key}>{item.name}</Select.Option>)
    getFieldProps('creatorName', { initialValue: user.userName })
    return (
      <div className="createWorkOrderWrapper">
        <Card>
          <Form>
            <Row>
              <Col className="colMarginRight" span={8}>
                <FormItem
                  label="工单名称"
                >
                  <Input size="large" {...getFieldProps('workorderName', { initialValue: '',
                    validate: [{
                      rules: [
                        { required: true, message: '请输入工单名称' },
                        { validator: this.checkName },
                      ],
                      trigger: [ 'onChange' ],
                    }],
                  })} placeholder="请输入工单名称" />

                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col className="colMarginRight" span={8}>
                <FormItem
                  label="问题类型"
                >
                  <Select size="large" {...getFieldProps('classifyID', {
                    validate: [{
                      rules: [
                        { required: true, message: '请选择问题类型' },
                      ],
                      trigger: [ 'onChange' ],
                    }],
                  })} placeholder="请选择问题类型">
                    { options }
                  </Select>
                </FormItem>
              </Col>
            </Row>
            <FormItem
              label="工单内容"
            >
              <Input size="large" rows={6} type="textarea" {...getFieldProps('contents', { initialValue: '',
                validate: [{
                  rules: [
                    { required: true, message: '请输入工单内容' },
                    { validator: this.checkContent },
                  ],
                  trigger: [ 'onChange' ],
                }],
              })} placeholder="请输入工单内容" />
            </FormItem>
            <Row>
              <Col className="colMarginRight" span={8}>
                <FormItem
                  label="相关资源"
                >
                  <Input size="large" {...getFieldProps('comments', { initialValue: '',
                  })} placeholder="相关资源说明" />
                </FormItem>
              </Col>
              <Col className="hint" span={10}>如果涉及到具体资源, 请说明是哪个项目, 哪个集群的什么资源</Col>
            </Row>
            <FormItem>
              <Button type="ghost" onClick={this.returnBack}>取消</Button>
              <Button loading={btnLoading} style={{ marginLeft: 20 }} type="primary" onClick={this.onOk}>确定</Button>
            </FormItem>
          </Form>
        </Card>
      </div>
    )
  }
}

const mapStateToProps = state => {
  const { loginUser = {} } = state.entities
  return {
    user: loginUser.info,
  }
}

export default connect(mapStateToProps, {
  getSystemNoticeList: workOrderActions.getSystemNoticeList,
  createWorkOrder: workOrderActions.createWorkOrder,
})(Form.create()(MyOrderDetail))
