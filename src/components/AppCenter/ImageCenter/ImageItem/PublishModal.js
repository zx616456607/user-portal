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
import { Modal, Form, Input, Select, Upload, Icon, Row, Col, Button, Radio, Checkbox, Tooltip } from 'antd'
import { getWrapGroupList } from '../../../../actions/app_center'
import { imagePublish, checkAppNameExists, getImageStatus, imageNameExists } from '../../../../actions/app_store'
import {
  loadProjectList, loadRepositoriesTagConfigInfo, loadRepositoriesTags,
} from '../../../../actions/harbor'
import { loadClusterList } from '../../../../actions/cluster'
import { API_URL_PREFIX, ASYNC_VALIDATOR_TIMEOUT, UPGRADE_EDITION_REQUIRED_CODE, DEFAULT_REGISTRY } from '../../../../constants'
import NotificationHandler from '../../../../components/Notification'
import { encodeImageFullname } from '../../../../common/tools'
import defaultImage from '../../../../../static/img/appstore/defaultimage.png'
import isEmpty from 'lodash/isEmpty'
import filter from 'lodash/filter'
import publishModalIntl from './intl/punlishModalIntl'
import { injectIntl } from 'react-intl'


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
      privateData: [],
      clusters: [],
      showImageVersionCheckbox: false,
      selectProjectImageVersionExisted: false,
      existImage: '',
    }
  }
  componentWillMount() {
    const { loadClusterList } = this.props
    loadClusterList().then( res => {
      const clusters = res.response.result.data || []
      this.setState({
        clusters,
      })
    })
  }
  componentWillReceiveProps(nextProps) {
    const { harbor } = nextProps
    const { visible: oldVisible } = this.props
    const { formatMessage } = this.props.intl
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
      const { clusters, imgTag } = nextProps
      const tagArr = []
      imgTag && imgTag.map( item=>{
        tagArr.push(item.name)
      })
      let body = {
        image: `${server}/${currentImage.name}`,
        harbor,
        tags: tagArr,
        targetCluster: form.getFieldValue("targetCluster") || "",
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
                  errors: [formatMessage(publishModalIntl.noVersionToPublish)],
                  value: ''
                }
              })
            }
          }
        },
        failed: {
          func: () => {
            notify.warn(formatMessage(publishModalIntl.fetchVersionFailed))
          },
          isAsync: true,
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
  checkImageName = (rule, value, callback) => {
    const { imageNameExists, form } = this.props
    const { formatMessage } = this.props.intl
    const tag = form.getFieldValue('tagsName')
    const targetCluster = form.getFieldValue('targetCluster')
    if (!tag) return callback()
    this.imageNameTimeout = setTimeout(()=>{
      const body = {
        image: `${value}:${tag}`,
        target_cluster: targetCluster,
      }
      imageNameExists(body, {
        success: {
          func: res => {
            if (res.data) {
              return callback(formatMessage(publishModalIntl.imageNameHasExist))
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
  checkSelectName = (rule, value, callback) => {
    const { imageNameExists, form } = this.props
    const { formatMessage } = this.props.intl
    const name = form.getFieldValue('select_version')
    const targetCluster = form.getFieldValue('targetCluster')
    if (!name) return callback()
    clearTimeout(this.selectNameTimeout)
    this.selectNameTimeout = setTimeout(()=>{
      const body = {
        image: `${value}:${name}`,
        target_cluster: targetCluster,
      }
      imageNameExists(body, {
        success: {
          func: res => {
            if (res.data) {
              return callback(formatMessage(publishModalIntl.imageNameHasExist))
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
  fileNickProps = (rule, value, callback) => {
    const { formatMessage } = this.props.intl
    const { checkAppNameExists } = this.props
    let newValue = value && value.trim()
    if (!newValue) {
      return callback(formatMessage(publishModalIntl.publishNameValidate1))
    }
    if (newValue.length < 3 || newValue.length > 20) {
      return callback(formatMessage(publishModalIntl.publishNameValidate2))
    }
    clearTimeout(this.nickNameTimeout)
    this.nickNameTimeout = setTimeout(()=>{
      checkAppNameExists(newValue, {
        success: {
          func: res => {
            if (res.data) {
              return callback(formatMessage(publishModalIntl.publishNameHasExist))
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
  checkTags = (rule, value, callback) => {
    const { formatMessage } = this.props.intl
    if (!value) {
      return callback(formatMessage(publishModalIntl.selectVersionOfImage))
    }
    const { loadRepositoriesTagConfigInfo, currentImage, harbor } = this.props
    loadRepositoriesTagConfigInfo(harbor, DEFAULT_REGISTRY,encodeImageFullname(currentImage.name), value, {
      success: {
        func: res => {
          this.setState({
            imageID: res.data.imageID
          })
          callback()
        }
      },
      failed: {
        func: res => {
          callback(`${formatMessage(publishModalIntl.imageErr)}: ${res.message}`)
          // if (res.statusCode === 404) {
          //   notify.error(formatMessage(publishModalIntl.imageErr), res.message)
          // }
        }
      },
    })
  }
  checkSelectVersion = (rule, value, callback) => {
    const { formatMessage } = this.props.intl
    if (!value) {
      return callback(formatMessage(publishModalIntl.selectVersion))
    }
    const { loadRepositoriesTagConfigInfo, currentImage, harbor } = this.props
    loadRepositoriesTagConfigInfo(harbor, DEFAULT_REGISTRY,encodeImageFullname(currentImage.name), value, {
      success: {
        func: res => {
          this.setState({
            imageID: res.data.imageID
          })
          callback()
        }
      },
      failed: {
        func: res => {
          callback(`${formatMessage(publishModalIntl.imageErr)}: ${res.message}`)
          // if (res.statusCode === 404) {
          //   notify.error(formatMessage(publishModalIntl.imageErr), res.message)
          // }
        }
      },
    })
  }
  checkTargetStore = (rule, value, callback) => {
    const { formatMessage } = this.props.intl
    if (!value) {
      return callback(formatMessage(publishModalIntl.selectTargetRepoGroup))
    }
    callback()
  }
  checkClassify = (rule, value, callback) => {
    const { formatMessage } = this.props.intl
    if(!value || value.length===0) {
      return callback(formatMessage(publishModalIntl.selectOrInputClass))
    }
    const flag = value.some(item => !item.trim())
    if (flag) {
      return callback(formatMessage(publishModalIntl.classifyNameNotEmpty))
    }
    if(value.length > 1) {
      return callback(formatMessage(publishModalIntl.onlyOneClass))
    }
    callback()
  }
  checkDesc = (rule, value, callback) => {
    const { formatMessage } = this.props.intl
    if(!value) {
      return callback(formatMessage(publishModalIntl.descriptionRequired))
    }
    if(value.length < 3 || value.length > 80) {
      return callback(formatMessage(publishModalIntl.descriptionValidate))
    }
    callback()
  }
  checkInfo = (rule, value, callback) => {
    const { formatMessage } = this.props.intl
    if (!value) {
      return callback(formatMessage(publishModalIntl.submitInfoRequired))
    }
    if (value.length < 3 || value.length > 20) {
      return callback(formatMessage(publishModalIntl.submitInfoValidate))
    }
    callback()
  }
  checkTargetCluster = (rule, value, callback) => {
    const { formatMessage } = this.props.intl
    if (!value) {
      return callback(formatMessage(publishModalIntl.targetClusterRequired))
    }
    callback()
  }
  confirmModal() {
    const { callback, form, imagePublish, currentImage, server, publishName, cluster } = this.props
    const { pkgIcon, imageID, radioVal } = this.state
    const { formatMessage } = this.props.intl
    let notify = new NotificationHandler()
    let validateArr = []
    const selectType = radioVal === 'market'
    if (selectType) {
      validateArr = ['imageName', 'tagsName', 'description', 'classifyName', 'request_message', 'targetCluster']
      if (!publishName) {
        validateArr.push('fileNickName')
      }
    } else {
      validateArr = ['select_name', 'select_version', 'target_store', 'commit_msg', 'targetCluster']
    }
    form.validateFields(validateArr, (errors, values) => {
      if (!!errors) {
        return
      }
      // if (!imageID) {
      //   return
      // }
      this.setState({
        loading: true
      })
      let body = {}
      if (selectType) {
        const { tagsName, description, classifyName, request_message, targetCluster } = values
        const fileNickName = form.getFieldValue('fileNickName')
        body = {
          origin_id: `${server}/${currentImage.name}:${tagsName}`,
          fileNickName,
          description,
          classifyName: classifyName[0],
          request_message,
          type: 2,
          resource: imageID,
          targetCluster,
          targetProjectID: currentImage.projectId,
        }
        if (pkgIcon) {
          Object.assign(body, { icon_id: Number(pkgIcon.split('?')[0]) })
        }
      } else {
        const { select_version, target_store, commit_msg, targetCluster } = values
        body = {
          origin_id: `${server}/${currentImage.name}:${select_version}`,
          targetProject: target_store,
          request_message: commit_msg,
          type: 2,
          resource: imageID,
          targetCluster,
          targetProjectID: currentImage.projectId,
        }
      }
      notify.close()
      notify.spin(formatMessage(publishModalIntl.inSubmit))
      imagePublish(cluster.clusterID, body, {
        success: {
          func: () => {
            notify.close()
            notify.success(formatMessage(publishModalIntl.submitSuccess))
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
              notify.warn(formatMessage(publishModalIntl.submitFailed1, { name: res.message.details.name}))
            } else {
              notify.close()
              notify.warn(formatMessage(publishModalIntl.submitFailed2), res.message.message || res.message)
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
  renderFooter = () => {
    const { loading, selectProjectImageVersionExisted } = this.state
    const { formatMessage } = this.props.intl
    const { systeminfo } = this.props
    const isReadOnly = systeminfo && systeminfo.readOnly === true
    return[
      <Button key="cancel" size="large" onClick={this.cancelModal.bind(this)}>{formatMessage(publishModalIntl.cancelText)}</Button>,
      <Tooltip
        title={ isReadOnly ? formatMessage(publishModalIntl.readOnlyForbid) : '' }
      >
        <Button
          key="confirm"
          size="large"
          type="primary"
          loading={loading}
          disabled={isReadOnly || selectProjectImageVersionExisted}
          onClick={this.confirmModal.bind(this)}
        >
          {formatMessage(publishModalIntl.okText)}
        </Button>
      </Tooltip>
    ]
  }
  closeSuccessModal() {
    this.setState({
      successModal: false
    })
  }

  handleSelectVersionContent = (val) => {
    const { loadRepositoriesTagConfigInfo, currentImage, harbor } = this.props
    const { formatMessage } = this.props.intl
    this.checkIsImageWithVersionExist(null, val)
  }
  handleSelectcheckTargetStore = (val) => {
    const notify = new NotificationHandler()
    const { formatMessage } = this.props.intl
    const { getImageStatus, currentImage, imgTag, server, harbor, form } = this.props
    const tagArr = []
    imgTag && imgTag.map( item=>{
      tagArr.push(item.name)
    })
    const body = {
      image: `${server}/${currentImage.name}`,
      targetProject: val,
      tags: tagArr,
      harbor,
      targetCluster: form.getFieldValue("targetCluster") || "",
    }
    getImageStatus(body, {
      failed: {
        func: () => {
          notify.warn(formatMessage(publishModalIntl.fetchVersionFailure))
        },
        isAsync: true,
      }
    })
    this.checkIsImageWithVersionExist(val)
  }
  checkIsImageWithVersionExist = (project, version) => {
    if (this.state.radioVal === 'market') {
      return
    }
    const { loadRepositoriesTags, harbor, form, currentImage } = this.props
    const targetProject = project || form.getFieldValue('target_store')
    const selectVersion = version || form.getFieldValue('select_version')
    if (!targetProject || !selectVersion) {
      return
    }
    const image = currentImage.name.split('/')[1]
    this.setState({
      showImageVersionCheckbox: false,
      existImage: `${image}:${selectVersion}`,
      selectProjectImageVersionExisted: false,
    })
    const imageFullName = `${targetProject}/${image}`
    loadRepositoriesTags(harbor, DEFAULT_REGISTRY, encodeImageFullname(imageFullName), {
      success: {
        func: res => {
          if (res && res.data) {
            const existTags = res.data.map(({ name }) => name)
            const newState = {
              showImageVersionCheckbox: false,
              selectProjectImageVersionExisted: false,
            }
            if (existTags.indexOf(selectVersion) > -1) {
              newState.showImageVersionCheckbox = true
              newState.selectProjectImageVersionExisted = true
            }
            this.setState(newState)
          }
        },
        isAsync: true,
      },
      failed: {
        func: () => {},
        isAsync: true,
      }
    }, false)
  }
  handleChangePublishRadio = (e) => {
    const radioVal = e.target.value
    const getFieldValue = this.props.form.getFieldValue
    this.setState({
      radioVal,
    }, () => {
      const clusterID = getFieldValue("targetCluster")
      this.getProjects(radioVal, clusterID)
    })
  }
  onClusterChange = (value) => {
    const notify = new NotificationHandler()
    const { radioVal } = this.state
    const { form } = this.props
    form.setFieldsValue({
      target_store: undefined,
    })
    this.getProjects(radioVal, value)
    if(radioVal === 'market'){
      const { server, currentImage, harbor, getImageStatus } = this.props
      const tagArr = []
      imgTag && imgTag.map( item=>{
        tagArr.push(item.name)
      })
      let body = {
        image: `${server}/${currentImage.name}`,
        harbor,
        targetCluster: value || "",
        tags: tagArr
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
        },
        failed: {
          func: () => {
            notify.warn('获取版本失败')
          },
          isAsync: true,
        }
      })
    }
  }
  getProjects = (radioVal, clusterID) => {
    if(radioVal === 'store' && !!clusterID){
      const { clusters } = this.state
      const { loadProjectList } = this.props
      const cluster = filter(clusters, {clusterID: clusterID})[0]
      const harbor = !!cluster.harbor && cluster.harbor[0] ? cluster.harbor[0] : ""
      loadProjectList(undefined, {
        harbor,
      }).then( res => {
        const listData = res.response.result.data || []
        const privateData = listData.filter( item=>{
          return item
          // return item.public === 0   过滤显示 公开=1  私有=0
        })
        this.setState({
          privateData,
        })
      })
    }
  }
  render() {
    const { visible, pkgIcon, successModal, privateData, clusters } = this.state
    const { space, form, currentImage, imgTag, wrapGroupList, publishName, description, classify_name, cluster } = this.props
    const { getFieldProps, isFieldValidating, getFieldError, getFieldValue  } = form
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
    };
    const noLabelFormItemLayout = {
      wrapperCol: { span: 18, offset: 4 },
    };
    const { formatMessage } = this.props.intl
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
    const selectProjectImageVersionExistedProps = getFieldProps('selectProjectImageVersionExisted', {
      onChange: e => {
        const selectProjectImageVersionExisted = !e.target.checked
        this.setState({ selectProjectImageVersionExisted })
      }
    })
    const targetCluster = getFieldProps('targetCluster', {
      rules: [
        {
          validator: this.checkTargetCluster
        }
      ],
      onChange: this.onClusterChange,
      initialValue: cluster.clusterID,
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
          notificat.error(formatMessage(publishModalIntl.formatError, { formats: wrapTypelist.join('、')}))
          return false
        }
        if (file.size > 1024 * 1024 * 10) {
          notificat.error(formatMessage(publishModalIntl.sizeLimit))
          return false
        }
      },
      onChange: e => {
        this.setState({
          fileList: e.fileList
        })
        if (e.file.status === 'done') {
          notificat.success(formatMessage(publishModalIntl.uploadSuccess))
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
            notificat.error(formatMessage(publishModalIntl.uploadFailure),message)
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

    const currSelCluster = getFieldValue("targetCluster")

    const targetStoreChildren = []
    const currStore = currentImage && currentImage.name && currentImage.name.split("/")[0] || ""
    !!currSelCluster && privateData && privateData.length && privateData.length >0 && privateData.map( (item,index)=>{
      // todo 根据集群筛选
      if(item.name !== currStore){
        targetStoreChildren.push( <Option key={item.name + item.index} value={item.name} >{item.name}</Option> )
      }
    })
    const clusterOptions = clusters.map((item, index) =>
      <Option key={index} value={item.clusterID} >{item.clusterName}</Option>
    )
    return(
      <div>
        <Modal
          className="imagePublishModal"
          title={formatMessage(publishModalIntl.title)}
          visible={visible}
          style={{top:20}}
          maskClosable={false}
          onOk={this.confirmModal}
          onCancel={this.cancelModal}
          footer={this.renderFooter()}
          width={540}
        >
          <SuccessModal
            visible={successModal}
            callback={this.closeSuccessModal}
            radioVal={this.state.radioVal}
          />

          <FormItem
            {...formItemLayout}
            label={formatMessage(publishModalIntl.publishType)}
          >
            <RadioGroup
              onChange={this.handleChangePublishRadio} value={this.state.radioVal}
              >
              <Radio value="market" key='market'>{formatMessage(publishModalIntl.publishToStore)}</Radio>
              <Radio value="store" key='store'>{formatMessage(publishModalIntl.publishToRepoGroup)}</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage(publishModalIntl.targetCluster)}
          >
            <Select
              style={{ width: '100%' }}
              showSearch
              {...targetCluster}
              placeholder={formatMessage(publishModalIntl.targetClusterPlaceholder)}
            >
              {clusterOptions}
            </Select>
          </FormItem>
          {
            this.state.radioVal ==='market' ?
            <Form>
              <FormItem
                {...formItemLayout}
                hasFeedback
                label={formatMessage(publishModalIntl.imageName)}
              >
                <Input {...nameProps} disabled/>
              </FormItem>
              <Form.Item
                {...formItemLayout}
                hasFeedback={!!getFieldValue('fileNickName')}
                label={formatMessage(publishModalIntl.publishName)}
                help={isFieldValidating('fileNickName') ? formatMessage(publishModalIntl.validating) : (getFieldError('fileNickName') || []).join(', ')}
              >
                <Input
                  disabled={publishName && publishName ? true : false}
                  {...releaseNameProps}
                  placeholder={formatMessage(publishModalIntl.publishNameValidate1)}
                />
              </Form.Item>
              <FormItem
                {...formItemLayout}
                label={formatMessage(publishModalIntl.imageVersion)}
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
                label={formatMessage(publishModalIntl.className)}
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
                label={formatMessage(publishModalIntl.description)}
              >
                <Input type="textarea" {...descProps} placeholder={formatMessage(publishModalIntl.description)} />
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
                  {
                    formatMessage(publishModalIntl.uploadIconTip)
                  }
                </Col>
              </Row>
              <FormItem
                {...formItemLayout}
                label={formatMessage(publishModalIntl.submitInfo)}
              >
                <Input type="textarea" {...infoProps} placeholder={formatMessage(publishModalIntl.submitInfoPlaceholder)} />
              </FormItem>
            </Form> :
            <Form>
              <FormItem
                {...formItemLayout}
                hasFeedback
                help={isFieldValidating('select_name') ? formatMessage(publishModalIntl.validating) : (getFieldError('select_name') || []).join(', ')}
                label={formatMessage(publishModalIntl.imageName)}
              >
                <Input {...selectName} disabled/>
              </FormItem>

              <FormItem
                {...formItemLayout}
                label={formatMessage(publishModalIntl.targetRepoGroup)}
              >
                <Select
                  showSearch
                  {...targetStore}
                  placeholder={formatMessage(publishModalIntl.selectTargetRepoGroup)}
                >
                  {targetStoreChildren}
                </Select>
              </FormItem>
              <FormItem
                {...formItemLayout}
                label={formatMessage(publishModalIntl.version)}
              >
                <Select
                  showSearch
                  {...selectVersion}
                  placeholder={formatMessage(publishModalIntl.selectVersion)}
                >
                  {selectVsionChildren}
                </Select>
              </FormItem>

              <FormItem
                {...formItemLayout}
                label={formatMessage(publishModalIntl.submitInfo)}
              >
                <Input type="textarea" {...commitMsg} placeholder={formatMessage(publishModalIntl.submitInfoPlaceholder)}/>
              </FormItem>

              {
                this.state.showImageVersionCheckbox &&
                <FormItem
                  {...noLabelFormItemLayout}
                >
                  <Checkbox {...selectProjectImageVersionExistedProps}>
                    {formatMessage(publishModalIntl.existImageTips, { image: this.state.existImage })}
                  </Checkbox>
                </FormItem>
              }
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
    const { formatMessage } = this.props.intl
    return[
      <Button key="cancel" size="large" onClick={this.cancelModal.bind(this)}>{formatMessage(publishModalIntl.close)}</Button>,
        <Button key="confirm" size="large" type="primary" onClick={this.confirmModal.bind(this)}>{formatMessage(publishModalIntl.checkPublishRecord)}</Button>
    ]
  }
  render() {
    const { formatMessage } = this.props.intl
    const { visible, radioVal } = this.state
    return(
      <Modal
        className="publishSuccessModal"
        title={formatMessage(publishModalIntl.submitSuccessText)}
        visible={visible}
        onOk={this.confirmModal}
        onCancel={this.cancelModal}
        footer={this.renderFooter()}
      >
        <Icon type="check-circle-o" className="successColor successIcon"/>
        <div className="successColor successText">{formatMessage(publishModalIntl.submitSuccessText)}</div>
        <div className="successColor waitText">{formatMessage(publishModalIntl.waitingAdminCheck)}</div>
        <div className="stepHint">
          1.{formatMessage(publishModalIntl.afterSubmit)}
          <span onClick={this.confirmModal} className="themeColor pointer">{formatMessage(publishModalIntl.publishRecord)}</span>
          {formatMessage(publishModalIntl.checkAuditStatus)}
        </div>
        <div className="stepHint">2.{formatMessage(publishModalIntl.tip)}</div>
      </Modal>
    )
  }
}
SuccessModal = injectIntl(SuccessModal, { withRef: true })
PublishModal = Form.create()(PublishModal)
PublishModal = injectIntl(PublishModal, { withRef: true })

function mapStateToProps(state) {
  const { images, current, appStore, entities, harbor } = state
  const { wrapGroupList } = images
  const { cluster, space } =  entities.current
  const { result: groupList } = wrapGroupList || { result: {} }
  const { data: groupData } = groupList || { data: [] }
  const { currentImageWithStatus } = appStore || { data: [] }
  const { data, file_nick_name: publishName, icon, description, classify_name } = currentImageWithStatus


  const { projectVisibleClusters } = state.projectAuthority
  const currentNamespace = space.namespace
  const currentProjectClusterList = projectVisibleClusters[currentNamespace] || {}
  const clusters = currentProjectClusterList.data || []
  const { systeminfo } = harbor


  const { harbor: harbors } = cluster
  return {
    imgTag: data,
    publishName,
    cluster,
    icon,
    description,
    classify_name,
    wrapGroupList: groupData,
    space: current && current.space,
    clusters,
    harbor: harbors ? harbors[0] || "" : "",
    systeminfo: systeminfo && systeminfo.default && systeminfo.default.info || {},
  }
}

export default connect(mapStateToProps, {
  getWrapGroupList,
  imagePublish,
  checkAppNameExists,
  getImageStatus,
  imageNameExists,
  loadRepositoriesTagConfigInfo,
  loadRepositoriesTags,
  loadProjectList,
  loadClusterList,
})(PublishModal)
