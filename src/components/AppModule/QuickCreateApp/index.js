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
import { Card, Row, Col, Steps, Button } from 'antd'
import { browserHistory } from 'react-router'
import './style/index.less'
import SelectImage from './SelectImage'
import ConfigureService from './ConfigureService'

const Step = Steps.Step
const SERVICE_CONFIG_HASH = '#configure-service'

export default class QuickCreateApp extends Component {
  constructor(props) {
    super()
    this.getStepsCurrent = this.getStepsCurrent.bind(this)
    this.renderBody = this.renderBody.bind(this)
    this.onSelectImage = this.onSelectImage.bind(this)
    this.renderFooterSteps = this.renderFooterSteps.bind(this)
    const { location } = props
    const { hash, query } = location
    const { imageName, registryServer } = query
    this.hash = hash
    if (hash === SERVICE_CONFIG_HASH && !imageName) {
      browserHistory.replace('/app_manage/app_create/quick_create')
    }
    this.state = {
      imageName,
      registry: registryServer,
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

  onSelectImage(imageName, registry) {
    console.log(imageName, registry)
    this.setState({
      imageName,
      registry,
    })
    browserHistory.push(`/app_manage/app_create/quick_create${SERVICE_CONFIG_HASH}`)
  }

  renderBody() {
    if (this.hash === SERVICE_CONFIG_HASH) {
      return <ConfigureService />
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
              <Button type="primary" size="large">
                保存此服务并继续添加
              </Button>
            </div>
            <div className="right">
              <Button
                size="large"
                onClick={() => browserHistory.push('/app_manage/app_create/quick_create')}
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
          onClick={() => browserHistory.push('/app_manage/app_create')}
        >
          上一步
        </Button>
      </div>
    )
  }

  render() {
    const steps = (
      <Steps size="small" className="steps" status="error" current={this.getStepsCurrent()}>
        <Step title="部署方式" />
        <Step title="选择镜像" />
        <Step title="服务配置" />
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
      </div>
    )
  }
}
