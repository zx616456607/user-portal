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
import { Modal, Form, Input, Select, Upload, Icon, Row, Col, Button, Radio } from 'antd'
import { getWrapGroupList } from '../../../../actions/app_center'
import { imagePublish, checkAppNameExists, getImageStatus, imageNameExists } from '../../../../actions/app_store'
import { loadProjectList } from '../../../../actions/harbor'
import { loadRepositoriesTagConfigInfo } from '../../../../actions/harbor'
import { API_URL_PREFIX, ASYNC_VALIDATOR_TIMEOUT, UPGRADE_EDITION_REQUIRED_CODE, DEFAULT_REGISTRY } from '../../../../constants'
import NotificationHandler from '../../../../components/Notification'
import { encodeImageFullname } from '../../../../common/tools'
import defaultImage from '../../../../../static/img/appstore/defaultimage.png'
import isEmpty from 'lodash/isEmpty'
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

const wrapTypelist = ['png','jpg','jpeg']

class PublishModal extends React.Component {
  constructor(props) {
    super(props)
    this.confirmModal = this.confirmModal.bind(this)
    this.cancelModal = this.cancelModal.bind(this)
    this.fileNickProps = this.fileNickProps.bind(this)
    this.closeSuccessModal = this.closeSuccessModal.bind(this)
    this.checkImageName = this.checkImageName.bind(this)
    this.checkSelectName = this.checkSelectName.bind(this)
    this.handleChangePublishRadio = this.handleChangePublishRadio.bind(this)
    this.handleSelectVersionContent = this.handleSelectVersionContent.bind(this)
    this.handleSelectcheckTargetStore = this.handleSelectcheckTargetStore.bind(this)
    this.state = {
      visible: false,
      pkgIcon: '',
      radioVal: 'market',
      privateData: []
    }
  }
  componentWillMount() {
    const { loadProjectList } = this.props
    loadProjectList().then( res=>{
      const listData = res.response.result.data
      const privateData = listData.filter( item=>{
        return item
        // return item.public === 0   过滤显示 公开=1  私有=0
      })
      this.setState({
        privateData: privateData
      })
    })
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
  checkSelectName(rule, value, callback) {
    const { imageNameExists, form } = this.props
    const name = form.getFieldValue('select_version')
    if (!name) return callback()
    clearTimeout(this.selectNameTimeout)
    this.selectNameTimeout = setTimeout(()=>{
      const body = {
        image: `${value}:${name}`
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
        },
        finally: {
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
  checkSelectVersion(rule, value, callback) {
    if (!value) {
      return callback('请选择版本')
    }
    callback()
  }
  checkTargetStore(rule, value, callback) {
    if (!value) {
      return callback('请选择目标仓库组')
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
    const { pkgIcon, imageID, radioVal } = this.state
    let notify = new NotificationHandler()
    let validateArr = []
    const selectType = radioVal === 'market'
    if (selectType) {
      validateArr = ['imageName', 'tagsName', 'description', 'classifyName', 'request_message']
      if (!publishName) {
        validateArr.push('fileNickName')
      }
    } else {
      validateArr = ['select_name', 'select_version', 'target_store', 'commit_msg']
    }
    form.validateFields(validateArr, (errors, values) => {
      if (!!errors) {
        return
      }
      this.setState({
        loading: true
      })
      let body = {}
      if (selectType) {
        const { tagsName, description, classifyName, request_message } = values
        const fileNickName = form.getFieldValue('fileNickName')
        body = {
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
      } else {
        const { select_version, target_store, commit_msg } = values
        body = {
          origin_id: `${server}/${currentImage.name}:${select_version}`,
          targetProject: target_store,
          request_message: commit_msg,
          type: 2,
          resource: imageID
        }
      }
      notify.close()
      notify.spin('提交审核中')
      imagePublish(body, {
        success: {
          func: () => {
            notify.close()
            notify.success('提交审核成功')
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
              notify.error('提交审核失败\n', `该镜像与${res.message.details.name}内容完全相同，不能发布`)
            } else {
              notify.close()
              notify.error('提交审核失败\n', res.message)
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

  handleSelectVersionContent(val) {
    const { loadRepositoriesTagConfigInfo, currentImage } = this.props
    loadRepositoriesTagConfigInfo(DEFAULT_REGISTRY,encodeImageFullname(currentImage.name), val, {
      success: {
        func: res => {
          this.setState({
            imageID: res.data.imageID
          })
        }
      }
    })
  }
  handleSelectcheckTargetStore(val) {
    const { getImageStatus, currentImage, imgTag, server } = this.props
    const tagArr = []
    imgTag && imgTag.map( item=>{
      tagArr.push(item.name)
    })
    const body = {
      image: `${server}/${currentImage.name}`,
      targetProject: val,
      tags: tagArr
    }
    getImageStatus(body)
  }
  handleChangePublishRadio(e) {
    this.setState({
      radioVal: e.target.value
    })
  }
  render() {
    const { visible, pkgIcon, successModal, privateData } = this.state
    const { space, form, currentImage, imgTag, wrapGroupList, publishName, description, classify_name } = this.props
    const { getFieldProps, isFieldValidating, getFieldError, getFieldValue  } = form
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
    const selectName = getFieldProps('select_name', {
      rules: [
        {
          validator: this.checkSelectName
        }
      ],
      initialValue: currentImage && currentImage.name && currentImage.name.split('/')[1]
    })
    const selectVersion = getFieldProps('select_version', {
      rules: [
        {
          validator: this.checkSelectVersion,
        }
      ],
      onChange: val => this.handleSelectVersionContent(val)
    })
    const targetStore = getFieldProps('target_store', {
      rules: [
        {
          validator: this.checkTargetStore
        }
      ],
      onChange: (val) => this.handleSelectcheckTargetStore(val)
    })
    const commitMsg = getFieldProps('commit_msg', {
      rules: [
        {
          validator: this.checkInfo
        }
      ],

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
    const selectVsionChildren = []
    imgTag && imgTag.length && imgTag.forEach(item => {
      selectVsionChildren.push(<Option key={item.name}>{item.name}</Option>)
    })
    const children = [];
    wrapGroupList &&
    wrapGroupList.classifies &&
    wrapGroupList.classifies.length &&
    wrapGroupList.classifies.forEach(item => {
      children.push(<Option value={item.classifyName} key={item.classifyName}>{item.classifyName}</Option>)
    })
    const targetStoreChildren = []
    privateData && privateData.length && privateData.length >0 && privateData.map( (item,index)=>{
      targetStoreChildren.push( <Option key={item.name + item.index} value={item.name} >{item.name}</Option> )
    })
    return(
      <div>
        <Modal
          className="imagePublishModal"
          title="发布"
          visible={visible}
          style={{top:20}}
          maskClosable={false}
          onOk={this.confirmModal}
          onCancel={this.cancelModal}
          footer={this.renderFooter()}
        >
          <SuccessModal
            visible={successModal}
            callback={this.closeSuccessModal}
            radioVal={this.state.radioVal}
          />

          <FormItem
            {...formItemLayout}
            label="发布类型"
          >
            <RadioGroup
              onChange={this.handleChangePublishRadio} value={this.state.radioVal}
              >
              <Radio value="market" key='market'>发布到商店</Radio>
              <Radio value="store" key='store'>发布到仓库组</Radio>
            </RadioGroup>
          </FormItem>
          {
            this.state.radioVal ==='market' ?
            <Form>
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
                label="分类名称"
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
            </Form> :
            <Form>
              <FormItem
                {...formItemLayout}
                hasFeedback
                help={isFieldValidating('select_name') ? '校验中...' : (getFieldError('select_name') || []).join(', ')}
                label="镜像名称"
              >
                <Input {...selectName} disabled/>
              </FormItem>

              <FormItem
                {...formItemLayout}
                label="选择版本"
              >
                <Select
                  showSearch
                  {...selectVersion}
                  placeholder="请选择版本"
                >
                  {selectVsionChildren}
                </Select>
              </FormItem>

              <FormItem
                {...formItemLayout}
                label="目标仓库组"
              >
                <Select
                  showSearch
                  {...targetStore}
                  placeholder="请选择目标仓库组"
                >
                  {targetStoreChildren}
                </Select>
              </FormItem>

              <FormItem
                {...formItemLayout}
                label="提交信息"
              >
                <Input type="textarea" {...commitMsg} placeholder="请输入提交信息，便于系统管理员快速了解发布内容" />
              </FormItem>
            </Form>
          }
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
    const { callback, radioVal } = this.props
    this.setState({
      visible: false
    }, callback)
    browserHistory.push(`/app_center/projects/publish?radioVal=${radioVal}`)
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
    const { visible, radioVal } = this.state
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
          <span onClick={() => browserHistory.push(`/app_center/projects/publish?radioVal=${radioVal}`)} className="themeColor pointer">发布记录</span>
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
  loadRepositoriesTagConfigInfo,
  loadProjectList
})(PublishModal)
