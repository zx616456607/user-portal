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
  getOtherImageTag,
  loadOtherDetailTagConfig,
} from '../../../../actions/app_center'
import { loadRepositoriesTags, loadRepositoriesTagConfigInfo } from '../../../../actions/harbor'
import QueueAnim from 'rc-queue-anim'
import { appNameCheck, validateK8sResourceForServiceName } from '../../../../common/naming_validation'
import {
  DEFAULT_REGISTRY,
  ASYNC_VALIDATOR_TIMEOUT,
 } from '../../../../constants'
import ApmSetting from './ApmSetting'
import NormalSetting from './NormalSetting'
import AssistSetting from './AssistSetting'
import LivenessSetting from './LivenessSetting'
import ConfigMapSetting from './ConfigMapSetting'
import AdvancedSetting from './AdvancedSetting'
import LogCollection from './LogCollection'
import './style/index.less'
import NotificationHandler from '../../../../components/Notification'

const LATEST = 'latest'
const FormItem = Form.Item
const Option = Select.Option
// for lazy set form fields
let fieldsBefore = {}
let lazySetFormFieldsTimeout = 200
let setFormFieldsTimeout
let initForm = false

let ConfigureService = React.createClass({
  propTypes: {
    callback: PropTypes.func.isRequired,
    mode: PropTypes.oneOf([ 'create', 'edit' ]),
  },
  getInitialState() {
    return {
      imageConfigs: {},
    }
  },
  componentWillMount() {
    const { callback, imageName, registryServer, form, mode, location } = this.props
    let  { appName } = this.props
    const { setFieldsValue } = form
    callback(form)
    if (mode === 'create') {
      const values = {
        imageUrl: `${registryServer}/${imageName}`,
      }
      if (location.query.appPkgID) {
        let { registryServer,imageName} = location.query
        values.imageUrl = `${registryServer}/${imageName}`
        appName = location.query.appName || appName
      }
      if (appName) {
        values.appName = appName
      }
      setFieldsValue(values)
    }
    this.loadImageTags(this.props)
  },
  focusInput(refId) {
    const ref = this.refs[refId]
    ref && ref.refs.input.focus()
  },
  componentDidMount() {
    setTimeout(() => {
      const disabled = this.getAppNameDisabled()
      if (!disabled) {
        this.focusInput('appNameInput')
      } else {
        this.focusInput('serviceNameInput')
      }
    }, 50)
    const { location, form } = this.props
    if (location.query.appPkgID) {
      form.getFieldProps('appPkgID')
      form.setFieldsValue({'appPkgID': location.query.appPkgID})
    }
  },
  componentWillUnmount() {
    clearTimeout(this.appNameCheckTimeout)
    clearTimeout(this.serviceNameExistsTimeout)
    // save fields to store when component unmount
    const { id, setFormFields, currentFields, mode } = this.props
    setFormFields(id, currentFields)
    // reset fields for lazy set form fields
    fieldsBefore = {}
    clearTimeout(setFormFieldsTimeout)
    initForm = false
  },
  loadImageTags(props) {
    const {
      location, getOtherImageTag, form,
      currentFields, mode, loadRepositoriesTags
    } = props
    let { imageName } = props
    const { other } = location.query
    const { setFieldsValue } = form
    let notify = new NotificationHandler()
    if (mode !== 'create') {
      imageName = currentFields.imageUrl.value
      imageName = imageName.substr(imageName.indexOf('/') + 1)
    }
    if (location.query　&& location.query.imageName) {
      imageName = location.query.imageName
    }
    if (other) {
      getOtherImageTag({ id: other, imageName }, {
        success: {
          func: result => {
            let imageTag = result.tags[0]
            if (result.tags.indexOf(LATEST) > -1) {
              imageTag = LATEST
            }
            if (location && location.query.tag) {
              let hasTag
              result.data.every(tags =>{
                if (tags == location.query.tag) {
                  hasTag = true
                  return false
                }
                return true
              })
              if (hasTag) {
                imageTag = location.query.tag
              }
            }
            setFieldsValue({
              imageTag,
            })
            // load image config by tag
            this.loadImageConfig(other, imageName, imageTag)
          },
          isAsync: true,
        }
      })
      return
    }
    loadRepositoriesTags(DEFAULT_REGISTRY, imageName, {
       success: {
         func: result => {
           if (!result.data.length) {
             return notify.warn('运行环境的镜像（版本）不存在', '请联系管理员上传')
           }
           let imageTag = result.data[0]
           if (result.data.indexOf(LATEST) > -1) {
             imageTag = LATEST
           }
           if (location.query && location.query.tag) {
              let hasTag
              result.data.every(tags =>{
                if (tags == location.query.tag) {
                  hasTag = true
                  return false
                }
                return true
              })
              if (hasTag) {
                imageTag = location.query.tag
              }
            }
           setFieldsValue({
             imageTag,
           })
           // load image config by tag
           this.loadImageConfig(other, imageName, imageTag)
         },
         isAsync: true,
       }
     })
    // use DEFAULT_REGISTRY here!
   // loadImageDetailTag(DEFAULT_REGISTRY, imageName, {
   //   success: {
   //     func: result => {
   //       let imageTag = result.data[0]
   //       if (result.data.indexOf(LATEST) > -1) {
   //         imageTag = LATEST
   //       }
   //       setFieldsValue({
   //         imageTag,
   //       })
   //       // load image config by tag
   //       this.loadImageConfig(other, imageTag)
   //     },
   //     isAsync: true,
   //   }
   // })
  },
  loadImageConfig(other, images, imageTag) {
    let {
      mode,
      loadOtherDetailTagConfig,
      loadRepositoriesTagConfigInfo,
      imageName,
      location
    } = this.props
    if (images) {
      imageName = images
    }
    let loadImageConfigFunc
    // if (location.query　&& location.query.imageName) {
    //   imageName = location.query.imageName
    // }
    const callback = {
      success: {
        func: (result) => {
          if (mode !== 'create') {
            return
          }
          this.setConfigsToForm(result.configInfo || result.data)
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
      loadImageConfigFunc = loadRepositoriesTagConfigInfo.bind(this, DEFAULT_REGISTRY, imageName, imageTag, callback)
    }
    loadImageConfigFunc()
  },
  setConfigsToForm(configs) {
    this.setState({
      imageConfigs: configs,
    })
    const { callback, form } = this.props
    callback(form, configs)
    const { setFieldsValue } = form
    let {
      mountPath,
      containerPorts,
      entrypoint,
      cmd,
      defaultEnv,
    } = configs
    // set storage `./NormalSetting/Storage.js`
    if (!mountPath || !Array.isArray(mountPath)) {
      mountPath = []
    }
    const storageKeys = []
    const storageFields = {}
    mountPath.map((path, index) => {
      storageKeys.push(index)
      storageFields[`mountPath${index}`] = path
    })

    // set ports `./NormalSetting/Ports.js`
    if (!containerPorts || !Array.isArray(containerPorts)) {
      containerPorts = []
    }
    const portsKeys = []
    const portsFields = {}
    containerPorts.map((port, index) => {
      // magic code ！
      // 此处 portsKeys 的元素必须为一个对象，而不能是一个数字
      // 后续会在这个对象上添加 `deleted` 字段来标记这个对象是否被删除
      // 在渲染元素时，根据 `deleted` 字段来决定是否渲染
      // 如果为一个数字，删除时直接移除，会导致 redux store 中的 fields 与 form 中的 fields 不一致
      // 具体原因与 rc-form 组件有关
      portsKeys.push({ value: index })
      const portArray = port.split('/')
      portsFields[`port${index}`] = parseInt(portArray[0])
      portsFields[`portProtocol${index}`] = portArray[1].toUpperCase()
    })
    // must set a port
    if (portsKeys.length < 1) {
      portsKeys.push({ value: 0})
      portsFields['portProtocol0'] = 'TCP'
    }

    // set entrypoint, cmd, imagePullPolicy `./AssistSetting.js`
    // entrypoint(Docker) -> command(K8s)
    // cmd(Docker) -> args(K8s)
    const commandFields = {}
    if (entrypoint) {
      commandFields['command'] = entrypoint.join(' ')
    }
    const argsKeys = []
    const argsFields = []
    if (cmd) {
      cmd.forEach((args, index) => {
        // magic code ！
        // the same as portsKeys
        argsKeys.push({ value: index })
        argsFields[`args${index}`] = args
      })
    }

    // set envs `./AdvancedSetting.js`
    const envKeys = []
    const envFields = {}
    // weblogic env config
    if (window.WrapListTable) {
      const { weblogic } = window.WrapListTable
      if (weblogic) {
        let envIndex = 0
        for (let key in weblogic){
          envKeys.push(
            { value: envIndex,disabled: true}
          )
          envFields[`envName${envIndex}`] = key
          envFields[`envValue${envIndex}`] = weblogic[key]
          envIndex ++
        }
      }
    }
    if (defaultEnv) {
      defaultEnv.forEach((env, index) => {
        // magic code ！
        // the same as portsKeys
        envKeys.push({ value: 7 + index })
        const keyIndex = env.indexOf('=')
        envFields[`envName${7 + index}`] = env.substr(0, keyIndex)
        envFields[`envValue${7 + index}`] = env.substr(keyIndex + 1)
      })
    }

    // use `setFieldsValue` once, dispatch one action
    let fieldsValues = {
      storageKeys,
      portsKeys,
      argsKeys,
      envKeys,
      imagePullPolicy: 'Always',
      livenessProtocol: 'none',
    }
    Object.assign(fieldsValues, storageFields, portsFields,
      commandFields,
      argsFields,
      envFields,
    )
    setFieldsValue(fieldsValues)
  },
  checkAppName(rule, value, callback) {
    if (!value || this.props.action === 'addService') {
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
          const serviceName = allFields[key].serviceName || {}
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
    const { mode, allFields, form, action } = this.props
    const fieldsKeys = Object.keys(allFields) || []
    if (mode === 'edit' || fieldsKeys.length > 1 || action === 'addService') {
      return true
    }
    return false
  },
  render() {
    const {
      form, imageTags, currentFields,
      standardFlag, loadFreeVolume, createStorage,
      current, id, allFields, location, AdvancedSettingKey
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
        { required: true, message: '请输入镜像地址' }
      ],
    })
    const imageTagProps = getFieldProps('imageTag', {
      rules: [
        { required: true }
      ],
      onChange: (tag) => {
        this.loadImageConfig(location.query.other, null, tag)
      }
    })
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    }
    return (
      <QueueAnim id="quickCreateAppConfigureService" type="right">
        <div id="basic" key="basic">
          <Form horizontal>
            <FormItem
              {...formItemLayout}
              wrapperCol={{ span: 8 }}
              label="应用名称"
              hasFeedback
              key="appName"
            >
              <Input
                size="large"
                placeholder="请输入应用名称"
                autoComplete="off"
                {...appNameProps}
                ref="appNameInput"
                disabled={this.getAppNameDisabled()}
              />
            </FormItem>
            <FormItem
              {...formItemLayout}
              wrapperCol={{ span: 8 }}
              label="服务名称"
              hasFeedback
              key="serviceName"
            >
              <Input
                size="large"
                placeholder="请输入服务名称"
                autoComplete="off"
                {...serviceNameProps}
                ref="serviceNameInput"
              />
            </FormItem>
            {window.WrapListTable &&
            <FormItem {...formItemLayout}
              wrapperCol={{ span: 8 }}
              label="应用包"
              hasFeedback
              key="Appwrap">
              <Input readOnly value={window.WrapListTable.fileName  + ' | '+ window.WrapListTable.fileTag} />
            </FormItem>
            }
            <FormItem
              {...formItemLayout}
              wrapperCol={{ span: 8 }}
              label={location.query.appPkgID ? '运行环境':"镜像"}
              key="image"
            >
              <Input
                size="large"
                placeholder={`请输入${location.query.appPkgID ?'运行环境':"镜像"}地址`}
                autoComplete="off"
                readOnly
                {...imageUrlProps}
              />
            </FormItem>
            <FormItem
              {...formItemLayout}
              wrapperCol={{ span: 6 }}
              label={location.query.appPkgID ?'环境版本':"镜像版本"}
              key="imageTag"
            >
              <Select
                size="large"
                placeholder={`请输入${location.query.appPkgID ?'运行':"镜像"}版本`}
                showSearch
                optionFilterProp="children"
                {...imageTagProps}
                disabled={location.query.tag}
              >
                {
                  imageTags.list.map(tag => (
                    <Option key={tag}>{tag}</Option>
                  ))
                }
              </Select>
            </FormItem>
            <ApmSetting
              form={form}
              formItemLayout={formItemLayout}
            />
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
         <LogCollection
          form={form}
          formItemLayout={formItemLayout}
          key="logCollection"
        />
        <LivenessSetting
          form={form}
          formItemLayout={formItemLayout}
          key="liveness"
        />
        <ConfigMapSetting
          form={form}
          formItemLayout={formItemLayout}
          key="configMap"
        />
        <AdvancedSetting
          AdvancedSettingKey={AdvancedSettingKey}
          form={form}
          formItemLayout={formItemLayout}
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
    if (!initForm) {
      setFormFields(id, fields)
      initForm = true
      return
    }
    const newFields = Object.assign({}, fieldsBefore, fields)
    fieldsBefore = newFields
    clearTimeout(setFormFieldsTimeout)
    setFormFieldsTimeout = setTimeout(() => {
      setFormFields(id, newFields)
    }, lazySetFormFieldsTimeout)
  }
}

ConfigureService = Form.create(createFormOpts)(ConfigureService)

function mapStateToProps(state, props) {
  const { quickCreateApp, entities, getImageTag, harbor } = state
  const { otherImageTag } = getImageTag
  const { imageTags } = harbor
  const { imageName, location, id } = props
  const { fields } = quickCreateApp
  const currentFields = quickCreateApp.fields[id]
  let tags = []
  let tagsIsFetching = false
  if (location.query.other) {
    tags = otherImageTag.imageTag || []
    tagsIsFetching = otherImageTag.isFetching
  } else {
    if (imageTags[DEFAULT_REGISTRY] && imageTags[DEFAULT_REGISTRY][imageName]) {
      const currentImageTags = imageTags[DEFAULT_REGISTRY][imageName]
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
      isFetching: tagsIsFetching
    }
  }
}

ConfigureService = connect(mapStateToProps, {
  setFormFields,
  checkAppName,
  checkServiceName,
  getOtherImageTag,
  loadOtherDetailTagConfig,
  loadRepositoriesTagConfigInfo,
  loadRepositoriesTags
})(ConfigureService)

export default ConfigureService
