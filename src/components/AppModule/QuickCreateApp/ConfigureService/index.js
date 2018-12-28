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
import { Form, Input, Row, Col, Select, Modal, Button } from 'antd'
import { connect } from 'react-redux'
import { setFormFields } from '../../../../actions/quick_create_app'
import { checkAppName, checkServiceName } from '../../../../actions/app_manage'
import {
  getOtherImageTag,
  loadOtherDetailTagConfig,
} from '../../../../actions/app_center'
import { loadRepositoriesTags, loadRepositoriesTagConfigInfo } from '../../../../actions/harbor'
import { appTemplateNameCheck } from '../../../../../client/actions/template'
import QueueAnim from 'rc-queue-anim'
import {
  appNameCheck, validateK8sResourceForServiceName,
  templateNameCheck
} from '../../../../common/naming_validation'
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
import OperationEnv from './OperationEnv'
import './style/index.less'
import NotificationHandler from '../../../../components/Notification'
import ServiceMesh from './ServiceMesh'
import SecurityGroup from '../../../../../client/containers/SecurityGroup/QuickCreateAppSecurityGroup'
import { injectIntl } from 'react-intl'
import IntlMessage from '../../../../containers/Application/ServiceConfigIntl'
import cloneDeep from 'lodash/cloneDeep'
import filter from 'lodash/filter'

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
    const { callback, imageName, registryServer, form, mode, location, template, newImageName } = this.props
    let  { appName,templateName, templateVersion, templateDesc } = this.props
    const { setFieldsValue } = form
    const { modelSet } = location.query
    callback && callback(form)
    if (location.query.template && appName) {
      setFieldsValue({
        appName
      })
    }
    if (mode === 'create') {
      let queryServer = location.query.registryServer || registryServer
      const values = {
        imageUrl: `${queryServer}/${imageName}`,
      }
      if (location.query.appPkgID && location.query.template) {
        values.imageUrl = `${registryServer}/${newImageName}`
      }
      appName = location.query.appName || appName
      if (appName) {
        values.appName = appName
      }
      if (templateName) {
        values.templateName = templateName
      }
      if (templateVersion) {
        values.templateVersion = templateVersion
      }
      if (templateDesc) {
        values.templateDesc = templateDesc
      }
      if (location.query.addAI === 'true') {
        values.serviceType = true
        const { mountPath, readOnly, type, type_1, volume } = location.query
        values.storageList = [
          {
            mountPath, type, type_1, volume,
            readOnly: readOnly === 'true',
            disableEdit: true,
          },
        ]
      }
      setFieldsValue(values)
    }
    this.loadImageTags(this.props, newImageName)
    if (modelSet) {
      setFieldsValue({
        modelSet
      })
    }
  },
  focusInput(refId) {
    const ref = this.refs[refId]
    ref && ref.refs.input.focus()
  },
  componentDidMount() {
    const { isTemplate, location, form, template: templateList } = this.props;
    const { template, appPkgID } = location.query;
    setTimeout(() => {
      const disabled = this.getAppNameDisabled()
      if (isTemplate) {
        if (!disabled) {
          let tempName = document.getElementById('templateName');
          tempName && tempName.focus()
        } else {
          this.focusInput('serviceNameInput')
        }
      } else {
        if (template || !disabled) {
          this.focusInput('appNameInput')
        } else {
          this.focusInput('serviceNameInput')
        }
      }
    }, 50)
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
  loadImageTags(props, name) {
    const {
      location, getOtherImageTag, form,
      currentFields, mode, loadRepositoriesTags, harbor,
      intl
    } = props
    let { imageName } = props
    const { other, isWrap } = location.query
    const { setFieldsValue } = form
    let notify = new NotificationHandler()
    if (mode !== 'create') {
      imageName = currentFields.imageUrl.value
      imageName = imageName.substr(imageName.indexOf('/') + 1)
    }
    if (location.query　&& location.query.imageName) {
      imageName = location.query.imageName
    }
    if (name) {
      imageName = name;
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
              result.data && result.data.every(tags =>{
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
    loadRepositoriesTags(harbor, DEFAULT_REGISTRY, imageName, {
       success: {
         func: result => {
           if (!result.data.length) {
             return notify.warn(intl.formatMessage(IntlMessage.imageNotExist),
               intl.formatMessage(IntlMessage.contactAdmin))
           }
           let imageTag = result.data[0]
           result.data.map(tag => {
             if(!!tag.name && tag.name === LATEST) {
               imageTag = LATEST
             }
           })
           if (result.data.indexOf(LATEST) > -1) {
             imageTag = LATEST
           }
           if (location.query && location.query.tag) {
              let hasTag
              result.data.every(tags =>{
                // 兼容老版本获取 tags
                if ((tags.name || tags) === location.query.tag) {
                  hasTag = true
                  return false
                }
                return true
              })
              if (hasTag) {
                imageTag = location.query.tag
              }
            }
            const textImageTag = typeof imageTag === 'object' ? imageTag.name : imageTag
            setFieldsValue({
              imageTag: textImageTag,
            })

           // load image config by tag
           this.loadImageConfig(other, imageName, textImageTag)
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
      location,
      harbor,
    } = this.props
    if (images) {
      imageName = images
    }
    let loadImageConfigFunc
    // if (location.query　&& location.query.imageName) {
    //   imageName = location.query.imageName
    // }
    let { pathname, query } = location
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
      loadImageConfigFunc = loadOtherDetailTagConfig.bind(this, config, callback)
    } else {
      loadImageConfigFunc = loadRepositoriesTagConfigInfo.bind(this, harbor, DEFAULT_REGISTRY, imageName, imageTag, callback)
    }
    loadImageConfigFunc()
  },
  setConfigsToForm(configs) {
    this.setState({
      imageConfigs: configs,
    })
    const { callback, form, location } = this.props
    callback && callback(form, configs)
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
      const argsType = 'default'
      cmd.forEach((args, index) => {
        // magic code ！
        // the same as portsKeys
        argsKeys.push({ value: index })
        argsFields[`args${index}_${argsType}`] = args
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

    // set annotation => system/registry = dockerhub
    const systemRegistry = location.query.systemRegistry

    // use `setFieldsValue` once, dispatch one action
    let fieldsValues = {
      storageKeys,
      portsKeys,
      argsKeys,
      defaultArgsKeys: argsKeys,
      envKeys,
      imagePullPolicy: 'Always',
      livenessProtocol: 'none',
      systemRegistry,
      imagePorts: containerPorts,
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
    const { current, checkAppName, intl } = this.props
    let errorMsg = appNameCheck(value, intl.formatMessage(IntlMessage.appName))
    if (errorMsg != 'success') {
      return callback(errorMsg)
    }
    clearTimeout(this.appNameCheckTimeout)
    this.appNameCheckTimeout = setTimeout(() => {
      checkAppName(current.cluster.clusterID, value, {
        success: {
          func: (result) => {
            if (result.data) {
              errorMsg = appNameCheck(value, intl.formatMessage(IntlMessage.appName), true)
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
          },
          isAsync: true,
        }
      })
    }, ASYNC_VALIDATOR_TIMEOUT)
  },
  checkTempName (rule, value, callback) {
    const { appTemplateNameCheck, isTemplate, location, mode, intl } = this.props
    const { query } = location
    let errorMsg = templateNameCheck(value)
    if (errorMsg !== 'success') {
      return callback(errorMsg)
    }
    if (mode === 'edit' || (query.action && query.action === 'addTemplate')) {
      return callback()
    }
    clearTimeout(this.templateNameCheckTimeout)
    this.templateNameCheckTimeout = setTimeout(() => {
      appTemplateNameCheck(value, {
        success: {
          func: () => {
            callback()
          },
          isAsync: true,
        },
        failed: {
          func: res=> {
            if (res.statusCode === 409) {
              callback(`${intl.formatMessage(IntlMessage.nameExisted,
                  { item: intl.formatMessage(IntlMessage.appTemplate) })}`)
            }
          },
          isAsync: true,
        }
      })
    }, ASYNC_VALIDATOR_TIMEOUT);
  },
  checkTempVersion (rule, value, callback) {
    const { intl } = this.props
    if (!value) {
      return callback(`${intl.formatMessage(IntlMessage.pleaseEnter,
        { item: intl.formatMessage(IntlMessage.appTemplateVersion), end: '' })}`)
    }
    callback()
  },
  checkTempDesc (rule, value, callback) {
    const { intl } = this.props
    if (!value) {
      return callback()
    }
    if (value && value.length > 1000) {
      return callback(intl.formatMessage(IntlMessage.appTempDescLengthLimit))
    }
    callback()
  },
  checkServiceName(rule, value, callback) {
    if (!value) {
      return callback()
    }
    const { current, checkServiceName, allFields, id, location, isTemplate, intl } = this.props
    if (!validateK8sResourceForServiceName(value)) {
      return callback(intl.formatMessage(IntlMessage.serviceNameRegLimit))
    }
    for (let key in allFields) {
      if (allFields.hasOwnProperty(key)) {
          const serviceName = allFields[key].serviceName || {}
        if (key !== id) {
          if (serviceName.value === value) {
            callback(appNameCheck(value, intl.formatMessage(IntlMessage.serviceName), true))
            return
          }
        }
      }
    }
    if (location && location.query && location.query.template && isTemplate) {
      return callback()
    }
    clearTimeout(this.serviceNameExistsTimeout)
    this.serviceNameExistsTimeout = setTimeout(() => {
      checkServiceName(current.cluster.clusterID, value, {
        success: {
          func: (result) => {
            if(result.data) {
              callback(appNameCheck(value, intl.formatMessage(IntlMessage.serviceName), true))
              return
            }
            callback()
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            callback()
          },
          isAsync: true,
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
      current, id, allFields, location, AdvancedSettingKey,
      isTemplate, template, setFormFields, appName, newImageName,
      intl
    } = this.props
    const allFieldsKeys = Object.keys(allFields) || []
    const { imageConfigs } = this.state
    const { getFieldProps, getFieldValue, setFieldsValue } = form
    const { query } = location
    const { isWrap, fileType, registryServer, template: queryTemplate,
      addAI, imageName, modelSet } = query || { isWrap: 'false' }
    let appNameProps;
    if (!isTemplate) {
      appNameProps = getFieldProps('appName', {
        rules: [
          { required: !isTemplate,
            message: intl.formatMessage(IntlMessage.requiredMessage,
              { item: intl.formatMessage(IntlMessage.appName) }) },
          { validator: this.checkAppName }
        ],
      })
    }
    let templateNameProps;
    // 暂时不支持模板版本
    let templateVersionProps;
    let templateDescProps;
    if (isTemplate) {
      templateNameProps = getFieldProps('templateName', {
        rules: [
          {
            validator: this.checkTempName
          }
        ]
      });
      // templateVersionProps = getFieldProps('templateVersion', {
      //   rules: [
      //     {
      //       validator: this.checkTempVersion
      //     }
      //   ]
      // })
      templateDescProps = getFieldProps('templateDesc', {
        rules: [
          {
            validator: this.checkTempDesc
          }
        ]
      })
    }
    const serviceNameProps = getFieldProps('serviceName', {
      rules: [
        { required: true,
          message: intl.formatMessage(IntlMessage.requiredMessage,
            { item: intl.formatMessage(IntlMessage.serviceName) })},
        { validator: this.checkServiceName }
      ],
    })
    const imageUrlProps = getFieldProps('imageUrl', {
      rules: [
        { required: true,
          message: intl.formatMessage(IntlMessage.pleaseEnter,
            { item: intl.formatMessage(IntlMessage.imageAddress), end: '' }) }
      ],
    })
    const imageTag = getFieldValue('imageTag')
    getFieldProps('imageTagOS', {
      initialValue: imageTag && imageTags.tagWithOS && imageTags.tagWithOS.length && filter(imageTags.tagWithOS, { name: imageTag })[0].os,
    })
    getFieldProps('imageTagArch', {
      initialValue: imageTag && imageTags.tagWithOS && imageTags.tagWithOS.length && filter(imageTags.tagWithOS, { name: imageTag })[0].arch,
    })
    const imageTagProps = getFieldProps('imageTag', {
      rules: [
        { required: true }
      ],
      onChange: tag => {
        const obj = imageTags.tagWithOS && imageTags.tagWithOS.length ? filter(imageTags.tagWithOS, { name: tag })[0] : undefined
        obj && setFieldsValue({
          imageTagOS: obj.os,
          imageTagArch: obj.arch,
        })
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
          {!isTemplate &&
            <FormItem
              {...formItemLayout}
              wrapperCol={{ span: 9 }}
              label={intl.formatMessage(IntlMessage.appName)}
              hasFeedback
              key="appName"
            >
              <Input
                size="large"
                placeholder={intl.formatMessage(IntlMessage.pleaseEnter, {
                  item: intl.formatMessage(IntlMessage.appName), end: '',
                })}
                autoComplete="off"
                {...appNameProps}
                ref="appNameInput"
                disabled={appName && this.getAppNameDisabled()}
              />
            </FormItem>
            }
            {isTemplate &&
              <FormItem
                label={intl.formatMessage(IntlMessage.templateName)}
                hasFeedback
                key="templateVersion"
                {...formItemLayout}
                wrapperCol={{ span: 9 }}
              >
                <Input
                  size="large"
                  placeholder={intl.formatMessage(IntlMessage.pleaseEnter, {
                    item: intl.formatMessage(IntlMessage.templateName),
                    end: '',
                  })}
                  autoComplete="off"
                  ref="templateNameInput"
                  disabled={this.getAppNameDisabled()}
                  {...templateNameProps}
                />
              </FormItem>
            }
            {/* {isTemplate &&
              <FormItem
                label="模板版本"
                key="templateName"
                {...formItemLayout}
                wrapperCol={{ span: 8 }}
              >
                <Input
                  size="large"
                  placeholder="请输入模板版本"
                  disabled={this.getAppNameDisabled()}
                  {...templateVersionProps}
                />
              </FormItem>
            } */}
            {isTemplate &&
              <FormItem
                label={intl.formatMessage(IntlMessage.appTemplateDesc)}
                key="templateDesc"
                {...formItemLayout}
                wrapperCol={{ span: 9 }}
              >
                <Input
                  size="large"
                  type="textarea"
                  placeholder={intl.formatMessage(IntlMessage.pleaseEnter, {
                    item: intl.formatMessage(IntlMessage.appTemplateDesc),
                    end: '',
                  })}
                  disabled={this.getAppNameDisabled()}
                  {...templateDescProps}
                />
              </FormItem>
            }
            <FormItem
              {...formItemLayout}
              wrapperCol={{ span: 9 }}
              label={intl.formatMessage(IntlMessage.serviceName)}
              hasFeedback
              key="serviceName"
            >
              <Input
                size="large"
                placeholder={intl.formatMessage(IntlMessage.pleaseEnter, {
                  item: intl.formatMessage(IntlMessage.serviceName),
                  end: '',
                })}
                autoComplete="off"
                {...serviceNameProps}
                ref="serviceNameInput"
              />
            </FormItem>
            {isWrap === 'true' &&
            <FormItem {...formItemLayout}
              wrapperCol={{ span: 9 }}
              label={intl.formatMessage(IntlMessage.wrap)}
              hasFeedback
              key="Appwrap">
              <Input readOnly value={newImageName || window.WrapListTable.fileName  + ' | '+ window.WrapListTable.fileTag} />
            </FormItem>
            }
            {
              addAI && modelSet &&
              <FormItem
                {...formItemLayout}
                wrapperCol={{ span: 9 }}
                label={intl.formatMessage(IntlMessage.modelSet)}
                hasFeedback
                key="modelSet"
              >
                <Input
                  size="large"
                  placeholder={intl.formatMessage(IntlMessage.pleaseEnter, {
                    item: intl.formatMessage(IntlMessage.modelSet),
                    end: '',
                  })}
                  readOnly
                  value={modelSet}
                />
              </FormItem>
            }
            {
              (!queryTemplate || (queryTemplate && isWrap !== 'true')) &&
              <FormItem
                {...formItemLayout}
                wrapperCol={{ span: 9 }}
                label={location.query.appPkgID ? intl.formatMessage(IntlMessage.operatingEnv): intl.formatMessage(IntlMessage.image)}
                key="image"
              >
                <Input
                  size="large"
                  placeholder={intl.formatMessage(IntlMessage.pleaseEnter, {
                    item: location.query.appPkgID ?
                      intl.formatMessage(IntlMessage.operatingEnv)
                      :
                      intl.formatMessage(IntlMessage.image),
                    end: intl.formatMessage(IntlMessage.address)
                    })
                  }
                  autoComplete="off"
                  readOnly
                  {...imageUrlProps}
                />
              </FormItem>
            }
            {
              (!queryTemplate || (queryTemplate && isWrap !== 'true')) &&
              [  <FormItem
                  {...formItemLayout}
                  wrapperCol={{ span: 6 }}
                  label={location.query.appPkgID ?
                    `${intl.formatMessage(IntlMessage.env)}${intl.formatMessage(IntlMessage.version)}`
                    :
                    `${intl.formatMessage(IntlMessage.image)}${intl.formatMessage(IntlMessage.version)}`
                  }
                  key="imageTag"
                >
                  <Select
                    size="large"
                    placeholder={
                      intl.formatMessage(IntlMessage.pleaseEnter, {
                        item: location.query.appPkgID ?
                          intl.formatMessage(IntlMessage.operation)
                          :
                          intl.formatMessage(IntlMessage.image),
                        end: intl.formatMessage(IntlMessage.version)
                      })
                    }
                    showSearch
                    optionFilterProp="children"
                    {...imageTagProps}
                    disabled={isWrap === 'true'}
                  >
                    {
                      imageTags.list && imageTags.list.map(tag => (
                        <Option key={tag}>{tag}</Option>
                      ))
                    }
                  </Select>
                </FormItem>,
                <FormItem
                  {...formItemLayout}
                  wrapperCol={{ span: 20 }}
                  key="system"
                  label="系统架构"
                >
                  {
                    (() => {
                      const os = getFieldValue('imageTagOS')
                      const arch = getFieldValue('imageTagArch')
                      if (os && arch) {
                        const array = os.split('')
                        array[0] = array[0].toUpperCase()
                        const showOs = array.join('')
                        const showArch = arch.toUpperCase()
                        if (os === 'windows') {
                          return <div className="infoText">
                            <Button className="btnOs" size="small" type="ghost">{showOs} {showArch}</Button> <span className="beta">Beta</span>
                            {/* <span style={{ marginLeft: 5 }}>容器只能运行在 Windows 节点上，并且只能与其它 Windows 容器网络互通</span> */}
                          </div>
                        } else if (os === 'linux') {
                          return <div className="infoText">
                            <Button className="btnOs" size="small" type="ghost">{showOs} {showArch}</Button>
                            {/* <span style={{ marginLeft: 5 }}>容器无法运行在 Windows 节点上，并且与 Windows 容器网络不互通</span> */}
                          </div>
                        }
                      }
                      return ''
                    })()
                  }
                </FormItem>
              ]
            }
              <ApmSetting
                form={form}
                formItemLayout={formItemLayout}
              />
              <ServiceMesh
                form={form}
                formItemLayout={formItemLayout}
              />
          </Form>
        </div>
        {
          isWrap === 'true' && queryTemplate &&
          <OperationEnv
            form={form}
            formItemLayout={formItemLayout}
            id={id}
            template={template}
            fileType={fileType}
            registryServer={registryServer}
            imageTagProps={imageTagProps}
            currentFields={currentFields}
            setFormFields={setFormFields}
            key="operation"
          />
        }
        <NormalSetting
          id={id}
          form={form}
          formItemLayout={formItemLayout}
          fields={currentFields}
          standardFlag={standardFlag}
          loadFreeVolume={loadFreeVolume}
          createStorage={createStorage}
          imageConfigs={imageConfigs}
          isTemplate={isTemplate}
          {...{location}}
          key="normal"
        />
        {
          !isTemplate &&
          <SecurityGroup
            form={form}
            formItemLayout={formItemLayout}
          />
        }
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
          fields={currentFields}
          key="liveness"
        />
        <ConfigMapSetting
          form={form}
          formItemLayout={formItemLayout}
          {...{location, isTemplate}}
          key="configMap"
        />
        <AdvancedSetting
          AdvancedSettingKey={AdvancedSettingKey}
          form={form}
          formItemLayout={formItemLayout}
          intl={this.props.intl}
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
    const { id, setFormFields, mode } = props
    if ((id !== window._fieldId) && (mode !== 'create')) {
      return
    }
    if (!initForm) {
      setFormFields(id, fields)
      initForm = true
      return
    }
    const newFields = Object.assign({}, fieldsBefore, fields)
    fieldsBefore = cloneDeep(newFields)
    clearTimeout(setFormFieldsTimeout)
    // 改延迟会导致用户输入过快表单显示不准确 和 切换服务过快时校验报错 LOT-2785 LOT-2912
    // setFormFieldsTimeout = setTimeout(() => {
      setFormFields(id, newFields)
    // }, lazySetFormFieldsTimeout)
  }
}

ConfigureService = Form.create(createFormOpts)(ConfigureService)

function mapStateToProps(state, props) {
  const { quickCreateApp, entities, getImageTag, harbor: stateHarbor, images } = state
  const { otherImageTag } = getImageTag
  const { imageTags } = stateHarbor
  const { imageName, location, id } = props
  const { fields } = quickCreateApp
  const currentFields = quickCreateApp.fields[id]
  let tags = []
  let tagWithOS = []
  let tagsIsFetching = false
  if (location.query.other) {
    const otherImageTags = otherImageTag[location.query.imageName] || {}
    tags = otherImageTags.imageTag || []
    tagsIsFetching = otherImageTags.isFetching
    tagWithOS = otherImageTags.tagWithOS || []
  } else {
    if (imageTags[DEFAULT_REGISTRY] && imageTags[DEFAULT_REGISTRY][imageName]) {
      const currentImageTags = imageTags[DEFAULT_REGISTRY][imageName]
      tags = currentImageTags.tag || []
      tagWithOS = currentImageTags.tagWithOS || []
      tagsIsFetching = currentImageTags.isFetching
    }
  }
  const { wrapTemplate } = images
  const { template } = wrapTemplate || { template: [] }

  const { cluster } =  entities.current
  const { harbor: harbors } = cluster
  const harbor = harbors ? harbors[0] || "" : ""
  return {
    allFields: fields,
    currentFields,
    current: entities.current,
    imageTags: {
      list: tags,
      tagWithOS,
      isFetching: tagsIsFetching
    },
    template,
    harbor,
  }
}

export default connect(mapStateToProps, {
  setFormFields,
  checkAppName,
  checkServiceName,
  getOtherImageTag,
  loadOtherDetailTagConfig,
  loadRepositoriesTagConfigInfo,
  loadRepositoriesTags,
  appTemplateNameCheck
})(ConfigureService)

// export default injectIntl(ConfigureService, {
//   withRef: true,
// })
