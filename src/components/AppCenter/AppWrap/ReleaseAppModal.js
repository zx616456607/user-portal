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
import { connect } from 'react-redux'
import { Modal, Form, Input, Select, Upload, Button, Icon, Row, Col } from 'antd'
import { getWrapGroupList, uploadWrapIcon } from '../../../actions/app_center'
import uploadFile from '../../../common/upload.js'
import isEmpty from 'lodash/isEmpty'
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
    const { visible: newVisible, getWrapGroupList, wrapGroupList: newGroupList } = nextProps
    if (oldVisible !== newVisible) {
      this.setState({
        visible: newVisible
      })
    }
    if (!oldVisible && newVisible && isEmpty(newGroupList && newGroupList.classifies)) {
      getWrapGroupList()
    }
  }
  releaseNameProps(rule, value, callback) {
    if (!value) {
      return callback('请输入发布名称')
    }
    if (value.length > 20) {
      return callback('发布名称不能超过20个字符')
    }
    callback()
  }
  checkClassify(rule, value, callback) {
    if(!value) {
      return callback('请选择或输入分类')
    }
    callback()
  }
  uploadIcon(file) {
    const { uploadWrapIcon } = this.props
    uploadWrapIcon(file.type.split('/')[1], file, {
      
    })
  }
  confirmModal() {
    const { closeRleaseModal, form, releaseWrap, wrapManageList, currentApp } = this.props
    const { validateFields } = form
    const { id } = currentApp
    validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      const { fileName, fileNickName, classifyName, description} = values
      this.setState({
        loading: true
      })
      releaseWrap(id, {
        fileName,
        fileNickName,
        classifyName: classifyName[0],
        description
      }, {
        success: {
          func: () => {
            wrapManageList({from: 0, size: 10})
            this.setState({
              visible: false,
              loading: false
            })
            closeRleaseModal()
          },
          isAsync: true
        },
        failed: {
          func: () => {
            this.setState({
              visible: false,
              loading: false
            })
            closeRleaseModal()
          }
        }
      })
    })
  }
  cancelModal() {
    const { closeRleaseModal } = this.props
    this.setState({
      visible: false
    })
    closeRleaseModal()
  }
  renderFooter() {
    const { loading } = this.state
    return[
      <Button key="cancel" onClick={this.cancelModal.bind(this)}>取消</Button>,
      <Button key="confirm" type="primary" loading={loading} onClick={this.confirmModal.bind(this)}>提交审核</Button>
    ]
  }
  render() {
    const { form, currentApp, wrapGroupList } = this.props
    const { visible } = this.state
    const { getFieldProps, getFieldError, isFieldValidating } = form;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
    };
    const nameProps = getFieldProps('fileName', {
      initialValue: currentApp && currentApp.fileName
    })
    const releaseNameProps = getFieldProps('fileNickName', {
      rules: [
        {
          validator: this.releaseNameProps,
        }
      ]
    })
    const classifyProps = getFieldProps('classifyName', {
      rules: [
        {
          validator: this.checkClassify,
        }
      ]
    })
    const children = wrapGroupList && 
          wrapGroupList.classifies && 
          wrapGroupList.classifies.length && 
          wrapGroupList.classifies.map(item => {
      return <Option key={item.classifyName}>{item.classifyName}</Option>
    })
    return(
      <Modal
        title="发布到应用包商店"
        visible={visible}
        onOk={this.confirmModal.bind(this)}
        onCancel={this.cancelModal.bind(this)}
        footer={this.renderFooter()}
      >
        <Form
          horizontal
          form={form}
        >
          <FormItem
            {...formItemLayout}
            hasFeedback
            label="应用包名称"
          >
            <Input {...nameProps} disabled/>
          </FormItem>
          <FormItem
            {...formItemLayout}
            hasFeedback
            label="发布名称"
            help={isFieldValidating('fileNickName') ? '校验中...' : (getFieldError('fileNickName') || []).join(', ')}
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
            <Upload listType="picture-card" accept="image/*" beforeUpload={file => this.uploadIcon(file)}>
              <Icon type="plus" />
              <div className="ant-upload-text">上传应用图标</div>
            </Upload>
          </FormItem>
          <Row>
            <Col span={4}>
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

function mapStateToProps(state) {
  const { images } = state
  const { wrapGroupList } = images
  const { result: groupList } = wrapGroupList || { result: {} }
  const { data: groupData } = groupList || { data: [] }
  return {
    wrapGroupList: groupData
  }
}
export default connect(mapStateToProps, {
  getWrapGroupList,
  uploadWrapIcon
})(ReleaseAppModal)

