/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/10/26
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import './style/RollingUpdateModal.less'
import { DEFAULT_REGISTRY } from '../../../constants'
import { Button, Card, Menu, message, Icon, Tooltip, Row, Col, Select, InputNumber, Alert, Switch, Modal } from 'antd'
import { loadImageDetailTag } from '../../../actions/app_center'
import { rollingUpdateService } from '../../../actions/services'
import { connect } from 'react-redux'

const Option = Select.Option
const OptGroup = Select.OptGroup

function loadTags(props, imageFullName) {
  const { loadImageDetailTag, registry } = props
  loadImageDetailTag(registry, imageFullName)
}

class RollingUpdateModal extends Component {
  constructor(props) {
    super(props)
    this.handleOK = this.handleOK.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleTagChange = this.handleTagChange.bind(this)
    this.state = {
      containers: [],
    }
  }

  componentWillReceiveProps(nextProps) {
    const { service, visible } = nextProps
    if (!service) {
      return
    }
    /*if (visible) {
      return
    }*/
    const containers = service.spec.template.spec.containers
    containers.map((container) => {
      let { image } = container
      let tag = image.substr(image.indexOf(':') + 1)
      let imageSrc = image.substring(0, image.indexOf(tag) - 1)
      let fullName = image.substring(image.indexOf('/') + 1, image.indexOf(tag) - 1)
      container.imageObj = {
        tag,
        imageSrc,
        fullName,
      }
    })
    this.setState({
      containers
    })
    if (!visible || visible === this.props.visible) {
      return
    }
    containers.map((container) => {
      let { imageObj } = container
      loadTags(nextProps, imageObj.fullName)
    })
  }

  handleCancel() {
    const { parentScope } = this.props
    parentScope.setState({
      rollingUpdateModalShow: false
    })
  }

  handleOK() {
    /*const { parentScope } = this.props
    parentScope.setState({
      rollingUpdateModalShow: false
    })*/
    const {
      parentScope,
      cluster,
      service,
      appName,
      loadServiceList,
      rollingUpdateService
    } = this.props
    const { containers } = this.state
    const serviceName = service.metadata.name
    const targets = {}
    containers.map((container) => {
      targets[container.name] = container.imageObj.imageSrc + container.targetTag
    })
    const hide = message.loading('正在保存中...', 0)
    rollingUpdateService(cluster, serviceName, { targets }, {
      success: {
        func: () => {
          loadServiceList(cluster, appName)
          parentScope.setState({
            rollingUpdateModalShow: false
          })
          hide()
          message.success(`服务 ${serviceName} 灰度升级已成功开启`)
        },
        isAsync: true
      },
      failed: {
        func: () => {
          hide()
          message.error(`服务 ${serviceName} 开启灰度升级失败`)
        }
      }
    })
  }

  handleTagChange(value, containerName) {
    const { containers } = this.state
    containers.map((container) => {
      if (container.name === containerName) {
        container.targetTag = value
      }
    })
    this.setState({
      containers
    })
  }

  render() {
    const { service, visible } = this.props
    if (!visible) {
      return null
    }
    const { containers } = this.state
    // const containers = service.spec.template.spec.containers
    return (
      <Modal
        wrapClassName="modal"
        visible={visible}
        title="灰度升级" onOk={this.handleOK} onCancel={this.handleCancel}
        footer={[
          <Button
            key="back" type="ghost" size="large" onClick={this.handleCancel}>
            取 消
          </Button>,
          <Button
            key="submit" type="primary" size="large" loading={this.state.loading}
            onClick={this.handleOK}>
            保 存
          </Button>
        ]}>
        <div id="RollingUpdateModal">
          {
            containers.length > 1 && (
              <Alert message="提示: 检测到您的服务实例为k8s多容器 (Pod内多个容器) 实例,选择灰度升级时请确认下列服务实例中要升级的容器" type="info" />
            )
          }
          <Row className="serviceName">
            <Col className="itemTitle" span={4} style={{ textAlign: 'right' }}>服务名称</Col>
            <Col className="itemBody" span={20}>
              {service.metadata.name}
            </Col>
          </Row>
          {containers.map((item, index) => {
            return (
              <Row className="updateItem" key={item.name}>
                <Col className="itemTitle" span={4} style={{ textAlign: 'right' }}>
                  {item.name}
                </Col>
                <Col className="itemBody" span={20}>
                  <div style={{ height: '30px' }}>{item.image}</div>
                  <Select
                    placeholder="请选择目标版本"
                    value={item.targetTag}
                    onChange={(value) => this.handleTagChange(value, item.name)}>
                    <OptGroup label="请选择目标版本">
                      {
                        this.props[item.imageObj.fullName] && this.props[item.imageObj.fullName].tag && this.props[item.imageObj.fullName].tag.map((tag) => {
                          let disabled = false
                          if (tag === item.imageObj.tag) {
                            disabled = true
                          }
                          return (
                            <Option value={tag} disabled={disabled}>
                              {tag}
                            </Option>
                          )
                        })
                      }
                    </OptGroup>
                  </Select>
                </Col>
              </Row>
            )
          })}
        </div>
      </Modal>
    )
  }
}

function mapStateToProps(state, props) {
  const {
    imageTag
  } = state.getImageTag
  let targetImageTag = imageTag[DEFAULT_REGISTRY] || {}

  return {
    registry: DEFAULT_REGISTRY,
    ...targetImageTag
  }
}

export default connect(mapStateToProps, {
  loadImageDetailTag,
  rollingUpdateService
})(RollingUpdateModal)