/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Create app: select image
 *
 * v0.1 - 2017-05-03
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import { Card, Row, Col, Steps, Button, Modal, Icon, Tooltip, Spin, Timeline, Popover } from 'antd'
import { browserHistory } from 'react-router'
import { connect } from 'react-redux'
import classNames from 'classnames'
import yaml from 'js-yaml'
import isEmpty from 'lodash/isEmpty'
import SelectImage from './SelectImage'
import ConfigureService from './ConfigureService'
import DeployWrap from '../AppCreate/DeployWrap'
import DeployAI from '../../../../client/containers/AppModule/QuickCreateApp/DeployAI'
import TemplateTable from '../../../../client/containers/AppModule/QuickCreateApp/SelectTemplate'
import ResourceQuotaModal from '../../ResourceQuotaModal'
import NotificationHandler from '../../../components/Notification'
import {
  genRandomString, toQuerystring, getResourceByMemory, parseAmount,
  isResourcePermissionError, formatServiceToArrry, getWrapFileType,
  sleep, lbListenerIsEmpty
} from '../../../common/tools'
import { DEFAULT_REGISTRY, OTHER_IMAGE } from '../../../constants'
import { removeFormFields, removeAllFormFields, setFormFields } from '../../../actions/quick_create_app'
import { createApp } from '../../../actions/app_manage'
import { addService, loadServiceList } from '../../../actions/services'
import { createAppIngress, getLBList, createTcpUdpIngress } from '../../../actions/load_balance'
import { getAppTemplateDetail, appTemplateDeploy, appTemplateDeployCheck, removeAppTemplateDeployCheck } from '../../../../client/actions/template'
import { getImageTemplate } from '../../../actions/app_center'
import {
  buildJson, getFieldsValues, formatValuesToFields,
  formatTemplateDeployErrors, isFieldsHasErrors,
} from './utils'
import './style/index.less'
import { SHOW_BILLING, UPGRADE_EDITION_REQUIRED_CODE } from '../../../constants'
import { parseToFields } from '../../../../client/containers/AppCenter/AppTemplate/CreateTemplate/parseToFields'
import { formatTemplateBody } from '../../../../client/containers/AppCenter/AppTemplate/CreateTemplate/TemplateInfo/formatTemplateBody'
import Title from '../../Title'
import ResourceErrorsModal from './ResourceErrorsModal'
import { getfSecurityGroupDetail, updateSecurityGroup } from '../../../../client/actions/securityGroup'
import { buildNetworkPolicy, parseNetworkPolicy } from '../../../../kubernetes/objects/securityGroup'
import { injectIntl, FormattedMessage } from 'react-intl'
import IntlMessage from '../../../containers/Application/intl'
import * as templateActions from '../../../../client/actions/template'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import { getPluginStatus } from '../../../actions/project'
import get from 'lodash/get'

const Step = Steps.Step
const SERVICE_CONFIG_HASH = '#configure-service'
const SERVICE_EDIT_HASH = '#edit-service'
const standard = require('../../../../configs/constants').STANDARD_MODE
const mode = require('../../../../configs/model').mode
const standardFlag = standard === mode
const notification = new NotificationHandler()
// let serviceNameList = []
const HOST_ERROR = 'do not support host storage'

class QuickCreateApp extends Component {
  constructor(props) {
    super()
    this.getStepsCurrent = this.getStepsCurrent.bind(this)
    this.renderBody = this.renderBody.bind(this)
    this.onSelectImage = this.onSelectImage.bind(this)
    this.onSelectOtherImage = this.onSelectOtherImage.bind(this)
    this.renderFooterSteps = this.renderFooterSteps.bind(this)
    this.goSelectCreateAppMode = this.goSelectCreateAppMode.bind(this)
    this.saveService = this.saveService.bind(this)
    this.setConfig = this.setConfig.bind(this)
    this.genConfigureServiceKey = this.genConfigureServiceKey.bind(this)
    this.getAppResources = this.getAppResources.bind(this)
    this.createAppOrAddService = this.createAppOrAddService.bind(this)
    this.onCreateAppOrAddServiceClick = this.onCreateAppOrAddServiceClick.bind(this)
    this.goSelectImage = this.goSelectImage.bind(this)
    this.renderServiceList = this.renderServiceList.bind(this)
    this.confirmSave = this.confirmSave.bind(this)
    this.cancelSave = this.cancelSave.bind(this)
    const { location, fields } = props
    const { query } = location
    const { imageName, registryServer, appName, action } = query
    let appNameInit = this.getAppName(fields)
    if (appName && action) {
      appNameInit = appName
      this.action = action
    }
    this.state = {
      imageName,
      registryServer,
      serviceList: [],
      confirmGoBackModalVisible: false,
      confirmSaveModalVisible: false,
      appName: appNameInit,
      isCreatingApp: false,
      resourceQuotaModal: false,
      resourceQuota: null,
      stepStatus: 'process',
      formErrors: null,
      editServiceLoading: false,
      AdvancedSettingKey: null,
      cpuTotal: 0,
      memoryTotal: 0,
      priceHour: 0,
      runAIImage: undefined,
      modelSet: undefined,
      modelSetVolumeConfig: undefined,
      dubboSwitchOn: false,
    }
    this.serviceSum = 0
    this.configureServiceKey = this.genConfigureServiceKey()
    this.serviceNameList = []
  }

  getAppName(fields) {
    let appName
    // get app name from fields
    if (fields) {
      for (let key in fields) {
        if (fields.hasOwnProperty(key)) {
          const currentFields = fields[key]
          if (currentFields.appName && currentFields.appName.value) {
            appName = currentFields.appName.value
          }
        }
      }
    }
    return appName
  }

  genConfigureServiceKey() {
    this.serviceSum ++
    return `${this.serviceSum}-${genRandomString('0123456789')}`
  }

  componentWillMount() {
    this.setConfig(this.props)
    const { location, fields, template:templateList, getImageTemplate, current, getPluginStatus } = this.props
    const { cluster, space } = current
    // 检查是否为dubbo服务，如果是，提交数据时加上当前项目的namespace为默认环境变量
    getPluginStatus({ clusterID: cluster.clusterID }, space.namespace, {
      success: {
        func: res => {
          if (res.data.dubboOperator) {
            this.setState({dubboSwitchOn: true})
          } else {
            this.setState({dubboSwitchOn: false})
          }
        }
      }
    })
    const { hash, query, pathname } = location
    const { imageName, registryServer, key, from, template } = query
    if (template && key) {
      this.deployCheck(this.props)
    }
    if (pathname.includes('app_create/quick_create') && template) {
      this.checkHelmIsRepare()
    }
    if (isEmpty(templateList)) {
      getImageTemplate(DEFAULT_REGISTRY)
    }
    this.getExistentServices()
    // 从交付中心跳转过来
    if (from && from === 'appcenter') {
      this.configureMode = 'edit';
      this.editServiceKey = key;
      window._fieldId = key
      const currentFields = fields[key]
      if (currentFields.appPkgID) {
        const { imageUrl, appPkgID } = currentFields
        const [registryServer, ...imageArray] = imageUrl.value.split('/');
        const imageName = imageArray.join('/');
        const type = imageName.split('/')[1];
        const fileType = getWrapFileType(type);
        let newTemplateList = templateList
        if (isEmpty(templateList)) {
          getImageTemplate(DEFAULT_REGISTRY).then(res => {
            newTemplateList = res.response.result.template
            let currentTemplate = newTemplateList.filter(item => item.type === fileType)[0]
            let newImageName = currentTemplate.name;
            this.setState({
              newImageName
            })
          })
        } else {
          let currentTemplate = newTemplateList.filter(item => item.type === fileType)[0]
          let newImageName = currentTemplate.name;
          this.setState({
            newImageName
          })
        }
      }
      return
    }
    if ((hash === SERVICE_CONFIG_HASH && !imageName) || hash === SERVICE_EDIT_HASH) {
      browserHistory.replace('/app_manage/app_create/quick_create')
    } else if (hash !== SERVICE_CONFIG_HASH && imageName && registryServer) {
      browserHistory.replace(`/app_manage/app_create/quick_create?${toQuerystring(query)}${SERVICE_CONFIG_HASH}`)
    }
  }

  componentWillUnmount() {
    this.removeAllFormFieldsAsync(this.props)
    this.removeDeployCheck(this.props)
    window.WrapListTable = null
  }

  removeDeployCheck = (props) => {
    const { removeAppTemplateDeployCheck } = this.props;
    setTimeout(removeAppTemplateDeployCheck);
  }

  checkHelmIsRepare = async () => {
    const { checkHelmIsPrepare, current } = this.props
    const { clusterID } = current.cluster;
    const result = await checkHelmIsPrepare(clusterID)
    const ready = getDeepValue(result, ['response', 'result', 'data', 'ready'])
    this.setState({
      helmAlready: !!ready,
    })
  }

  getExistentServices() {
    const { loadServiceList, current, location } = this.props
    let serviceList = []
    let newCpuTotal = 0
    let newMemoryTotal = 0
    let newPriceHour = 0
    const appName = location.query.appName
    if (!appName) {
      return
    }
    loadServiceList(current.cluster.clusterID, location.query.appName, null, {
      success: {
        func: res => {
          if (res.data.length) {
            res.data.forEach(item => {
              // _serviceNameList.push(item.metadata.name)
              const { replicas, template } = item.spec
              const { cpu, memory } = template.spec.containers[0].resources.limits
              let resourceType
              const unit = memory.charAt(memory.length - 2)
              if (unit === 'M') {
                resourceType = Number(memory.substring(0, memory.length - 2))
              } else if (unit === 'G') {
                resourceType = Number(memory.substring(0, memory.length - 2)) * 1024
              }
              const { memoryShow, cpuShow, config } = getResourceByMemory(resourceType)
              newCpuTotal += cpuShow * replicas
              newMemoryTotal += memoryShow * replicas
              newPriceHour += current.cluster.resourcePrice[config]
              serviceList.push(
                <Row className="serviceItem" key={item.metadata.name}>
                  <Col span={12} className="textoverflow">
                    {item.metadata.name}
                  </Col>
                  <Col span={12} className="btns">
                    <div>
                      <Button
                        type="dashed"
                        size="small"
                        disabled
                      >
                        <Icon type="edit" />
                      </Button>
                      <Button
                        type="dashed"
                        size="small"
                        disabled
                      >
                        <Icon type="delete" />
                      </Button>
                    </div>
                  </Col>
                </Row>
              )
              this.setState({
                serviceList,
                cpuTotal: Math.ceil(newCpuTotal * 100) / 100,
                memoryTotal: Math.ceil(newMemoryTotal * 100) / 100,
                priceHour: newPriceHour
              })
            })
          }
        },
        isAsync: true
      }
    })
  }
  removeAllFormFieldsAsync(props) {
    // 异步清除 fields，即等 QuickCreateApp 组件卸载后再清除，否者会出错
    const { removeAllFormFields } = props
    setTimeout(removeAllFormFields)
  }

  componentWillReceiveProps(nextProps) {
    const { location } = nextProps
    const { hash, query, template } = location
    if (hash !== this.props.location.hash || query.key !== this.props.location.query.key) {
      this.setConfig(nextProps)
    }
    if (query.imageName) {
      this.setState({imageName:query.imageName})
    }
    if (query.key && !this.props.location.query.key && template) {
      this.deployCheck(nextProps)
    }
  }

  deployCheck = async (props) => {
    const { appTemplateDeployCheck, current, templateDetail, fields, setFormFields } = props;
    const { clusterID } = current.cluster;
    const { data } = templateDetail;
    const { chart } = data;
    const { name, version } = chart;
    const result = await appTemplateDeployCheck(clusterID, name, version)
    if (result.error) {
      return
    }
    const { templateDeployCheck } = this.props
    let flag = false;
    for (const [key, value] of Object.entries(fields)) {
      const errorFields = {};
      const currentError = result.response.result.data[value.serviceName.value]
      if (!isEmpty(currentError)) {
        flag = true
        formatTemplateDeployErrors(value, currentError, errorFields, templateDeployCheck)
      }
      if (!isEmpty(errorFields)) {
        setFormFields(key, Object.assign(value, errorFields))
        // this.form.setFields(Object.assign(value, errorFields))
      }
    }

    this.setState({
      resourceError: flag
    })
  }

  setConfig(props) {
    const { location } = props
    const { hash, query } = location
    const { key } = query
    const configureMode = hash === SERVICE_EDIT_HASH ? 'edit' : 'create'
    this.configureMode = configureMode
    if (configureMode === 'edit') {
      // this.configureServiceKey = key
      this.editServiceKey = key
      // 这个全局变量是因为模板部署过程中，切换服务的时候 onFieldsChange 取到的 id 值有可能不是当前父组件传给它的 id，需要用这个全局变量去做对比
      window._fieldId = key
    }
  }

  getStepsCurrent() {
    const { hash } = this.props.location
    if (hash === SERVICE_CONFIG_HASH || hash === SERVICE_EDIT_HASH) {
      return 2
    }
    return 1
  }
  onSelectOtherImage(query) {
    browserHistory.push(`/app_manage/app_create/quick_create?${toQuerystring(query)}${SERVICE_CONFIG_HASH}`)
  }
  onSelectImage(imageName, registryServer, appName, fromDetail) {
    this.setState({
      imageName,
      registryServer,
    })
    if (fromDetail) {
      browserHistory.push(`/app_manage/app_create/quick_create${SERVICE_CONFIG_HASH}?appName=${appName}&fromDetail=${fromDetail}`)
      return;
    }
    const query = {
      imageName,
      registryServer,
    }
    browserHistory.push(`/app_manage/app_create/quick_create?${toQuerystring(query)}${SERVICE_CONFIG_HASH}`)
  }

  onSelectTemplate = async record => {
    const { getAppTemplateDetail, setFormFields } = this.props;
    const { name } = record;
    const version = record.versions[0].version;
    const result = await getAppTemplateDetail(name, version);
    if (result.error) {
      return;
    }
    const { detail, chart } = result.response.result.data;
    const templateArray = [];
    formatServiceToArrry(detail, templateArray);
    templateArray.reverse();
    templateArray.forEach((temp) => {
      const id = this.genConfigureServiceKey();
      const values = parseToFields(temp, chart);
      setFormFields(id, values);
    });
    let url = '/app_manage/app_create/quick_create'
    setTimeout(() => {
      const { fields, location } = this.props;
      const firstID = Object.keys(fields)[0];
      const currentFields = fields[firstID];
      const { imageUrl, imageTag } = currentFields;
      const [registryServer, ...imageArray] = imageUrl.value.split('/');
      const imageName = imageArray.join('/');
      const query = {
        imageName,
        registryServer,
        tag: imageTag.value,
        key: firstID,
      };
      Object.assign(query, {...location.query})
      if (currentFields[OTHER_IMAGE]) {
        Object.assign(query, {
          other: currentFields[OTHER_IMAGE].value,
        })
      }
      if (location.query.appName) {
        this.configureMode = 'create';
        this.configureServiceKey = firstID;
        url += `?${toQuerystring(query)}${SERVICE_CONFIG_HASH}`
      } else {
        this.configureMode = 'edit';
        this.editServiceKey = firstID;
        url += `?${toQuerystring(query)}${SERVICE_EDIT_HASH}`
      }
      browserHistory.push(url)
    });
  }

  goSelectCreateAppMode() {
    const { query } = this.props.location;
    if (this.serviceNameList.length < 1) {
      if (query.fromDetail) {
        browserHistory.push(`/app_manage/detail/${query.appName}`)
        return
      }
      browserHistory.push('/app_manage/app_create')
      return
    }
    this.setState({
      confirmGoBackModalVisible: true
    })
  }

  confirmGoBack() {
    this.removeAllFormFieldsAsync(this.props)
    // browserHistory.push('/app_manage/app_create')
    browserHistory.goBack()
  }

  confirmSave() {
    if (this.state.formErrors) {
      notification.warn('请修改错误表单后，点击 [保存此服务并继续添加] 保存服务')
    }
    this.setState({
      confirmSaveModalVisible: false,
      formErrors: null,
    })
    this.saveService()
  }

  cancelSave() {
    this.setState({
      confirmSaveModalVisible: false,
    })
    const { removeFormFields } = this.props
    setTimeout(() => {
      removeFormFields(this.configureServiceKey)
    })
    browserHistory.push('/app_manage/app_create/quick_create')
  }

  goSelectImage() {
    const { template } = this.props.location.query
    if (!template && this.configureMode === 'edit') {
      return
    }
    this.setState({
      stepStatus: 'process',
    })
    const { removeAllFormFields, location } = this.props
    if (location.query.appPkgID) {
      // browserHistory.push('/app_manage/deploy_wrap')
      browserHistory.goBack()
      return
    }
    if (template) {
      setTimeout(() => {
        removeAllFormFields()
      })
      browserHistory.push('/app_manage/app_create/quick_create?template=true')
      return
    }
    const { validateFieldsAndScroll } = this.form
    validateFieldsAndScroll((errors, values) => {
      if (!!errors) {
        // 如果未填写服务名称，直接移除 store 中的表单记录
        if (errors.serviceName) {
          setTimeout(() => {
            removeFormFields(this.configureServiceKey)
          })
          // browserHistory.push('/app_manage/app_create/quick_create')
          browserHistory.goBack()
          return
        }
        // 如果已填写服务名称，保存 errors 到 state 中
        this.setState({
          formErrors: errors,
        })
      }
      // 提示用户是否保留该服务
      this.setState({
        confirmSaveModalVisible: true,
      })
    })
  }

  saveService(options) {
    const { fields } = this.props
    const { validateFieldsAndScroll } = this.form
    const { noJumpPage } = options || {}
    validateFieldsAndScroll((errors, values) => {
      if (!!errors) {
        return
      }
      const fieldsKeys = Object.keys(fields) || []
      if (fieldsKeys.length === 1) {
        this.setState({
          appName: values.appName
        })
      }
      // if create service, update the configure service key
      // use timeout: when history change generate a new configure serivce key
      if (this.configureMode === 'create') {
        setTimeout(() => {
          this.configureServiceKey = this.genConfigureServiceKey()
        }, 50)
      }
      if (options && options.addWrap) {
        browserHistory.push(`/app_manage/app_create/quick_create?appName=${values.appName}&addWrap=true`)
        return
      }
      if (!noJumpPage) {
        browserHistory.push('/app_manage/app_create/quick_create')
      }
    })
  }

  createAppByTemplate = async () => {
    const { appTemplateDeploy, fields, current, getLBList, loadBalanceList } = this.props;
    const { clusterID } = current.cluster
    if (isEmpty(loadBalanceList)) {
      await getLBList(clusterID)
    }
    const body = formatTemplateBody(this.props, this.imageConfigs, true);
    const fieldsArray = Object.values(fields);
    const firstField = fieldsArray[0];
    const appName = getFieldsValues(firstField).appName;
    body.name = appName;
    const { name, version } = body.chart;
    const result = await appTemplateDeploy(clusterID, name, version, body);
    if (result.error) {
      this.setState({
        stepStatus: 'error',
        isCreatingApp: false,
      })
      return
    }
    this.setState({
      stepStatus: 'finish',
      isCreatingApp: false,
    })
    let redirectUrl = '/app_manage'
    browserHistory.push(redirectUrl)
  }

  createAppOrAddService() {
    this.setState({
      isCreatingApp: true,
      stepStatus: 'process',
    })
    const {
      fields, current, loginUser,
      createApp, addService,location,
      createAppIngress, intl, createTcpUdpIngress,
      loadBalanceList
    } = this.props
    if (location.query.template) {
      this.createAppByTemplate()
      return
    }
    const { clusterID } = current.cluster
    const { namespace } = current.space
    let template = []
    let appPkgID = {}
    const monitorArr = []
    for (let key in fields) {
      if (fields.hasOwnProperty(key)) {
        if (this.state.dubboSwitchOn) {
          fields[key].envKeys.value.push({value: 0})
          fields[key].envName0 = {
            dirty: false,
            errors: '',
            name: 'envName0',
            validating: false,
            value: 'NAMESPACE'
          }
          fields[key].envValue0 = {
            dirty: false,
            name: 'envValue0',
            validating: false,
            value: namespace
          }
        }
        // 增加限流的annotion
        Object.assign(fields[key], this.props.flowContainer)
        let json = buildJson(fields[key], current.cluster, loginUser, this.imageConfigs)
        template.push(yaml.dump(json.deployment))
        template.push(yaml.dump(json.service))
        json.storage.forEach(item => {
          template.push(yaml.dump(item))
        })
        if (fields[key].appPkgID) {
          let serviceName = fields[key].serviceName && fields[key].serviceName.value
          appPkgID[serviceName] = fields[key].appPkgID.value
        }
      }
    }
    const callback = {
      success: {
        func: async res => {
          // 创建app后添加应用负载监听器
          for (let key in fields) {
            if (fields.hasOwnProperty(key)) {
              if (fields[key].accessType && fields[key].accessType.value === 'loadBalance') {
                const lbName = fields[key].loadBalance.value
                const lbKeys = fields[key].lbKeys && fields[key].lbKeys.value
                const tcpKeys = fields[key].tcpKeys && fields[key].tcpKeys.value
                const udpKeys = fields[key].udpKeys && fields[key].udpKeys.value
                const currentLB = loadBalanceList.filter(lb => lbName === lb.metadata.name)[0]
                const { displayName } = currentLB.metadata.annotations;
                const agentType = fields[key].agentType.value
                if (!isEmpty(lbKeys)) {
                  lbKeys.forEach(item => {
                    const items = []
                    const lbBody = []
                    const { host, displayName: ingressName, protocolPort } = fields[key][`ingress-${item}`].value
                    const [hostname, ...path] = host.split('/')
                    items.push({
                      serviceName: fields[key].serviceName.value,
                      servicePort: parseInt(fields[key][`port-${item}`].value),
                      weight: parseInt(fields[key][`weight-${item}`].value)
                    })
                    const body = {
                      host: hostname,
                      path: path ? '/' + path.join('/') : '/',
                      items,
                      port: protocolPort,
                    }
                    delete fields[key][`ingress-${item}`].value.protocolPort
                    lbBody.push(Object.assign(fields[key][`ingress-${item}`].value, body))
                    monitorArr.push(createAppIngress(clusterID, lbName, ingressName, displayName, agentType, { data: lbBody }))
                  })
                }
                if (!isEmpty(tcpKeys)) {
                  tcpKeys.forEach(item => {
                    const tcpBody = []
                    const exportPort = fields[key][`tcp-exportPort-${item}`].value.toString()
                    const servicePort = fields[key][`tcp-servicePort-${item}`].value.toString()
                    const serviceName = fields[key].serviceName.value
                    tcpBody.push({
                      exportPort,
                      servicePort,
                      serviceName,
                    })
                    monitorArr.push(createTcpUdpIngress(clusterID, lbName, 'tcp', displayName, agentType, { tcp: tcpBody }))
                  })
                }
                if (!isEmpty(udpKeys)) {
                  udpKeys.forEach(item => {
                    const udpBody = []
                    const exportPort = fields[key][`udp-exportPort-${item}`].value.toString()
                    const servicePort = fields[key][`udp-servicePort-${item}`].value.toString()
                    const serviceName = fields[key].serviceName.value
                    udpBody.push({
                      exportPort,
                      servicePort,
                      serviceName,
                    })
                    monitorArr.push(createTcpUdpIngress(clusterID, lbName, 'udp', displayName, agentType, { udp: udpBody }))
                  })
                }
              }
            }
          }
          if (!isEmpty(monitorArr)) {
            await Promise.all(monitorArr)
          }
          this.setState({
            stepStatus: 'finish',
          })
          let redirectUrl
          if (this.action === 'addService') {
            redirectUrl = `/app_manage/detail/${this.state.appName}`
          } else {
            redirectUrl = '/app_manage'
          }
          browserHistory.push(redirectUrl)
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          this.setState({
            stepStatus: 'error',
          })
          let msgObj
          if (this.action === 'addService') {
            msgObj = intl.formatMessage(IntlMessage.addServer)
          } else {
            msgObj = intl.formatMessage(IntlMessage.createApp)
          }
          if (err.statusCode == 400 && err.message === 'ip already allocated') {
            const { message, field } = err.message.details.causes[0]
            return notification.warn('ip 已经占用', `${message} 占用了 ${field}`)
          }
          if (err.statusCode == 403 && !isResourcePermissionError(err)) {
            const { data } = err.message
            const { require, capacity, used } = data
            let resourceQuota = {
              selectResource: {
                cpu: formatCpuFromMToC(require.cpu),
                memory: formatMemoryFromKbToG(require.memory),
              },
              usedResource: {
                cpu: formatCpuFromMToC(used.cpu),
                memory: formatMemoryFromKbToG(used.memory),
              },
              totalResource: {
                cpu: formatCpuFromMToC(capacity.cpu),
                memory: formatMemoryFromKbToG(capacity.memory),
              },
            }
            this.setState({
              resourceQuotaModal: true,
              resourceQuota,
            })
            function formatCpuFromMToC(cpu) {
              return Math.ceil(cpu / 1000 * 10) / 10
            }
            function formatMemoryFromKbToG(memory) {
              return Math.ceil(memory / 1024 / 1024 * 10) / 10
            }
            notification.warn(
              `${msgObj}${intl.formatMessage(IntlMessage.failure)}`,
              intl.formatMessage(IntlMessage.clusterResourceInsufficient))
            return
          }
          if (err.statusCode == 409) {
            if (err.message.message.indexOf('ip_port') > 0) {
              notification.warn(
                `${msgObj}${intl.formatMessage(IntlMessage.failure)}`,
                intl.formatMessage(IntlMessage.portConflict))
              return
            }
          }
          if (err.statusCode == 402) {
            return
          }
          if (err.statusCode !== UPGRADE_EDITION_REQUIRED_CODE && !isResourcePermissionError(err)){
            const { message } = err
            notification.warn(`${msgObj}${intl.formatMessage(IntlMessage.failure)}`, message.message)
          }
        }
      },
      finally: {
        func: () => {
          this.setState({
            isCreatingApp: false,
          })
        }
      },
    }
    if (this.action === 'addService') {
      const body = {
        template: template.join('---\n'),
        appPkgID: appPkgID
      }
      if (!body.template.length) {
        this.setState({
          stepStatus: 'process',
          isCreatingApp: false,
        })
        return notification.warn(intl.formatMessage(IntlMessage.mustAddServer))
      }
      addService(clusterID, this.state.appName, body, callback)
      return
    }
    const appConfig = {
      cluster: clusterID,
      template: template.join('---\n'),
      appName: this.getAppName(fields),
      appPkgID: appPkgID,
    }
    if (location.query.addAI) {
      appConfig.ai = true
    }
    createApp(appConfig, callback)
  }

  async onCreateAppOrAddServiceClick(isValidateFields) {
    const { intl, fields } = this.props
    // 解决 InputNumber 组件失去焦点新值才能生效问题
    await sleep(200)

    // [LOT-2384] 如果选择应用均衡负载, 则需要至少添加一个监听器
    let lbNoPort = lbListenerIsEmpty(fields)
    if (lbNoPort) {
      notification.warn(intl.formatMessage(IntlMessage.addOneListener))
      return
    }

    for (let key in fields) {
      if (fields.hasOwnProperty(key)) {
        // 调度的折叠面板打开则校验是否添加了标签
        if (fields[key].isShowScheduler && fields[key].isShowScheduler.value) {
          if (fields[key].bindNodeType.value === 'hostlabel') {
            const { cluster: { listNodes } } = this.props
            const checkNodeTag = !fields[key].serviceTag || !fields[key].serviceTag.value.length
            const checkServiceTag = !fields[key].serviceBottomTag || !fields[key].serviceBottomTag.value.length
            const advanceSet = fields[key].advanceSet && fields[key].advanceSet.value || false
            if (listNodes === 2 || listNodes === 6) {
              if (checkServiceTag && !advanceSet) {
                return notification.warn(intl.formatMessage(IntlMessage.mustAddOneServerTag))
              }
            } else if (listNodes === 3) {
              if (checkNodeTag) {
                return notification.warn(intl.formatMessage(IntlMessage.mustAddOneNodeTag))
              }
            } else if (listNodes === 4 || listNodes === 8) {
              if (checkNodeTag && checkServiceTag && !advanceSet) {
                return notification.warn(intl.formatMessage(IntlMessage.mustAddOneTag))
              }
            }
          }
        }
      }
    }

    if (!isValidateFields) {
      return this.createAppOrAddService()
    }
    // 检查 fields 中是否有错误
    if (isFieldsHasErrors(fields)) {
      const values = Object.values(fields)[0]
      let envError = false
      values.envKeys.value.forEach(v => {
        if (!values[`envName${v.value}`].value) {
          envError = true
          return
        }
      })
      if (envError) {
        notification.warn(intl.formatMessage(IntlMessage.envError))
        return
      }
      notification.warn(intl.formatMessage(IntlMessage.formsError))
      return
    }
    const { validateFieldsAndScroll, validateFields } = this.form
    const callback = async (errors, values) => {
      if (!!errors) {
        let keys = Object.getOwnPropertyNames(errors)
        const envNameErrors = keys.filter( item => {
          const envName = new RegExp('envName')
          if(envName.test(item)){
            return true
          }
          return false
        })
        const envValueErrors = keys.filter( item => {
          const envValue = new RegExp('envValue')
          if(envValue.test(item)){
            return true
          }
          return false
        })
        if (errors.appName){
          notification.warn(intl.formatMessage(IntlMessage.incorrect,
            { item: intl.formatMessage(IntlMessage.appName) }))
        } else if (errors.serviceName) {
          notification.warn(intl.formatMessage(IntlMessage.incorrect,
            { item: intl.formatMessage(IntlMessage.serviceName) }))
        } else if (envNameErrors.length || envValueErrors.length) {
          notification.warn(intl.formatMessage(IntlMessage.envError))
          this.setState({
            AdvancedSettingKey: 1
          })
        } else {
          notification.warn(intl.formatMessage(IntlMessage.formsError))
        }
        return
      }
      // 更新安全组 (失败就不创建)
      const { securityGroup } = values
      if (securityGroup && securityGroup.length) {
        let isSuccess = true
        const reqArray = []
        const { getfSecurityGroupDetail, updateSecurityGroup, cluster } = this.props
        securityGroup.map(item => {
          return reqArray.push(
            getfSecurityGroupDetail(cluster.clusterID, item, {
              failed: {},
            }).then(res => {
              if (res.error) {
                notification.close()
                notification.warn(intl.formatMessage(IntlMessage.loadSecurityGroupFailure), message.message)
                isSuccess = false
                return
              }
              const { name, targetServices, ingress, egress } = parseNetworkPolicy(res.response.result.data)
              targetServices.push(values.serviceName)
              const body = buildNetworkPolicy(name, targetServices, ingress || [], egress || [])
              return updateSecurityGroup(cluster.clusterID, body, {
                failed: {
                  func: error => {
                    const { message } = error
                    notification.close()
                    notification.warn(intl.formatMessage(IntlMessage.editSecurityGroupFailure), message.message)
                    isSuccess = false
                    return
                  },
                },
              })
            })
          )
        })
        await Promise.all(reqArray)
        if (!isSuccess) {
          return
        }
      }
      const { setFormFields } = this.props
      const id = this.configureMode === 'create' ? this.configureServiceKey : this.editServiceKey
      setFormFields(id, formatValuesToFields(values), {
        success: {
          func: this.createAppOrAddService,
          isAsync: true,
        }
      })
    }
    validateFields(async (errors, values) => {
      if (!!errors) {
        const errorsValues = Object.values(errors)
        // 应用模板部署过程中，如果配置组名称重复，重新输入新的配置组名称后，切换服务过程中表单会报错revalidate信息，需要重新validateFields
        const flag = errorsValues.some(error => {
          return error.errors.some(item => item.message.includes('revalidate'))
        })
        if (flag) {
          validateFieldsAndScroll(async (errors, values) => {
            await callback(errors, values)
          })
          return
        }
      }
      await callback(errors,values)
    })
  }

  onDeployAIChange = ({ runAIImage, modelSet, modelSetVolumeConfig }) => this.setState({
    runAIImage: runAIImage || this.state.runAIImage,
    modelSet: modelSet || this.state.modelSet,
    modelSetVolumeConfig: modelSetVolumeConfig || this.state.modelSetVolumeConfig,
  })

  renderBody() {
    const { location } = this.props
    const { hash, query } = location
    const { key, addWrap, template, addAI } = query
    const { imageName, registryServer, appName, editServiceLoading, AdvancedSettingKey, newImageName } = this.state
    if ((hash === SERVICE_CONFIG_HASH && imageName) || (hash === SERVICE_EDIT_HASH && key)) {
      const id = this.configureMode === 'create' ? this.configureServiceKey : this.editServiceKey
      if (editServiceLoading) {
        return <div className="loadingBox"><Spin size="large" /></div>
      }
      return (
        <ConfigureService
          mode={this.configureMode}
          id={id}
          action={this.action}
          callback={(form, configs) => {
              this.form = form
              this.imageConfigs = configs
            }
          }
          {...{imageName, registryServer, appName, newImageName}}
          {...this.props}
          AdvancedSettingKey={AdvancedSettingKey}
        />
      )
    }
    if (addWrap) {
      return <DeployWrap goBack={this.goSelectCreateAppMode}  location={location} quick_create={'quick_create'}/>
    } else if (template) {
      return <TemplateTable location={location} onChange={this.onSelectTemplate}/>
    } else if (addAI) {
      return <DeployAI
        runAIImage={this.state.runAIImage}
        modelSet={this.state.modelSet}
        onChange={this.onDeployAIChange}
      />
    }
    return <SelectImage location={location} onChange={this.onSelectImage} onOtherChange={this.onSelectOtherImage} />
  }

  renderCreateBtnText() {
    if (this.action === 'addService') {
      return <FormattedMessage {...IntlMessage.finishAddServices}/>
    }
    return <span>&nbsp;<FormattedMessage {...IntlMessage.create}/>&nbsp;</span>
  }

  /* nextStep() {
    const { wrapList, location } = this.props
    if (!window.WrapListTable) {
      notification.info('请先选择应用包')
      return
    }
    const row = window.WrapListTable
    // @todo has appRegistryMap
    // 此方法放弃了
    if(row.appRegistryMap && Object.keys(row.appRegistryMap).length > 0 && location.query.entryPkgID) {
      notification.error('应用下已有设置entryPkgID的服务')
      return
    }
    // /app_manage/app_create/quick_create#configure-service
    let { version, defaultTemplate, template } = window
    if (!defaultTemplate) {
      defaultTemplate = 1
      if (window.WrapListTable.fileType == 'jar') {
        defaultTemplate = 0
      }
    }
    let registry = wrapList.registry
    registry = registry && registry.split(/^(http:\/\/|https:\/\/)/)[2]
    let tag = version
    if (!version) {
      tag = template[defaultTemplate].version[0]
    }
    if (!registry) {
      notification.error('镜像地址获取失败','尝试刷新后重试')
      return
    }
    if (template[defaultTemplate].version.indexOf(tag) == -1) {
      notification.info('版本有误，请重新选择版本')
      return
    }
    const { appName, action} = location.query
    let imageName ='?imageName='+ template[defaultTemplate].name +`&tag=${tag}`+`&registryServer=${registry}&appPkgID=${row.id}&entryPkgID=${(row.appRegistryMap && Object.keys(row.appRegistryMap).length > 0) ? row.id : ''}`
    if (appName) {
      imageName += `&appName=${appName}&action=${action}`
    }
    browserHistory.push('/app_manage/app_create/quick_create'+ imageName + SERVICE_CONFIG_HASH)
  } */

  deployAINextStep = () => {
    const { intl } = this.props
    const { runAIImage, modelSet, modelSetVolumeConfig } = this.state
    if (!runAIImage) {
      notification.warn(intl.formatMessage(IntlMessage.pleaseSelectOperatingEnv))
      return
    }
    if (!modelSet) {
      notification.warn(intl.formatMessage(IntlMessage.pleaseBindModelSet))
      return
    }
    const { loginUser } = this.props
    const registryServer = loginUser.registryConfig.server.replace(/https?:\/\//, '')
    const query = Object.assign({}, modelSetVolumeConfig, {
      addAI: true,
      imageName: runAIImage,
      registryServer,
      modelSet,
    })
    browserHistory.push(`/app_manage/app_create/quick_create?${toQuerystring(query)}${SERVICE_CONFIG_HASH}`)
  }

  renderFooterSteps() {
    const { location } = this.props
    const { helmAlready } = this.state
    const { hash, query } = location
    const { template } = query;
    if (hash === SERVICE_CONFIG_HASH || hash === SERVICE_EDIT_HASH) {
      return (
        <div className="footerSteps">
          <div className="configureSteps">
            <div className={classNames("left", {'hidden': template})}>
              <FormattedMessage {...IntlMessage.keepAdding}/>：
              <Button.Group>
                <Button size="large" onClick={this.saveService}><FormattedMessage {...IntlMessage.containerImage}/></Button>
                <Button size="large" onClick={()=> this.saveService({addWrap: true})} type="primary">
                  <FormattedMessage {...IntlMessage.wrap}/>
                </Button>
              </Button.Group>
            </div>
            <div className="right">
              <Button
                size="large"
                onClick={this.goSelectImage}
                disabled={!template && this.configureMode === 'edit'}
              >
                <FormattedMessage {...IntlMessage.previous}/>
              </Button>
              <Tooltip title={template && !helmAlready ? <FormattedMessage {...IntlMessage.noTillerTip}/> : ''}>
                <Button size="large" disabled={template && !helmAlready} type="primary" onClick={this.onCreateAppOrAddServiceClick}>
                  { this.renderCreateBtnText() }
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
      )
    }
    return (
      query.addWrap && query.addWrap === 'true' ? null :
        <div className="footerSteps">
          <Button
            size="large"
            onClick={this.goSelectCreateAppMode}
          >
            <FormattedMessage {...IntlMessage.previous}/>
          </Button>
          {
            query.addAI && query.addAI === 'true' &&
            <Button size="large" style={{marginLeft:10}} onClick={()=> this.deployAINextStep()}>
              <FormattedMessage {...IntlMessage.nextStep}/>
            </Button>
          }
        </div>
    )
  }

  editService = (key) => {
    const { location, fields, template, intl } = this.props
    const { hash, query: oldQuery } = location
    const query = { key }
    const currentFields = fields[key]

    if (oldQuery.template) {
      Object.assign(query, { template: oldQuery.template })
    }
    if (currentFields.appPkgID) {
      const { imageUrl, appPkgID } = currentFields
      const [registryServer, ...imageArray] = imageUrl.value.split('/');
      const imageName = imageArray.join('/');
      const type = imageName.split('/')[1];
      const fileType = getWrapFileType(type);
      Object.assign(query, { isWrap: true, fileType, appPkgID: appPkgID.value })
      let currentTemplate = template.filter(item => item.type === fileType)[0]
      let newImageName = currentTemplate.name;
      this.setState({
        newImageName
      })
    }
    if (currentFields[OTHER_IMAGE]) {
      Object.assign(query, {
        other: currentFields[OTHER_IMAGE].value,
      })
    }
    const url = `/app_manage/app_create/quick_create?${toQuerystring(query)}${SERVICE_EDIT_HASH}`
    const currentStep = this.getStepsCurrent()
    // 在选择镜像界面
    if (currentStep === 1) {
      browserHistory.push(url)
      return
    }
    // 在配置服务界面
    if (currentStep === 2) {
      const { validateFields, validateFieldsAndScroll } = this.form
      const callback = (errors, values) => {
        if (!!errors) {
          let message = intl.formatMessage(IntlMessage.pleaseCorrectWrongForm)
          // 如果未填写服务名称，提示填写服务名称
          if (errors.serviceName) {
            message = intl.formatMessage(IntlMessage.pleaseFillInServiceName)
          }
          notification.warn(message)
          return
        }
        if (values.appName) {
          this.setState({
            appName: values.appName
          })
          // this.action = 'addService'
        }
        this.setState({ editServiceLoading: true }, () => {
          this.saveService({ noJumpPage: true })
          browserHistory.push(url)
          this.setState({
            editServiceLoading: false,
          })
        })
      }
      validateFields((errors, values) => {
        if (!!errors) {
          const errorsValues = Object.values(errors)
          // 应用模板部署过程中，如果配置组名称重复，重新输入新的配置组名称后，切换服务过程中表单会报错revalidate信息，需要重新validateFields
          const flag = errorsValues.some(error => {
            return error.errors.some(item => item.message.includes('revalidate'))
          })
          if (flag) {
            validateFieldsAndScroll((errors, values) => {
              callback(errors, values)
            })
            return
          }
        }
        callback(errors,values)
      })
      // const { removeFormFields } = this.props
      // setTimeout(() => {
      //   removeFormFields(this.configureServiceKey)
      // })
    }
  }

  deleteService(key) {
    const { removeFormFields, intl } = this.props
    if (this.configureMode === 'edit' && this.editServiceKey === key) {
      notification.warn(`${intl.formatMessage(IntlMessage.deleteFailure)}，
        ${intl.formatMessage(IntlMessage.pleaseCancelEdit)}`)
      return
    }
    removeFormFields(key, {
      success: {
        func: () => {
          //
        }
      }
    })
  }

  renderServiceError = name => {
    const { templateDeployCheck, fields } = this.props
    if (isEmpty(templateDeployCheck) || !templateDeployCheck.data) {
      return
    }
    const valuesArray = Object.values(fields)
    const currentFields = valuesArray.filter(item => item.serviceName.value === name)[0]
    let errorArray = []
    for (let [key, value] of Object.entries(currentFields)) {
      if (value.errors) {
        errorArray = errorArray.concat(value.errors.map(item => item.message))
      }
    }
    if (isEmpty(errorArray)) {
      return
    }
    const children = errorArray.map(item =>
      <Timeline.Item color="red" key={item}>{item}</Timeline.Item>
    )
    const content = (
      <Timeline className="serviceErrorTimeline">
        {children}
      </Timeline>
    )
    return (
      <Popover content={content} placement="right" arrowPointAtCenter={true}>
        <Icon type="exclamation-circle-o" className="failedColor" style={{ marginLeft: 10 }}/>
      </Popover>
    )
  }

  renderServiceList() {
    const { fields, location, intl } = this.props
    const { serviceList } = this.state
    const { template } = location.query
    let newServiceList = []
    const currentStep = this.getStepsCurrent()
    const _serviceNameList = []
    for (let key in fields) {
      if (fields.hasOwnProperty(key)) {
        const service = fields[key]
        const { serviceName } = service
        if (serviceName && serviceName.value) {
          let isRowActive = false
          // 排除“选择镜像”页面
          if (location.hash) {
            if (this.configureMode === 'create') {
              isRowActive = this.configureServiceKey === key
            } else if (this.configureMode === 'edit') {
              isRowActive = this.editServiceKey === key
            }
          }
          const rowClass = classNames({
            'serviceItem': true,
            'active': isRowActive,
          })
          _serviceNameList.push(serviceName.value)
          newServiceList.push(
            <Row className={rowClass} key={serviceName.value}>
              <Col span={12} className={classNames("textoverflow", { 'pointer': template })} onClick={template ? () => this.editService(key) : null}>
                {serviceName.value}{this.renderServiceError(serviceName.value)}
              </Col>
              <Col span={12} className="btns">
                {
                  !template && (currentStep === 1 || !isRowActive) && (
                    <div>
                      <Tooltip title={intl.formatMessage(IntlMessage.modify)}>
                        <Button
                          type="dashed"
                          size="small"
                          onClick={() => this.editService(key)}
                        >
                          <Icon type="edit" />
                        </Button>
                      </Tooltip>
                      <Tooltip title={intl.formatMessage(IntlMessage.delete)}>
                        <Button
                          type="dashed"
                          size="small"
                          onClick={this.deleteService.bind(this, key)}
                        >
                          <Icon type="delete" />
                        </Button>
                      </Tooltip>
                    </div>
                  )
                }
              </Col>
            </Row>
          )
        }
      }
    }
    newServiceList = newServiceList.concat(serviceList)
    this.serviceNameList = _serviceNameList
    if (newServiceList.length < 1) {
      return (
        <div className="noService"><FormattedMessage {...IntlMessage.noServiceTip}/></div>
      )
    }
    return newServiceList
  }

  getAppResources() {
    const { current } = this.props
    const { cpuTotal, memoryTotal, priceHour } = this.state
    const fields = this.props.fields || {}
    let newCpuTotal = 0 // unit: C
    let newMemoryTotal = 0 // unit: G
    let newPriceHour = 0 // unit: T/￥
    for (let key in fields) {
      if (fields.hasOwnProperty(key) && fields[key].serviceName) {
        const { resourceType, DIYMemory, DIYMaxMemory, DIYCPU, DIYMaxCPU, replicas } = getFieldsValues(fields[key])
        const { memoryShow, cpuShow, config } = getResourceByMemory(resourceType, DIYMemory, DIYCPU, DIYMaxMemory, DIYMaxCPU)
        newCpuTotal += cpuShow * replicas
        newMemoryTotal += memoryShow * replicas
        let price = current.cluster.resourcePrice[config]
        if (price) {
          newPriceHour += price * replicas
        } else {
          // @Todo: need diy resource price
        }
      }
    }
    newCpuTotal += cpuTotal
    newMemoryTotal += memoryTotal
    newPriceHour += priceHour
    newCpuTotal = Math.ceil(newCpuTotal * 100) / 100
    newMemoryTotal = Math.ceil(newMemoryTotal * 100) / 100
    const priceMonth = parseAmount(newPriceHour * 24 * 30, 4).amount
    newPriceHour = parseAmount(newPriceHour, 4).amount
    return {
      resource: `${newCpuTotal}C ${newMemoryTotal}G`,
      priceHour: newPriceHour,
      priceMonth,
    }
  }

  cancelResourceModal = () => {
    const { removeAllFormFields } = this.props;
    this.setState({
      resourceError: false
    })
    setTimeout(removeAllFormFields);
    browserHistory.goBack()
  }

  render() {
    const { current, location, billingEnabled, intl } = this.props
    const {
      confirmGoBackModalVisible, confirmSaveModalVisible, isCreatingApp,
      stepStatus, resourceError
    } = this.state
    const { template } = location.query
    const steps = (
      <Steps size="small" className="steps" status={stepStatus} current={this.getStepsCurrent()}>
        <Step title={intl.formatMessage(IntlMessage.deployMethod)} />
        <Step title={template ? intl.formatMessage(IntlMessage.selectTemplate) : intl.formatMessage(IntlMessage.selectImage)} />
        <Step title={intl.formatMessage(IntlMessage.configService)} />
      </Steps>
    )
    const { resource, priceHour, priceMonth } = this.getAppResources()
    const quickCreateAppClass = classNames({
      'ant-spin-nested-loading': isCreatingApp,
    })
    const quickCreateAppContentClass = classNames({
      'ant-spin-container': isCreatingApp,
    })
    const serviceList = this.renderServiceList()
    const currentStep = this.getStepsCurrent()
    let showprice = 18
    if (!SHOW_BILLING) {
      showprice = 24
    }
    return (
      <div id="quickCreateApp" className={quickCreateAppClass}>
        {
          isCreatingApp && <Spin />
        }
        <Title title={intl.formatMessage(IntlMessage.appList)} />
        <div className={quickCreateAppContentClass}>
          <Row gutter={16}>
            <Col span={showprice}>
              <Card className="leftCard" title={steps}>
                { this.renderBody() }
                { this.renderFooterSteps() }
              </Card>
            </Col>
            <Col span={6}>
              <Card
                className="rightCard"
                title={
                  <Row className="title">
                    <Col span={16}><FormattedMessage {...IntlMessage.addedService}/></Col>
                    <Col span={8} className="textAlignRight"><FormattedMessage {...IntlMessage.operation}/></Col>
                  </Row>
                }
              >
                <div className="serviceList">
                  {serviceList}
                </div>
                {
                  billingEnabled &&
                  <div className="resourcePrice">
                    <div className="resource">
                      <FormattedMessage {...IntlMessage.calculateResource}/>：
                      <span>{resource}</span>
                    </div>
                    {
                      current.unit === '¥'
                        ? (
                          <div className="price">
                            <FormattedMessage {...IntlMessage.totalPrice}/>：
                            <span className="hourPrice">
                              <FormattedMessage
                                {...IntlMessage.priceHour}
                                values={{ RMB: '￥', priceHour, unit: '' }}
                              />
                            </span>
                            <span className="monthPrice">
                              (<FormattedMessage
                                {...IntlMessage.priceMonth}
                                values={{ RMB: '￥', priceMonth, unit: '' }}
                              />)
                            </span>
                          </div>
                        )
                        : (
                          <div className="price">
                            <FormattedMessage {...IntlMessage.totalPrice}/>：
                            <span className="hourPrice">
                              <FormattedMessage
                                {...IntlMessage.priceHour}
                                values={{ RMB: '', priceHour, unit: current.unit }}
                              />
                            </span>
                            <span className="monthPrice">
                              (<FormattedMessage
                                {...IntlMessage.priceMonth}
                                values={{ RMB: '', priceMonth, unit: current.unit }}
                              />)
                            </span>
                          </div>
                        )
                    }
                  </div>
                }
                {
                  (serviceList && serviceList.length > 0 && currentStep === 1) && (
                    <div className="createApp">
                      <Button type="primary" size="large" onClick={this.onCreateAppOrAddServiceClick.bind(this, false)}>
                        {this.renderCreateBtnText()}
                      </Button>
                    </div>
                  )
                }
              </Card>
            </Col>
          </Row>
          <Modal
            title={intl.formatMessage(IntlMessage.returnToPrevious)}
            visible={confirmGoBackModalVisible}
            onCancel={() => this.setState({confirmGoBackModalVisible: false})}
            onOk={this.confirmGoBack.bind(this)}
          >
            <FormattedMessage
              {...IntlMessage.confirmReturnToPreviousTip}
              values={{ services: this.serviceNameList.join(', ') }}
            />
          </Modal>
          <Modal
            title={intl.formatMessage(IntlMessage.returnToPrevious)}
            visible={confirmSaveModalVisible}
            onCancel={() => this.setState({ confirmSaveModalVisible: false })}
            onOk={this.confirmSave}
            footer={[
              <Button key="back" type="ghost" size="large" onClick={this.cancelSave}><FormattedMessage {...IntlMessage.cancel}/></Button>,
              <Button key="submit" type="primary" size="large" onClick={this.confirmSave}>
                <FormattedMessage {...IntlMessage.confirm}/>
              </Button>,
            ]}
          >
            <FormattedMessage {...IntlMessage.confirmSaveService}/>
          </Modal>

          <ResourceQuotaModal
            visible={this.state.resourceQuotaModal}
            closeModal={() => this.setState({resourceQuotaModal: false})}
            {...this.state.resourceQuota}
          />
          {
            resourceError &&
            <ResourceErrorsModal
              visible={resourceError}
              closeModal={this.cancelResourceModal}
              confirmModal={() => this.setState({ resourceError: false })}
              templateDeployCheck={this.props.templateDeployCheck}
            />
          }
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { quickCreateApp, entities, loadBalance, appTemplates } = state
  const { location } = props
  const { wrapList, wrapTemplate } = state.images
  const { loginUser, current } = entities
  const { cluster } = current
  const { billingConfig } = loginUser.info
  const { enabled: billingEnabled } = billingConfig
  const { loadBalanceList } = loadBalance || { loadBalanceList: {} };
  const { data: lbList } = loadBalanceList || { data: [] };
  const { templateDetail, templateDeployCheck } = appTemplates;
  const list = wrapList || {}
  let datalist = { pkgs: [], total: 0 }
  const { template } = wrapTemplate || { template: [] }
  if (list.result) {
    datalist = list.result.data
  }
  const flowContainer = {
    flowCheck: {name: "flowCheck", value: get(state, [ 'FlowContainer', 'getFlowContainerValue', 'check' ])},
    flowSliderValue1: {name: "flowSliderValue1", value: get(state, [ 'FlowContainer', 'getFlowContainerValue', 'sliderValue1' ])},
    flowSliderValue2: {name: "flowSliderValue2", value: get(state, [ 'FlowContainer', 'getFlowContainerValue', 'sliderValue2' ])},
  }
  return {
    fields: quickCreateApp.fields,
    standardFlag,
    current,
    cluster,
    loginUser: loginUser.info,
    wrapList: datalist,
    billingEnabled,
    loadBalanceList: lbList,
    templateDetail,
    templateDeployCheck,
    template,
    flowContainer
  }
}

export default connect(mapStateToProps, {
  removeFormFields,
  removeAllFormFields,
  createApp,
  addService,
  loadServiceList,
  setFormFields,
  createAppIngress,
  getAppTemplateDetail,
  appTemplateDeploy,
  appTemplateDeployCheck,
  removeAppTemplateDeployCheck,
  getImageTemplate,
  getLBList,
  getfSecurityGroupDetail,
  updateSecurityGroup,
  createTcpUdpIngress,
  getPluginStatus,
  checkHelmIsPrepare: templateActions.checkHelmIsPrepare,
})(injectIntl(QuickCreateApp, {
  withRef: true,
}))
