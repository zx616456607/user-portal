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
import ResourceQuotaModal from '../../ResourceQuotaModal'
import NotificationHandler from '../../../common/notification_handler'
import { genRandomString, toQuerystring, getResourceByMemory, parseAmount } from '../../../common/tools'
import { removeFormFields, removeAllFormFields } from '../../../actions/quick_create_app'
import { createApp } from '../../../actions/app_manage'
import { buildJson } from './utils'
import './style/index.less'

const Step = Steps.Step
const SERVICE_CONFIG_HASH = '#configure-service'
const SERVICE_EDIT_HASH = '#edit-service'
const standard = require('../../../../configs/constants').STANDARD_MODE
const mode = require('../../../../configs/model').mode
const standardFlag = standard === mode
const notification = new NotificationHandler()

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
    this.createApp = this.createApp.bind(this)
    this.onCreateAppClick = this.onCreateAppClick.bind(this)
    const { location, fields } = props
    const { query } = location
    const { imageName, registryServer } = query
    this.state = {
      imageName,
      registryServer,
      serviceList: [],
      confirmGoBackModalVisible: false,
      appName: this.getAppName(fields),
      isCreatingApp: false,
      resourceQuotaModal: false,
      resourceQuota: null,
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
    if ((hash === SERVICE_CONFIG_HASH && !imageName) || hash === SERVICE_EDIT_HASH) {
      browserHistory.replace('/app_manage/app_create/quick_create')
    } else if (hash !== SERVICE_CONFIG_HASH && imageName && registryServer) {
      browserHistory.replace(`/app_manage/app_create/quick_create?${toQuerystring(query)}${SERVICE_CONFIG_HASH}`)
    }
  }

  componentWillReceiveProps(nextProps) {
    const { location } = nextProps
    const { hash, query } = location
    if (hash !== this.props.location.hash || query.key !== this.props.location.query.key) {
      this.setConfig(nextProps)
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
    if (this.props.location.hash === SERVICE_CONFIG_HASH) {
      return 2
    }
    return 1
  }

  onSelectImage(imageName, registryServer) {
    const { setFormFields } = this.props
    this.setState({
      imageName,
      registryServer,
    })
    browserHistory.push(`/app_manage/app_create/quick_create${SERVICE_CONFIG_HASH}`)
  }

  goSelectCreateAppMode() {
    this.setState({
      confirmGoBackModalVisible: true
    })
  }

  confirmGoBack() {
    browserHistory.push('/app_manage/app_create')
  }

  goSelectImage() {
    browserHistory.push('/app_manage/app_create/quick_create')
  }

  saveService() {
    const { fields } = this.props
    const { validateFieldsAndScroll } = this.form
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
      browserHistory.push('/app_manage/app_create/quick_create')
    })
  }

  createApp() {
    // this.setState({
    //   isCreatingApp: true,
    // })
    const {
      fields, current, loginUser,
      createApp, removeAllFormFields,
    } = this.props
    const template = []
    for (let key in fields) {
      if (fields.hasOwnProperty(key)) {
        const json = buildJson(fields[key], current.cluster, loginUser)
        console.log(JSON.stringify(json))
        template.push(yaml.dump(json.deployment))
        template.push(yaml.dump(json.service))
      }
    }
    return
    const appConfig = {
      cluster: current.cluster.clusterID,
      template: template.join('---\n'),
      appName: this.getAppName(fields),
    }
    createApp(appConfig, {
      success: {
        func: res => {
          this.appIsCreated = true
          // 异步清除 fields，即等 QuickCreateApp 组件卸载后再清除，否者会出错
          setTimeout(removeAllFormFields)
          browserHistory.push('/app_manage')
        },
        isAsync: true,
      },
      failed: {
        func: err => {
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
            notification.error('创建应用失败', '集群资源不足')
            return
          }
          const { message } = err
          notification.error('创建应用失败', message.message)
        }
      },
      finally: {
        func: () => {
          this.setState({
            isCreatingApp: false,
          })
        }
      },
    })
  }

  onCreateAppClick(isValidateFields) {
    if (!isValidateFields) {
      return this.createApp()
    }
    const { validateFieldsAndScroll } = this.form
    validateFieldsAndScroll((errors, values) => {
      if (!!errors) {
        return
      }
      this.createApp()
    })
  }

  renderBody() {
    const { hash, query } = this.props.location
    const { key } = query
    const { imageName, registryServer, appName } = this.state
    if ((hash === SERVICE_CONFIG_HASH && imageName) || (hash === SERVICE_EDIT_HASH && key)) {
      const id = this.configureMode === 'create' ? this.configureServiceKey : this.editServiceKey
      return (
        <ConfigureService
          mode={this.configureMode}
          id={id}
          callbackForm={form => this.form = form}
          {...{imageName, registryServer, appName}}
          {...this.props}
        />
      )
    }
    return <SelectImage onChange={this.onSelectImage} />
  }

  renderFooterSteps() {
    const { location } = this.props
    const { hash } = location
    if (hash === SERVICE_CONFIG_HASH || hash === SERVICE_EDIT_HASH) {
      return (
        <div className="footerSteps">
          <div className="configureSteps">
            <div className="left">
              <Button type="primary" size="large" onClick={this.saveService}>
                保存此服务并继续添加
              </Button>
            </div>
            <div className="right">
              <Button
                size="large"
                onClick={this.goSelectImage}
              >
                上一步
              </Button>
              <Button size="large" type="primary" onClick={this.onCreateAppClick}>
                &nbsp;创建&nbsp;
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
    const query = { key }
    // this.props.removeFormFields(this.configureServiceKey)
    browserHistory.push(`/app_manage/app_create/quick_create?${toQuerystring(query)}${SERVICE_EDIT_HASH}`)
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
          /*if (this.configureMode === 'edit' && this.configureServiceKey === key) {
            browserHistory.push('/app_manage/app_create/quick_create')
          }*/
        }
      }
    })
  }

  renderServiceList() {
    const { fields, location } = this.props
    const serviceList = []
    for (let key in fields) {
      if (fields.hasOwnProperty(key)) {
        const service = fields[key]
        const { serviceName } = service
        if (serviceName && serviceName.value) {
          const isRowActive = this.editServiceKey === key || this.configureServiceKey === key
          const rowClass = classNames({
            'serviceItem': true,
            'active': isRowActive,
          })
          serviceList.push(
            <Row className={rowClass} key={serviceName.value}>
              <Col span={18}>
              {serviceName.value}
              </Col>
              <Col span={6} className="btns">
              {
                (!location.hash || !isRowActive) && (
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
    if (serviceList.length < 1) {
      return (
        <div className="noService">本应用中暂无任何服务</div>
      )
    }
    return serviceList
  }

  getAppResources() {
    const { current } = this.props
    const fields = this.props.fields || {}
    let cpuTotal = 0 // unit: C
    let memoryTotal = 0 // unit: G
    let priceHour = 0 // unit: T/￥
    for (let key in fields) {
      if (fields.hasOwnProperty(key) && fields[key].serviceName) {
        const { resourceType, DIYMemory, DIYCPU, replicas } = fields[key]
        const { memoryShow, cpuShow, config } = getResourceByMemory(resourceType.value, DIYMemory.value, DIYCPU.value)
        cpuTotal += cpuShow
        memoryTotal += memoryShow
        let price = current.cluster.resourcePrice[config]
        if (price) {
          priceHour += price * replicas.value
        } else {
          // @Todo: need diy resource price
        }
      }
    }
    const priceMonth = parseAmount(priceHour * 24 * 30, 4).amount
    priceHour = parseAmount(priceHour, 4).amount
    return {
      resource: `${cpuTotal}C${memoryTotal}G`,
      priceHour,
      priceMonth,
    }
  }

  render() {
    // magic code ~
    /*if (this.appIsCreated) {
      return <div></div>
    }*/
    const { current, location } = this.props
    const { confirmGoBackModalVisible, isCreatingApp } = this.state
    const steps = (
      <Steps size="small" className="steps" status="error" current={this.getStepsCurrent()}>
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
    return (
      <div id="quickCreateApp" className={quickCreateAppClass}>
        {
          isCreatingApp && <Spin />
        }
        <div className={quickCreateAppContentClass}>
          <Row gutter={16}>
            <Col span={18}>
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
                    <Col span={18}>已添加服务</Col>
                    <Col span={6}>操作</Col>
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
                  (serviceList.length > 0 && !location.hash) && (
                    <div className="createApp">
                      <Button type="primary" size="large" onClick={this.createApp.bind(this, false)}>创建应用</Button>
                    </div>
                  )
                }
              </Card>
            </Col>
          </Row>
          <Modal
            title="返回上一步"
            visible={confirmGoBackModalVisible}
            onCancel={() => this.setState({confirmGoBackModalVisible: false})}
            onOk={this.confirmGoBack}
          >
            是否确定返回“上一步”？确定后已添加的服务xxx、xxx、xxx将不被保留
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
  // setFormFields,
  removeFormFields,
  removeAllFormFields,
  createApp,
})(QuickCreateApp)
