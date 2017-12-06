/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Image Publish Modal
 *
 * v0.1 - 2017-11-16
 * @author zhangxuan
 */

import React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import { Modal, Form, Input, Select, Upload, Icon, Row, Col, Button } from 'antd'
import { getWrapGroupList } from '../../../../actions/app_center'
import { imagePublish, checkAppNameExists, getImageStatus, imageNameExists } from '../../../../actions/app_store'
import { loadRepositoriesTagConfigInfo } from '../../../../actions/harbor'
import { API_URL_PREFIX, ASYNC_VALIDATOR_TIMEOUT, UPGRADE_EDITION_REQUIRED_CODE, DEFAULT_REGISTRY } from '../../../../constants'
import NotificationHandler from '../../../../components/Notification'
import { encodeImageFullname } from '../../../../common/tools'
import defaultImage from '../../../../../static/img/appstore/defaultimage.png'
import isEmpty from 'lodash/isEmpty'
const FormItem = Form.Item;
const Option = Select.Option;

const wrapTypelist = ['png','jpg','jpeg']

class PublishModal extends React.Component {
  constructor(props) {
    super(props)
    this.confirmModal = this.confirmModal.bind(this)
    this.cancelModal = this.cancelModal.bind(this)
    this.fileNickProps = this.fileNickProps.bind(this)
    this.closeSuccessModal = this.closeSuccessModal.bind(this)
    this.checkImageName = this.checkImageName.bind(this)
    this.state = {
      visible: false,
      pkgIcon: '',
    }
  }
  componentWillReceiveProps(nextProps) {
    const { visible: oldVisible } = this.props
    const { 
      visible: newVisible, wrapGroupList,
      currentImage, form, getWrapGroupList, getImageStatus, server } = nextProps
    if (oldVisible !== newVisible) {
      this.setState({
        visible: newVisible,
        pkgIcon: '',
        successModal: false,
        imageID: ''
      })
      form.resetFields()
    }
    if (!oldVisible && newVisible) {
      let body = {
        image: `${server}/${currentImage.name}`
      }
      getImageStatus(body, {
        success: {
          func: res => {
            let flag = false
            if (res.data) {
              flag = res.data.every(item => {
                return [1, 2].includes(item.status)
              })
            }
            if (res.icon > 0) {
              this.setState({
                pkgIcon: `${res.icon}?${+new Date()}`
              })
            }
            if (flag) {
              form.setFields({
                tagsName: {
                  errors: ['无可发布版本'],
                  value: ''
                }
              })
            }
          }
        }
      })
    }
    if (!oldVisible && newVisible && isEmpty(wrapGroupList && wrapGroupList.classifies)) {
      getWrapGroupList()
    }
  }
  componentWillUnmount() {
    clearTimeout(this.nickNameTimeout)
    clearTimeout(this.imageNameTimeout)
  }
  checkImageName(rule, value, callback) {
    const { imageNameExists, form } = this.props
    const tag = form.getFieldValue('tagsName')
    if (!tag) return callback()
    this.imageNameTimeout = setTimeout(()=>{
      const body = {
        image: `${value}:${tag}`
      }
      imageNameExists(body, {
        success: {
          func: res => {
            if (res.data) {
              return callback('该镜像名称已存在')
            }
            callback()
          },
          isAsync: true
        },
        failed: {
          func: () => {
            callback()
          },
          isAsync: true
        }
      })
    },ASYNC_VALIDATOR_TIMEOUT)
  }
  fileNickProps(rule, value, callback) {
    const { checkAppNameExists } = this.props
    let newValue = value && value.trim()
    if (!newValue) {
      return callback('请输入发布名称')
    }
    if (newValue.length < 3 || newValue.length > 20) {
      return callback('发布名称需在3-20个字符之间')
    }
    clearTimeout(this.nickNameTimeout)
    this.nickNameTimeout = setTimeout(()=>{
      checkAppNameExists(newValue, {
        success: {
          func: res => {
            if (res.data) {
              return callback('该发布名称已存在')
            }
            callback()
          },
          isAsync: true
        },
        failed: {
          func: () => {
            callback()
          },
          isAsync: true
        }
      })
    },ASYNC_VALIDATOR_TIMEOUT)
  }
  checkTags(rule, value, callback) {
    if (!value) {
      return callback('请选择镜像版本')
    }
    callback()
  }
  checkClassify(rule, value, callback) {
    if(!value) {
      return callback('请选择或输入分类')
    }
    if(value.length > 1) {
      return callback('只能选择一个分类')
    }
    callback()
  }
  checkDesc(rule, value, callback) {
    if(!value) {
      return callback('请输入描述信息')
    }
    if(value.length < 3 || value.length > 80) {
      return callback('描述信息需在3-80个字符之间')
    }
    callback()
  }
  checkInfo(rule, value, callback) {
    if (!value) {
      return callback('请输入提交信息')
    }
    if (value.length < 3 || value.length > 20) {
      return callback('提交信息需在3-20个字符之间')
    }
    callback()
  }
  confirmModal() {
    const { callback, form, imagePublish, currentImage, server, publishName } = this.props
    const { pkgIcon, imageID } = this.state
    let notify = new NotificationHandler()
    let validateArr = ['imageName', 'tagsName', 'description', 'classifyName', 'request_message']
    if (!publishName) {
      validateArr.push('fileNickName')
    }
    form.validateFields(validateArr, (errors, values) => {
      if (!!errors) {
        return
      }
      this.setState({
        loading: true
      })
      const { tagsName, description, classifyName, request_message } = values
      const fileNickName = form.getFieldValue('fileNickName')
      const body = {
        origin_id: `${server}/${currentImage.name}:${tagsName}`,
        fileNickName,
        description,
        classifyName: classifyName[0],
        request_message,
        type: 2,
        resource: imageID
      }
      if (pkgIcon) {
        Object.assign(body, { icon_id: Number(pkgIcon.split('?')[0]) })
      }
      notify.close()
      notify.spin('发布中')
      imagePublish(body, {
        success: {
          func: () => {
            notify.close()
            notify.success('发布成功')
            this.setState({
              visible: false,
              loading: false,
              successModal: true
            })
            callback()
          },
          isAsync: true
        },
        failed: {
          func: res => {
            if (res.statusCode === 409) {
              notify.close()
              notify.error('发布失败\n', `该镜像与${res.message.details.name}内容完全相同，不能发布`)
            } else {
              notify.close()
              notify.error('发布失败\n', res.message)
            }
            this.setState({
              loading: false
            })
          }
        },
        finally: {
          func: () => {
            notify.close()
            this.setState({
              loading: false
            })
          }
        }
      })
    })
  }
  cancelModal() {
    const { callback } = this.props
    this.setState({
      visible: false
    })
    callback()
  }
  renderFooter() {
    const { loading } = this.state
    return[
      <Button key="cancel" size="large" onClick={this.cancelModal.bind(this)}>取消</Button>,
      <Button key="confirm" size="large" type="primary" loading={loading} onClick={this.confirmModal.bind(this)}>提交审核</Button>
    ]
  }
  closeSuccessModal() {
    this.setState({
      successModal: false
    })
  }
  getConfigInfo(tag) {
    const { loadRepositoriesTagConfigInfo, currentImage } = this.props
    loadRepositoriesTagConfigInfo(DEFAULT_REGISTRY,encodeImageFullname(currentImage.name), tag, {
      success: {
        func: res => {
          this.setState({
            imageID: res.data.imageID
          })
        }
      }
    })
  }
  render() {
    const { visible, pkgIcon, successModal } = this.state
    const { space, form, currentImage, imgTag, wrapGroupList, publishName, description, classify_name } = this.props
    const { getFieldProps, isFieldValidating, getFieldError, getFieldValue } = form
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
    };
    const nameProps = getFieldProps('imageName', {
      rules: [
        {
          validator: this.checkImageName
        }
      ],
      initialValue: currentImage && currentImage.name && currentImage.name.split('/')[1]
    })
    const releaseNameProps = getFieldProps('fileNickName', {
      rules: [
        {
          validator: this.fileNickProps,
        }
      ],
      initialValue: publishName && publishName
    })
    const tagsProps = getFieldProps('tagsName', {
      rules: [
        {
          validator: this.checkTags,
        }
      ],
      onChange: tag => this.getConfigInfo(tag)
    })
    const classifyProps = getFieldProps('classifyName', {
      rules: [
        {
          validator: this.checkClassify,
        }
      ],
      initialValue: classify_name ? [classify_name] : []
    })
    const descProps = getFieldProps('description', {
      rules: [
        {
          validator: this.checkDesc
        }
      ],
      initialValue: description && description
    })
    const infoProps = getFieldProps('request_message', {
      rules: [
        {
          validator: this.checkInfo
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
      action: `${API_URL_PREFIX}/app-store/apps/${currentImage && currentImage.id}/icon`,
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
        this.setState({
          fileList: e.fileList
        })
        if (e.file.status === 'done') {
          notificat.success('上传成功')
          this.setState({
            pkgIcon: `${e.file.response.data.id}?${+new Date()}`,
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
    const tagsChildren = []
    imgTag && imgTag.length && imgTag.forEach(item => {
      tagsChildren.push(<Option key={item.name} disabled={[1, 2].includes(item.status)}>{item.name}</Option>)
    })
    const children = [];
    wrapGroupList &&
    wrapGroupList.classifies &&
    wrapGroupList.classifies.length &&
    wrapGroupList.classifies.forEach(item => {
      children.push(<Option value={item.classifyName} key={item.classifyName}>{item.classifyName}</Option>)
    })
    return(
      <div>
        <Modal
          className="imagePublishModal"
          title="发布"
          visible={visible}
          onOk={this.confirmModal}
          onCancel={this.cancelModal}
          footer={this.renderFooter()}
        >
          <SuccessModal
            visible={successModal}
            callback={this.closeSuccessModal}
          />
          <Form
            horizontal
            form={form}
          >
            <FormItem
              {...formItemLayout}
              hasFeedback
              label="镜像名称"
            >
              <Input {...nameProps} disabled/>
            </FormItem>
            <Form.Item
              {...formItemLayout}
              hasFeedback={!!getFieldValue('fileNickName')}
              label="发布名称"
              help={isFieldValidating('fileNickName') ? '校验中...' : (getFieldError('fileNickName') || []).join(', ')}
            >
              <Input 
                disabled={publishName && publishName ? true : false}
                {...releaseNameProps}
                placeholder="请输入发布名称" 
              />
            </Form.Item>
            <FormItem
              {...formItemLayout}
              label="镜像版本"
            >
              <Select
                showSearch
                {...tagsProps}
              >
                {tagsChildren}
              </Select>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="分类"
            >
              <Select
                disabled={classify_name && classify_name ? true : false}
                showSearch
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
                    `${API_URL_PREFIX}/app-store/apps/icon/${pkgIcon}`
                    :
                    defaultImage
                } 
              />
              </span>
              </Upload>
            </FormItem>
            <Row style={{ marginTop: -20, marginBottom: 10 }}>
              <Col span={4}>
              </Col>
              <Col className="hintColor">
                上传icon支持（jpg/jpeg/png图片格式，建议尺寸100px*100px）
              </Col>
            </Row>
            <FormItem
              {...formItemLayout}
              label="提交信息"
            >
              <Input type="textarea" {...infoProps} placeholder="请输入提交信息，便于系统管理员快速了解发布内容" />
            </FormItem>
          </Form>
        </Modal>
      </div>
    )
  }
}

class SuccessModal extends React.Component {
  constructor(props) {
    super(props)
    this.confirmModal = this.confirmModal.bind(this)
    this.cancelModal = this.cancelModal.bind(this)
    this.renderFooter = this.renderFooter.bind(this)
    this.state = {
      visible: false
    }
  }
  componentWillReceiveProps(nextProps) {
    const { visible: oldVisible } = this.props
    const { visible: newVisible } = nextProps
    if (!oldVisible && newVisible) {
      this.setState({
        visible: newVisible
      })
    }
  }
  confirmModal() {
    const { callback } = this.props
    this.setState({
      visible: false
    }, callback)
    browserHistory.push('/app_center/projects/publish')
  }
  cancelModal() {
    const { callback } = this.props
    this.setState({
      visible: false
    }, callback)
  }
  renderFooter() {
    return[
      <Button key="cancel" size="large" onClick={this.cancelModal.bind(this)}>关闭</Button>,
      <Button key="confirm" size="large" type="primary" onClick={this.confirmModal.bind(this)}>查看发布记录</Button>
    ]
  }
  render() {
    const { visible } = this.state
    return(
      <Modal
        className="publishSuccessModal"
        title="提交成功"
        visible={visible}
        onOk={this.confirmModal}
        onCancel={this.cancelModal}
        footer={this.renderFooter()}
      >
        <Icon type="check-circle-o" className="successColor successIcon"/>
        <div className="successColor successText">提交成功</div>
        <div className="successColor waitText">等待系统管理员审核...</div>
        <div className="stepHint">
          1.提交审核后可以到 
          <span onClick={() => browserHistory.push('/app_center/projects/publish')} className="themeColor pointer">发布记录</span>
          查看审核状态
        </div>
        <div className="stepHint">2.审核通过系统将会复制一个新的镜像，与原镜像无关</div>
      </Modal>
    )
  }
}

PublishModal = Form.create()(PublishModal)

function mapStateToProps(state) {
  const { images, current, appStore } = state
  const { wrapGroupList } = images
  const { result: groupList } = wrapGroupList || { result: {} }
  const { data: groupData } = groupList || { data: [] }
  const { currentImageWithStatus } = appStore || { data: [] }
  const { data, file_nick_name: publishName, icon, description, classify_name } = currentImageWithStatus
  return {
    imgTag: data,
    publishName,
    icon,
    description,
    classify_name,
    wrapGroupList: groupData,
    space: current && current.space
  }
}

export default connect(mapStateToProps, {
  getWrapGroupList,
  imagePublish,
  checkAppNameExists,
  getImageStatus,
  imageNameExists,
  loadRepositoriesTagConfigInfo
})(PublishModal)
