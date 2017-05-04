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
import { Card, Row, Col, Steps } from 'antd'
import { browserHistory } from 'react-router'
import './style/index.less'
import SelectImage from './SelectImage'

const Step = Steps.Step
const SERVICE_CONFIG_HASH = '#configure-service'

export default class QuickCreateApp extends Component {
  constructor(props) {
    super()
    this.getStepsCurrent = this.getStepsCurrent.bind(this)
    this.renderBody = this.renderBody.bind(this)
    this.onSelectImage = this.onSelectImage.bind(this)
    let imageName
    let registry
    this.state = {
      imageName,
      registry,
    }
  }

  getStepsCurrent() {
    const { location } = this.props
    const { hash } = location
    if (hash === SERVICE_CONFIG_HASH) {
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
    const { location } = this.props
    const { hash } = location
    if (hash === SERVICE_CONFIG_HASH) {
      return
    }
    return <SelectImage onChange={this.onSelectImage} />
  }

  render() {
    const { location } = this.props
    const { hash } = location
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
