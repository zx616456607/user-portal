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
import { Button, Card, Menu, Icon, Tooltip, Row, Col, Select, InputNumber, Alert, Modal, Input } from 'antd'
import { loadRepositoriesTags, loadWrapTags } from '../../../actions/harbor'
import { rollingUpdateService } from '../../../actions/services'
import { connect } from 'react-redux'
import NotificationHandler from '../../../components/Notification'

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
      let tagIndex = image.lastIndexOf(':')
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


    notification.spin(`服务 ${serviceName} 灰度升级中...`)
    const body = {
      type: 0,
      targets,
      interval: parseInt(intervalTime)
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
    const minReadySeconds = service.spec.minReadySeconds
    const isOnly = containers.length > 1 ? false : true
    const incloudPrivate = this.getVolumeTypeInfo()
    // const containers = service.spec.template.spec.containers
    return (
      <Modal
        visible={visible}
        maskClosable={false}
        width={600}
        title="灰度升级" onOk={this.handleOK} onCancel={this.handleCancel}
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
              <Alert message="提示: 检测到您的服务实例为k8s多容器 (Pod内多个容器) 实例,选择灰度升级时请确认下列服务实例中要升级的容器" type="info" />
            )
          }
          {
            incloudPrivate && <div className='alertRow'>Tips: 挂载独享型存储的服务不支持灰度升级</div>
          }
          <Row className="serviceName">
            <Col className="itemTitle" span={4} style={{ textAlign: "right" }}>服务名称：</Col>
            <Col className="itemBody" span={10}>
              {service.metadata.name}
            </Col>
            <Col span={3} className="itemBody"></Col>
          </Row>
          {containers.map((item, index) => {
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
            let showText = '镜像版本：'
            if(image.length > 40) show = image.substring(0, 40) + "..."
            if (service.wrapper) {
              show = service.wrapper.appPkgName
              tag = service.wrapper.appPkgTag
              showText = '应用包：'
            }
            let imageTags =  this.props[item.imageObj.fullName]
            imageTags = imageTags && imageTags.tag || []
            return (
              <div key={item.name}>
              <Row style={{marginBottom: "10px"}}>
                <Col span={4} style={{ textAlign: "right" }}>{showText}</Col>
                <Tooltip title={item.image}>
                  <Col className="rollingUpdateUpdateItem" span={15}>{`${show}：${tag}`}</Col>
                </Tooltip>
              </Row>
              <Row style={{marginBottom: "10px"}} >
                <Col span={4}></Col>
                <Col className="rollingUpdateUpdateItem" span={10}>
                  <Select
                    placeholder="请选择目标版本"
                    value={item.targetTag}
                    onChange={(value) => this.handleTagChange(value, item)}
                    className='rollingUpdateUpdateItemSelect'
                  >
                  {// app wrap
                    service.wrapper ?
                    this.state.wrapTags.map((item,index) => {
                      return <Select.Option value={item.fileName +'.'+ item.fileType + ':'+item.fileTag+'||'+item.iD} disabled={item.fileTag == tag} key={index}>{item.fileTag}</Select.Option>
                    })
                    :
                    <Select.OptGroup label="请选择目标版本">
                      {
                       imageTags.map((tag) => {
                          let disabled = false
                          if (tag === item.imageObj.tag) {
                            disabled = true
                          }
                          return (
                            <Select.Option key={tag} value={tag} disabled={disabled} title={tag}>
                              {tag}
                            </Select.Option>
                          )
                        })
                      }
                    </Select.OptGroup>
                  }
                  </Select>
                </Col>
                <Col span={6}>
                  {index > 0 ? "" : <Input placeholder="更新间隔时间 2~60s" defaultValue={ minReadySeconds ? minReadySeconds : 0 } onChange={(e) => { this.getintervalTime(e, item.name)}}/>}
                </Col>
                <Col span={1} >{ index > 0 ? "" : <span style={{marginLeft: "2px", lineHeight: "28px"}}>&nbsp;秒</span>}</Col>
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
