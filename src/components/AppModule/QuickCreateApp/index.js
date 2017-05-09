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
import { Card, Row, Col, Steps, Button, Modal } from 'antd'
import { browserHistory } from 'react-router'
import { connect } from 'react-redux'
import SelectImage from './SelectImage'
import ConfigureService from './ConfigureService'
import { genRandomString, toQuerystring } from '../../../common/tools'
import { removeFormFields } from '../../../actions/quick_create_app'
import './style/index.less'

const Step = Steps.Step
const SERVICE_CONFIG_HASH = '#configure-service'
const standard = require('../../../../configs/constants').STANDARD_MODE
const mode = require('../../../../configs/model').mode
const standardFlag = standard === mode

function genConfigureServiceKey() {
  return genRandomString('0123456789')
}

class QuickCreateApp extends Component {
  constructor(props) {
    super()
    this.getStepsCurrent = this.getStepsCurrent.bind(this)
    this.renderBody = this.renderBody.bind(this)
    this.onSelectImage = this.onSelectImage.bind(this)
    this.renderFooterSteps = this.renderFooterSteps.bind(this)
    this.goSelectCreateAppMode = this.goSelectCreateAppMode.bind(this)
    this.saveService = this.saveService.bind(this)
    const { location } = props
    const { hash, query } = location
    const { imageName, registryServer } = query
    this.hash = hash
    this.configureServiceKey = genConfigureServiceKey()
    if (hash === SERVICE_CONFIG_HASH && !imageName) {
      browserHistory.replace('/app_manage/app_create/quick_create')
    } else if (hash !== SERVICE_CONFIG_HASH && imageName && registryServer) {
      browserHistory.replace(`/app_manage/app_create/quick_create?${toQuerystring(query)}${SERVICE_CONFIG_HASH}`)
    }
    this.state = {
      imageName,
      registryServer,
      serviceList: [],
      confirmGoBackModalVisible: false,
      configureMode: 'create',
    }
  }

  componentWillReceiveProps(nextProps) {
    const { location } = nextProps
    const { hash } = location
    this.hash = hash
  }

  getStepsCurrent() {
    if (this.hash === SERVICE_CONFIG_HASH) {
      return 2
    }
    return 1
  }

  onSelectImage(imageName, registryServer) {
    console.log(imageName, registryServer)
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
    const { validateFieldsAndScroll } = this.form
    validateFieldsAndScroll((errors, values) => {
      if (!!errors) {
        console.log('errors===============')
        console.log(errors)
        return
      }
      this.configureServiceKey = genConfigureServiceKey()
      console.log('this.configureServiceKey===========')
      console.log(this.configureServiceKey)
      browserHistory.push('/app_manage/app_create/quick_create')
    })
  }

  renderBody() {
    const { imageName, registryServer, configureMode } = this.state
    if (this.hash === SERVICE_CONFIG_HASH && imageName) {
      return (
        <ConfigureService
          mode={configureMode}
          id={this.configureServiceKey}
          callbackForm={form => this.form = form}
          {...{imageName, registryServer}}
          {...this.props}
        />
      )
    }
    return <SelectImage onChange={this.onSelectImage} />
  }

  renderFooterSteps() {
    const { location } = this.props
    const { hash } = location
    if (hash === SERVICE_CONFIG_HASH) {
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
              服务列表
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
  return {
    standardFlag
  }
}

export default connect(mapStateToProps, {
  // setFormFields,
  removeFormFields,
})(QuickCreateApp)
