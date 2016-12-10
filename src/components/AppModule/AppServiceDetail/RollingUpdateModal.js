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
import { Button, Card, Menu, message, Icon, Tooltip, Row, Col, Select, InputNumber, Alert, Switch, Modal, Input } from 'antd'
import { loadImageDetailTag } from '../../../actions/app_center'
import { rollingUpdateService } from '../../../actions/services'
import { connect } from 'react-redux'
import NotificationHandler from '../../../common/notification_handler'

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
      rollingInterval: false
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
    this.setState({
      intervalTime: service.spec.minReadySeconds
    })
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
      targets[container.name] = `${container.imageObj.imageSrc}:${container.targetTag}`
    })

    //统一间隔时间
    const intervalTime = this.state.intervalTime
    if(!intervalTime) {
      message.error('请填写 2~60s 间隔时间')
      return
    }
    if(!/[0-9]+/.test(intervalTime)) {
      message.Error('请填入 2~60 之间的数字')
      return
    }
    if(intervalTime < 2) {
      message.Error('请填入 2~60 之间的数字')
      return
    }
    const hide = message.loading('正在保存中...', 0)

    let notification = new NotificationHandler()
    notification.spin(`服务 ${serviceName} 灰度升级中...`)
    rollingUpdateService(cluster, serviceName, { targets, interval: parseInt(intervalTime) }, {
      success: {
        func: () => {
          notification.close()
          loadServiceList(cluster, appName)
          setTimeout(function () {
            notification.success(`服务 ${serviceName} 灰度升级已成功开启`)
          }, 300)
          parentScope.setState({
            rollingUpdateModalShow: false
          })
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notification.close()
          setTimeout(function () {
            notification.error(`服务 ${serviceName} 开启灰度升级失败`)
          }, 300)
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
  getintervalTime(e, time) {
    const { containers } = this.state
    if(containers.length < 2 || this.state.rollingInterval === false) {
      this.setState({
        intervalTime: e.target.value
      })
      return
    }
    containers.forEach(container => {
      if(container.name == e.target.value) {
        container.intervalTime = time
      }
    })
  }
 switchType(c) {
   this.setState({
     rollingInterval: c
   })
 }
  render() {
    const { service, visible } = this.props
    if (!visible) {
      return null
    }
    const { containers } = this.state
    if(!service) {
      return <div></div>
    }
    const minReadySeconds = service.spec.minReadySeconds
    const isOnly = containers.length > 1 ? false : true
    // const containers = service.spec.template.spec.containers
    return (
      <Modal
        visible={visible}
        title='灰度升级' onOk={this.handleOK} onCancel={this.handleCancel}
        footer={[
          <Button
            key='back' type='ghost' size='large' onClick={this.handleCancel}>
            取 消
          </Button>,
          <Button
            key='submit' type='primary' size='large' loading={this.state.loading}
            onClick={this.handleOK}>
            保 存
          </Button>
        ]}>
        <div id='RollingUpdateModal'>
          {
            containers.length > 1 && (
              <Alert message='提示: 检测到您的服务实例为k8s多容器 (Pod内多个容器) 实例,选择灰度升级时请确认下列服务实例中要升级的容器' type='info' />
            )
          }
          <Row className='serviceName'>
            <Col className='itemTitle' span={4} style={{ textAlign: 'right' }}>服务名称</Col>
            <Col className='itemBody' span={10}>
              {service.metadata.name}
            </Col>
            <Col span={3} className='itemBody'></Col>
            <Col className='itemTitle' span={7} style={{ textAlign: 'center', position: 'relative', paddingBottom: '15px'}}><Switch disabled='true' onChange={(c)=> this.switchType(c)}></Switch>
            <div style={{ textAlign: 'right', position: 'absolute', left: '37px', top: '38px', lineHeight: '0px', zoom: 1}}>统一间隔时间<Tooltip style={{marginTop: '1px'}} title='暂不支持独立间隔时间'><Icon style={{marginLeft: '5px'}} type='question-circle-o'/></Tooltip></div>
            </Col>
          </Row>
          {containers.map((item, index) => {
            let start = item.image.lastIndexOf(':')
            let tag, image
            if(start >= 0) {
              tag = item.image.substring(start + 1)
              image = item.image.substring(0, start)
            } else {
              image = item.image
              tag = 'latest'
            }
            let show = image
            if(image.length > 25) show = image.substring(0, 25) + '...'
            return (
              <div key={item.name}>
              <Row style={{marginBottom: '10px'}}>
                <Col className='itemTitle' span={4} style={{ textAlign: 'right' }}>
                  {isOnly ? `容器` : `容器${index + 1}`}
                </Col>
                <Col span={3} className='rollingUpdateUpdateItem'>{item.name}</Col>
                <Col span={4} style={{ textAlign: 'right' }}>镜像版本</Col>
                <Tooltip title={item.image}><Col className='rollingUpdateUpdateItem' span={11}>{`${show}：${tag}`}</Col></Tooltip>
              </Row>
              <Row style={{marginBottom: '10px'}} >
                <Col span={4}></Col>
                <Col className='rollingUpdateUpdateItem' span={8}>
                  <Select
                    placeholder='请选择目标版本'
                    value={item.targetTag}
                    onChange={(value) => this.handleTagChange(value, item.name)}>
                    <OptGroup label='请选择目标版本'>
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
                <Col span={6}>
                  {index > 0 ? '' : <Input placeholder='更新间隔时间 2~60s' defaultValue={ minReadySeconds ? minReadySeconds : 0 } onChange={(e) => { this.getintervalTime(e, item.name)}}/>}
                </Col>
                <Col span={1} >{ index > 0 ? '' : <span style={{marginLeft: '2px', lineHeight: '28px'}}>S</span>}</Col>
              </Row>
              </div>
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
