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
import { Card, Row, Col, Steps, Button, Modal, Icon, Tooltip, Spin } from 'antd'
import { browserHistory } from 'react-router'
import { connect } from 'react-redux'
import classNames from 'classnames'
import yaml from 'js-yaml'
import SelectImage from './SelectImage'
import ConfigureService from './ConfigureService'
import DepolyWrap from '../AppCreate/DeployWrap'
import ResourceQuotaModal from '../../ResourceQuotaModal'
import NotificationHandler from '../../../components/Notification'
import { genRandomString, toQuerystring, getResourceByMemory, parseAmount } from '../../../common/tools'
import { removeFormFields, removeAllFormFields } from '../../../actions/quick_create_app'
import { createApp } from '../../../actions/app_manage'
import { addService, loadServiceList } from '../../../actions/services'
import { buildJson, getFieldsValues } from './utils'
import './style/index.less'
import { SHOW_BILLING, UPGRADE_EDITION_REQUIRED_CODE } from '../../../constants'

const Step = Steps.Step
const SERVICE_CONFIG_HASH = '#configure-service'
const SERVICE_EDIT_HASH = '#edit-service'
const standard = require('../../../../configs/constants').STANDARD_MODE
const mode = require('../../../../configs/model').mode
const standardFlag = standard === mode
const notification = new NotificationHandler()
let serviceNameList = []

class QuickCreateApp extends Component {
  constructor(props) {
    super()
    this.getStepsCurrent = this.getStepsCurrent.bind(this)
    this.renderBody = this.renderBody.bind(this)
    this.onSelectImage = this.onSelectImage.bind(this)
    this.renderFooterSteps = this.renderFooterSteps.bind(this)
    this.goSelectCreateAppMode = this.goSelectCreateAppMode.bind(this)
    this.saveService = this.saveService.bind(this)
    this.editService = this.editService.bind(this)
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
      priceHour: 0
    }
    this.serviceSum = 0
    this.configureServiceKey = this.genConfigureServiceKey()
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
    const { location, fields } = this.props
    const { hash, query } = location
    const { imageName, registryServer, key } = query
    this.getExistentServices()
    if ((hash === SERVICE_CONFIG_HASH && !imageName) || hash === SERVICE_EDIT_HASH) {
      browserHistory.replace('/app_manage/app_create/quick_create')
    } else if (hash !== SERVICE_CONFIG_HASH && imageName && registryServer) {
      browserHistory.replace(`/app_manage/app_create/quick_create?${toQuerystring(query)}${SERVICE_CONFIG_HASH}`)
    }
  }

  componentWillUnmount() {
    this.removeAllFormFieldsAsync(this.props)
  }
  getExistentServices() {
    const { loadServiceList, current, location } = this.props
    let serviceList = []
    let newCpuTotal = 0
    let newMemoryTotal = 0
    let newPriceHour = 0
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
    const { hash, query } = location
    if (hash !== this.props.location.hash || query.key !== this.props.location.query.key) {
      this.setConfig(nextProps)
    }
    if (query.imageName) {
      this.setState({imageName:query.imageName})
    }
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
    }
  }

  getStepsCurrent() {
    const { hash } = this.props.location
    if (hash === SERVICE_CONFIG_HASH || hash === SERVICE_EDIT_HASH) {
      return 2
    }
    return 1
  }

  onSelectImage(imageName, registryServer, appName, fromDetail) {
    this.setState({
      imageName,
      registryServer,
    })
    if(fromDetail){
      browserHistory.push(`/app_manage/app_create/quick_create${SERVICE_CONFIG_HASH}?appName=${appName}&fromDetail=${fromDetail}`)
      return;
    }
    browserHistory.push(`/app_manage/app_create/quick_create${SERVICE_CONFIG_HASH}`)
  }

  goSelectCreateAppMode() {
    const { query } = this.props.location;
    if (serviceNameList.length < 1) {
      if (query.fromDetail ) {
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
    browserHistory.push('/app_manage/app_create')
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
    if (this.configureMode === 'edit') {
      return
    }
    this.setState({
      stepStatus: 'process',
    })
    const { removeFormFields, location } = this.props
    if (location.query.appPkgID) {
      browserHistory.push('/app_manage/deploy_wrap')
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
          browserHistory.push('/app_manage/app_create/quick_create')
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
      if (this.configureMode === 'create') {
        this.configureServiceKey = this.genConfigureServiceKey()
      }
      if (options.addWrap) {
        browserHistory.push(`/app_manage/app_create/quick_create?appName=${values.appName}&addWrap=true`)
        return
      }
      if (!noJumpPage) {
        browserHistory.push('/app_manage/app_create/quick_create')
      }
    })
  }

  createAppOrAddService() {
    this.setState({
      isCreatingApp: true,
      stepStatus: 'process',
    })
    const {
      fields, current, loginUser,
      createApp, addService,location
    } = this.props
    const { clusterID } = current.cluster
    let template = []
    let appPkgID = {}
    for (let key in fields) {
      if (fields.hasOwnProperty(key)) {
        let json = buildJson(fields[key], current.cluster, loginUser, this.imageConfigs)
        template.push(yaml.dump(json.deployment))
        template.push(yaml.dump(json.service))
        json.storage.forEach(item => {
          template.push(yaml.dump(item))
        })
        if (fields[key].appPkgID) {
          let serviceName = fields[key].serviceName.value
          appPkgID[serviceName] = fields[key].appPkgID.value
        }
      }
    }
    const callback = {
      success: {
        func: res => {
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
            msgObj = '添加服务'
          } else {
            msgObj = '创建应用'
          }
          if (err.statusCode == 403) {
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
            notification.error(`${msgObj}失败`, '集群资源不足')
            return
          }
          if (err.statusCode == 409) {
            if (err.message.message.indexOf('ip_port') > 0) {
              notification.error(`${msgObj}失败`, '端口冲突，请检查服务端口')
              return
            }
          }
          if (err.statusCode == 402) {
            return
          }
          if(err.statusCode !== UPGRADE_EDITION_REQUIRED_CODE){
            const { message } = err
            notification.error(`${msgObj}失败`, message.message)
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
      addService(clusterID, this.state.appName, body, callback)
      return
    }
    const appConfig = {
      cluster: clusterID,
      template: template.join('---\n'),
      appName: this.getAppName(fields),
      appPkgID: appPkgID
    }
    createApp(appConfig, callback)
  }

  onCreateAppOrAddServiceClick(isValidateFields) {
    if (!isValidateFields) {
      return this.createAppOrAddService()
    }
    const { validateFieldsAndScroll } = this.form
    validateFieldsAndScroll((errors, values) => {
      if (!!errors) {
        if(errors.appName){
          notification.error('应用名称不正确')
        }
        if(errors.serviceName){
          notification.error('服务名称不正确')
        }
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
        if(envNameErrors.length || envValueErrors.length){
          this.setState({
            AdvancedSettingKey: 1
          })
        }
        return
      }
      this.createAppOrAddService()
    })
  }

  renderBody() {
    const { location } = this.props
    const { hash, query } = location
    const { key, addWrap } = query
    const { imageName, registryServer, appName, editServiceLoading, AdvancedSettingKey } = this.state
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
          {...{imageName, registryServer, appName}}
          {...this.props}
          AdvancedSettingKey={AdvancedSettingKey}
        />
      )
    }
    if (addWrap) {
      return <DepolyWrap location={location} quick_create={'quick_create'}/>
    }
    return <SelectImage location={location} onChange={this.onSelectImage} />
  }

  renderCreateBtnText() {
    if (this.action === 'addService') {
      return '完成添加服务'
    }
    return <span>&nbsp;创建&nbsp;</span>
  }

  renderFooterSteps() {
    const { location } = this.props
    const { hash } = location
    if (hash === SERVICE_CONFIG_HASH || hash === SERVICE_EDIT_HASH) {
      return (
        <div className="footerSteps">
          <div className="configureSteps">
            <div className="left">
              继续添加：
              <Button.Group>
                <Button size="large" onClick={this.saveService}>容器镜像</Button>
                <Button size="large" onClick={()=> this.saveService({addWrap: true})} type="primary">应用包</Button>
              </Button.Group>
            </div>
            <div className="right">
              <Button
                size="large"
                onClick={this.goSelectImage}
                disabled={this.configureMode === 'edit'}
              >
                上一步
              </Button>
              <Button size="large" type="primary" onClick={this.onCreateAppOrAddServiceClick}>
                { this.renderCreateBtnText() }
              </Button>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="footerSteps">
        <Button
          size="large"
          onClick={this.goSelectCreateAppMode}
        >
          上一步
        </Button>
      </div>
    )
  }

  editService(key) {
    const { location } = this.props
    const { hash } = location
    const query = { key }
    const url = `/app_manage/app_create/quick_create?${toQuerystring(query)}${SERVICE_EDIT_HASH}`
    const currentStep = this.getStepsCurrent()
    // 在选择镜像界面
    if (currentStep === 1) {
      browserHistory.push(url)
      return
    }
    // 在配置服务界面
    if (currentStep === 2) {
      const { validateFieldsAndScroll } = this.form
      validateFieldsAndScroll((errors, values) => {
        if (!!errors) {
          let message = '请先修改错误的表单'
          // 如果未填写服务名称，提示填写服务名称
          if (errors.serviceName) {
            message = '请先填写服务名称'
          }
          notification.warn(message)
          return
        }
        this.setState({ editServiceLoading: true }, () => {
          this.saveService({ noJumpPage: true })
          browserHistory.push(url)
          this.setState({
            editServiceLoading: false,
          })
        })
      })
      // const { removeFormFields } = this.props
      // setTimeout(() => {
      //   removeFormFields(this.configureServiceKey)
      // })
    }
  }

  deleteService(key) {
    const { removeFormFields } = this.props
    if (this.configureMode === 'edit' && this.editServiceKey === key) {
      notification.warn('删除失败，请您先取消编辑')
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

  renderServiceList() {
    const { fields, location } = this.props
    const { serviceList } = this.state
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
              <Col span={12} className="textoverflow">
                {serviceName.value}
              </Col>
              <Col span={12} className="btns">
                {
                  (currentStep === 1 || !isRowActive) && (
                    <div>
                      <Tooltip title="修改">
                        <Button
                          type="dashed"
                          size="small"
                          onClick={this.editService.bind(this, key)}
                        >
                          <Icon type="edit" />
                        </Button>
                      </Tooltip>
                      <Tooltip title="删除">
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
    serviceNameList = _serviceNameList
    if (newServiceList.length < 1) {
      return (
        <div className="noService">本应用中暂无任何服务</div>
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
        const { resourceType, DIYMemory, DIYCPU, replicas } = getFieldsValues(fields[key])
        const { memoryShow, cpuShow, config } = getResourceByMemory(resourceType, DIYMemory, DIYCPU)
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

  render() {
    const { current, location } = this.props
    const {
      confirmGoBackModalVisible, confirmSaveModalVisible, isCreatingApp,
      stepStatus,
    } = this.state
    const steps = (
      <Steps size="small" className="steps" status={stepStatus} current={this.getStepsCurrent()}>
        <Step title="部署方式" />
        <Step title="选择镜像" />
        <Step title="配置服务" />
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
        <div className={quickCreateAppContentClass}>
          <Row gutter={16}>
            <Col span={showprice}>
              <Card className="leftCard" title={steps}>
                { this.renderBody() }
                { this.renderFooterSteps() }
              </Card>
            </Col>
            { SHOW_BILLING ?
            <Col span={6}>
              <Card
                className="rightCard"
                title={
                  <Row className="title">
                    <Col span={16}>已添加服务</Col>
                    <Col span={8} className="textAlignRight">操作</Col>
                  </Row>
                }
              >
                <div className="serviceList">
                  {serviceList}
                </div>
                <div className="resourcePrice">
                  <div className="resource">
                    计算资源：
                    <span>{resource}</span>
                  </div>
                  {
                    current.unit === '¥'
                    ? (
                      <div className="price">
                        合计：
                        <span className="hourPrice"><font>¥</font> {priceHour}/小时</span>
                        <span className="monthPrice">（合 <font>¥</font> {priceMonth}/月）</span>
                      </div>
                    )
                    : (
                      <div className="price">
                        合计：
                        <span className="hourPrice">{priceHour} {current.unit}/小时</span>
                        <span className="monthPrice">（合 {priceMonth} {current.unit}/月）</span>
                      </div>
                    )
                  }
                </div>
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
            :null
            }
          </Row>
          <Modal
            title="返回上一步"
            visible={confirmGoBackModalVisible}
            onCancel={() => this.setState({confirmGoBackModalVisible: false})}
            onOk={this.confirmGoBack.bind(this)}
          >
            是否确定返回“上一步”？确定后已添加的服务 {serviceNameList.join(', ')} 将不被保留
          </Modal>
          <Modal
            title="返回上一步"
            visible={confirmSaveModalVisible}
            onCancel={() => this.setState({ confirmSaveModalVisible: false })}
            onOk={this.confirmSave}
            footer={[
              <Button key="back" type="ghost" size="large" onClick={this.cancelSave}>取 消</Button>,
              <Button key="submit" type="primary" size="large" onClick={this.confirmSave}>
                确 定
              </Button>,
            ]}
          >
            是否确定保存该服务？
          </Modal>

          <ResourceQuotaModal
            visible={this.state.resourceQuotaModal}
            closeModal={() => this.setState({resourceQuotaModal: false})}
            {...this.state.resourceQuota}
          />
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { quickCreateApp, entities } = state
  const { location } = props
  return {
    fields: quickCreateApp.fields,
    standardFlag,
    current: entities.current,
    loginUser: entities.loginUser.info,
  }
}

export default connect(mapStateToProps, {
  removeFormFields,
  removeAllFormFields,
  createApp,
  addService,
  loadServiceList
})(QuickCreateApp)
