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
import { Card, Row, Col, Steps, Button, Modal, Icon, Tooltip } from 'antd'
import { browserHistory } from 'react-router'
import { connect } from 'react-redux'
import SelectImage from './SelectImage'
import ConfigureService from './ConfigureService'
import NotificationHandler from '../../../common/notification_handler'
import { genRandomString, toQuerystring } from '../../../common/tools'
import { removeFormFields } from '../../../actions/quick_create_app'
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
    const { location } = props
    const { query } = location
    const { imageName, registryServer } = query
    this.state = {
      imageName,
      registryServer,
      serviceList: [],
      confirmGoBackModalVisible: false,
      appName: '',
    }
    this.serviceSum = 0
    this.configureServiceKey = this.genConfigureServiceKey()
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
      this.configureServiceKey = key
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
    /*setFormFields(this.configureServiceKey, {
      imageUrl: {
        name: 'imageUrl',
        value: `${registryServer}/${imageName}`,
      },
    })*/
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
      this.configureServiceKey = this.genConfigureServiceKey()
      browserHistory.push('/app_manage/app_create/quick_create')
    })
  }

  renderBody() {
    const { hash, query } = this.props.location
    const { key } = query
    const { imageName, registryServer, appName } = this.state
    if ((hash === SERVICE_CONFIG_HASH && imageName) || (hash === SERVICE_EDIT_HASH && key)) {
      return (
        <ConfigureService
          mode={this.configureMode}
          id={this.configureServiceKey}
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
              <Button size="large" type="primary">
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
    browserHistory.push(`/app_manage/app_create/quick_create?${toQuerystring(query)}${SERVICE_EDIT_HASH}`)
  }

  deleteService(key) {
    const { removeFormFields } = this.props
    if (this.configureMode === 'edit' && this.configureServiceKey === key) {
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
    const { fields } = this.props
    const serviceList = []
    for (let key in fields) {
      if (fields.hasOwnProperty(key)) {
        const service = fields[key]
        const { serviceName } = service
        if (serviceName && serviceName.value) {
          serviceList.push(
            <Row className="serviceItem" key={serviceName.value}>
              <Col span={18}>
              {serviceName.value}
              </Col>
              <Col span={6} className="btns">
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
                    disabled={this.configureMode === 'edit' && this.configureServiceKey === key}
                    onClick={this.deleteService.bind(this, key)}
                  >
                    <Icon type="delete" />
                  </Button>
                </Tooltip>
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

  render() {
    const { confirmGoBackModalVisible } = this.state
    const steps = (
      <Steps size="small" className="steps" status="error" current={this.getStepsCurrent()}>
        <Step title="部署方式" />
        <Step title="选择镜像" />
        <Step title="配置服务" />
      </Steps>
    )
    return(
      <div id="quickCreateApp">
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
                <div className="title">
                  <div className="left">已添加服务</div>
                  <div className="right">操作</div>
                </div>
              }
            >
              <div>
                {this.renderServiceList()}
              </div>
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
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { quickCreateApp } = state
  const { location } = props
  return {
    fields: quickCreateApp.fields,
    standardFlag,
  }
}

export default connect(mapStateToProps, {
  // setFormFields,
  removeFormFields,
})(QuickCreateApp)
