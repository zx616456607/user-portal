/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Release App Modal
 *
 * v0.1 - 2017-11-08
 * @author zhangxuan
 */

import React from 'react'
import { Modal, Form, Input, Select, Upload, Button, Icon, Row, Col } from 'antd'

const FormItem = Form.Item;
const Option = Select.Option;

class ReleaseAppModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false
    }
  }
  componentWillReceiveProps(nextProps) {
    const { visible: oldVisible } = this.props
    const { visible: newVisible } = nextProps
    if (oldVisible !== newVisible) {
      this.setState({
        visible: newVisible
      })
    }
  }
  releaseNameProps(rule, value, callback) {
    callback()
  }
  checkClassify(rule, value, callback) {
    callback()
  }
  confirmModal() {
    const { closeRleaseModal } = this.props
    this.setState({
      visible: false
    })
    closeRleaseModal()
  }
  cancelModal() {
    const { closeRleaseModal } = this.props
    this.setState({
      visible: false
    })
    closeRleaseModal()
  }
  render() {
    const { form } = this.props
    const { visible } = this.state
    const { getFieldProps, getFieldError, isFieldValidating } = form;
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 12 },
    };
    const nameProps = getFieldProps('name', {
      initialValue: 'app'
    })
    const releaseNameProps = getFieldProps('releaseName', {
      rules: [
        {
          validator: this.releaseNameProps,
        }
      ]
    })
    const classifyProps = getFieldProps('classify', {
      rules: [
        {
          validator: this.checkClassify,
        }
      ]
    })
    let children = [];
    for (let i = 10; i < 36; i++) {
      children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
    }
    return(
      <Modal
        title="发布到应用包商店"
        visible={visible}
        onOk={this.confirmModal.bind(this)}
        onCancel={this.cancelModal.bind(this)}
      >
        <Form
          horizontal
          form={form}
        >
          <FormItem
            {...formItemLayout}
            hasFeedback
            label="应用名称"
          >
            <Input {...nameProps} disabled/>
          </FormItem>
          <FormItem
            {...formItemLayout}
            hasFeedback
            label="发布名称"
            help={isFieldValidating('releaseName') ? '校验中...' : (getFieldError('releaseName') || []).join(', ')}
          >
            <Input {...releaseNameProps} placeholder="请输入发布名称" />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="分类"
          >
            <Select
              {...classifyProps}
              tags
            >
              {children}
            </Select>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="描述"
          >
            <Input type="textarea" {...getFieldProps('description')} placeholder="描述" />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="上传icon"
          >
            <Upload listType="picture-card" accept="image/*">
              <Icon type="plus" />
              <div className="ant-upload-text">上传应用图标</div>
            </Upload>
          </FormItem>
          <Row>
            <Col span={7}>
            </Col>
            <Col className="hintColor">
              上传icon支持（jpg/pgn图片格式，建议尺寸100px*100px）
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}

ReleaseAppModal = Form.create()(ReleaseAppModal)
export default ReleaseAppModal

