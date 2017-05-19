/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Create app: configure service
 *
 * v0.1 - 2017-05-04
 * @author Zhangpc
 */

import React, { PropTypes } from 'react'
import { Form, Input, Row, Col, Select } from 'antd'
import { connect } from 'react-redux'
import { setFormFields } from '../../../../actions/quick_create_app'
import { checkAppName, checkServiceName } from '../../../../actions/app_manage'
import {
  loadImageDetailTag,
  loadImageDetailTagConfig,
  getOtherImageTag,
  loadOtherDetailTagConfig,
} from '../../../../actions/app_center'
import QueueAnim from 'rc-queue-anim'
import { appNameCheck, validateK8sResourceForServiceName } from '../../../../common/naming_validation'
import {
  DEFAULT_REGISTRY,
  ASYNC_VALIDATOR_TIMEOUT,
 } from '../../../../constants'
import NormalSetting from './NormalSetting'
import AssistSetting from './AssistSetting'
import LivenessSetting from './LivenessSetting'
import ConfigMapSetting from './ConfigMapSetting'
import AdvancedSetting from './AdvancedSetting'
import './style/index.less'

const LATEST = 'latest'
const FormItem = Form.Item
const Option = Select.Option

let ConfigureService = React.createClass({
  propTypes: {
    callbackForm: PropTypes.func.isRequired,
    mode: PropTypes.oneOf([ 'create', 'edit' ]),
  },
  getInitialState() {
    return {
      imageConfigs: {},
    }
  },
  componentWillMount() {
    const { callbackForm, imageName, registryServer, form, mode, appName } = this.props
    const { setFieldsValue } = form
    callbackForm(form)
    if (mode === 'create') {
      const values = {
        imageUrl: `${registryServer}/${imageName}`,
      }
      if (appName) {
        values.appName = appName
      }
      setFieldsValue(values)
    }
    this.loadImageTags(this.props)
  },
  componentWillUnmount() {
    clearTimeout(this.appNameCheckTimeout)
    // save fields to store when component unmount
    const { id, setFormFields, currentFields } = this.props
    setFormFields(id, currentFields)
  },
  loadImageTags(props) {
    const {
      location, loadImageDetailTag, getOtherImageTag,
      form, currentFields, mode
    } = props
    let { imageName } = props
    const { other } = location.query
    const { setFieldsValue } = form
    if (mode !== 'create') {
      imageName = currentFields.imageUrl.value
      imageName = imageName.substr(imageName.indexOf('/') + 1)
    }
    if (other) {
      getOtherImageTag({ id: other, imageName }, {
        success: {
          func: result => {
            let imageTag = result.tags[0]
            if (result.tags.indexOf(LATEST) > -1) {
              imageTag = LATEST
            }
            setFieldsValue({
              imageTag,
            })
            // load image config by tag
            this.loadImageConfig(other, imageTag)
          },
          isAsync: true,
        }
      })
      return
    }
    // use DEFAULT_REGISTRY here!
    loadImageDetailTag(DEFAULT_REGISTRY, imageName, {
      success: {
        func: result => {
          let imageTag = result.data[0]
          if (result.data.indexOf(LATEST) > -1) {
            imageTag = LATEST
          }
          setFieldsValue({
            imageTag,
          })
          // load image config by tag
          this.loadImageConfig(other, imageTag)
        },
        isAsync: true,
      }
    })
  },
  loadImageConfig(other, imageTag) {
    const {
      mode,
      loadOtherDetailTagConfig,
      loadImageDetailTagConfig,
      imageName,
    } = this.props
    let loadImageConfigFunc
    const callback = {
      success: {
        func: (result) => {
          // setArg()
          if (mode !== 'create') {
            return
          }
          this.setConfigsToForm(result.configInfo || result.data)
          // setPorts(containerPorts, form)
          // setEnv(defaultEnv, form)
          // setCMD({cmd, entrypoint}, form)
        },
        isAsync: true
      }
    }
    if (other) {
      const config = {
        imageId: other,
        fullname: imageName,
        imageTag
      }
      loadImageConfigFunc = loadOtherDetailTagConfig.bind(this, imageTag, callback)
    } else {
      loadImageConfigFunc = loadImageDetailTagConfig.bind(this, DEFAULT_REGISTRY, imageName, imageTag, callback)
    }
    loadImageConfigFunc()
  },
  setConfigsToForm(configs) {
    this.setState({
      imageConfigs: configs,
    })
    const { form } = this.props
    const { setFieldsValue } = form
    let {
      mountPath,
      containerPorts,
      entrypoint,
      cmd,
    } = configs

    // set storage `./NormalSetting/Storage.js`
    if (!mountPath || !Array.isArray(mountPath)) {
      mountPath = []
    }
    const storageKeys = []
    mountPath.map((path, index) => {
      storageKeys.push(index)
      setFieldsValue({
        [`mountPath${index}`]: path,
      })
    })

    // set ports `./NormalSetting/Ports.js`
    if (!containerPorts || !Array.isArray(containerPorts)) {
      containerPorts = []
    }
    const portsKeys = []
    containerPorts.map((port, index) => {
      // magic code ！
      // 此处 portsKeys 的元素必须为一个对象，而不能是一个数字
      // 后续会在这个对象上添加 `deleted` 字段来标记这个对象是否被删除
      // 在渲染元素时，根据 `deleted` 字段来决定是否渲染
      // 如果为一个数字，删除时直接移除，会导致 redux store 中的 fields 与 form 中的 fields 不一致
      // 具体原因与 rc-form 组件有关
      portsKeys.push({ value: index })
      const portArray = port.split('/')
      setFieldsValue({
        [`port${index}`]: parseInt(portArray[0]),
        [`portProtocol${index}`]: portArray[1].toUpperCase(),
      })
    })
    // must set a port
    if (portsKeys.length < 1) {
      portsKeys.push({ value: 0})
      setFieldsValue({
        [`portProtocol0`]: 'TCP',
      })
    }

    // set entrypoint, cmd, imagePullPolicy `./AssistSetting.js`
    // entrypoint(Docker) -> command(K8s)
    // cmd(Docker) -> args(K8s)
    if (entrypoint) {
      setFieldsValue({
        command: entrypoint.join(' '),
      })
    }
    const argsKeys = []
    if (cmd) {
      cmd.forEach((args, index) => {
        // magic code ！
        // the same as portsKeys
        argsKeys.push({ value: index })
        setFieldsValue({
          [`args${index}`]: args,
        })
      })
    }

    setFieldsValue({
      storageKeys,
      portsKeys,
      argsKeys,
      imagePullPolicy: 'Always',
      livenessProtocol: 'none',
    })
  },
  checkAppName(rule, value, callback) {
    if (!value) {
      return callback()
    }
    const { current, checkAppName } = this.props
    let errorMsg = appNameCheck(value, '应用名称')
    if (errorMsg != 'success') {
      return callback(errorMsg)
    }
    clearTimeout(this.appNameCheckTimeout)
    this.appNameCheckTimeout = setTimeout(() => {
      checkAppName(current.cluster.clusterID, value, {
        success: {
          func: (result) => {
            if (result.data) {
              errorMsg = appNameCheck(value, '应用名称', true)
              callback(errorMsg)
              return
            }
            callback()
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            callback()
          }
        }
      })
    }, ASYNC_VALIDATOR_TIMEOUT)
  },
  checkServiceName(rule, value, callback) {
    if (!value) {
      return callback()
    }
    const { current, checkServiceName, allFields, id } = this.props
    if (!validateK8sResourceForServiceName(value)) {
      return callback('服务名称可由3~24位小写字母、数字、中划线组成，以小写字母开头，小写字母或者数字结尾')
    }
    for (let key in allFields) {
      if (allFields.hasOwnProperty(key)) {
        if (key !== id) {
          const { serviceName } = allFields[key]
          if (serviceName.value === value) {
            callback(appNameCheck(value, '服务名称', true))
            return
          }
        }
      }
    }
    clearTimeout(this.serviceNameExistsTimeout)
    this.serviceNameExistsTimeout = setTimeout(() => {
      checkServiceName(current.cluster.clusterID, value, {
        success: {
          func: (result) => {
            if(result.data) {
              callback(appNameCheck(value, '服务名称', true))
              return
            }
            callback()
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            callback()
          }
        }
      })
    }, ASYNC_VALIDATOR_TIMEOUT)
  },
  getAppNameDisabled() {
    const { mode, allFields, form } = this.props
    const fieldsKeys = Object.keys(allFields) || []
    if (mode === 'edit' || fieldsKeys.length > 1) {
      return true
    }
    return false
  },
  render() {
    const {
      form, imageTags, currentFields,
      standardFlag, loadFreeVolume, createStorage,
      current, id, allFields
    } = this.props
    const allFieldsKeys = Object.keys(allFields) || []
    const { imageConfigs } = this.state
    const { getFieldProps } = form
    const appNameProps = getFieldProps('appName', {
      rules: [
        { required: true, message: '应用名称至少为3个字符' },
        { validator: this.checkAppName }
      ],
    })
    const serviceNameProps = getFieldProps('serviceName', {
      rules: [
        { required: true, message: '服务名称至少为3个字符' },
        { validator: this.checkServiceName }
      ],
    })
    const imageUrlProps = getFieldProps('imageUrl', {
      rules: [
        { required: true }
      ],
    })
    const imageTagProps = getFieldProps('imageTag', {
      rules: [
        { required: true }
      ],
    })
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
    }
    return (
      <QueueAnim id="quickCreateAppConfigureService" type="right">
        <div id="basic" key="basic">
          <Form horizontal>
            <FormItem
              {...formItemLayout}
              wrapperCol={{ span: 6 }}
              label="应用名称"
              hasFeedback
              key="appName"
            >
              <Input
                size="large"
                placeholder="请输入应用名称"
                autoComplete="off"
                {...appNameProps}
                ref={ref => this.appNameInput = ref}
                disabled={this.getAppNameDisabled()}
              />
            </FormItem>
            <FormItem
              {...formItemLayout}
              wrapperCol={{ span: 6 }}
              label="服务名称"
              hasFeedback
              key="serviceName"
            >
              <Input
                size="large"
                placeholder="请输入服务名称"
                autoComplete="off"
                {...serviceNameProps}
                ref={ref => this.serviceNameInput = ref}
              />
            </FormItem>
            <FormItem
              {...formItemLayout}
              wrapperCol={{ span: 9 }}
              label="镜像"
              key="image"
            >
              <Input
                size="large"
                placeholder="请输入镜像地址"
                autoComplete="off"
                readOnly
                {...imageUrlProps}
              />
            </FormItem>
            <FormItem
              {...formItemLayout}
              wrapperCol={{ span: 6 }}
              label="镜像版本"
              key="imageTag"
            >
              <Select
                size="large"
                placeholder="请选择镜像版本"
                showSearch
                optionFilterProp="children"
                {...imageTagProps}
              >
                {
                  imageTags.list.map(tag => (
                    <Option key={tag}>{tag}</Option>
                  ))
                }
              </Select>
            </FormItem>
          </Form>
        </div>
        <NormalSetting
          id={id}
          form={form}
          formItemLayout={formItemLayout}
          fields={currentFields}
          standardFlag={standardFlag}
          loadFreeVolume={loadFreeVolume}
          createStorage={createStorage}
          imageConfigs={imageConfigs}
          key="normal"
        />
        <AssistSetting
          form={form}
          formItemLayout={formItemLayout}
          fields={currentFields}
          imageConfigs={imageConfigs}
          key="assist"
        />
        <LivenessSetting
          form={form}
          formItemLayout={formItemLayout}
          key="liveness"
        />
        <ConfigMapSetting
          key="configMap"
        />
        <AdvancedSetting
          key="advanced"
        />
      </QueueAnim>
    )
  }
})

const createFormOpts = {
  mapPropsToFields(props) {
    return props.currentFields
  },
  onFieldsChange(props, fields) {
    const { id, setFormFields } = props
    setFormFields(id, fields)
  }
}

ConfigureService = Form.create(createFormOpts)(ConfigureService)

function mapStateToProps(state, props) {
  const { quickCreateApp, entities, getImageTag } = state
  const { imageTag, otherImageTag } = getImageTag
  const { imageName, location, id } = props
  const { fields } = quickCreateApp
  const currentFields = quickCreateApp.fields[id]
  let tags = []
  let tagsIsFetching = false
  if (location.query.other) {
    tags = otherImageTag.imageTag || []
    tagsIsFetching = otherImageTag.isFetching
  } else {
    if (imageTag[DEFAULT_REGISTRY] && imageTag[DEFAULT_REGISTRY][imageName]) {
      const currentImageTags = imageTag[DEFAULT_REGISTRY][imageName]
      tags = currentImageTags.tag || []
      tagsIsFetching = currentImageTags.isFetching
    }
  }
  return {
    allFields: fields,
    currentFields,
    current: entities.current,
    imageTags: {
      list: tags,
      isFetching: tagsIsFetching,
    }
  }
}

ConfigureService = connect(mapStateToProps, {
  setFormFields,
  checkAppName,
  checkServiceName,
  loadImageDetailTag,
  loadImageDetailTagConfig,
  getOtherImageTag,
  loadOtherDetailTagConfig,
})(ConfigureService)

export default ConfigureService
