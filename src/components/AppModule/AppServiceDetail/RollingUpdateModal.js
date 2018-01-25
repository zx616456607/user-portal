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
import {
  Button, Card, Menu, Icon, Tooltip, Row, Col,
  Select, InputNumber, Alert, Modal, Input, Tag,
 } from 'antd'
import { loadRepositoriesTags, loadWrapTags } from '../../../actions/harbor'
import { rollingUpdateService } from '../../../actions/services'
import { connect } from 'react-redux'
import NotificationHandler from '../../../components/Notification'

const Option = Select.Option

function loadTags(props, imageFullName) {
  const { loadRepositoriesTags, registry } = props
  loadRepositoriesTags(registry, imageFullName)
}

class RollingUpdateModal extends Component {
  constructor(props) {
    super(props)
    this.handleOK = this.handleOK.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.getVolumeTypeInfo = this.getVolumeTypeInfo.bind(this)
    this.state = {
      containers: [],
      wrapTags:[],
      rollingInterval: false
    }
  }

  componentWillMount() {
  // componentWillReceiveProps(nextProps) {
    const { service, visible } = this.props
    if (!service) {
      return
    }
    /*if (visible) {
      return
    }*/
    const containers = service.spec.template.spec.containers
    containers.map((container) => {
      let { image } = container
      let tagIndex = image.indexOf(':')
      if(tagIndex < 0) {
        tagIndex = image.length
      }
      let tag = image.substr(tagIndex + 1)
      let imageSrc = image.substring(0, tagIndex)
      let fullName = image.substring(image.indexOf('/') + 1, tagIndex)
      container.imageObj = {
        tag,
        imageSrc,
        fullName,
      }
    })
    this.setState({
      containers
    })
    // if (!visible || visible === this.props.visible) {
    //   return
    // }
    this.setState({
      intervalTime: service.spec.minReadySeconds
    })
    if (service.wrapper) {
      this.getWrapTags()
      return
    }
    containers.map((container) => {
      let { imageObj } = container
      loadTags(this.props, imageObj.fullName)
    })
  }

  componentDidMount() {
    const { service } = this.props
    if (service && service.status.phase === 'RollingUpdate') {
      this.handleCancel()
      Modal.info({
        title: '正在灰度发布，该服务暂不能做滚动发布操作',
        width: 480,
        content: (
          <div>
            确认发布完成或确认发布回滚后方可进行下一次发布
          </div>
        ),
        onOk() {},
      })
    }
  }

  getWrapTags() {
    const { service } = this.props
    const wrap = service.wrapper.appPkgName.split('.')
    const body = {
      filename: wrap[0],
      filetype: wrap[1],
    }
    this.props.loadWrapTags(body,{
      success:{
        func:(res)=> {
          this.setState({wrapTags: res.data})
        }
      },
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
    let count = 0
    containers.forEach((container) => {
      if(!container.targetTag) {
        count++
        return
      }
      targets[container.name] = `${container.imageObj.imageSrc}:${container.targetTag}`
    })
    let notification = new NotificationHandler()
    if(count === containers.length) {
      notification.error('请至少为一个容器指定目标版本')
      return
    }
    //统一间隔时间
    const intervalTime = this.state.intervalTime
    if(!intervalTime) {
      notification.error('请填写 2~60s 间隔时间')
      return
    }
    if(!/[0-9]+/.test(intervalTime)) {
      notification.error('请填入 2~60 之间的数字')
      return
    }
    if(intervalTime < 2) {
      notification.error('请填入 2~60 之间的数字')
      return
    }
    const hide = notification.spin('正在保存中...', 0)


    notification.spin(`服务 ${serviceName} 滚动发布中...`)
    const body = {
      type: 0,
      targets,
      interval: parseInt(intervalTime),
      onlyRollingUpdate: true
    }
    if (service.wrapper) {
      const wrapfile = this.state.wrap.split('||')
      body.type = 1
      body.targets = {
        [wrapfile[0]]: wrapfile[1]
      }
    }
    rollingUpdateService(cluster, serviceName, body, {
      success: {
        func: () => {
          notification.close()
          loadServiceList(cluster, appName)
          setTimeout(function () {
            notification.success(`服务 ${serviceName} 滚动发布已成功开启`)
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
            notification.error(`服务 ${serviceName} 开启滚动发布失败`)
          }, 300)
        }
      }
    })
  }

  handleTagChange(value, item) {
    const { containers } = this.state
    containers.map((container) => {
      if (container.name === item.name) {
        container.targetTag = value
      }
    })
    this.setState({
      wrap: value,
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
      rollingInterval:c,
    })
  }

  getVolumeTypeInfo(){
    const { service } = this.props
    let incloudPrivate = false
    const { volumeTypeList } = service
    for(let i = 0; i < volumeTypeList.length; i++){
      if(volumeTypeList[i] == 'private'){
        incloudPrivate = true
        break
      }
    }
    return incloudPrivate
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
    if (service.status.phase === 'RollingUpdate') {
      return null
    }
    const minReadySeconds = service.spec.minReadySeconds
    const isOnly = containers.length > 1 ? false : true
    const incloudPrivate = this.getVolumeTypeInfo()
    return (
      <Modal
        visible={visible}
        maskClosable={false}
        title="滚动发布" onOk={this.handleOK} onCancel={this.handleCancel}
        footer={[
          <Button
            key="back" type="ghost" size="large" onClick={this.handleCancel}>
            取 消
          </Button>,
          <Button
            key="submit" type="primary" size="large" loading={this.state.loading}
            onClick={this.handleOK}
            disabled={incloudPrivate}
          >
            保 存
          </Button>
        ]}>
        <div id="RollingUpdateModal">
          {
            containers.length > 1 && (
              <Alert message="提示: 检测到您的服务实例为k8s多容器 (Pod内多个容器) 实例,选择滚动发布时请确认下列服务实例中要升级的容器" type="info" />
            )
          }
          {
            incloudPrivate && <div className='alertRow'>Tips: 挂载独享型存储的服务不支持滚动发布</div>
          }
          <div className="alertRow">
          滚动发布是指将应用完全更新为下面所选的目标版本，可升级也可回滚版本
          </div>
          <Row>
            <Col span={6}>服务名称</Col>
            <Col className="itemBody" span={18}>
              {service.metadata.name}
            </Col>
          </Row>
          {containers.map((item, index) => {
            let imageTags = this.props[item.imageObj.fullName]
            imageTags = imageTags && imageTags.tag || []
            let start = item.image.lastIndexOf(":")
            let tag, image
            if(start >= 0) {
              tag = item.image.substring(start + 1)
              image = item.image.substring(0, start)
            } else {
              image = item.image
              tag = "latest"
            }
            let show = image
            let showText = '镜像版本'
            if(image.length > 40) show = image.substring(0, 40) + "..."
            if (service.wrapper) {
              show = service.wrapper.appPkgName
              tag = service.wrapper.appPkgTag
              showText = '应用包'
            }
            return [
              <Row key="old-tag" className="old-tag">
                <Col span={6}>
                {showText}
                </Col>
                <Tooltip title={item.image}>
                  <Col span={18}>
                  {show}:
                  <Tag>{tag}</Tag>
                  </Col>
                </Tooltip>
              </Row>,
              <Row key="target-tag">
                <Col span={6}>
                目标版本
                </Col>
                <Col span={10}>
                  <Select
                    placeholder="请选择目标版本"
                    value={item.targetTag}
                    onChange={(value) => this.handleTagChange(value, item)}
                  >
                  {// app wrap
                    service.wrapper ?
                    this.state.wrapTags.map((item, index) => {
                      return <Option
                        value={item.fileName +'.'+ item.fileType + ':'+item.fileTag+'||'+item.iD}
                        disabled={item.fileTag == tag}
                        key={index}
                      >
                        {item.fileTag}
                      </Option>
                    })
                    :
                    <Select.OptGroup label="请选择目标版本">
                      {
                        imageTags.map(tag => {
                          let disabled = false
                          if (tag === item.imageObj.tag) {
                            disabled = true
                          }
                          return (
                            <Option key={tag} value={tag} disabled={disabled}>
                              {tag}
                            </Option>
                          )
                        })
                      }
                    </Select.OptGroup>
                  }
                  </Select>
                </Col>
              </Row>,
              index <= 0 &&
              <Row key="minReadySeconds">
                <Col span={6}>
                更新间隔时间&nbsp;
                <Tooltip title="容器实例升级时间间隔，例如若为 0 秒，则 Pod 在 Ready 后就会被认为是可用状态，继续升级">
                  <Icon type="question-circle-o" />
                </Tooltip>
                </Col>
                <Col span={10}>
                  <Input
                    placeholder="建议 2~60s"
                    defaultValue={ minReadySeconds ? minReadySeconds : 0 }
                    onChange={(e) => { this.getintervalTime(e, item.name)}}
                  />
                </Col>
                <Col span={1}>&nbsp;秒</Col>
              </Row>
            ]
          })}
          </div>
      </Modal>
    )
  }
}

function mapStateToProps(state, props) {
  const {
    imageTags
  } = state.harbor
  let targetImageTag = imageTags[DEFAULT_REGISTRY] || {}
  return {
    registry: DEFAULT_REGISTRY,
    ...targetImageTag
  }
}

export default connect(mapStateToProps, {
  loadRepositoriesTags,
  loadWrapTags,
  rollingUpdateService
})(RollingUpdateModal)
