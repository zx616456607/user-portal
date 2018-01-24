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
import { getWrapGroupList, auditWrap } from '../../../actions/app_center'
import isEmpty from 'lodash/isEmpty'
import NotificationHandler from '../../../components/Notification'
import { API_URL_PREFIX, UPGRADE_EDITION_REQUIRED_CODE } from '../../../constants'
import defaultApp from '../../../../static/img/appstore/defaultapp.png'

const FormItem = Form.Item;
const Option = Select.Option;
const wrapTypelist = ['png','jpg','jpeg']
class ReleaseAppModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false
    }
  }
  componentWillReceiveProps(nextProps) {
    const { visible: oldVisible } = this.props
    const { visible: newVisible, getWrapGroupList, wrapGroupList: newGroupList, form } = nextProps
    if (oldVisible !== newVisible) {
      this.setState({
        visible: newVisible,
        pkgIcon: ''
      })
      form.resetFields()
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
    if(!value || !value.length) {
      return callback('请选择或输入分类')
    }
    if(value && value.length > 1) {
      return callback('只能选择一个分类')
    }
    callback()
  }
  checkDesc(rule, value, callback) {
    if(!value) {
      return callback('请输入描述信息')
    }
    if(value.length > 128) {
      return callback('描述信息不得超过128个字符')
    }
    callback()
  }
  confirmModal() {
    const { closeRleaseModal, form, auditWrap, callback, currentApp } = this.props
    const { validateFields } = form
    const { pkgIcon } = this.state
    const { id } = currentApp
    let notify = new NotificationHandler()
    validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      const { fileName, fileNickName, classifyName, description} = values
      this.setState({
        loading: true
      })
      const body = {
        fileName,
        fileNickName,
        classifyName: classifyName[0],
        description
      }
      if (pkgIcon) {
        Object.assign(body, { pkgIcon })
      }
      notify.spin('提交审核中')
      auditWrap(id, body, {
        success: {
          func: () => {
            notify.close()
            notify.success('提交审核成功')
            callback()
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
        },
        finally: {
          func: () => {
            this.setState({
              visible: false,
              loading: false
            })
            notify.close()
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
      <Button key="cancel" size="large" onClick={this.cancelModal.bind(this)}>取消</Button>,
      <Button key="confirm" size="large" type="primary" loading={loading} onClick={this.confirmModal.bind(this)}>提交审核</Button>
    ]
  }
  render() {
    const { form, currentApp, wrapGroupList, space } = this.props
    const { visible, pkgIcon } = this.state
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
    const descProps = getFieldProps('description', {
      rules: [
        {
          validator: this.checkDesc
        }
      ]
    })
    let headers = {}
    if (space && space.userName) {
      // 个人项目
      headers = {onbehalfuser: space.userName}
    }
    if (space && space.namespace !== 'default') {
      // 共享项目
      headers = {teamspace: space.namespace}
    }
    let notificat = new NotificationHandler()
    const uploadOpt = {
      showUploadList: false,
      accept:"image/*",
      action: `${API_URL_PREFIX}/pkg/icon`,
      headers,
      beforeUpload: file => {
        let isType

        isType = file.name.toLowerCase().match(/\.(jpg|png|jpeg)$/)

        if (!isType) {
          notificat.error('上传文件格式错误', '支持：'+ wrapTypelist.join('、')+'文件格式')
          return false
        }
        if (file.size > 1024 * 1024 * 10) {
          notificat.error('请上传10M以内的图片')
          return false
        }
      },
      onChange: e => {
        if (e.file.status === 'done') {
          notificat.success('上传成功')
          this.setState({
            pkgIcon: e.file.response.data.id
          })
        }
        if (e.file.status === 'error') {
          let message = e.file.response.message
          if (typeof e.file.response.message === 'object') {
            message = JSON.stringify(e.file.response.message)
            notificat.info(message)
          }
          if(e.file.response.statusCode !== UPGRADE_EDITION_REQUIRED_CODE){
            notificat.error('上传失败',message)
          }
        }
      }
    }
    const children = [];
    wrapGroupList && 
    wrapGroupList.classifies && 
    wrapGroupList.classifies.length &&
    wrapGroupList.classifies.forEach(item => {
    children.push(<Option value={item.classifyName} key={item.classifyName}>{item.classifyName}</Option>)
    })
    return(
      <Modal
        className="publishModal"
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
            label="发布名称"
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
            <Input type="textarea" {...descProps} placeholder="描述" />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="上传icon"
          >
            <Upload
              {...uploadOpt}
              
            >
              <span className="wrap-image">
                <img 
                  className="wrapLogo" 
                  src={
                    pkgIcon ?
                      `${API_URL_PREFIX}/pkg/icon/${pkgIcon}`
                      :
                      defaultApp
                  } 
                />
              </span>
            </Upload>
          </FormItem>
          <Row style={{ marginTop: -20 }}>
            <Col span={4}>
            </Col>
            <Col className="hintColor">
              上传icon支持（jpg/jpeg/png图片格式，建议尺寸100px*100px）
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}

ReleaseAppModal = Form.create()(ReleaseAppModal)

function mapStateToProps(state) {
  const { images, current } = state
  const { wrapGroupList } = images
  const { result: groupList } = wrapGroupList || { result: {} }
  const { data: groupData } = groupList || { data: [] }
  return {
    wrapGroupList: groupData,
    space: current && current.space
  }
}
export default connect(mapStateToProps, {
  getWrapGroupList,
  auditWrap
})(ReleaseAppModal)

